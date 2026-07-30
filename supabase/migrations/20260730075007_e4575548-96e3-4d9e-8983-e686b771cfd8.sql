CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH ex AS (
  SELECT DISTINCT l.style_code, l.is_large_size AS big, ROUND(l.price::numeric, 2) AS price
    FROM public.ss_price_list_2026 l
   WHERE l.price > 0
), exr AS (
  SELECT style_code, big, price,
         DENSE_RANK() OVER (PARTITION BY style_code, big ORDER BY price) AS rk,
         COUNT(*) OVER (PARTITION BY style_code, big) AS tiers
    FROM ex
), exg AS (
  -- Group-level ranking (Whites < Colors < Essential Heathers < Special Heathers)
  SELECT l.style_code, l.is_large_size AS big, ROUND(l.price::numeric, 2) AS price,
         ROW_NUMBER() OVER (
           PARTITION BY l.style_code, l.is_large_size
           ORDER BY ROUND(l.price::numeric, 2),
                    CASE l.color_group
                      WHEN 'Whites' THEN 1
                      WHEN 'Colors' THEN 2
                      WHEN 'Shirt Fabric' THEN 2
                      WHEN 'Essential Heathers' THEN 3
                      WHEN 'Special Heathers' THEN 4
                      ELSE 5 END
         ) AS rk,
         COUNT(*) OVER (PARTITION BY l.style_code, l.is_large_size) AS tiers
    FROM public.ss_price_list_2026 l
   WHERE l.price > 0
), sk AS (
  SELECT p.sku, p.style_code, v.color_code, v.size_code, p.purchase_price,
         (COALESCE(v.size_code,'') ~* '4XL|5XL') AS big
    FROM public.ss_prices p
    JOIN public.ss_variants v ON v.sku = p.sku
   WHERE p.purchase_price > 0
), sk_tiers AS (
  SELECT style_code, big, COUNT(DISTINCT purchase_price) AS tiers
    FROM sk GROUP BY style_code, big
), skr AS (
  SELECT sk.*, t.tiers,
         DENSE_RANK() OVER (PARTITION BY sk.style_code, sk.big ORDER BY sk.purchase_price) AS rk
    FROM sk
    JOIN sk_tiers t ON t.style_code = sk.style_code AND t.big = sk.big
), max_ex AS (
  SELECT style_code, big, MAX(rk) AS max_rk FROM exr GROUP BY style_code, big
)
SELECT skr.sku, skr.style_code, skr.color_code, skr.size_code,
       COALESCE(
         -- 1) supplier tier count == distinct price-tier count -> exact match
         CASE WHEN exr.tiers = skr.tiers THEN exr.price END,
         -- 2) supplier tier count == excel colour-group row count -> group order
         CASE WHEN exg.tiers = skr.tiers THEN exg.price END,
         -- 3) clamp supplier rank into the available price tiers
         exc.price,
         ROUND(skr.purchase_price * 1.25, 2)
       ) AS retail_price
  FROM skr
  LEFT JOIN exr
    ON exr.style_code = skr.style_code AND exr.big = skr.big AND exr.rk = skr.rk
  LEFT JOIN exg
    ON exg.style_code = skr.style_code AND exg.big = skr.big AND exg.rk = skr.rk
  LEFT JOIN max_ex m
    ON m.style_code = skr.style_code AND m.big = skr.big
  LEFT JOIN exr exc
    ON exc.style_code = skr.style_code AND exc.big = skr.big
   AND exc.rk = LEAST(skr.rk, m.max_rk);
$function$;

SELECT public.refresh_catalog_prices();
SELECT public.refresh_ss_public_retail_prices();