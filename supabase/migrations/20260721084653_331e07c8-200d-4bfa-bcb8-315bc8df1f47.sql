REVOKE ALL ON FUNCTION public.refresh_mf_public_retail_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_mf_public_retail_prices() TO service_role;