REVOKE EXECUTE ON FUNCTION public.price_audit_summary() FROM anon;
REVOKE EXECUTE ON FUNCTION public.price_audit_mismatches(text, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.price_audit_lookup(text, integer) FROM anon;