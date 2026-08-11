ALTER TABLE public.nwg_variants
  ADD CONSTRAINT nwg_variants_product_item_unique UNIQUE (product_number, item_number);

ALTER TABLE public.nwg_skus
  ADD CONSTRAINT nwg_skus_style_fk
  FOREIGN KEY (product_number) REFERENCES public.nwg_styles(product_number)
  ON UPDATE CASCADE ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT nwg_skus_variant_fk
  FOREIGN KEY (product_number, item_number)
  REFERENCES public.nwg_variants(product_number, item_number)
  ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE public.nwg_images
  ADD CONSTRAINT nwg_images_style_fk
  FOREIGN KEY (product_number) REFERENCES public.nwg_styles(product_number)
  ON UPDATE CASCADE ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT nwg_images_variant_fk
  FOREIGN KEY (product_number, item_number)
  REFERENCES public.nwg_variants(product_number, item_number)
  ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;

ALTER TABLE public.nwg_skus VALIDATE CONSTRAINT nwg_skus_style_fk;
ALTER TABLE public.nwg_skus VALIDATE CONSTRAINT nwg_skus_variant_fk;
ALTER TABLE public.nwg_images VALIDATE CONSTRAINT nwg_images_style_fk;

CREATE OR REPLACE VIEW public.catalog_items AS
WITH base AS (
  SELECT m.source, m.id, m.name, m.description, m.brand, m.category, m.group_name,
         m.gender, m.image_url, m.hover_image_url, m.sort_order, m.colors
    FROM private.catalog_items_mv m
   WHERE m.source <> 'nwg'
      OR EXISTS (
           SELECT 1
             FROM public.nwg_styles s
            WHERE s.product_number = m.id
              AND s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
              AND COALESCE(s.published, true) = true
              AND COALESCE(s.archived, false) = false
              AND cardinality(COALESCE(s.assortment_ids, '{}'::text[])) > 0
              AND NULLIF(btrim(s.name), '') IS NOT NULL
              AND (
                NULLIF(btrim(s.category), '') IS NOT NULL
                OR NULLIF(btrim(s.catalog_text), '') IS NOT NULL
                OR NULLIF(btrim(s.commerce_text), '') IS NOT NULL
                OR NULLIF(btrim(s.usp), '') IS NOT NULL
              )
              AND EXISTS (
                SELECT 1
                  FROM public.nwg_skus k
                  JOIN public.nwg_variants v
                    ON v.product_number = k.product_number
                   AND v.item_number = k.item_number
                 WHERE k.product_number = s.product_number
                   AND COALESCE(k.active, true) = true
                   AND COALESCE(k.discontinued, false) = false
              )
         )
  UNION ALL
  SELECT 'ru'::text AS source,
         s.style_code AS id,
         s.name,
         s.description,
         COALESCE(NULLIF(s.brand, ''), 'Russell') AS brand,
         s.category,
         s.category AS group_name,
         s.gender,
         COALESCE(NULLIF(s.main_image_url, ''), (
           SELECT i.url FROM public.ru_images i
            WHERE i.style_code = s.style_code
            ORDER BY i.sort_order, i.id LIMIT 1
         )) AS image_url,
         (
           SELECT i.url FROM public.ru_images i
            WHERE i.style_code = s.style_code
            ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1
         ) AS hover_image_url,
         600000 AS sort_order,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'h', NULLIF(v.color_hex, ''),
             'n', NULLIF(v.color_name, ''),
             'u', NULL::text,
             'c', NULL::text
           ) ORDER BY v.color_name)
           FILTER (WHERE NULLIF(v.color_name, '') IS NOT NULL OR NULLIF(v.color_hex, '') IS NOT NULL)
             FROM public.ru_variants v
            WHERE v.style_code = s.style_code
         ), '[]'::jsonb) AS colors
    FROM public.ru_styles s
   WHERE COALESCE(s.published, true) = true
     AND COALESCE(s.hidden_by_admin, false) = false
)
SELECT source, id, name, description, brand, category, group_name, gender,
       image_url, hover_image_url, sort_order, colors,
       COALESCE(ARRAY(
         SELECT elem.value ->> 'h'
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE elem.value ->> 'h' IS NOT NULL
       ), ARRAY[]::text[]) AS color_hexes,
       COALESCE(ARRAY(
         SELECT elem.value ->> 'n'
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE elem.value ->> 'n' IS NOT NULL
       ), ARRAY[]::text[]) AS color_names
  FROM base
 ORDER BY sort_order, name;

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE true;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r
   WHERE r.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p
    JOIN public.mf_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p
    JOIN public.bb_variants v ON v.sku = p.sku
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, p.model_code, COALESCE(v.color_code, v.color_desc, p.item_code), v.size,
         ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p
    LEFT JOIN public.pf_variants v ON v.item_code = p.item_code
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p
   WHERE p.retail_price > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, k.item_number, k.size,
         CASE
           WHEN k.purchase_price IS NOT NULL AND k.purchase_price > 0
             THEN ROUND((k.purchase_price * 1.67 * 1.21)::numeric, 2)
           ELSE ROUND(k.retail_price::numeric, 2)
         END,
         CASE
           WHEN k.purchase_price IS NOT NULL AND k.purchase_price > 0
             THEN COALESCE(k.purchase_currency, 'EUR')
           ELSE COALESCE(k.currency, 'EUR')
         END
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    JOIN public.nwg_variants v
      ON v.product_number = k.product_number
     AND v.item_number = k.item_number
   WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
     AND COALESCE(s.published, true) = true
     AND COALESCE(s.archived, false) = false
     AND COALESCE(k.active, true) = true
     AND COALESCE(k.discontinued, false) = false
     AND (COALESCE(k.purchase_price, 0) > 0 OR COALESCE(k.retail_price, 0) > 0)
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges WHERE true;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices
   GROUP BY source, style_code;
END;
$function$;

REVOKE ALL ON FUNCTION public.refresh_catalog_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_prices() TO service_role;

SELECT public.refresh_catalog_prices();