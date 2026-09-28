DROP FUNCTION IF EXISTS public.save_quote_worksheet(text, jsonb, text);
CREATE FUNCTION public.save_quote_worksheet(_token text, _items jsonb, _by text DEFAULT NULL, _base_revision integer DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE q public.quote_requests%ROWTYPE;
DECLARE existing_base integer;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN RAISE EXCEPTION 'Nederīga saite'; END IF;
  PERFORM public.validate_worksheet_items(_items);
  SELECT * INTO q FROM public.quote_requests
   WHERE action_token = _token AND worksheet_locked = false FOR UPDATE;
  IF q.id IS NULL THEN RETURN false; END IF;
  existing_base := CASE WHEN public.has_role(auth.uid(), 'admin')
    THEN q.worksheet_staff_draft_revision ELSE q.worksheet_client_draft_revision END;
  IF COALESCE(existing_base, _base_revision, q.worksheet_revision) <> q.worksheet_revision THEN
    RAISE EXCEPTION 'Sarakstam ir jaunāka apstiprināta versija. Atjauno lapu un pārbaudi izmaiņas.';
  END IF;
  IF public.has_role(auth.uid(), 'admin') THEN
    UPDATE public.quote_requests
       SET worksheet_staff_draft = _items,
           worksheet_staff_draft_at = now(),
           worksheet_staff_draft_by = NULLIF(left(COALESCE(_by, ''), 120), ''),
           worksheet_staff_draft_revision = COALESCE(worksheet_staff_draft_revision, _base_revision, worksheet_revision)
     WHERE id = q.id;
  ELSE
    UPDATE public.quote_requests
       SET worksheet_client_draft = _items,
           worksheet_client_draft_at = now(),
           worksheet_client_draft_by = NULLIF(left(COALESCE(_by, ''), 120), ''),
           worksheet_client_draft_revision = COALESCE(worksheet_client_draft_revision, _base_revision, worksheet_revision)
     WHERE id = q.id;
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.save_quote_worksheet(text, jsonb, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_quote_worksheet(text, jsonb, text, integer) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.restore_quote_worksheet_version(_token text, _version_id uuid, _by text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE restored jsonb;
DECLARE current_revision integer;
BEGIN
  SELECT v.items, q.worksheet_revision INTO restored, current_revision
  FROM public.quote_worksheet_versions v
  JOIN public.quote_requests q ON q.id = v.quote_id
  WHERE q.action_token = _token AND v.id = _version_id AND q.worksheet_locked = false;
  IF restored IS NULL THEN RETURN false; END IF;
  RETURN public.save_quote_worksheet(_token, restored, _by, current_revision);
END;
$$;