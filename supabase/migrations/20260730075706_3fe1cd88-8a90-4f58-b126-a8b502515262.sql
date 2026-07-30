CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH v AS (
  SELECT v.sku, v.style_code, v.color_code, v.size_code,
         (COALESCE(v.size_code,'') ~* '4XL|5XL') AS big,
         CASE
           WHEN v.color_name IN ('White','Off White','Vintage White','Natural Raw','Natural') THEN 'Whites'
           WHEN v.color_name IN ('Heather Grey','Cool Heather Grey','Dark Heather Grey','Mid Heather Grey') THEN 'Essential Heathers'
           WHEN v.color_name IN ('Heather Haze','Heather Rainbow','Heather Sand','Eco Heather','Dark Heather Blue')
             OR v.color_name ILIKE '%heather%' THEN 'Special Heathers'
           ELSE 'Colors'
         END AS grp
    FROM public.ss_variants v
   WHERE v.published
), ex AS (
  SELECT l.style_code, l.is_large_size AS big, l.color_group,
         ROUND(l.price::numeric, 2) AS price
    FROM public.ss_price_list_2026 l
   WHERE l.price > 0
), ex_colors AS (
  SELECT style_code, big, MIN(price) AS price FROM ex
   WHERE color_group IN ('Colors','Shirt Fabric') GROUP BY 1,2
), ex_any AS (
  SELECT style_code, big, MIN(price) AS price FROM ex GROUP BY 1,2
), ex_style AS (
  SELECT style_code, MIN(price) AS price FROM ex GROUP BY 1
)
SELECT v.sku, v.style_code, v.color_code, v.size_code,
       COALESCE(e.price, ec.price, ea.price, es.price) AS retail_price
  FROM v
  LEFT JOIN ex e  ON e.style_code = v.style_code AND e.big = v.big AND e.color_group = v.grp
  LEFT JOIN ex_colors ec ON ec.style_code = v.style_code AND ec.big = v.big
  LEFT JOIN ex_any ea ON ea.style_code = v.style_code AND ea.big = v.big
  LEFT JOIN ex_style es ON es.style_code = v.style_code
 WHERE COALESCE(e.price, ec.price, ea.price, es.price) IS NOT NULL;
$function$;

SELECT public.refresh_catalog_prices();
SELECT public.refresh_ss_public_retail_prices();