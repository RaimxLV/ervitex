CREATE OR REPLACE VIEW public.ss_public_retail_prices
WITH (security_invoker=on) AS
SELECT
  style_code,
  MIN(suggested_retail_price) AS retail_price,
  MAX(currency) AS currency
FROM public.ss_prices
WHERE suggested_retail_price IS NOT NULL AND suggested_retail_price > 0
GROUP BY style_code;

GRANT SELECT ON public.ss_public_retail_prices TO anon, authenticated;

CREATE POLICY "ss_prices public retail read"
ON public.ss_prices FOR SELECT
TO anon, authenticated
USING (suggested_retail_price IS NOT NULL);