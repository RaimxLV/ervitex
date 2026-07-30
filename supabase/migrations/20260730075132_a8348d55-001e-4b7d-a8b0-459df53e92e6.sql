CREATE OR REPLACE FUNCTION public.ss_fill_missing_variant_prices()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE n integer;
BEGIN
  WITH flat AS (
    SELECT style_code, MIN(ROUND(price::numeric,2)) AS price
      FROM public.ss_price_list_2026
     WHERE price > 0
     GROUP BY style_code
    HAVING COUNT(DISTINCT ROUND(price::numeric,2)) = 1
  ), ins AS (
    INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
    SELECT 'ss', v.sku, v.style_code, v.color_code, v.size_code, f.price, 'EUR'
      FROM public.ss_variants v
      JOIN flat f ON f.style_code = v.style_code
     WHERE v.published
       AND NOT EXISTS (SELECT 1 FROM public.catalog_variant_prices c WHERE c.source='ss' AND c.sku = v.sku)
    ON CONFLICT DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO n FROM ins;
  RETURN n;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.ss_fill_missing_variant_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ss_fill_missing_variant_prices() TO service_role;

SELECT public.ss_fill_missing_variant_prices();
SELECT public.refresh_ss_public_retail_prices();