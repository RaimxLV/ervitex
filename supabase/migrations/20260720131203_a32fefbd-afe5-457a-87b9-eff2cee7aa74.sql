DROP VIEW IF EXISTS public.ss_public_retail_prices;

CREATE TABLE public.ss_public_retail_prices (
  style_code text PRIMARY KEY,
  retail_price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ss_public_retail_prices TO anon, authenticated;
GRANT ALL ON public.ss_public_retail_prices TO service_role;

ALTER TABLE public.ss_public_retail_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ss retail prices public read"
ON public.ss_public_retail_prices FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "ss retail prices admin write"
ON public.ss_public_retail_prices FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.refresh_ss_public_retail_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ss_public_retail_prices;
  INSERT INTO public.ss_public_retail_prices (style_code, retail_price, currency)
  SELECT style_code,
         MIN(suggested_retail_price),
         COALESCE(MAX(currency), 'EUR')
    FROM public.ss_prices
   WHERE suggested_retail_price IS NOT NULL AND suggested_retail_price > 0
   GROUP BY style_code;
END;
$$;

SELECT public.refresh_ss_public_retail_prices();