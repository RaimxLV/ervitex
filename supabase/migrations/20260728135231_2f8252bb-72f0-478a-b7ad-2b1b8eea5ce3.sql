CREATE TABLE public.ss_price_list_2026 (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  style_code text NOT NULL,
  color_group text NOT NULL,
  size_range text,
  is_large_size boolean NOT NULL DEFAULT false,
  price numeric NOT NULL,
  price_vat numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ss_price_list_2026 TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ss_price_list_2026 TO authenticated;
GRANT ALL ON public.ss_price_list_2026 TO service_role;

ALTER TABLE public.ss_price_list_2026 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ss_price_list_public_read" ON public.ss_price_list_2026
  FOR SELECT USING (true);
CREATE POLICY "ss_price_list_admin_write" ON public.ss_price_list_2026
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ss_price_list_style ON public.ss_price_list_2026 (style_code, is_large_size, price);

CREATE TRIGGER trg_ss_price_list_updated_at
  BEFORE UPDATE ON public.ss_price_list_2026
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-SKU Stanley/Stella retail prices from the 2026 sales price list.
CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH ex AS (
  SELECT DISTINCT l.style_code, l.is_large_size AS big, ROUND(l.price::numeric, 2) AS price
    FROM public.ss_price_list_2026 l
   WHERE l.price > 0
), exr AS (
  SELECT style_code, big, price,
         DENSE_RANK() OVER (PARTITION BY style_code, big ORDER BY price) AS rk,
         COUNT(*) OVER (PARTITION BY style_code, big) AS tiers
    FROM ex
), sk AS (
  SELECT p.sku, p.style_code, v.color_code, v.size_code, p.purchase_price,
         (COALESCE(v.size_code,'') ~* '4XL|5XL') AS big
    FROM public.ss_prices p
    JOIN public.ss_variants v ON v.sku = p.sku
   WHERE p.purchase_price > 0
), sk_tiers AS (
  SELECT style_code, big, COUNT(DISTINCT purchase_price) AS tiers
    FROM sk GROUP BY style_code, big
), skr AS (
  SELECT sk.*, t.tiers,
         DENSE_RANK() OVER (PARTITION BY sk.style_code, sk.big ORDER BY sk.purchase_price) AS rk
    FROM sk
    JOIN sk_tiers t ON t.style_code = sk.style_code AND t.big = sk.big
)
SELECT skr.sku, skr.style_code, skr.color_code, skr.size_code,
       COALESCE(
         CASE WHEN exr.tiers = skr.tiers THEN exr.price END,
         ROUND(skr.purchase_price * 1.25, 2)
       ) AS retail_price
  FROM skr
  LEFT JOIN exr
    ON exr.style_code = skr.style_code
   AND exr.big = skr.big
   AND exr.rk = skr.rk;
$function$;

REVOKE EXECUTE ON FUNCTION public.ss_sku_retail_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ss_sku_retail_prices() TO service_role;

-- Style-level public price (min) now follows the 2026 list too.
CREATE OR REPLACE FUNCTION public.refresh_ss_public_retail_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.ss_public_retail_prices;
  INSERT INTO public.ss_public_retail_prices (style_code, retail_price, currency)
  SELECT style_code, MIN(retail_price), 'EUR'
    FROM public.ss_sku_retail_prices()
   WHERE retail_price > 0
   GROUP BY style_code;
END;
$function$;

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

  -- New Wave Group
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, k.item_number, k.size, ROUND(k.retail_price::numeric, 2), COALESCE(k.currency, 'EUR')
    FROM public.nwg_skus k
   WHERE k.retail_price > 0 AND COALESCE(k.discontinued, false) = false
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$function$;