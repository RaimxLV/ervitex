-- 005 data step — NOT APPLIED. Same transaction as 01_schema.sql, after 02_feed_values.sql
-- (temp tables pf005_keys / pf005_stale_items / pf005_stale_models).
-- Prices: pf_prices / pf_public_retail_prices untouched. Source rows: no deletes.
CREATE TABLE private.pf005_backup_variants AS
  SELECT item_code, color_key, color_label, feed_seen_at, feed_active FROM public.pf_variants;
CREATE TABLE private.pf005_backup_styles AS SELECT model_code, feed_seen_at, feed_active FROM public.pf_styles;
CREATE TABLE private.pf005_backup_cvp AS SELECT * FROM public.catalog_variant_prices WHERE source = 'pf';
CREATE TABLE private.pf005_backup_ranges AS SELECT * FROM public.catalog_price_ranges WHERE source = 'pf';
REVOKE ALL ON private.pf005_backup_variants, private.pf005_backup_styles, private.pf005_backup_cvp, private.pf005_backup_ranges FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.pf005_backup_variants, private.pf005_backup_styles, private.pf005_backup_cvp, private.pf005_backup_ranges TO service_role;

DO $g$ BEGIN
  IF (SELECT count(*) FROM pf005_keys) <> 19674 OR (SELECT count(*) FROM pf005_stale_items) <> 994 OR (SELECT count(*) FROM pf005_stale_models) <> 121 THEN
    RAISE EXCEPTION '005: feed values incomplete';
  END IF;
  IF EXISTS (SELECT 1 FROM pf005_keys k LEFT JOIN public.pf_variants v USING (item_code) WHERE v.item_code IS NULL) THEN
    RAISE EXCEPTION '005: feed key for an SKU not in pf_variants (DB changed since review)';
  END IF;
END $g$;

UPDATE public.pf_variants v SET color_key = k.color_key, color_label = k.color_label,
       feed_seen_at = '2026-10-18T13:40:28.431809Z', feed_active = true
  FROM pf005_keys k WHERE v.item_code = k.item_code;
UPDATE public.pf_variants SET feed_active = false WHERE item_code IN (SELECT item_code FROM pf005_stale_items);
UPDATE public.pf_styles s SET feed_seen_at = '2026-10-18T13:40:28.431809Z'
  WHERE EXISTS (SELECT 1 FROM public.pf_variants v WHERE v.model_code = s.model_code AND v.feed_active);
UPDATE public.pf_styles SET feed_active = false WHERE model_code IN (SELECT model_code FROM pf005_stale_models);

-- Derived cache only (backed up above): rekey retained SKUs, remove stale SKUs' derived rows.
UPDATE public.catalog_variant_prices c SET color_code = k.color_key
  FROM pf005_keys k WHERE c.source = 'pf' AND c.sku = k.item_code;
DELETE FROM public.catalog_variant_prices
 WHERE source = 'pf' AND sku IN (SELECT item_code FROM pf005_stale_items);
UPDATE public.catalog_price_ranges r SET min_price = x.mn, max_price = x.mx, updated_at = now()
  FROM (SELECT style_code, min(retail_price) mn, max(retail_price) mx FROM public.catalog_variant_prices
         WHERE source = 'pf' GROUP BY style_code) x
 WHERE r.source = 'pf' AND r.style_code = x.style_code AND (r.min_price, r.max_price) IS DISTINCT FROM (x.mn, x.mx);
DO $g2$ BEGIN
  IF EXISTS (SELECT 1 FROM public.catalog_variant_prices c JOIN private.pf005_backup_cvp b USING (source, sku) WHERE c.retail_price <> b.retail_price) THEN
    RAISE EXCEPTION '005: a retained SKU price changed';
  END IF;
END $g2$;
SELECT public.refresh_catalog_items_mv();
