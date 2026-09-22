ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS worksheet_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS worksheet_vat_rate numeric NOT NULL DEFAULT 21,
  ADD COLUMN IF NOT EXISTS worksheet_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS worksheet_updated_by text,
  ADD COLUMN IF NOT EXISTS worksheet_locked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.get_quote_worksheet(_token text)
RETURNS TABLE(
  id uuid,
  name text,
  company text,
  email text,
  phone text,
  message text,
  status text,
  items jsonb,
  vat_rate numeric,
  locked boolean,
  worksheet_updated_at timestamptz,
  worksheet_updated_by text,
  assigned_pm_name text,
  assigned_pm_email text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.name, q.company, q.email, q.phone, q.message, q.status,
         CASE WHEN jsonb_array_length(COALESCE(q.worksheet_items, '[]'::jsonb)) > 0
              THEN q.worksheet_items ELSE COALESCE(q.items, '[]'::jsonb) END,
         q.worksheet_vat_rate, q.worksheet_locked,
         q.worksheet_updated_at, q.worksheet_updated_by,
         q.assigned_pm_name, q.assigned_pm_email, q.created_at
  FROM public.quote_requests q
  WHERE q.action_token = _token
    AND _token ~ '^[a-f0-9]{20,64}$'
$$;

CREATE OR REPLACE FUNCTION public.save_quote_worksheet(_token text, _items jsonb, _by text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE target uuid;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN
    RAISE EXCEPTION 'Nederīga saite';
  END IF;
  IF jsonb_typeof(_items) <> 'array' THEN
    RAISE EXCEPTION 'Nederīgs saraksts';
  END IF;
  IF jsonb_array_length(_items) > 300 THEN
    RAISE EXCEPTION 'Par daudz rindu';
  END IF;

  SELECT q.id INTO target FROM public.quote_requests q
   WHERE q.action_token = _token AND q.worksheet_locked = false;
  IF target IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.quote_requests
     SET worksheet_items = _items,
         worksheet_updated_at = now(),
         worksheet_updated_by = NULLIF(left(COALESCE(_by, ''), 120), '')
   WHERE id = target;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.get_quote_worksheet(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_quote_worksheet(text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_quote_worksheet(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.save_quote_worksheet(text, jsonb, text) TO anon, authenticated, service_role;