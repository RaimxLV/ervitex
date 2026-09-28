CREATE OR REPLACE FUNCTION public.supplier_price_health()
RETURNS TABLE(source text, total_variants bigint, priced_variants bigint, contract_priced bigint, fallback_priced bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT health.*
  FROM (
    SELECT 'stanley-stella'::text AS source,
           count(*)::bigint AS total_variants,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'ss' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint AS priced_variants,
           0::bigint AS contract_priced,
           0::bigint AS fallback_priced
    FROM public.ss_variants v
    WHERE v.published = true

    UNION ALL

    SELECT 'nwg'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'nwg' AND c.sku = k.sku AND c.retail_price > 0
           ))::bigint,
           count(*) FILTER (WHERE k.purchase_price > 0)::bigint,
           count(*) FILTER (
             WHERE COALESCE(k.purchase_price, 0) <= 0
               AND k.retail_price > 0
               AND EXISTS (
                 SELECT 1 FROM public.catalog_variant_prices c
                 WHERE c.source = 'nwg' AND c.sku = k.sku AND c.retail_price > 0
               )
           )::bigint
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
      AND COALESCE(s.published, true) = true
      AND COALESCE(s.archived, false) = false
      AND COALESCE(k.active, true) = true
      AND COALESCE(k.discontinued, false) = false

    UNION ALL

    SELECT 'pf'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'pf' AND c.sku = v.item_code AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.pf_variants v

    UNION ALL

    SELECT 'bb'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'bb' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.bb_variants v
    JOIN public.bb_styles s ON s.style_code = v.style_code
    WHERE s.active = true AND v.active = true

    UNION ALL

    SELECT 'malfini'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'mf' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.mf_variants v
    JOIN public.mf_styles s ON s.style_code = v.style_code
    WHERE s.published = true AND s.hidden_by_admin = false
  ) health
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
$function$;

REVOKE ALL ON FUNCTION public.supplier_price_health() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.supplier_price_health() FROM anon;
GRANT EXECUTE ON FUNCTION public.supplier_price_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.supplier_price_health() TO service_role;