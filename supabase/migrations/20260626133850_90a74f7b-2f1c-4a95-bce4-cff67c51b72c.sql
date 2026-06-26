
-- Drop the view approach; use column-level grants instead
DROP VIEW IF EXISTS public.products_public;

-- Anonymous users: only safe columns
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, category_id, name_lv, name_en, description_lv, description_en,
  long_description_lv, long_description_en, material, min_order,
  retail_price, bulk_discount_percent, bulk_min_qty, printing_techs,
  featured, is_new, active, created_at, updated_at, brand,
  ss_style_code, ss_in_stock, hidden_manual, hide_when_oos, last_synced_at
) ON public.products TO anon;

-- Authenticated (admins only, since public sign-ups are disabled) keep full access
GRANT SELECT ON public.products TO authenticated;

-- RLS: allow anon to see active+visible rows; admins see everything
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Public can view visible products"
  ON public.products FOR SELECT
  TO anon
  USING (active = true AND hidden_manual = false);

CREATE POLICY "Authenticated can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);
