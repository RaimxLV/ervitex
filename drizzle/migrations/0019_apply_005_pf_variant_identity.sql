SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '900s';
DO $run$
DECLARE b text;
BEGIN
  SELECT body INTO b FROM public.migration_stage WHERE name = '005' AND body_md5 = 'd8c319c2fd1998d0e38847f683c3f113';
  IF b IS NULL THEN RAISE EXCEPTION '005: staged SQL missing or differs from the reviewed files'; END IF;
  EXECUTE b;
END $run$;