-- 003 ROLLBACK. Restores the exact function/view definitions captured 2026-10-19 and the snapshot rows.
-- Added columns stay (non-breaking, defaults false).
CREATE OR REPLACE FUNCTION public.ss_sku_retail_prices()
 RETURNS TABLE(sku text, style_code text, color_code text, size_code text, retail_price numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH style_base AS (
  SELECT p.style_code, MIN(p.purchase_price) AS purchase_price
    FROM public.ss_prices p
   WHERE p.purchase_price > 0
   GROUP BY p.style_code
)
SELECT v.sku, v.style_code, v.color_code, v.size_code,
       ROUND(COALESCE(p.purchase_price, sb.purchase_price) * 1.75, 2) AS retail_price
  FROM public.ss_variants v
  LEFT JOIN public.ss_prices p
         ON p.sku = v.sku AND p.purchase_price > 0
  LEFT JOIN style_base sb ON sb.style_code = v.style_code
 WHERE v.published
   AND COALESCE(p.purchase_price, sb.purchase_price) > 0;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source IS NOT NULL;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r WHERE r.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p JOIN public.mf_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p JOIN public.bb_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, COALESCE(v.model_code, p.model_code), COALESCE(v.color_code, v.color_desc, p.item_code), v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p LEFT JOIN public.pf_variants v ON v.item_code = p.item_code WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  -- UTT sends clearance prices for leftovers. Reference = higher of the size median and the style median;
  -- prices >25% below it use the reference, and anything still under 1 EUR purchase (all-clearance styles) gets no price.
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  WITH base AS (
    SELECT v.sku, v.style_code, v.color_name, v.size, p.purchase_price, p.currency, s.brand
      FROM public.utt_prices p
      JOIN public.utt_variants v ON v.sku = p.sku
      JOIN public.utt_styles s ON s.style_code = v.style_code
     WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin
       AND public.utt_markup(s.brand) IS NOT NULL
  ), reg AS (
    SELECT style_code, size, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med
      FROM base GROUP BY style_code, size
  ), sty AS (
    SELECT style_code, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med
      FROM base GROUP BY style_code
  ), priced AS (
    SELECT b.*, CASE WHEN b.purchase_price < GREATEST(r.med, s.med) * 0.75 THEN GREATEST(r.med, s.med) ELSE b.purchase_price END AS regular
      FROM base b
      JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
      JOIN sty s ON s.style_code = b.style_code
  )
  SELECT 'utt', sku, style_code, color_name, size,
         ROUND((regular * public.utt_markup(brand))::numeric, 2), COALESCE(currency, 'EUR')
    FROM priced WHERE regular >= 1.0
  ON CONFLICT DO NOTHING;
  -- Falk&Ross (Build Your Brand / Flexfit): partner price x 1.55, no clearance rows in the feed.
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'fr', p.sku, v.style_code, v.color_name, v.size,
         ROUND((p.purchase_price * 1.55)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.falkross_prices p
    JOIN public.falkross_variants v ON v.sku = p.sku
   WHERE p.purchase_price > 0 AND v.active
  ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, v.color_code, COALESCE(NULLIF(k.size_name, ''), k.size),
         ROUND((COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE s.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) * CASE s.brand WHEN 'Craft' THEN 1.5 WHEN 'ProJob' THEN 1.5 WHEN 'Cutter & Buck' THEN 1.5 ELSE 1.75 END)::numeric, 2),
         'EUR'
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    JOIN public.nwg_variants v ON v.product_number = k.product_number AND v.item_number = k.item_number
    LEFT JOIN public.nwg_pricelist pl ON pl.product_number = k.product_number AND pl.rec_price > 0
   WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
     AND COALESCE(s.published, true) = true
     AND COALESCE(s.archived, false) = false
     AND COALESCE(k.active, true) = true
     AND COALESCE(k.discontinued, false) = false
     AND COALESCE(
       COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
         CASE s.brand
           WHEN 'Clique' THEN 0.37
           WHEN 'Craft' THEN 0.50
           WHEN 'ProJob' THEN 0.60
           WHEN 'Cutter & Buck' THEN 0.60
         END,
       NULLIF(k.purchase_price, 0),
       0
     ) > 0
  ON CONFLICT DO NOTHING;

  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
    SELECT 'etx',p.id::text,p.id::text,NULL,'-',COALESCE(p.price_override,p.retail_price)/1.21,'EUR' FROM public.products p
    WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
    DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices GROUP BY source, style_code;
END;
$function$;

CREATE OR REPLACE VIEW public.catalog_items WITH (security_invoker = true) AS
( WITH base AS (
         SELECT m.source,
            m.id,
            m.name,
            m.description,
            m.brand,
            m.category,
            m.group_name,
            m.gender,
            m.image_url,
            m.hover_image_url,
            m.sort_order,
            m.colors
           FROM private.catalog_items_mv m
          WHERE ((m.source <> 'nwg'::text) OR (m.id IN ( SELECT r.style_code
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'nwg'::text) AND (r.min_price > (0)::numeric)))))
        UNION ALL
         SELECT 'ru'::text AS source,
            s.style_code,
            s.name,
            s.description,
            COALESCE(NULLIF(s.brand, ''::text), 'Russell'::text) AS brand,
            s.category,
            s.category,
            s.gender,
            COALESCE(NULLIF(s.main_image_url, ''::text), ( SELECT i.url
                   FROM ru_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.sort_order, i.id
                 LIMIT 1)) AS "coalesce",
            ( SELECT i.url
                   FROM ru_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            600000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''::text), 'n', NULLIF(v.color_name, ''::text), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name) AS jsonb_agg
                   FROM ru_variants v
                  WHERE (v.style_code = s.style_code)), '[]'::jsonb) AS "coalesce"
           FROM ru_styles s
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false))
        UNION ALL
         SELECT 'utt'::text AS source,
            s.style_code,
            s.name,
            s.description,
            s.brand,
            s.category,
            s.category,
            s.gender,
            ( SELECT i.url
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS url,
            ( SELECT i.url
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            700000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name) AS jsonb_agg
                   FROM ( SELECT DISTINCT ON (v.color_name) v.color_name,
                            NULLIF(v.color_hex, ''::text) AS color_hex
                           FROM utt_variants v
                          WHERE ((v.style_code = s.style_code) AND v.active AND (NULLIF(v.color_name, ''::text) IS NOT NULL))
                          ORDER BY v.color_name) c), '[]'::jsonb) AS "coalesce"
           FROM utt_styles s
          WHERE (s.published AND (NOT s.hidden_by_admin) AND (EXISTS ( SELECT 1
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'utt'::text) AND (r.style_code = s.style_code) AND (r.min_price > (0)::numeric)))) AND (EXISTS ( SELECT 1
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL)))))
        UNION ALL
         SELECT 'fr'::text AS source,
            s.style_code,
            s.name,
            s.description,
            s.brand,
            s.category,
            s.category,
            s.gender,
            ( SELECT i.url
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS url,
            ( SELECT i.url
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            750000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name) AS jsonb_agg
                   FROM ( SELECT DISTINCT ON (v.color_name) v.color_name,
                            NULLIF(v.color_hex, ''::text) AS color_hex
                           FROM falkross_variants v
                          WHERE ((v.style_code = s.style_code) AND v.active AND (NULLIF(v.color_name, ''::text) IS NOT NULL))
                          ORDER BY v.color_name) c), '[]'::jsonb) AS "coalesce"
           FROM falkross_styles s
          WHERE (s.published AND (NOT s.hidden_by_admin) AND (EXISTS ( SELECT 1
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'fr'::text) AND (r.style_code = s.style_code) AND (r.min_price > (0)::numeric)))) AND (EXISTS ( SELECT 1
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL)))))
        )
 SELECT base.source,
    base.id,
    base.name,
    base.description,
    base.brand,
    base.category,
    base.group_name,
    base.gender,
    base.image_url,
    base.hover_image_url,
    base.sort_order,
    base.colors,
    COALESCE(ARRAY( SELECT (elem.value ->> 'h'::text)
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE ((elem.value ->> 'h'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_hexes,
    COALESCE(ARRAY( SELECT (elem.value ->> 'n'::text)
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE ((elem.value ->> 'n'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_names
   FROM base
  ORDER BY base.sort_order, base.name)
UNION ALL
 SELECT 'etx'::text AS source,
    (p.id)::text AS id,
    p.name_lv AS name,
    p.description_lv AS description,
    p.brand,
    c.name_lv AS category,
    c.name_lv AS group_name,
    NULL::text AS gender,
    ( SELECT i.url
           FROM product_images i
          WHERE (i.product_id = p.id)
          ORDER BY i.sort_order, i.id
         LIMIT 1) AS image_url,
    ( SELECT i.url
           FROM product_images i
          WHERE (i.product_id = p.id)
          ORDER BY i.sort_order, i.id
         OFFSET 1
         LIMIT 1) AS hover_image_url,
    800000 AS sort_order,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', pc.hex_code, 'n', pc.name, 'u', NULLIF(pc.image_url, ''::text), 'c', (pc.id)::text) ORDER BY pc.created_at, pc.id) AS jsonb_agg
           FROM product_colors pc
          WHERE (pc.product_id = p.id)), '[]'::jsonb) AS colors,
    COALESCE(( SELECT array_agg(pc.hex_code) AS array_agg
           FROM product_colors pc
          WHERE ((pc.product_id = p.id) AND (pc.hex_code IS NOT NULL))), ARRAY[]::text[]) AS color_hexes,
    COALESCE(( SELECT array_agg(pc.name) AS array_agg
           FROM product_colors pc
          WHERE (pc.product_id = p.id)), ARRAY[]::text[]) AS color_names
   FROM (products p
     JOIN categories c ON ((c.id = p.category_id)))
  WHERE ((p.brand = 'ETX Latvia'::text) AND (p.active = true) AND (p.hidden_manual = false));

INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency, updated_at)
SELECT source, sku, style_code, color_code, size, retail_price, currency, updated_at
  FROM private.price_rollback_20261019 ON CONFLICT DO NOTHING;
DELETE FROM public.catalog_price_ranges r
 WHERE (r.source, r.style_code) IN (SELECT DISTINCT source, style_code FROM private.range_rollback_20261019);
INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency, updated_at)
SELECT DISTINCT ON (source, style_code) source, style_code, min_price, max_price, currency, updated_at
  FROM private.range_rollback_20261019 ORDER BY source, style_code, saved_at ON CONFLICT DO NOTHING;
UPDATE public.utt_variants SET outlet = false WHERE outlet;
UPDATE public.mf_styles SET is_outlet = false WHERE is_outlet;
