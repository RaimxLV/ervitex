ALTER TABLE public.nwg_skus
  ADD COLUMN IF NOT EXISTS purchase_price numeric,
  ADD COLUMN IF NOT EXISTS purchase_currency text,
  ADD COLUMN IF NOT EXISTS purchase_updated_at timestamptz;

CREATE TABLE IF NOT EXISTS public.nwg_auth (
  id integer PRIMARY KEY DEFAULT 1,
  refresh_token text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.nwg_auth TO service_role;
ALTER TABLE public.nwg_auth ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices;

  -- Stanley/Stella (2026 sales price list, excl. VAT)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r
   WHERE r.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Malfini
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p
    JOIN public.mf_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Beechfield family
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p
    JOIN public.bb_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- PF Concept
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, p.model_code,
         COALESCE(v.color_code, v.color_desc, p.item_code), v.size,
         ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p
    LEFT JOIN public.pf_variants v ON v.item_code = p.item_code
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- Russell (supplier price x 1.65, excl. VAT)
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  -- New Wave Group: prefer our contract price x 1.65 x 1.21 (VAT), fall back to list price
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, k.item_number, k.size,
         CASE
           WHEN k.purchase_price IS NOT NULL AND k.purchase_price > 0
             THEN ROUND((k.purchase_price * 1.65 * 1.21)::numeric, 2)
           ELSE ROUND(k.retail_price::numeric, 2)
         END,
         COALESCE(k.purchase_currency, k.currency, 'EUR')
    FROM public.nwg_skus k
   WHERE COALESCE(k.discontinued, false) = false
     AND (COALESCE(k.purchase_price, 0) > 0 OR COALESCE(k.retail_price, 0) > 0)
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$function$;