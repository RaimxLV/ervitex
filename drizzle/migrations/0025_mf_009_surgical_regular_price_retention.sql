DO $apply$
DECLARE
  approved_sql text;
  approved_md5 text;
BEGIN
  PERFORM set_config('lock_timeout','5s',true);
  SELECT body,body_md5 INTO STRICT approved_sql,approved_md5 FROM public.migration_stage WHERE name='009_regular_price_retention';
  IF approved_md5 <> 'd32594cd2e0aecace6068a57f8f69272' OR md5(approved_sql) <> 'd32594cd2e0aecace6068a57f8f69272' THEN
    RAISE EXCEPTION '009 approved SQL checksum mismatch; STOP';
  END IF;
  IF (SELECT body_md5 FROM public.migration_stage WHERE name='009_before_refresh') IS DISTINCT FROM '70fe11431867e526b6c12957762bd5f3'
    OR (SELECT body_md5 FROM public.migration_stage WHERE name='009_before_view') IS DISTINCT FROM '26917678018e447c4c1d0c0e8acf1d9f' THEN
    RAISE EXCEPTION '009 rollback definitions absent or changed; STOP';
  END IF;
  EXECUTE approved_sql;
END
$apply$;