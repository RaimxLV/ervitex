REVOKE ALL ON FUNCTION public.reap_stale_syncs(integer) FROM authenticated;
REVOKE ALL ON FUNCTION public.reap_stale_syncs(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.reap_stale_syncs(integer) TO service_role;