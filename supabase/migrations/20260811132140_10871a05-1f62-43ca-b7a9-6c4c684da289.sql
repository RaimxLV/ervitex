DO $block$
BEGIN
  PERFORM public.refresh_catalog_prices();
END
$block$;