
-- 1) Products: column-level SELECT for anon/authenticated, excluding sensitive columns
REVOKE SELECT ON public.products FROM anon, authenticated;

GRANT SELECT (
  id, category_id, name_lv, name_en, description_lv, description_en,
  long_description_lv, long_description_en, material, min_order,
  retail_price, bulk_discount_percent, bulk_min_qty, printing_techs,
  featured, is_new, active, created_at, updated_at, brand,
  ss_style_code, ss_in_stock, last_synced_at
) ON public.products TO anon, authenticated;

-- Admins still need full access via authenticated role + admin check; grant write back
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Tighten SELECT policy to active rows only
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Admins can read everything (including hidden + sensitive cols via has_role bypass on column grants? column grants still apply)
-- For admin full read, also grant select on all columns to authenticated only via separate policy isn't enough; need column grants.
-- Provide RPC for admin to read full row instead:
CREATE OR REPLACE FUNCTION public.admin_get_product_full(_id uuid)
RETURNS SETOF public.products
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.products WHERE id = _id AND public.has_role(auth.uid(), 'admin'::app_role);
$$;
REVOKE ALL ON FUNCTION public.admin_get_product_full(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_product_full(uuid) TO authenticated;

-- 2) SECURITY DEFINER functions: revoke broad EXECUTE
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_product_wholesale(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_product_wholesale(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_quote_request() FROM PUBLIC, anon, authenticated;

-- 3) Storage: stop anonymous listing of product-images bucket.
-- Files remain accessible via direct public URL because bucket.public = true.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Admins can list product images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));
