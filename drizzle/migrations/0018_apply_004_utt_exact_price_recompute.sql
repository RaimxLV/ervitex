SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '600s';
DO $run$
DECLARE b text;
BEGIN
  SELECT body INTO b FROM public.migration_stage WHERE name = '004' AND body_md5 = 'b7e1c6d77150e406c0101894a02bbaf7';
  IF b IS NULL THEN RAISE EXCEPTION '004: staged SQL missing or differs from the reviewed file'; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'utt_variants' AND column_name = 'outlet') THEN
    RAISE EXCEPTION '004: 003 not applied';
  END IF;
  EXECUTE b;
END $run$;