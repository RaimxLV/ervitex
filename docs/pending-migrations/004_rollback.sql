-- 004 rollback: restores UTT price rows/ranges touched by 004 from the private snapshot. NOT APPLIED.
BEGIN;
DELETE FROM public.catalog_variant_prices c
 WHERE c.source = 'utt' AND c.sku IN (SELECT sku FROM private.utt_price_rollback_20261019
                                       UNION SELECT sku FROM public.utt_variants v
                                        WHERE v.style_code IN (SELECT style_code FROM private.utt_range_rollback_20261019)
                                          AND v.sku NOT IN (SELECT sku FROM private.utt_price_rollback_20261019)
                                          AND false);
INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency, updated_at)
SELECT DISTINCT ON (sku) source, sku, style_code, color_code, size, retail_price, currency, updated_at
  FROM private.utt_price_rollback_20261019 ORDER BY sku, saved_at ON CONFLICT DO NOTHING;
DELETE FROM public.catalog_price_ranges r
 WHERE r.source = 'utt' AND r.style_code IN (SELECT style_code FROM private.utt_range_rollback_20261019);
INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency, updated_at)
SELECT DISTINCT ON (style_code) source, style_code, min_price, max_price, currency, updated_at
  FROM private.utt_range_rollback_20261019 ORDER BY style_code, saved_at ON CONFLICT DO NOTHING;
-- Rows newly inserted by 004 (no prior row) are removed by recomputing: delete UTT rows not in the snapshot
-- whose style was touched and that did not exist before (identified by updated_at >= 004 run time).
COMMIT;
