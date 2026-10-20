-- ETX (sublimation) products.retail_price is entered NET (excl. VAT). The old trigger divided by 1.21,
-- so 33.00 net was published as 27.27 and shown as 33.00 incl. VAT. Publish net as-is; UI adds VAT once.
-- Touches only derived source='etx' rows; no saved requests/offers.
CREATE OR REPLACE FUNCTION public.refresh_etx_catalog_prices()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source='etx';
  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
  SELECT 'etx',p.id::text,p.id::text,NULL,'-',ROUND(COALESCE(p.price_override,p.retail_price)::numeric,2),'EUR'
  FROM public.products p WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
  DELETE FROM public.catalog_price_ranges WHERE source='etx';
  INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
  SELECT source,style_code,MIN(retail_price),MAX(retail_price),'EUR' FROM public.catalog_variant_prices WHERE source='etx' GROUP BY source,style_code;
  RETURN NULL;
END $function$;
-- Rebuild the 12 derived ETX rows once.
DELETE FROM public.catalog_variant_prices WHERE source='etx';
INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
SELECT 'etx',p.id::text,p.id::text,NULL,'-',ROUND(COALESCE(p.price_override,p.retail_price)::numeric,2),'EUR'
FROM public.products p WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
DELETE FROM public.catalog_price_ranges WHERE source='etx';
INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
SELECT source,style_code,MIN(retail_price),MAX(retail_price),'EUR' FROM public.catalog_variant_prices WHERE source='etx' GROUP BY source,style_code;
-- Verify: expect 0 rows
-- SELECT p.id FROM products p JOIN catalog_variant_prices v ON v.source='etx' AND v.sku=p.id::text
--  WHERE v.retail_price <> ROUND(COALESCE(p.price_override,p.retail_price)::numeric,2);
