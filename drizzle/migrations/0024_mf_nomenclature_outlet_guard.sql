DO $apply$
DECLARE staged text;
BEGIN
  PERFORM set_config('lock_timeout','3s',true);
  PERFORM set_config('statement_timeout','15s',true);
  SELECT body INTO staged FROM public.migration_stage WHERE name='008_mf_nomenclature_outlet' AND body_md5='d1494da51dc4de79e458fe3885fb5620';
  IF staged IS NULL OR md5(staged) <> 'd1494da51dc4de79e458fe3885fb5620' THEN RAISE EXCEPTION 'Missing or mismatched staged MF guard'; END IF;
  EXECUTE staged;
END
$apply$;