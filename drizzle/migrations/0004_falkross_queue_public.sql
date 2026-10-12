CREATE TABLE IF NOT EXISTS public.falkross_queue (
  url text PRIMARY KEY,
  brand text NOT NULL,
  mpn text NOT NULL,
  title text,
  done boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.falkross_queue FROM anon, authenticated;
GRANT ALL ON public.falkross_queue TO service_role;
ALTER TABLE public.falkross_queue ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE private.falkross_queue IS 'DEPRECATED: replaced by public.falkross_queue (service_role only)';