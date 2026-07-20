CREATE TABLE IF NOT EXISTS public.pf_public_retail_prices (
  item_code TEXT PRIMARY KEY,
  model_code TEXT NOT NULL,
  retail_price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pf_public_retail_prices TO anon;
GRANT SELECT ON public.pf_public_retail_prices TO authenticated;
GRANT ALL ON public.pf_public_retail_prices TO service_role;

ALTER TABLE public.pf_public_retail_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "PF public retail prices are readable" ON public.pf_public_retail_prices;
CREATE POLICY "PF public retail prices are readable"
ON public.pf_public_retail_prices
FOR SELECT
TO public
USING (true);

CREATE INDEX IF NOT EXISTS idx_pf_public_retail_prices_model_code
ON public.pf_public_retail_prices(model_code);

INSERT INTO public.pf_public_retail_prices (item_code, model_code, retail_price, currency, updated_at)
SELECT item_code, model_code, retail_price, COALESCE(currency, 'EUR'), now()
FROM public.pf_retail_prices
WHERE retail_price IS NOT NULL AND retail_price > 0
ON CONFLICT (item_code) DO UPDATE SET
  model_code = EXCLUDED.model_code,
  retail_price = EXCLUDED.retail_price,
  currency = EXCLUDED.currency,
  updated_at = EXCLUDED.updated_at;