DO $migration$
DECLARE definition text; updated_definition text;
BEGIN
  definition := pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure);
  updated_definition := replace(definition, ') * 1.75)::numeric, 2),', ') * CASE s.brand WHEN ''Craft'' THEN 1.5 WHEN ''ProJob'' THEN 1.5 WHEN ''Cutter & Buck'' THEN 1.5 ELSE 1.75 END)::numeric, 2),');
  IF definition = updated_definition THEN RAISE EXCEPTION 'NWG refresh formula not found'; END IF;
  EXECUTE updated_definition;
  definition := pg_get_functiondef('private.price_audit_expected()'::regprocedure);
  updated_definition := replace(definition, ') * 1.75)::numeric, 2) AS expected,', ') * CASE st.brand WHEN ''Craft'' THEN 1.5 WHEN ''ProJob'' THEN 1.5 WHEN ''Cutter & Buck'' THEN 1.5 ELSE 1.75 END)::numeric, 2) AS expected,');
  IF definition = updated_definition THEN RAISE EXCEPTION 'NWG audit formula not found'; END IF;
  EXECUTE updated_definition;
END;
$migration$;
REVOKE ALL ON FUNCTION public.refresh_catalog_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_prices() TO service_role;
REVOKE ALL ON FUNCTION private.price_audit_expected() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.price_audit_expected() TO service_role;

UPDATE public.catalog_variant_prices cv
SET retail_price = a.expected
FROM private.price_audit_expected() a, public.nwg_styles s
WHERE cv.source='nwg' AND a.source=cv.source AND a.sku=cv.sku
AND s.product_number=cv.style_code AND s.brand IN ('Craft','ProJob','Cutter & Buck')
AND a.expected > 0 AND cv.retail_price IS DISTINCT FROM a.expected;

UPDATE public.catalog_price_ranges r
SET min_price=p.min_price, max_price=p.max_price
FROM (
 SELECT cv.style_code, min(cv.retail_price) AS min_price, max(cv.retail_price) AS max_price
 FROM public.catalog_variant_prices cv
 JOIN public.nwg_styles s ON s.product_number=cv.style_code
 WHERE cv.source='nwg' AND s.brand IN ('Craft','ProJob','Cutter & Buck')
 GROUP BY cv.style_code
) p
WHERE r.source='nwg' AND r.style_code=p.style_code;