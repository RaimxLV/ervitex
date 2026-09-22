ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS ref text,
  ADD COLUMN IF NOT EXISTS assigned_pm_slug text,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS action_token text;

CREATE SEQUENCE IF NOT EXISTS public.quote_ref_seq;

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_ref_key ON public.quote_requests (ref);
CREATE INDEX IF NOT EXISTS quote_requests_action_token_idx ON public.quote_requests (action_token);

CREATE OR REPLACE FUNCTION public.quote_requests_set_ref()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ref IS NULL THEN
    NEW.ref := 'ERV-' || to_char(now(), 'DDMM') || '-' ||
               lpad((nextval('public.quote_ref_seq') % 1000)::text, 3, '0');
  END IF;
  IF NEW.action_token IS NULL THEN
    NEW.action_token := encode(gen_random_bytes(18), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_requests_set_ref ON public.quote_requests;
CREATE TRIGGER quote_requests_set_ref
  BEFORE INSERT ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.quote_requests_set_ref();

UPDATE public.quote_requests
   SET ref = 'ERV-' || to_char(created_at, 'DDMM') || '-' || lpad((nextval('public.quote_ref_seq') % 1000)::text, 3, '0'),
       action_token = COALESCE(action_token, encode(gen_random_bytes(18), 'hex'))
 WHERE ref IS NULL;