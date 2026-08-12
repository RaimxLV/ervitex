CREATE OR REPLACE FUNCTION public.nwg_price_targets(only_missing boolean DEFAULT true, lim integer DEFAULT 20000)
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
  )
  SELECT r.sku, r.product_number, r.item_number
    FROM reps r
   WHERE NOT only_missing OR r.purchase_price IS NULL
   LIMIT lim;
$$;

CREATE OR REPLACE FUNCTION public.nwg_propagate_purchase_prices()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  WITH src AS (
    SELECT product_number, COALESCE(size,'') AS sz,
           MIN(purchase_price) AS price, MIN(purchase_currency) AS cur
      FROM public.nwg_skus
     WHERE COALESCE(purchase_price,0) > 0
     GROUP BY 1,2
  ), upd AS (
    UPDATE public.nwg_skus k
       SET purchase_price = s.price,
           purchase_currency = COALESCE(s.cur,'EUR'),
           purchase_updated_at = now()
      FROM src s
     WHERE s.product_number = k.product_number
       AND s.sz = COALESCE(k.size,'')
       AND k.purchase_price IS NULL
    RETURNING 1
  )
  SELECT count(*) INTO n FROM upd;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.nwg_price_targets(boolean, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.nwg_propagate_purchase_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nwg_price_targets(boolean, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.nwg_propagate_purchase_prices() TO service_role;