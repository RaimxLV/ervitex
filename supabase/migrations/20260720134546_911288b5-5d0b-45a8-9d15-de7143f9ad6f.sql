
CREATE OR REPLACE VIEW public.bb_public_retail_prices
WITH (security_invoker = true) AS
SELECT
  v.style_code,
  MIN(p.retail_price)::numeric(10,2) AS retail_price,
  COALESCE(MIN(p.currency), 'EUR')   AS currency
FROM public.bb_prices p
JOIN public.bb_variants v ON v.sku = p.sku
GROUP BY v.style_code;

GRANT SELECT ON public.bb_public_retail_prices TO anon, authenticated;
