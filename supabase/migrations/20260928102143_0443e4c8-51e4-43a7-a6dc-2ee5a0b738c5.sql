ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS worksheet_revision integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS worksheet_client_draft jsonb,
  ADD COLUMN IF NOT EXISTS worksheet_client_draft_at timestamptz,
  ADD COLUMN IF NOT EXISTS worksheet_client_draft_by text,
  ADD COLUMN IF NOT EXISTS worksheet_staff_draft jsonb,
  ADD COLUMN IF NOT EXISTS worksheet_staff_draft_at timestamptz,
  ADD COLUMN IF NOT EXISTS worksheet_staff_draft_by text;

CREATE TABLE public.quote_worksheet_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  revision integer NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  actor_side text NOT NULL,
  actor_name text,
  summary text NOT NULL DEFAULT 'Preču saraksts apstiprināts',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quote_id, revision)
);
GRANT SELECT ON public.quote_worksheet_versions TO authenticated;
GRANT ALL ON public.quote_worksheet_versions TO service_role;
ALTER TABLE public.quote_worksheet_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view worksheet versions"
ON public.quote_worksheet_versions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.quote_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  actor_name text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quote_events TO authenticated;
GRANT ALL ON public.quote_events TO service_role;
ALTER TABLE public.quote_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view quote events"
ON public.quote_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX quote_worksheet_versions_quote_idx
  ON public.quote_worksheet_versions (quote_id, revision DESC);
