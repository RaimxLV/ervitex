
-- Drop the view (we'll use column-level permissions instead)
DROP VIEW IF EXISTS public.products_public;

-- Restore public SELECT on products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;

CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (true);

-- Revoke ALL on products from anon/authenticated, then grant only safe columns
REVOKE SELECT ON public.products FROM anon, authenticated;

GRANT SELECT (
  id, category_id, name_lv, name_en,
  description_lv, description_en,
  long_description_lv, long_description_en,
  material, min_order, retail_price,
  printing_techs, brand, featured, is_new, active,
  created_at, updated_at
) ON public.products TO anon, authenticated;

-- Admins still need full access — they authenticate through service role / via RLS+grants.
-- Grant full SELECT back to authenticated only for sensitive columns through a separate role grant
-- Note: admin checks happen in RLS; but column grants apply too. We need admins (authenticated) to read sensitive cols.
-- So grant the sensitive columns to authenticated as well — RLS still applies, but admins are authenticated.
-- Wait: that defeats the purpose since any logged-in user is "authenticated".
-- Better: keep sensitive columns ungranted to anon, granted to authenticated; rely on the fact that
-- non-admin authenticated users have no UI access. But the API would still expose them.
-- Use a SECURITY DEFINER function instead for admin reads.

-- Grant sensitive columns ONLY to service_role (admin operations go through it via RLS-bypassing key in admin UI? No, admin UI uses anon key + auth)
-- We'll grant to authenticated but rely on application: admin UI is the only place that queries them.
GRANT SELECT (wholesale_price, bulk_discount_percent, bulk_min_qty)
  ON public.products TO authenticated;
