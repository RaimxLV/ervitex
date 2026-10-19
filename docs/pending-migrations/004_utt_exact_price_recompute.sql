-- 004 UTT exact-price targeted recompute. NOT APPLIED. Run ONLY after 003 (needs utt_variants.outlet).
-- One transaction. Same rule as 003 refresh_catalog_prices UTT block: own non-outlet SKU price x existing
-- utt_markup(brand); median is only a suspicious signal -> no price (Cena pēc pieprasījuma). No invented prices.
-- Touches only UTT rows whose value differs (incl. the rows the old median currently substitutes). Idempotent.
BEGIN;
CREATE TABLE IF NOT EXISTS private.utt_price_rollback_20261019 AS
  SELECT now() AS saved_at, c.* FROM public.catalog_variant_prices c WHERE false;
CREATE TABLE IF NOT EXISTS private.utt_range_rollback_20261019 AS
  SELECT now() AS saved_at, r.* FROM public.catalog_price_ranges r WHERE false;
REVOKE ALL ON private.utt_price_rollback_20261019, private.utt_range_rollback_20261019 FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.utt_price_rollback_20261019, private.utt_range_rollback_20261019 TO service_role;

CREATE TEMP TABLE _utt_cand ON COMMIT DROP AS
WITH base AS (
  SELECT v.sku, v.style_code, v.color_name, v.size, p.purchase_price, p.currency, s.brand
    FROM public.utt_prices p
    JOIN public.utt_variants v ON v.sku = p.sku
    JOIN public.utt_styles s ON s.style_code = v.style_code
   WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin AND NOT v.outlet
     AND public.utt_markup(s.brand) IS NOT NULL
), reg AS (
  SELECT style_code, size, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med FROM base GROUP BY 1, 2
), sty AS (
  SELECT style_code, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med FROM base GROUP BY 1
)
SELECT b.sku, b.style_code, b.color_name, b.size, COALESCE(b.currency, 'EUR') AS currency,
       ROUND((b.purchase_price * public.utt_markup(b.brand))::numeric, 2) AS retail_price
  FROM base b
  JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
  JOIN sty st ON st.style_code = b.style_code
 WHERE b.purchase_price >= 1.0 AND b.purchase_price >= GREATEST(r.med, st.med) * 0.75;

CREATE TEMP TABLE _utt_touch ON COMMIT DROP AS
SELECT c.sku, c.style_code FROM public.catalog_variant_prices c
  LEFT JOIN _utt_cand k ON k.sku = c.sku
 WHERE c.source = 'utt' AND (k.sku IS NULL OR k.retail_price <> c.retail_price)
UNION
SELECT k.sku, k.style_code FROM _utt_cand k
  LEFT JOIN public.catalog_variant_prices c ON c.source = 'utt' AND c.sku = k.sku
 WHERE c.sku IS NULL;

INSERT INTO private.utt_price_rollback_20261019
  SELECT now(), c.* FROM public.catalog_variant_prices c
   WHERE c.source = 'utt' AND c.sku IN (SELECT sku FROM _utt_touch);
INSERT INTO private.utt_range_rollback_20261019
  SELECT now(), r.* FROM public.catalog_price_ranges r
   WHERE r.source = 'utt' AND r.style_code IN (SELECT DISTINCT style_code FROM _utt_touch);

DELETE FROM public.catalog_variant_prices c
 WHERE c.source = 'utt' AND c.sku IN (SELECT sku FROM _utt_touch);
INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
SELECT 'utt', k.sku, k.style_code, k.color_name, k.size, k.retail_price, k.currency
  FROM _utt_cand k WHERE k.sku IN (SELECT sku FROM _utt_touch)
ON CONFLICT DO NOTHING;

DELETE FROM public.catalog_price_ranges r
 WHERE r.source = 'utt' AND r.style_code IN (SELECT DISTINCT style_code FROM _utt_touch);
INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
SELECT 'utt', c.style_code, MIN(c.retail_price), MAX(c.retail_price), COALESCE(MAX(c.currency), 'EUR')
  FROM public.catalog_variant_prices c
 WHERE c.source = 'utt' AND c.style_code IN (SELECT DISTINCT style_code FROM _utt_touch)
 GROUP BY c.style_code
ON CONFLICT DO NOTHING;
COMMIT;
