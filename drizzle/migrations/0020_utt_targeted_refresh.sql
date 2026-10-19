-- UTT-only price refresh (same UTT rule as refresh_catalog_prices); a single function call is atomic, so no partial state.
CREATE OR REPLACE FUNCTION public.refresh_utt_catalog_prices()
 RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' SET statement_timeout TO '120s'
AS $function$
DECLARE n integer;
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source = 'utt';
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  WITH base AS (
    SELECT v.sku, v.style_code, v.color_name, v.size, p.purchase_price, p.currency, s.brand
      FROM public.utt_prices p
      JOIN public.utt_variants v ON v.sku = p.sku
      JOIN public.utt_styles s ON s.style_code = v.style_code
     WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin AND NOT v.outlet
       AND public.utt_markup(s.brand) IS NOT NULL
  ), reg AS (
    SELECT style_code, size, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med FROM base GROUP BY style_code, size
  ), sty AS (
    SELECT style_code, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med FROM base GROUP BY style_code
  )
  SELECT 'utt', b.sku, b.style_code, b.color_name, b.size,
         ROUND((b.purchase_price * public.utt_markup(b.brand))::numeric, 2), COALESCE(b.currency, 'EUR')
    FROM base b
    JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
    JOIN sty st ON st.style_code = b.style_code
   WHERE b.purchase_price >= 1.0 AND b.purchase_price >= GREATEST(r.med, st.med) * 0.75
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS n = ROW_COUNT;
  DELETE FROM public.catalog_price_ranges WHERE source = 'utt';
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT 'utt', style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices WHERE source = 'utt' GROUP BY style_code;
  RETURN n;
END;
$function$;
REVOKE ALL ON FUNCTION public.refresh_utt_catalog_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_utt_catalog_prices() TO service_role;