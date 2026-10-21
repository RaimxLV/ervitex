-- Surgical MF SKU outlet guard; no refresh invocation or data changes.
DO $patch$
DECLARE definition text; needle text := 'AND NOT ms.is_outlet ON CONFLICT DO NOTHING;';
BEGIN
  SELECT pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure) INTO definition;
  IF strpos(definition, 'nomenclature_outlet_guard') > 0 THEN RETURN; END IF;
  IF strpos(definition, needle) = 0 THEN RAISE EXCEPTION 'MF refresh source has changed; review required'; END IF;
  definition := replace(definition, needle, $guard$AND NOT ms.is_outlet
    -- nomenclature_outlet_guard: exact SKU only, no substitute prices.
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(ms.raw->'variants','[]'::jsonb)) variant
      CROSS JOIN LATERAL jsonb_array_elements(COALESCE(variant->'nomenclatures','[]'::jsonb)) nomenclature
      WHERE nomenclature->>'productSizeCode' = p.sku
        AND COALESCE(NULLIF(btrim(nomenclature->>'outlet'),''),'0') <> '0'
    ) ON CONFLICT DO NOTHING;$guard$);
  EXECUTE definition;
END
$patch$;
