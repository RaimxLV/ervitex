CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
 RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH style_base AS (
  SELECT p.style_code, MIN(p.purchase_price) AS purchase_price
    FROM public.ss_prices p
   WHERE p.purchase_price > 0
   GROUP BY p.style_code
)
SELECT v.sku, v.style_code, v.color_code, v.size_code,
       ROUND(COALESCE(p.purchase_price, sb.purchase_price) * 1.75, 2) AS retail_price
  FROM public.ss_variants v
  LEFT JOIN public.ss_prices p
         ON p.sku = v.sku AND p.purchase_price > 0
  LEFT JOIN style_base sb ON sb.style_code = v.style_code
 WHERE v.published
   AND COALESCE(p.purchase_price, sb.purchase_price) > 0;
$function$;

CREATE OR REPLACE FUNCTION private.price_audit_expected()
RETURNS TABLE(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select cv.source, cv.sku, cv.style_code, s.purchase_price,
         round(s.purchase_price * 1.67, 2), cv.retail_price
  from catalog_variant_prices cv
  left join nwg_skus s on s.sku = cv.sku
  where cv.source = 'nwg'
  union all
  select cv.source, cv.sku, cv.style_code, p.purchase_price,
         round(p.purchase_price * 1.75, 2), cv.retail_price
  from catalog_variant_prices cv
  left join ss_prices p on p.sku = cv.sku
  where cv.source = 'ss'
  union all
  select cv.source, cv.sku, cv.style_code, p.wholesale_price, round(p.wholesale_price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join mf_prices p on p.sku = cv.sku
  where cv.source = 'mf'
  union all
  select cv.source, cv.sku, cv.style_code, p.price, round(p.price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join pf_prices p on p.item_code = cv.sku
  where cv.source = 'pf'
  union all
  select cv.source, cv.sku, cv.style_code, p.retail_price, round(p.retail_price, 2), cv.retail_price
  from catalog_variant_prices cv
  left join bb_prices p on p.sku = cv.sku
  where cv.source = 'bb'
  union all
  select cv.source, cv.sku, cv.style_code, p.wholesale_price, round(p.wholesale_price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join ru_prices p on p.style_code = cv.style_code
  where cv.source = 'ru'
$$;

DROP TABLE IF EXISTS public.ss_price_list_2026;