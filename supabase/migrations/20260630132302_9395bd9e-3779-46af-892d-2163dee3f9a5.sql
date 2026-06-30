-- 1) Revoke direct API access to the materialized view
REVOKE ALL ON public.ss_style_summary FROM anon, authenticated;

-- 2) Rename MV and expose through a regular view that PostgREST can serve
ALTER MATERIALIZED VIEW public.ss_style_summary RENAME TO ss_style_summary_mv;

CREATE VIEW public.ss_style_summary
WITH (security_invoker = off) AS
SELECT * FROM public.ss_style_summary_mv;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
GRANT ALL ON public.ss_style_summary TO service_role;

-- 3) Lock down the refresh helper
REVOKE EXECUTE ON FUNCTION public.refresh_ss_style_summary() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_ss_style_summary() TO service_role;