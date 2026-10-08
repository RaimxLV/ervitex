CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '900s'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source IS NOT NULL;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r WHERE r.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p JOIN public.mf_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p JOIN public.bb_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, COALESCE(v.model_code, p.model_code), COALESCE(v.color_code, v.color_desc, p.item_code), v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p LEFT JOIN public.pf_variants v ON v.item_code = p.item_code WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  -- UTT sends clearance prices for leftover colours/sizes; use the regular (median) price of the same style and size.
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  WITH base AS (
    SELECT v.sku, v.style_code, v.color_name, v.size, p.purchase_price, p.currency, s.brand
      FROM public.utt_prices p
      JOIN public.utt_variants v ON v.sku = p.sku
      JOIN public.utt_styles s ON s.style_code = v.style_code
     WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin
       AND public.utt_markup(s.brand) IS NOT NULL
  ), reg AS (
    SELECT style_code, size, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med
      FROM base GROUP BY style_code, size
  )
  SELECT 'utt', b.sku, b.style_code, b.color_name, b.size,
         ROUND((GREATEST(b.purchase_price, CASE WHEN b.purchase_price < r.med * 0.75 THEN r.med ELSE 0 END) * public.utt_markup(b.brand))::numeric, 2),
         COALESCE(b.currency, 'EUR')
    FROM base b JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, v.color_code, COALESCE(NULLIF(k.size_name, ''), k.size),
         ROUND((COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE s.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) * CASE s.brand WHEN 'Craft' THEN 1.5 WHEN 'ProJob' THEN 1.5 WHEN 'Cutter & Buck' THEN 1.5 ELSE 1.75 END)::numeric, 2),
         'EUR'
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    JOIN public.nwg_variants v ON v.product_number = k.product_number AND v.item_number = k.item_number
    LEFT JOIN public.nwg_pricelist pl ON pl.product_number = k.product_number AND pl.rec_price > 0
   WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
     AND COALESCE(s.published, true) = true
     AND COALESCE(s.archived, false) = false
     AND COALESCE(k.active, true) = true
     AND COALESCE(k.discontinued, false) = false
     AND COALESCE(
       COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
         CASE s.brand
           WHEN 'Clique' THEN 0.37
           WHEN 'Craft' THEN 0.50
           WHEN 'ProJob' THEN 0.60
           WHEN 'Cutter & Buck' THEN 0.60
         END,
       NULLIF(k.purchase_price, 0),
       0
     ) > 0
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices GROUP BY source, style_code;
END;
$function$;
SELECT public.refresh_catalog_prices();