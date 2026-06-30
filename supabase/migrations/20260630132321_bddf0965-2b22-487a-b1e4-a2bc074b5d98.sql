CREATE SCHEMA IF NOT EXISTS private;

-- Drop public-facing wrappers
DROP VIEW IF EXISTS public.ss_style_summary;

-- Move materialized view to private schema (out of PostgREST API)
ALTER MATERIALIZED VIEW public.ss_style_summary_mv SET SCHEMA private;

GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;
GRANT SELECT ON private.ss_style_summary_mv TO anon, authenticated;
GRANT ALL ON private.ss_style_summary_mv TO service_role;

-- Recreate the public view with security_invoker=on (no SECURITY DEFINER warning)
CREATE VIEW public.ss_style_summary
WITH (security_invoker = on) AS
SELECT * FROM private.ss_style_summary_mv;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
GRANT ALL ON public.ss_style_summary TO service_role;

-- Update refresh helper to point at the new location
CREATE OR REPLACE FUNCTION public.refresh_ss_style_summary()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.ss_style_summary_mv;
$$;

REVOKE ALL ON FUNCTION public.refresh_ss_style_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_ss_style_summary() TO service_role;