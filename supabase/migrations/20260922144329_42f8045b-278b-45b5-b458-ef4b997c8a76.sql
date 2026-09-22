-- catalog_items is already publicly readable, so no elevated rights are needed.
ALTER FUNCTION public.catalog_items_lite(text, integer, integer) SECURITY INVOKER;