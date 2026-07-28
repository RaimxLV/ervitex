CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.catalog_variant_prices;

  -- Stanley/Stella (suggested retail, excl. VAT)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', p.sku, p.style_code, v.color_code, v.size_code, ROUND(p.suggested_retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ss_prices p
    LEFT JOIN public.ss_variants v ON v.sku = p.sku
   WHERE p.suggested_retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Malfini
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p
    JOIN public.mf_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Beechfield family (colour identified by name)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p
    JOIN public.bb_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- PF Concept (already marked up in pf_public_retail_prices)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, p.model_code,
         COALESCE(v.color_code, v.color_desc, p.item_code), v.size,
         ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p
    LEFT JOIN public.pf_variants v ON v.item_code = p.item_code
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Russell (supplier price x 1.65 markup, excl. VAT) - style level only
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- New Wave Group (colour identified by item_number)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, k.item_number, k.size, ROUND(k.retail_price::numeric, 2), COALESCE(k.currency, 'EUR')
    FROM public.nwg_skus k
   WHERE k.retail_price > 0 AND COALESCE(k.discontinued, false) = false
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$$;

SELECT public.refresh_catalog_prices();