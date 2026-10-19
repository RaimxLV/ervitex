-- SELECT-only checks after apply.
SELECT count(*) FILTER (WHERE color_key IS NOT NULL) keyed, count(*) FILTER (WHERE NOT feed_active) stale, count(*) total FROM public.pf_variants; -- expect 19674 / 994 / 20668
SELECT count(*) FROM public.pf_styles WHERE NOT feed_active; -- expect 121
SELECT style_code, color_code, size, count(DISTINCT retail_price) FROM public.catalog_variant_prices
 WHERE source = 'pf' GROUP BY 1,2,3 HAVING count(DISTINCT retail_price) > 1; -- expect 0 rows
SELECT count(*) FROM public.catalog_variant_prices c JOIN public.pf005_backup_cvp b USING (source, sku)
 WHERE c.retail_price <> b.retail_price; -- expect 0
SELECT sku, color_code, size, retail_price FROM public.catalog_variant_prices
 WHERE source = 'pf' AND style_code IN ('K1058','106505') ORDER BY 1;
