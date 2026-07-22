DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'ss_styles','ss_variants','ss_images','ss_sizes','ss_colors','ss_combos','ss_prices','ss_stock','ss_public_retail_prices',
    'nwg_styles','nwg_variants','nwg_images','nwg_skus','nwg_assortments',
    'pf_styles','pf_variants','pf_images','pf_prices','pf_public_retail_prices',
    'bb_styles','bb_variants','bb_images','bb_prices',
    'mf_styles','mf_variants','mf_images','mf_prices','mf_stock','mf_public_retail_prices'
  ]) LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
  END LOOP;
END$$;