
-- Fix has_role to properly evaluate against user_roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Restrict anonymous access to sensitive pricing columns on products.
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, category_id, name_lv, name_en, description_lv, description_en,
  long_description_lv, long_description_en, material,
  retail_price, printing_techs, featured, is_new, active,
  created_at, updated_at, brand, ss_style_code, ss_in_stock, ss_stock_qty,
  price_override, hidden_manual, hide_when_oos, last_synced_at, nwg_product_number
) ON public.products TO anon;
