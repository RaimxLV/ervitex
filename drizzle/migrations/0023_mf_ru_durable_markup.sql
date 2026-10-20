DO $patch$
DECLARE definition text;
BEGIN
  SELECT pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure) INTO definition;
  IF position('ROUND(p.retail_price::numeric, 2)' IN definition)=0 THEN RAISE EXCEPTION 'Unexpected MF publication definition'; END IF;
  definition := replace(definition, 'COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2)', 'COALESCE(v.size_name, v.size), ROUND((p.wholesale_price * 1.75)::numeric, 2)');
  IF position('p.retail_price * 1.70' IN definition)=0 THEN RAISE EXCEPTION 'Unexpected Russell publication definition'; END IF;
  EXECUTE definition;
  SELECT pg_get_functiondef('private.price_audit_expected()'::regprocedure) INTO definition;
  IF position('p.wholesale_price * 1.65' IN definition)=0 THEN RAISE EXCEPTION 'Unexpected price audit definition'; END IF;
  definition := replace(definition, 'p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price' || chr(10) || '    FROM public.catalog_variant_prices cv' || chr(10) || '    LEFT JOIN public.mf_prices', 'p.wholesale_price, ROUND(p.wholesale_price * 1.75, 2), cv.retail_price' || chr(10) || '    FROM public.catalog_variant_prices cv' || chr(10) || '    LEFT JOIN public.mf_prices');
  definition := replace(definition, 'p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price' || chr(10) || '    FROM public.catalog_variant_prices cv' || chr(10) || '    LEFT JOIN public.ru_prices', 'p.retail_price, ROUND(p.retail_price * 1.70, 2), cv.retail_price' || chr(10) || '    FROM public.catalog_variant_prices cv' || chr(10) || '    LEFT JOIN public.ru_prices');
  IF position('p.wholesale_price * 1.65' IN definition)>0 THEN RAISE EXCEPTION 'MF/RU audit patch incomplete'; END IF;
  EXECUTE definition;
END $patch$;