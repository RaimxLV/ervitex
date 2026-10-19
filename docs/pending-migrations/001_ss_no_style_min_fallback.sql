-- NEIZPILDĪTS. Noņem MIN(style) rezerves cenu; formula ×1,75 nemainās.
CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
 RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
SELECT v.sku, v.style_code, v.color_code, v.size_code,
       ROUND(p.purchase_price * 1.75, 2) AS retail_price
  FROM public.ss_variants v
  JOIN public.ss_prices p ON p.sku = v.sku AND p.purchase_price > 0
 WHERE v.published;
$function$;
