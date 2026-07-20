DROP POLICY IF EXISTS "ss_prices public retail read" ON public.ss_prices;

DROP VIEW IF EXISTS public.ss_public_retail_prices;
CREATE VIEW public.ss_public_retail_prices AS
SELECT
  style_code,
  MIN(suggested_retail_price) AS retail_price,
  MAX(currency) AS currency
FROM public.ss_prices
WHERE suggested_retail_price IS NOT NULL AND suggested_retail_price > 0
GROUP BY style_code;

GRANT SELECT ON public.ss_public_retail_prices TO anon, authenticated;