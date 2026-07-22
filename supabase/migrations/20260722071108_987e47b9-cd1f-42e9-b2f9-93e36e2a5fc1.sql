DO $$
DECLARE
  rel text;
  rels text[] := ARRAY[
    'catalog_items',
    'ss_styles','ss_variants','ss_images','ss_public_retail_prices',
    'nwg_styles','nwg_variants','nwg_images','nwg_skus','nwg_assortments',
    'pf_styles','pf_variants','pf_images','pf_public_retail_prices',
    'bb_styles','bb_variants','bb_images','bb_prices','bb_public_retail_prices',
    'mf_styles','mf_variants','mf_images','mf_prices','mf_public_retail_prices'
  ];
BEGIN
  FOREACH rel IN ARRAY rels LOOP
    IF to_regclass(format('public.%I', rel)) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', rel);
      EXECUTE format('GRANT SELECT ON public.%I TO authenticated', rel);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', rel);
    END IF;
  END LOOP;
END;
$$;