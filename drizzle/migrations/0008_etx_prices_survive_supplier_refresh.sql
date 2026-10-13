CREATE OR REPLACE FUNCTION public.refresh_etx_catalog_prices() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $fn$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source='etx';
  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
  SELECT 'etx',p.id::text,p.id::text,NULL,'-',COALESCE(p.price_override,p.retail_price)/1.21,'EUR'
  FROM public.products p WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
  DELETE FROM public.catalog_price_ranges WHERE source='etx';
  INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
  SELECT source,style_code,MIN(retail_price),MAX(retail_price),'EUR' FROM public.catalog_variant_prices WHERE source='etx' GROUP BY source,style_code;
  RETURN NULL;
END $fn$;
REVOKE ALL ON FUNCTION public.refresh_etx_catalog_prices() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_etx_catalog_prices() TO service_role;
CREATE TRIGGER etx_product_price_refresh AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_etx_catalog_prices();
DO $migration$
DECLARE definition text;
BEGIN
  definition:=pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure);
  IF definition NOT LIKE '%''etx''%' THEN
    definition:=replace(definition,'DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;', 'INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
    SELECT ''etx'',p.id::text,p.id::text,NULL,''-'',COALESCE(p.price_override,p.retail_price)/1.21,''EUR'' FROM public.products p
    WHERE p.brand=''ETX Latvia'' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
    DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;');
    EXECUTE definition;
  END IF;
END $migration$;