CREATE TABLE IF NOT EXISTS public.catalog_variant_prices (
  source text NOT NULL,
  sku text NOT NULL,
  style_code text NOT NULL,
  color_code text,
  size text,
  retail_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, sku)
);

GRANT SELECT ON public.catalog_variant_prices TO anon, authenticated;
GRANT ALL ON public.catalog_variant_prices TO service_role;
ALTER TABLE public.catalog_variant_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_variant_prices public read" ON public.catalog_variant_prices FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS catalog_variant_prices_style_idx ON public.catalog_variant_prices (source, style_code);

CREATE TABLE IF NOT EXISTS public.catalog_price_ranges (
  source text NOT NULL,
  style_code text NOT NULL,
  min_price numeric NOT NULL,
  max_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, style_code)
);

GRANT SELECT ON public.catalog_price_ranges TO anon, authenticated;
GRANT ALL ON public.catalog_price_ranges TO service_role;
ALTER TABLE public.catalog_price_ranges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_price_ranges public read" ON public.catalog_price_ranges FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.catalog_variant_prices;

  -- Stanley/Stella (suggested retail, excl. VAT)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ss', p.sku, p.style_code, ROUND(p.suggested_retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ss_prices p
   WHERE p.suggested_retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Malfini
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p
    JOIN public.mf_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Beechfield family
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p
    JOIN public.bb_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- PF Concept (already marked up in pf_public_retail_prices)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'pf', p.item_code, p.model_code, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Russell (supplier price x 1.65 markup, excl. VAT)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- New Wave Group
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, k.size, ROUND(k.retail_price::numeric, 2), COALESCE(k.currency, 'EUR')
    FROM public.nwg_skus k
   WHERE k.retail_price > 0 AND COALESCE(k.discontinued, false) = false
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_catalog_prices() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_prices() TO authenticated, service_role;

SELECT public.refresh_catalog_prices();