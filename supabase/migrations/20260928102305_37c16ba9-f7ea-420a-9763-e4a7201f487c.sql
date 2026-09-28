ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS worksheet_client_draft_revision integer,
  ADD COLUMN IF NOT EXISTS worksheet_staff_draft_revision integer;

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
           worksheet_staff_draft_by = NULLIF(left(COALESCE(_by, ''), 120), ''),
           worksheet_staff_draft_revision = worksheet_revision
     WHERE id = target;
  ELSE
    UPDATE public.quote_requests
       SET worksheet_client_draft = _items,
           worksheet_client_draft_at = now(),
           worksheet_client_draft_by = NULLIF(left(COALESCE(_by, ''), 120), ''),
           worksheet_client_draft_revision = worksheet_revision
     WHERE id = target;
  END IF;
  RETURN true;
END;
$$;

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
DECLARE base_revision integer;
DECLARE actor text;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  SELECT * INTO q FROM public.quote_requests
   WHERE action_token = _token AND worksheet_locked = false FOR UPDATE;
  IF q.id IS NULL THEN RAISE EXCEPTION 'Saraksts nav pieejams'; END IF;
  side := CASE WHEN public.has_role(auth.uid(), 'admin') THEN 'staff' ELSE 'client' END;
  chosen := CASE WHEN side = 'staff' THEN q.worksheet_staff_draft ELSE q.worksheet_client_draft END;
  base_revision := CASE WHEN side = 'staff' THEN q.worksheet_staff_draft_revision ELSE q.worksheet_client_draft_revision END;
  IF chosen IS NULL THEN RETURN q.worksheet_revision; END IF;
  IF COALESCE(base_revision, q.worksheet_revision) <> q.worksheet_revision THEN
    RAISE EXCEPTION 'Sarakstam ir jaunāka apstiprināta versija. Atjauno lapu un pārbaudi izmaiņas.';
  END IF;
  PERFORM public.validate_worksheet_items(chosen);
  next_revision := q.worksheet_revision + 1;
  actor := COALESCE(
    NULLIF(left(COALESCE(_by, ''), 120), ''),
    CASE WHEN side = 'staff' THEN q.assigned_pm_name ELSE q.name END,
    CASE WHEN side = 'staff' THEN 'Ervitex' ELSE 'Klients' END
  );
  UPDATE public.quote_requests
     SET worksheet_items = chosen,
         worksheet_revision = next_revision,
         worksheet_updated_at = now(),
         worksheet_updated_by = actor,
         worksheet_client_draft = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft END,
         worksheet_client_draft_at = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft_at END,
         worksheet_client_draft_by = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft_by END,
         worksheet_client_draft_revision = CASE WHEN side = 'client' THEN NULL ELSE worksheet_client_draft_revision END,
         worksheet_staff_draft = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft END,
         worksheet_staff_draft_at = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft_at END,
         worksheet_staff_draft_by = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft_by END,
         worksheet_staff_draft_revision = CASE WHEN side = 'staff' THEN NULL ELSE worksheet_staff_draft_revision END
   WHERE id = q.id;
  INSERT INTO public.quote_worksheet_versions (quote_id, revision, items, actor_side, actor_name)
  VALUES (q.id, next_revision, chosen, side, actor);
  INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
  VALUES (q.id, 'worksheet_confirmed', actor,
          jsonb_build_object('revision', next_revision, 'side', side, 'item_count', jsonb_array_length(chosen)));
  RETURN next_revision;
END;
$$;

CREATE OR REPLACE FUNCTION public.discard_quote_worksheet_draft(_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    UPDATE public.quote_requests
       SET worksheet_staff_draft = NULL, worksheet_staff_draft_at = NULL,
           worksheet_staff_draft_by = NULL, worksheet_staff_draft_revision = NULL
     WHERE action_token = _token AND worksheet_locked = false;
  ELSE
    UPDATE public.quote_requests
       SET worksheet_client_draft = NULL, worksheet_client_draft_at = NULL,
           worksheet_client_draft_by = NULL, worksheet_client_draft_revision = NULL
     WHERE action_token = _token AND worksheet_locked = false;
  END IF;
  RETURN FOUND;
END;
$$;