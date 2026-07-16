
CREATE TABLE IF NOT EXISTS public.pf_prices (
  item_code text PRIMARY KEY,
  currency text,
  price numeric,
  list_price numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pf_prices TO authenticated;
GRANT ALL ON public.pf_prices TO service_role;

ALTER TABLE public.pf_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read pf_prices"
  ON public.pf_prices FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS pf_prices_updated_idx ON public.pf_prices(updated_at DESC);

-- Public retail price view (applies formula) — safe to expose to anon.
CREATE OR REPLACE VIEW public.pf_retail_prices
WITH (security_invoker = true)
AS
SELECT
  v.item_code,
  v.model_code,
  round((p.price * coalesce(nullif(current_setting('app.pf_markup', true), '')::numeric, 1.0165) * 1.0165)::numeric, 2) AS retail_price,
  p.currency
FROM public.pf_variants v
JOIN public.pf_prices p ON p.item_code = v.item_code
WHERE p.price IS NOT NULL AND p.price > 0;

GRANT SELECT ON public.pf_retail_prices TO anon, authenticated;
