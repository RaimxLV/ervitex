ALTER VIEW public.catalog_items SET (security_invoker = true);
REVOKE ALL ON FUNCTION public.get_product_wholesale(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_product_wholesale(uuid) TO service_role;