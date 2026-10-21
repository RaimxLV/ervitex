-- PREPARED ONLY: replaces rejected broad 009. Root review required; no refresh invocation.
-- Existing public MF promo values are held, NOT certified regular evidence.
-- Missing MF139 prices are not reconstructed. Other supplier formulas/gates unchanged.
DO $patch$
DECLARE
  definition text;
  old_delete text := 'DELETE FROM public.catalog_variant_prices WHERE source IS NOT NULL;';
  old_guard text := $old$AND NOT ms.is_outlet
    -- nomenclature_outlet_guard: exact SKU only, no substitute prices.
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(ms.raw->'variants','[]'::jsonb)) variant
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(variant->'nomenclatures','[]'::jsonb)) nomenclature
      WHERE nomenclature->>'productSizeCode' = p.sku
        AND COALESCE(NULLIF(btrim(nomenclature->>'outlet'),''),'0') <> '0'
    ) ON CONFLICT DO NOTHING;$old$;
BEGIN
  SELECT pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure) INTO definition;
  IF md5(definition) <> '70fe11431867e526b6c12957762bd5f3' THEN
    RAISE EXCEPTION 'MF surgical patch: refresh definition changed; review required';
  END IF;
  IF strpos(definition,old_delete)=0 OR strpos(definition,old_guard)=0 THEN
    RAISE EXCEPTION 'MF surgical patch: expected 008 fragments absent';
  END IF;
  definition := replace(definition,old_delete,$new$-- mf_promo_hold: retain existing exact-SKU public values, without certifying them.
  DELETE FROM public.catalog_variant_prices cp WHERE cp.source IS NOT NULL
    AND NOT (cp.source = 'mf' AND EXISTS (
      SELECT 1 FROM public.mf_variants v JOIN public.mf_styles ms ON ms.style_code = v.style_code
      WHERE v.sku = cp.sku AND (ms.is_outlet OR EXISTS (
        SELECT 1 FROM jsonb_array_elements(COALESCE(ms.raw->'variants','[]'::jsonb)) variant
        CROSS JOIN LATERAL jsonb_array_elements(COALESCE(variant->'nomenclatures','[]'::jsonb)) nomenclature
        WHERE nomenclature->>'productSizeCode' = cp.sku
          AND COALESCE(NULLIF(btrim(nomenclature->>'outlet'),''),'0') <> '0'
      ))
    ));$new$);
  -- Promos remain excluded from candidate generation, not from held public rows.
  definition := replace(definition,old_guard,replace(old_guard,
    '-- nomenclature_outlet_guard: exact SKU only, no substitute prices.',
    '-- mf_promo_candidate_guard: no discounted replacement or invented missing price.'));
  EXECUTE definition;
END
$patch$;

DO $view$
DECLARE
  definition text;
  old_filter text := $old$ AND NOT (m.source = 'mf'::text AND (m.id IN ( SELECT ms.style_code
                   FROM mf_styles ms
                  WHERE ms.is_outlet)))$old$;
BEGIN
  SELECT pg_get_viewdef('public.catalog_items'::regclass,true) INTO definition;
  IF md5(definition) <> '26917678018e447c4c1d0c0e8acf1d9f' OR strpos(definition,old_filter)=0 THEN
    RAISE EXCEPTION 'MF surgical patch: catalog view changed; review required';
  END IF;
  -- Only MF outlet-model suppression removed. NWG/FR price gates, UTT filters,
  -- underlying published/manual-hidden checks and footwear exclusions untouched.
  definition := replace(definition,old_filter,'');
  EXECUTE 'CREATE OR REPLACE VIEW public.catalog_items AS ' || definition;
END
$view$;