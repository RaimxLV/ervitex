-- ETX product prices are VAT-inclusive; catalog_variant_prices stores NET (refresh_catalog_prices divides by 1.21).
-- The per-product trigger stored gross, which would double VAT after any product edit. Align it; no data rewritten now.
CREATE OR REPLACE FUNCTION public.refresh_etx_catalog_prices()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source='etx';
  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
  SELECT 'etx',p.id::text,p.id::text,NULL,'-',COALESCE(p.price_override,p.retail_price)/1.21,'EUR'
  FROM public.products p WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
  DELETE FROM public.catalog_price_ranges WHERE source='etx';
  INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
  SELECT source,style_code,MIN(retail_price),MAX(retail_price),'EUR' FROM public.catalog_variant_prices WHERE source='etx' GROUP BY source,style_code;
  RETURN NULL;
END $function$;
REVOKE ALL ON FUNCTION public.refresh_etx_catalog_prices() FROM PUBLIC, anon, authenticated;