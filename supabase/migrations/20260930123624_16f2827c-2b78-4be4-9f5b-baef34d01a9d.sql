CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public' SET statement_timeout TO '900s'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE true;
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
         ) * 1.75)::numeric, 2),
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

  DELETE FROM public.catalog_price_ranges WHERE true;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices GROUP BY source, style_code;
END;
$function$;

CREATE OR REPLACE FUNCTION private.price_audit_expected()
 RETURNS TABLE(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  SELECT cv.source, cv.sku, cv.style_code,
         COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE st.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) AS base_price,
         ROUND((COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE st.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) * 1.75)::numeric, 2) AS expected,
         cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.nwg_skus k ON k.sku = cv.sku
    LEFT JOIN public.nwg_styles st ON st.product_number = k.product_number
    LEFT JOIN public.nwg_pricelist pl ON pl.product_number = k.product_number AND pl.rec_price > 0
   WHERE cv.source = 'nwg'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.purchase_price,
         ROUND(p.purchase_price * 1.75, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.ss_prices p ON p.sku = cv.sku
   WHERE cv.source = 'ss'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.mf_prices p ON p.sku = cv.sku
   WHERE cv.source = 'mf'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.price, ROUND(p.price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.pf_prices p ON p.item_code = cv.sku
   WHERE cv.source = 'pf'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.retail_price, ROUND(p.retail_price, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.bb_prices p ON p.sku = cv.sku
   WHERE cv.source = 'bb'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.ru_prices p ON p.style_code = cv.style_code
   WHERE cv.source = 'ru'
$function$;

SELECT public.refresh_catalog_prices();