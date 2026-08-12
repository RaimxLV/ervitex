ALTER VIEW public.catalog_items SET (security_invoker = true);

ALTER FUNCTION public.price_audit_lookup(text, integer) SECURITY INVOKER;
ALTER FUNCTION public.price_audit_mismatches(text, integer) SECURITY INVOKER;
ALTER FUNCTION public.price_audit_summary() SECURITY INVOKER;