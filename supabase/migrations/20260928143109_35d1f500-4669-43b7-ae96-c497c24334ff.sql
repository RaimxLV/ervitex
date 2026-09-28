CREATE OR REPLACE FUNCTION public.nwg_price_targets(only_missing boolean DEFAULT true, lim integer DEFAULT 1000, off integer DEFAULT 0)
RETURNS TABLE(sku text, product_number text, item_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT k.sku, k.product_number, k.item_number
  FROM public.nwg_skus k
  JOIN public.nwg_styles s ON s.product_number = k.product_number
  JOIN public.nwg_variants v
    ON v.product_number = k.product_number
   AND v.item_number = k.item_number
  WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
    AND COALESCE(s.published, true) = true
    AND COALESCE(s.archived, false) = false
    AND COALESCE(k.active, true) = true
    AND COALESCE(k.discontinued, false) = false
    AND (
      NOT only_missing
      OR (
        k.purchase_price IS NULL
        AND (
          k.purchase_updated_at IS NULL
          OR k.purchase_updated_at < now() - interval '20 hours'
        )
      )
    )
  ORDER BY k.sku
  OFFSET GREATEST(off, 0)
  LIMIT GREATEST(lim, 1);
$function$;