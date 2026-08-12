CREATE OR REPLACE VIEW public.catalog_items AS
WITH base AS (
  SELECT
    m.source, m.id, m.name, m.description, m.brand, m.category,
    m.group_name, m.gender, m.image_url, m.hover_image_url,
    m.sort_order, m.colors
  FROM private.catalog_items_mv m
  WHERE m.source <> 'nwg'
     OR EXISTS (
       SELECT 1
       FROM public.nwg_styles s
       WHERE s.product_number = m.id
         AND s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
         AND COALESCE(s.published, true) = true
         AND COALESCE(s.archived, false) = false
         AND NULLIF(BTRIM(s.name), '') IS NOT NULL
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
  SELECT
    'ru'::text AS source,
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
      SELECT jsonb_agg(
        jsonb_build_object('h', NULLIF(v.color_hex, ''), 'n', NULLIF(v.color_name, ''), 'u', NULL::text, 'c', NULL::text)
        ORDER BY v.color_name
      ) FILTER (WHERE NULLIF(v.color_name, '') IS NOT NULL OR NULLIF(v.color_hex, '') IS NOT NULL)
      FROM public.ru_variants v
      WHERE v.style_code = s.style_code
    ), '[]'::jsonb) AS colors
  FROM public.ru_styles s
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.hidden_by_admin, false) = false
)
SELECT
  source, id, name, description, brand, category, group_name, gender,
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

GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT ALL ON public.catalog_items TO service_role;

CREATE OR REPLACE FUNCTION public.nwg_price_targets(
  only_missing boolean DEFAULT true,
  lim integer DEFAULT 1000,
  off integer DEFAULT 0
)
RETURNS TABLE(sku text, product_number text, item_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT k.sku, k.product_number, k.item_number
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
    AND (NOT only_missing OR k.purchase_price IS NULL)
  ORDER BY k.sku
  OFFSET GREATEST(off, 0)
  LIMIT GREATEST(lim, 1);
$$;

CREATE OR REPLACE FUNCTION public.nwg_propagate_purchase_prices()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 0;
$$;

REVOKE ALL ON FUNCTION public.nwg_price_targets(boolean, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nwg_price_targets(boolean, integer, integer) TO service_role;
REVOKE ALL ON FUNCTION public.nwg_propagate_purchase_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.nwg_propagate_purchase_prices() TO service_role;