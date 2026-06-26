
-- Restore full table SELECT for authenticated/service_role (admins via RLS); remove anon column grants
REVOKE SELECT ON public.products FROM anon, authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Tighten RLS: only admins can SELECT from base table
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Drop helper RPC no longer needed
DROP FUNCTION IF EXISTS public.admin_get_product_full(uuid);

-- Public view with only safe display columns
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public
WITH (security_invoker = true) AS
SELECT
  id, category_id, name_lv, name_en, description_lv, description_en,
  long_description_lv, long_description_en, material, min_order,
  retail_price, bulk_discount_percent, bulk_min_qty, printing_techs,
  featured, is_new, active, created_at, updated_at, brand,
  ss_style_code, ss_in_stock, last_synced_at
FROM public.products
WHERE active = true
  AND hidden_manual = false
  AND (hide_when_oos = false OR ss_in_stock = true);

GRANT SELECT ON public.products_public TO anon, authenticated;
