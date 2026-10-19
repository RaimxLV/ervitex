SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '600s';
DO $run$
DECLARE b text;
BEGIN
  SELECT body INTO b FROM public.migration_stage WHERE name = '003' AND body_md5 = 'dd5e4a4da155f74d79434f5faf5bffbb';
  IF b IS NULL THEN RAISE EXCEPTION '003: staged SQL missing or differs from the reviewed file'; END IF;
  IF md5((SELECT prosrc FROM pg_proc WHERE oid = 'public.refresh_catalog_prices()'::regprocedure)) <> '31de0b3b0e27ab9bfd33897f0e05b3a9' THEN
    RAISE EXCEPTION '003: live refresh_catalog_prices drifted from the reviewed baseline';
  END IF;
  IF md5(pg_get_viewdef('public.catalog_items'::regclass)) <> '31491aa58c4bdfcb8044705dafb5ee4c' THEN
    RAISE EXCEPTION '003: live catalog_items drifted from the reviewed baseline';
  END IF;
  EXECUTE b;
  IF md5((SELECT prosrc FROM pg_proc WHERE oid = 'public.refresh_catalog_prices()'::regprocedure)) <> '3fd1011aa68fb54f641895acc0cb9c8e' THEN
    RAISE EXCEPTION '003: resulting refresh_catalog_prices is not the reviewed version';
  END IF;
END $run$;