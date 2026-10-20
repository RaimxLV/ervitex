-- Additive request capability; existing rotation and history are never reset.
ALTER TABLE public.quote_requests ADD COLUMN IF NOT EXISTS submission_key uuid;
CREATE INDEX IF NOT EXISTS quote_requests_normalized_email_idx ON public.quote_requests (lower(btrim(email)));

CREATE OR REPLACE FUNCTION public.assign_quote_request_manager()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE previous public.quote_requests%ROWTYPE;
DECLARE position integer;
DECLARE rotation text[] := ARRAY['laura','ilona','justine','santa'];
BEGIN
  NEW.email := lower(btrim(NEW.email));
  -- Assignment on creation is always server-owned, even for staff.
  NEW.assigned_pm_slug := NULL; NEW.assigned_pm_name := NULL; NEW.assigned_pm_email := NULL;
  SELECT next_position INTO position FROM public.quote_assignment_rotation WHERE id=1 FOR UPDATE;
  IF position IS NULL OR position NOT BETWEEN 0 AND 3 THEN RAISE EXCEPTION 'Sadale nav pieejama'; END IF;
  SELECT q.* INTO previous FROM public.quote_requests q
    WHERE lower(btrim(q.email))=NEW.email AND q.assigned_pm_slug IS NOT NULL
    ORDER BY COALESCE(q.assigned_at,q.created_at) DESC,q.created_at DESC,q.id DESC LIMIT 1;
  IF previous.id IS NOT NULL THEN
    -- Preserve explicit historical/manual ownership, including non-rotation managers.
    IF previous.assigned_pm_name IS NULL OR previous.assigned_pm_email IS NULL THEN
      RAISE EXCEPTION 'Klienta atbildīgā dati jāpārbauda';
    END IF;
    NEW.assigned_pm_slug := previous.assigned_pm_slug;
    NEW.assigned_pm_name := previous.assigned_pm_name;
    NEW.assigned_pm_email := previous.assigned_pm_email;
  ELSE
    IF EXISTS (SELECT 1 FROM public.quote_requests q WHERE lower(btrim(q.email))=NEW.email) THEN
      RAISE EXCEPTION 'Klienta atbildīgais jāpārbauda';
    END IF;
    NEW.assigned_pm_slug := rotation[position+1];
    NEW.assigned_pm_name := CASE NEW.assigned_pm_slug WHEN 'laura' THEN 'Laura' WHEN 'ilona' THEN 'Ilona' WHEN 'justine' THEN 'Justīne' WHEN 'santa' THEN 'Santa' END;
    NEW.assigned_pm_email := CASE NEW.assigned_pm_slug WHEN 'laura' THEN 'birojs@ervitex.lv' WHEN 'ilona' THEN 'ilona@ervitex.lv' WHEN 'justine' THEN 'justine@ervitex.lv' WHEN 'santa' THEN 'santa.k@ervitex.lv' END;
    UPDATE public.quote_assignment_rotation SET next_position=(position+1)%4 WHERE id=1;
  END IF;
  NEW.assigned_at := clock_timestamp();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.submit_quote_request(_id uuid, _key uuid, _payload jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE existing_key uuid;
BEGIN
  IF _id IS NULL OR _key IS NULL OR jsonb_typeof(_payload) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Nederīgs pieprasījums'; END IF;
  -- Lock the id BEFORE retry lookup; simultaneous retries cannot advance rotation.
  PERFORM pg_advisory_xact_lock(hashtextextended(_id::text, 0));
  SELECT submission_key INTO existing_key FROM public.quote_requests WHERE id=_id;
  IF FOUND THEN
    IF existing_key IS DISTINCT FROM _key THEN RAISE EXCEPTION 'Nav atļauts'; END IF;
    RETURN true;
  END IF;
  IF COALESCE(_payload->>'print_method','') NOT IN ('','none','consult','silkscreen','dtf','termodruka','embroidery','sublimation','other') THEN RAISE EXCEPTION 'Nederīga apdruka'; END IF;
  IF length(COALESCE(_payload->>'print_placement',''))>300 OR length(COALESCE(_payload->>'print_colors',''))>300 OR length(COALESCE(_payload->>'deadline',''))>300 THEN RAISE EXCEPTION 'Pārāk garš teksts'; END IF;
  PERFORM public.validate_worksheet_items(COALESCE(_payload->'items','[]'::jsonb));
  INSERT INTO public.quote_requests(id,submission_key,name,email,phone,company,message,items,print_method,print_placement,print_colors,deadline,billing,product_id)
  VALUES(_id,_key,btrim(_payload->>'name'),lower(btrim(_payload->>'email')),_payload->>'phone',_payload->>'company',_payload->>'message',COALESCE(_payload->'items','[]'::jsonb),NULLIF(_payload->>'print_method',''),_payload->>'print_placement',_payload->>'print_colors',_payload->>'deadline',NULLIF(_payload->'billing','null'::jsonb),NULLIF(_payload->>'product_id','')::uuid);
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.submit_quote_request(uuid,uuid,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_quote_request(uuid,uuid,jsonb) TO anon,authenticated,service_role;
-- Public clients submit only through the whitelisted capability RPC, never arbitrary rows.
DROP POLICY IF EXISTS "Anyone can submit a quote" ON public.quote_requests;

CREATE OR REPLACE FUNCTION public.get_quote_request_print_details(_token text)
RETURNS TABLE(print_method text, print_placement text, print_colors text, deadline text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
SELECT q.print_method,q.print_placement,q.print_colors,q.deadline FROM public.quote_requests q
WHERE q.action_token=_token AND _token ~ '^[a-f0-9]{20,64}$'
$$;
REVOKE ALL ON FUNCTION public.get_quote_request_print_details(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_request_print_details(text) TO anon,authenticated,service_role;