CREATE TABLE public.quote_request_rate_limits (
  id bigserial PRIMARY KEY,
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX quote_request_rate_limits_ip_time ON public.quote_request_rate_limits (ip, created_at);
ALTER TABLE public.quote_request_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quote_request_rate_limits FROM anon, authenticated;
GRANT ALL ON public.quote_request_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.quote_requests_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  hdrs json;
  client_ip text;
  recent int;
BEGIN
  IF auth.uid() IS NOT NULL THEN RETURN NEW; END IF;
  BEGIN
    hdrs := current_setting('request.headers', true)::json;
  EXCEPTION WHEN others THEN hdrs := NULL;
  END;
  client_ip := COALESCE(hdrs->>'cf-connecting-ip', split_part(hdrs->>'x-forwarded-for', ',', 1), hdrs->>'x-real-ip');
  client_ip := NULLIF(trim(client_ip), '');
  IF client_ip IS NULL THEN RETURN NEW; END IF;
  DELETE FROM public.quote_request_rate_limits WHERE created_at < now() - interval '1 hour';
  SELECT count(*) INTO recent FROM public.quote_request_rate_limits
    WHERE ip = client_ip AND created_at > now() - interval '1 minute';
  IF recent >= 3 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0429';
  END IF;
  INSERT INTO public.quote_request_rate_limits (ip) VALUES (client_ip);
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.quote_requests_rate_limit() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER quote_requests_rate_limit BEFORE INSERT ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.quote_requests_rate_limit();