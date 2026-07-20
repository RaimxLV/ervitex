REVOKE EXECUTE ON FUNCTION public.refresh_ss_public_retail_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_ss_public_retail_prices() TO service_role;