CREATE INDEX quote_events_quote_idx
  ON public.quote_events (quote_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.validate_worksheet_items(_items jsonb)
RETURNS void
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  item jsonb;
  print jsonb;
  qty numeric;
  unit_price numeric;
  print_price numeric;
BEGIN
  IF jsonb_typeof(_items) <> 'array' THEN
    RAISE EXCEPTION 'Nederīgs saraksts';
  END IF;
  IF jsonb_array_length(_items) > 300 THEN
    RAISE EXCEPTION 'Par daudz rindu';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(_items) LOOP
    IF jsonb_typeof(item) <> 'object' THEN RAISE EXCEPTION 'Nederīga rinda'; END IF;
    IF item ? 'qty' AND COALESCE(item->>'qty', '') <> '' THEN
      BEGIN qty := (item->>'qty')::numeric;
      EXCEPTION WHEN others THEN RAISE EXCEPTION 'Nederīgs skaits'; END;
      IF qty < 0 OR qty > 100000 OR qty <> trunc(qty) THEN RAISE EXCEPTION 'Nederīgs skaits'; END IF;
    END IF;
    IF item ? 'unitPrice' AND COALESCE(item->>'unitPrice', '') <> '' THEN
      BEGIN unit_price := (item->>'unitPrice')::numeric;
      EXCEPTION WHEN others THEN RAISE EXCEPTION 'Nederīga cena'; END;
      IF unit_price < 0 OR unit_price > 100000 THEN RAISE EXCEPTION 'Nederīga cena'; END IF;
    END IF;
    IF item ? 'prints' AND jsonb_typeof(item->'prints') = 'array' THEN
      FOR print IN SELECT value FROM jsonb_array_elements(item->'prints') LOOP
        IF jsonb_typeof(print) <> 'object' THEN RAISE EXCEPTION 'Nederīga apdruka'; END IF;
        IF print ? 'price' AND COALESCE(print->>'price', '') <> '' THEN
          BEGIN print_price := (print->>'price')::numeric;
          EXCEPTION WHEN others THEN RAISE EXCEPTION 'Nederīga apdrukas cena'; END;
          IF print_price < 0 OR print_price > 100000 THEN RAISE EXCEPTION 'Nederīga apdrukas cena'; END IF;
        END IF;
      END LOOP;
    ELSIF item ? 'prints' AND jsonb_typeof(item->'prints') <> 'null' THEN
      RAISE EXCEPTION 'Nederīga apdruka';
    END IF;
  END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS public.get_quote_worksheet(text);
CREATE FUNCTION public.get_quote_worksheet(_token text)
RETURNS TABLE(
  id uuid, name text, company text, email text, phone text, message text,
  status text, items jsonb, vat_rate numeric, locked boolean,
  worksheet_updated_at timestamptz, worksheet_updated_by text,
  assigned_pm_name text, assigned_pm_email text, created_at timestamptz,
  revision integer, draft_items jsonb, draft_updated_at timestamptz,
  draft_updated_by text, actor_side text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.name, q.company, q.email, q.phone, q.message, q.status,
         CASE WHEN jsonb_array_length(COALESCE(q.worksheet_items, '[]'::jsonb)) > 0
              THEN q.worksheet_items ELSE COALESCE(q.items, '[]'::jsonb) END,
         q.worksheet_vat_rate, q.worksheet_locked,
         q.worksheet_updated_at, q.worksheet_updated_by,
         q.assigned_pm_name, q.assigned_pm_email, q.created_at,
         q.worksheet_revision,
         CASE WHEN public.has_role(auth.uid(), 'admin')
              THEN q.worksheet_staff_draft ELSE q.worksheet_client_draft END,
         CASE WHEN public.has_role(auth.uid(), 'admin')
              THEN q.worksheet_staff_draft_at ELSE q.worksheet_client_draft_at END,
         CASE WHEN public.has_role(auth.uid(), 'admin')
              THEN q.worksheet_staff_draft_by ELSE q.worksheet_client_draft_by END,
         CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'staff' ELSE 'client' END
  FROM public.quote_requests q
  WHERE q.action_token = _token
    AND _token ~ '^[a-f0-9]{20,64}$'
$$;
REVOKE ALL ON FUNCTION public.get_quote_worksheet(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_worksheet(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.save_quote_worksheet(_token text, _items jsonb, _by text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target uuid;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  PERFORM public.validate_worksheet_items(_items);
  SELECT q.id INTO target FROM public.quote_requests q
   WHERE q.action_token = _token AND q.worksheet_locked = false;
  IF target IS NULL THEN RETURN false; END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    UPDATE public.quote_requests
       SET worksheet_staff_draft = _items,
           worksheet_staff_draft_at = now(),
           worksheet_staff_draft_by = NULLIF(left(COALESCE(_by, ''), 120), '')
     WHERE id = target;
  ELSE
    UPDATE public.quote_requests
       SET worksheet_client_draft = _items,
           worksheet_client_draft_at = now(),
           worksheet_client_draft_by = NULLIF(left(COALESCE(_by, ''), 120), '')
     WHERE id = target;
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.save_quote_worksheet(text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_quote_worksheet(text, jsonb, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.confirm_quote_worksheet(_token text, _by text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE q public.quote_requests%ROWTYPE;
DECLARE chosen jsonb;
DECLARE side text;
DECLARE next_revision integer;
DECLARE actor text;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  SELECT * INTO q FROM public.quote_requests
   WHERE action_token = _token AND worksheet_locked = false FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Saraksts nav pieejams'; END IF;
  side := CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'staff' ELSE 'client' END;
  chosen := CASE WHEN side = 'staff' THEN q.worksheet_staff_draft ELSE q.worksheet_client_draft END;
  IF chosen IS NULL THEN RETURN q.worksheet_revision; END IF;
  PERFORM public.validate_worksheet_items(chosen);
  next_revision := q.worksheet_revision + 1;
  actor := NULLIF(left(COALESCE(_by, ''), 120), '');
  UPDATE public.quote_requests
     SET worksheet_items = chosen,
         worksheet_revision = next_revision,
         worksheet_updated_at = now(),
         worksheet_updated_by = actor,
         worksheet_client_draft = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft END,
         worksheet_client_draft_at = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft_at END,
         worksheet_client_draft_by = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft_by END,
         worksheet_staff_draft = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft END,
         worksheet_staff_draft_at = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft_at END,
         worksheet_staff_draft_by = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft_by END
   WHERE id = q.id;
  INSERT INTO public.quote_worksheet_versions (quote_id, revision, items, actor_side, actor_name)
  VALUES (q.id, next_revision, chosen, side, actor);
  INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
  VALUES (q.id, 'worksheet_confirmed', actor,
          jsonb_build_object('revision', next_revision, 'side', side, 'item_count', jsonb_array_length(chosen)));
  RETURN next_revision;
END;
$$;
REVOKE ALL ON FUNCTION public.confirm_quote_worksheet(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_quote_worksheet(text, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.discard_quote_worksheet_draft(_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    UPDATE public.quote_requests SET worksheet_staff_draft = NULL, worksheet_staff_draft_at = NULL, worksheet_staff_draft_by = NULL
     WHERE action_token = _token AND worksheet_locked = false;
  ELSE
    UPDATE public.quote_requests SET worksheet_client_draft = NULL, worksheet_client_draft_at = NULL, worksheet_client_draft_by = NULL
     WHERE action_token = _token AND worksheet_locked = false;
  END IF;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.discard_quote_worksheet_draft(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.discard_quote_worksheet_draft(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_quote_worksheet_versions(_token text)
RETURNS TABLE(id uuid, revision integer, items jsonb, actor_side text, actor_name text, summary text, created_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.revision, v.items, v.actor_side, v.actor_name, v.summary, v.created_at
  FROM public.quote_worksheet_versions v
  JOIN public.quote_requests q ON q.id = v.quote_id
  WHERE q.action_token = _token AND _token ~ '^[a-f0-9]{20,64}$'
  ORDER BY v.revision DESC
$$;
REVOKE ALL ON FUNCTION public.get_quote_worksheet_versions(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_worksheet_versions(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.restore_quote_worksheet_version(_token text, _version_id uuid, _by text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE restored jsonb;
BEGIN
  SELECT v.items INTO restored
  FROM public.quote_worksheet_versions v
  JOIN public.quote_requests q ON q.id = v.quote_id
  WHERE q.action_token = _token AND v.id = _version_id AND q.worksheet_locked = false;
  IF restored IS NULL THEN RETURN false; END IF;
  RETURN public.save_quote_worksheet(_token, restored, _by);
END;
$$;
REVOKE ALL ON FUNCTION public.restore_quote_worksheet_version(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restore_quote_worksheet_version(text, uuid, text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.quote_request_event_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
    VALUES (NEW.id, 'submitted', NEW.name, jsonb_build_object('item_count', jsonb_array_length(COALESCE(NEW.items, '[]'::jsonb))));
  ELSE
    IF NEW.assigned_pm_slug IS DISTINCT FROM OLD.assigned_pm_slug THEN
      INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
      VALUES (NEW.id, 'assigned', NEW.assigned_pm_name,
              jsonb_build_object('from', OLD.assigned_pm_name, 'to', NEW.assigned_pm_name));
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'closed' THEN
      INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
      VALUES (NEW.id, 'completed', NEW.assigned_pm_name, '{}'::jsonb);
    ELSIF NEW.status IS DISTINCT FROM OLD.status AND OLD.status = 'closed' THEN
      INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
      VALUES (NEW.id, 'reopened', NEW.assigned_pm_name, '{}'::jsonb);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS quote_request_event_log ON public.quote_requests;
CREATE TRIGGER quote_request_event_log
AFTER INSERT OR UPDATE ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.quote_request_event_log();

INSERT INTO public.quote_worksheet_versions (quote_id, revision, items, actor_side, actor_name, summary, created_at)
SELECT q.id, 1,
       CASE WHEN jsonb_array_length(COALESCE(q.worksheet_items, '[]'::jsonb)) > 0 THEN q.worksheet_items ELSE q.items END,
       'system', q.worksheet_updated_by, 'Sākotnējais preču saraksts', COALESCE(q.worksheet_updated_at, q.created_at)
FROM public.quote_requests q
WHERE jsonb_array_length(CASE WHEN jsonb_array_length(COALESCE(q.worksheet_items, '[]'::jsonb)) > 0 THEN q.worksheet_items ELSE COALESCE(q.items, '[]'::jsonb) END) > 0
ON CONFLICT (quote_id, revision) DO NOTHING;

UPDATE public.quote_requests q
SET worksheet_revision = 1
WHERE worksheet_revision = 0
  AND EXISTS (SELECT 1 FROM public.quote_worksheet_versions v WHERE v.quote_id = q.id AND v.revision = 1);