-- NEIZPILDĪTS. Izmaiņa refresh_catalog_prices() Malfini blokā (pārējie bloki un ×1,65 nemainās).
-- Aizstāj esošo 'mf' INSERT ar šo:
--
--   INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
--   SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size),
--          ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
--     FROM public.mf_prices p
--     JOIN public.mf_variants v ON v.sku = p.sku
--     JOIN public.mf_styles s ON s.style_code = v.style_code
--    WHERE p.retail_price > 0
--      AND upper(COALESCE(s.raw->>'categoryName', '')) <> 'OUTLET'
--   ON CONFLICT DO NOTHING;
--
-- Pirms/pēc pārbaude (tikai SELECT):
SELECT s.style_code, s.category_name, count(*) AS variants, min(c.retail_price), max(c.retail_price)
  FROM public.catalog_variant_prices c
  JOIN public.mf_styles s ON s.style_code = c.style_code
 WHERE c.source = 'mf' AND upper(s.raw->>'categoryName') = 'OUTLET'
 GROUP BY 1, 2 ORDER BY 1;
