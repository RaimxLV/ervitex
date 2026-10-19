-- 005 data step — NOT APPLIED. Run after 01_schema.sql in one transaction, with 02_feed_values.sql
-- loaded first (temp tables pf005_keys / pf005_stale_items / pf005_stale_models).
-- Prices: pf_prices / pf_public_retail_prices are not touched. Source rows: no deletes.
CREATE TABLE public.pf005_backup_variants AS
  SELECT item_code, color_key, color_label, feed_seen_at, feed_active FROM public.pf_variants;
CREATE TABLE public.pf005_backup_styles AS SELECT model_code, feed_seen_at, feed_active FROM public.pf_styles;
CREATE TABLE public.pf005_backup_cvp AS SELECT * FROM public.catalog_variant_prices WHERE source = 'pf';
CREATE TABLE public.pf005_backup_ranges AS SELECT * FROM public.catalog_price_ranges WHERE source = 'pf';
REVOKE ALL ON public.pf005_backup_variants, public.pf005_backup_styles, public.pf005_backup_cvp, public.pf005_backup_ranges FROM anon, authenticated;
ALTER TABLE public.pf005_backup_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf005_backup_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf005_backup_cvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf005_backup_ranges ENABLE ROW LEVEL SECURITY;

UPDATE public.pf_variants v SET color_key = k.color_key, color_label = k.color_label,
       feed_seen_at = '2026-10-18T13:40:28.431809Z', feed_active = true
  FROM pf005_keys k WHERE v.item_code = k.item_code;
UPDATE public.pf_variants SET feed_active = false WHERE item_code IN (SELECT item_code FROM pf005_stale_items);
UPDATE public.pf_styles s SET feed_seen_at = '2026-10-18T13:40:28.431809Z'
  WHERE EXISTS (SELECT 1 FROM public.pf_variants v WHERE v.model_code = s.model_code AND v.feed_active);
UPDATE public.pf_styles SET feed_active = false WHERE model_code IN (SELECT model_code FROM pf005_stale_models);

-- Derived cache only (backed up above): rekey retained SKUs, drop stale SKUs' derived rows.
UPDATE public.catalog_variant_prices c SET color_code = k.color_key
  FROM pf005_keys k WHERE c.source = 'pf' AND c.sku = k.item_code;
DELETE FROM public.catalog_variant_prices
 WHERE source = 'pf' AND sku IN (SELECT item_code FROM pf005_stale_items);
UPDATE public.catalog_price_ranges r SET min_price = x.mn, max_price = x.mx, updated_at = now()
  FROM (SELECT style_code, min(retail_price) mn, max(retail_price) mx FROM public.catalog_variant_prices
         WHERE source = 'pf' GROUP BY style_code) x
 WHERE r.source = 'pf' AND r.style_code = x.style_code AND (r.min_price, r.max_price) IS DISTINCT FROM (x.mn, x.mx);
SELECT public.refresh_catalog_items_mv();
