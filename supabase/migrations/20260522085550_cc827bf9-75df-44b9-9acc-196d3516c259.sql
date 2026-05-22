-- Restore public SELECT on products (was revoked by previous security migration)
GRANT SELECT ON public.products TO anon, authenticated;

-- Protect sensitive wholesale columns at row level via column privileges:
-- Revoke just the sensitive columns from public roles
REVOKE SELECT (wholesale_price, bulk_discount_percent, bulk_min_qty) ON public.products FROM anon;

-- Authenticated non-admins also shouldn't see wholesale; revoke and re-grant via admin path
REVOKE SELECT (wholesale_price, bulk_discount_percent, bulk_min_qty) ON public.products FROM authenticated;

-- Provide an admin-only function to fetch wholesale data when needed
CREATE OR REPLACE FUNCTION public.get_product_wholesale(_product_id uuid)
RETURNS TABLE(wholesale_price numeric, bulk_discount_percent numeric, bulk_min_qty integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.wholesale_price, p.bulk_discount_percent, p.bulk_min_qty
  FROM public.products p
  WHERE p.id = _product_id
    AND public.has_role(auth.uid(), 'admin'::app_role);
$$;

GRANT EXECUTE ON FUNCTION public.get_product_wholesale(uuid) TO authenticated;