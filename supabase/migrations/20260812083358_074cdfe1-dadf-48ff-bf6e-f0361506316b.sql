DROP FUNCTION IF EXISTS public.nwg_price_targets(boolean, integer);

CREATE OR REPLACE FUNCTION public.nwg_price_targets(only_missing boolean DEFAULT true, lim integer DEFAULT 1000, off integer DEFAULT 0)
RETURNS TABLE(sku text, product_number text, item_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH visible AS (
    SELECT s.product_number
      FROM public.nwg_styles s
     WHERE s.brand IN ('Craft','Clique','ProJob','Cutter & Buck')
       AND COALESCE(s.published, true) = true
       AND COALESCE(s.archived, false) = false
  ), reps AS (
    SELECT DISTINCT ON (k.product_number, COALESCE(k.size,''))
           k.sku, k.product_number, k.item_number, k.purchase_price
      FROM public.nwg_skus k
      JOIN visible v ON v.product_number = k.product_number
     WHERE COALESCE(k.active, true) = true
       AND COALESCE(k.discontinued, false) = false
     ORDER BY k.product_number, COALESCE(k.size,''), (k.purchase_price IS NULL) DESC, k.sku
  ), filtered AS (
    SELECT r.sku, r.product_number, r.item_number
      FROM reps r
     WHERE NOT only_missing OR r.purchase_price IS NULL
     ORDER BY r.sku
  )
  SELECT * FROM filtered OFFSET GREATEST(off, 0) LIMIT GREATEST(lim, 1);
$$;

REVOKE ALL ON FUNCTION public.nwg_price_targets(boolean, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nwg_price_targets(boolean, integer, integer) TO service_role;