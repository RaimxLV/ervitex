DO $security$
BEGIN
  IF (SELECT body::jsonb->>'view_options' FROM public.migration_stage WHERE name='009_before_checks') IS DISTINCT FROM '{security_invoker=true}'
    OR md5(pg_get_viewdef('public.catalog_items'::regclass,true)) <> 'e9797e96504448bdd4ee1ab864c29231' THEN
    RAISE EXCEPTION '009 original view security or approved definition mismatch; STOP';
  END IF;
  ALTER VIEW public.catalog_items SET (security_invoker=true);
END
$security$;