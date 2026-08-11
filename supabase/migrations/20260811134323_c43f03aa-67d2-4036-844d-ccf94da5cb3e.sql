CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE true;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r
   WHERE r.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p
    JOIN public.mf_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p
    JOIN public.bb_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, p.model_code, COALESCE(v.color_code, v.color_desc, p.item_code), v.size,
         ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p
    LEFT JOIN public.pf_variants v ON v.item_code = p.item_code
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- NWG: ONLY contract price x 1.67 x 1.21 VAT. No fallback to NWG public
  -- retail price; without a contract price the item shows "price on request".
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, v.color_code, k.size,
         ROUND((k.purchase_price * 1.67 * 1.21)::numeric, 2),
         COALESCE(k.purchase_currency, 'EUR')
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    JOIN public.nwg_variants v
      ON v.product_number = k.product_number
     AND v.item_number = k.item_number
   WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
     AND COALESCE(s.published, true) = true
     AND COALESCE(s.archived, false) = false
     AND COALESCE(k.active, true) = true
     AND COALESCE(k.discontinued, false) = false
     AND COALESCE(k.purchase_price, 0) > 0
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges WHERE true;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$function$;