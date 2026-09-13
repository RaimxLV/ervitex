CREATE OR REPLACE FUNCTION public.reap_stale_syncs(_older_than_minutes integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH stale AS (
    UPDATE public.sync_logs
       SET status = 'error',
           finished_at = now(),
           message = COALESCE(NULLIF(message, ''), 'Process pārtrūka un netika pabeigts (laika limits)')
     WHERE status = 'running'
       AND started_at < now() - make_interval(mins => GREATEST(COALESCE(_older_than_minutes, 30), 1))
    RETURNING 1
  )
  SELECT count(*) INTO n FROM stale;

  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.reap_stale_syncs(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reap_stale_syncs(integer) TO authenticated, service_role;