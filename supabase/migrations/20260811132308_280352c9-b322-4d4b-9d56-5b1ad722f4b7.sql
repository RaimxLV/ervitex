CREATE OR REPLACE FUNCTION public.refresh_nwg_catalog_after_sync()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.refresh_catalog_prices();
  RETURN NULL;
END;
$function$;