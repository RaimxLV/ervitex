-- Prepared only. Root must stage/verify these exact bytes before applying.
-- No refresh, supplier invocation, price recalculation, unhide, or customer-data mutation.
CREATE TABLE private.supplier_regular_prices (
  source text NOT NULL,
  sku text NOT NULL,
  style_code text NOT NULL,
  color_code text,
  size text,
  regular_unit_base numeric,
  retail_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  evidence_kind text NOT NULL CHECK (evidence_kind IN ('held_legacy','verified_regular')),
  evidence_ref text NOT NULL,
  verified_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(source,sku),
  CHECK (retail_price > 0),
  CHECK (regular_unit_base IS NULL OR regular_unit_base > 0),
  CHECK (evidence_kind <> 'verified_regular' OR (verified_at IS NOT NULL AND regular_unit_base IS NOT NULL))
);
GRANT ALL ON private.supplier_regular_prices TO service_role;
REVOKE ALL ON private.supplier_regular_prices FROM anon, authenticated;
ALTER TABLE private.supplier_regular_prices ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE private.supplier_regular_prices IS 'Exact-SKU price evidence. held_legacy is NOT verification of normal price; only reviewed same-SKU evidence permits new public pricing.';

-- Narrow additive backfill: preserve only currently published MF139 values,
-- explicitly labelled unverified legacy. Missing 24 prices are NOT reconstructed.
INSERT INTO private.supplier_regular_prices(source,sku,style_code,color_code,size,retail_price,currency,evidence_kind,evidence_ref)
SELECT source,sku,style_code,color_code,size,retail_price,currency,'held_legacy','MF139 existing published value, 2026-10-21; regular semantics not re-certified'
FROM public.catalog_variant_prices WHERE source='mf' AND style_code='139' AND retail_price>0;

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
BEGIN
  -- Never DELETE/rebuild from a possibly discounted supplier purchase feed.
  -- Held public rows remain byte-for-byte unchanged; new/changed values require
  -- reviewed regular evidence with the existing supplier formula already applied.
  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
  SELECT source,sku,style_code,color_code,size,retail_price,currency
  FROM private.supplier_regular_prices WHERE evidence_kind='verified_regular'
  ON CONFLICT(source,sku) DO UPDATE SET
    retail_price=EXCLUDED.retail_price,currency=EXCLUDED.currency,updated_at=now();
  INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
  SELECT source,style_code,min(retail_price),max(retail_price),max(currency)
  FROM public.catalog_variant_prices GROUP BY source,style_code
  ON CONFLICT(source,style_code) DO UPDATE SET
    min_price=EXCLUDED.min_price,max_price=EXCLUDED.max_price,currency=EXCLUDED.currency,updated_at=now();
END $fn$;
REVOKE ALL ON FUNCTION public.refresh_catalog_prices() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_prices() TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_utt_catalog_prices()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $fn$
DECLARE affected integer;
BEGIN
  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
  SELECT source,sku,style_code,color_code,size,retail_price,currency
  FROM private.supplier_regular_prices WHERE source='utt' AND evidence_kind='verified_regular'
  ON CONFLICT(source,sku) DO UPDATE SET
    retail_price=EXCLUDED.retail_price,currency=EXCLUDED.currency,updated_at=now();
  GET DIAGNOSTICS affected=ROW_COUNT;
  INSERT INTO public.catalog_price_ranges(source,style_code,min_price,max_price,currency)
  SELECT source,style_code,min(retail_price),max(retail_price),max(currency)
  FROM public.catalog_variant_prices WHERE source='utt' GROUP BY source,style_code
  ON CONFLICT(source,style_code) DO UPDATE SET
    min_price=EXCLUDED.min_price,max_price=EXCLUDED.max_price,currency=EXCLUDED.currency,updated_at=now();
  RETURN affected;
END $fn$;
REVOKE ALL ON FUNCTION public.refresh_utt_catalog_prices() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_utt_catalog_prices() TO service_role;

-- Remove automatic outlet/price-presence suppression, preserve all existing
-- published/archived/manual-hidden checks. Guard the exact current definition.
DO $view$
DECLARE definition text;
BEGIN
  SELECT pg_get_viewdef('public.catalog_items'::regclass,true) INTO definition;
  IF strpos(definition,'ms.is_outlet')=0 OR strpos(definition,'NOT v.outlet')=0 THEN
    RAISE EXCEPTION 'catalog_items changed: review before applying';
  END IF;
  definition := regexp_replace(definition,
    ' AND NOT \(m.source = ''mf''::text AND \(m.id IN \( SELECT ms.style_code[[:space:]]+FROM mf_styles ms[[:space:]]+WHERE ms.is_outlet\)\)\)', '', 'g');
  definition := replace(definition,' AND NOT v.outlet','');
  -- NWG price presence must not hide a still-listed product.
  definition := regexp_replace(definition,
    '\(m.source <> ''nwg''::text OR \(m.id IN \( SELECT r.style_code[[:space:]]+FROM catalog_price_ranges r[[:space:]]+WHERE r.source = ''nwg''::text AND r.min_price > 0::numeric\)\)\)', 'true', 'g');
  definition := regexp_replace(definition,
    ' AND \(EXISTS \( SELECT 1[[:space:]]+FROM catalog_price_ranges r[[:space:]]+WHERE r.source = ''fr''::text AND r.style_code = s.style_code AND r.min_price > 0::numeric\)\)', '', 'g');
  IF strpos(definition,'ms.is_outlet')>0 OR strpos(definition,'NOT v.outlet')>0 THEN
    RAISE EXCEPTION 'Outlet filter removal did not match; no changes applied';
  END IF;
  EXECUTE 'CREATE OR REPLACE VIEW public.catalog_items AS ' || definition;
END $view$;