CREATE OR REPLACE FUNCTION public.refresh_mf_public_retail_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.mf_public_retail_prices;
  -- Use the MODE (most common) wholesale price per style as the "regular" price,
  -- so that outlier cheap sizes/colors (e.g. clearance XS or single discounted color)
  -- don't drag the displayed price below the true regular price.
  WITH base AS (
    SELECT v.style_code, p.retail_price, p.currency
      FROM public.mf_prices p
      JOIN public.mf_variants v ON v.sku = p.sku
     WHERE p.retail_price IS NOT NULL AND p.retail_price > 0
  ),
  counts AS (
    SELECT style_code, retail_price, currency, COUNT(*) AS cnt
      FROM base
     GROUP BY style_code, retail_price, currency
  ),
  ranked AS (
    SELECT style_code, retail_price, currency,
           ROW_NUMBER() OVER (
             PARTITION BY style_code
             ORDER BY cnt DESC, retail_price ASC
           ) AS rn
      FROM counts
  )
  INSERT INTO public.mf_public_retail_prices (style_code, retail_price, currency)
  SELECT style_code, retail_price, COALESCE(currency,'EUR')
    FROM ranked
   WHERE rn = 1;
END;
$function$;

SELECT public.refresh_mf_public_retail_prices();