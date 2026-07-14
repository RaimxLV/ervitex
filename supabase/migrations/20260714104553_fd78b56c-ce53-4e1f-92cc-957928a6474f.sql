DROP MATERIALIZED VIEW IF EXISTS private.catalog_items_mv CASCADE;
DROP VIEW IF EXISTS public.catalog_items CASCADE;

CREATE MATERIALIZED VIEW private.catalog_items_mv AS
WITH ss AS (
  SELECT
    'ss'::text AS source,
    s.style_code::text AS id,
    s.name::text AS name,
    COALESCE(s.short_description, s.long_description)::text AS description,
    'Stanley/Stella'::text AS brand,
    s.type::text AS category,
    s.category::text AS group_name,
    s.gender::text AS gender,
    (
      SELECT COALESCE(i.public_url, i.source_url)
      FROM public.ss_images i
      WHERE i.style_code = s.style_code
        AND COALESCE(i.public_url, i.source_url) IS NOT NULL
        AND COALESCE(i.public_url, i.source_url) <> '[object Object]'
      ORDER BY i.is_main DESC,
               (i.photo_shoot_code = 'Front') DESC,
               i.sort_order NULLS LAST,
               i.created_at DESC
      LIMIT 1
    )::text AS image_url,
    (
      SELECT COALESCE(i.public_url, i.source_url)
      FROM public.ss_images i
      WHERE i.style_code = s.style_code
        AND COALESCE(i.public_url, i.source_url) IS NOT NULL
        AND COALESCE(i.public_url, i.source_url) <> '[object Object]'
        AND i.is_over
      ORDER BY i.sort_order NULLS LAST,
               i.created_at DESC
      LIMIT 1
    )::text AS hover_image_url,
    COALESCE(s.sequence_style, 999999)::integer AS sort_order,
    COALESCE(
      array_remove(
        array_agg(DISTINCT NULLIF(NULLIF(COALESCE(v.hex_color_code, c.hex, c.raw->>'HexaColourCode'), 'false'), ''))
          FILTER (WHERE NULLIF(NULLIF(COALESCE(v.hex_color_code, c.hex, c.raw->>'HexaColourCode'), 'false'), '') IS NOT NULL),
        NULL
      ),
      ARRAY[]::text[]
    ) AS color_hexes,
    COALESCE(
      array_remove(
        array_agg(DISTINCT NULLIF(COALESCE(v.color_name, c.name), ''))
          FILTER (WHERE NULLIF(COALESCE(v.color_name, c.name), '') IS NOT NULL),
        NULL
      ),
      ARRAY[]::text[]
    ) AS color_names
  FROM public.ss_styles s
  LEFT JOIN public.ss_variants v
    ON v.style_code = s.style_code
   AND COALESCE(v.hidden_by_admin, false) = false
   AND COALESCE(v.published, true) = true
  LEFT JOIN public.ss_colors c ON c.code = v.color_code
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.hidden_by_admin, false) = false
    AND COALESCE(s.archived, false) = false
  GROUP BY s.style_code, s.name, s.short_description, s.long_description, s.type, s.category, s.gender, s.sequence_style
),
nwg AS (
  SELECT
    'nwg'::text AS source,
    s.product_number::text AS id,
    s.name::text AS name,
    COALESCE(s.catalog_text, s.commerce_text, s.usp)::text AS description,
    s.brand::text AS brand,
    s.category::text AS category,
    s.category::text AS group_name,
    s.gender::text AS gender,
    COALESCE(
      NULLIF(s.main_picture_url, ''),
      (
        SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url)
        FROM public.nwg_images i
        WHERE i.product_number = s.product_number
          AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL
        ORDER BY (i.picture_angle = 'front') DESC,
                 i.sort_order NULLS LAST,
                 i.id
        LIMIT 1
      )
    )::text AS image_url,
    (
      SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url)
      FROM public.nwg_images i
      WHERE i.product_number = s.product_number
        AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL
        AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) <> COALESCE(NULLIF(s.main_picture_url, ''), '')
      ORDER BY i.sort_order NULLS LAST,
               i.id
      LIMIT 1
    )::text AS hover_image_url,
    200000::integer AS sort_order,
    ARRAY[]::text[] AS color_hexes,
    COALESCE(
      array_remove(
        array_agg(DISTINCT NULLIF(COALESCE(v.filter_color, v.shade_color, v.color_name), ''))
          FILTER (WHERE NULLIF(COALESCE(v.filter_color, v.shade_color, v.color_name), '') IS NOT NULL),
        NULL
      ),
      ARRAY[]::text[]
    ) AS color_names
  FROM public.nwg_styles s
  LEFT JOIN public.nwg_variants v ON v.product_number = s.product_number
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.archived, false) = false
  GROUP BY s.product_number, s.name, s.catalog_text, s.commerce_text, s.usp, s.brand, s.category, s.gender, s.main_picture_url
),
pf AS (
  SELECT
    'pf'::text AS source,
    s.model_code::text AS id,
    s.description::text AS name,
    COALESCE(s.ext_desc, s.product_comments, s.keywords)::text AS description,
    s.brand::text AS brand,
    s.category::text AS category,
    s.category_group::text AS group_name,
    s.gender::text AS gender,
    COALESCE(
      (
        SELECT COALESCE(i.url_500, i.url_1600)
        FROM public.pf_images i
        WHERE i.model_code = s.model_code
          AND COALESCE(i.url_500, i.url_1600) IS NOT NULL
        ORDER BY (i.kind = 'main') DESC,
                 i.sort_order NULLS LAST,
                 i.id
        LIMIT 1
      ),
      CASE WHEN s.main_image IS NOT NULL AND s.main_image <> '' THEN 'https://images.pfconcept.com/ProductImages_All/JPG/500x500/' || s.main_image ELSE NULL END
    )::text AS image_url,
    (
      SELECT COALESCE(i.url_500, i.url_1600)
      FROM public.pf_images i
      WHERE i.model_code = s.model_code
        AND COALESCE(i.url_500, i.url_1600) IS NOT NULL
        AND i.kind <> 'main'
      ORDER BY i.sort_order NULLS LAST,
               i.id
      LIMIT 1
    )::text AS hover_image_url,
    300000::integer AS sort_order,
    COALESCE(
      array_remove(
        array_agg(DISTINCT CASE
          WHEN NULLIF(v.hex_color, '') IS NULL THEN NULL
          WHEN v.hex_color LIKE '#%' THEN v.hex_color
          ELSE '#' || v.hex_color
        END) FILTER (WHERE NULLIF(v.hex_color, '') IS NOT NULL),
        NULL
      ),
      ARRAY[]::text[]
    ) AS color_hexes,
    COALESCE(
      array_remove(
        array_agg(DISTINCT NULLIF(COALESCE(v.base_color, v.color_desc), ''))
          FILTER (WHERE NULLIF(COALESCE(v.base_color, v.color_desc), '') IS NOT NULL),
        NULL
      ),
      ARRAY[]::text[]
    ) AS color_names
  FROM public.pf_styles s
  LEFT JOIN public.pf_variants v ON v.model_code = s.model_code
  GROUP BY s.model_code, s.description, s.ext_desc, s.product_comments, s.keywords, s.brand, s.category, s.category_group, s.gender, s.main_image
)
SELECT * FROM ss
UNION ALL
SELECT * FROM nwg
UNION ALL
SELECT * FROM pf;

CREATE UNIQUE INDEX catalog_items_mv_source_id_idx ON private.catalog_items_mv (source, id);
CREATE INDEX catalog_items_mv_source_idx ON private.catalog_items_mv (source);
CREATE INDEX catalog_items_mv_category_idx ON private.catalog_items_mv (category);
CREATE INDEX catalog_items_mv_group_idx ON private.catalog_items_mv (group_name);
CREATE INDEX catalog_items_mv_brand_idx ON private.catalog_items_mv (brand);
CREATE INDEX catalog_items_mv_gender_idx ON private.catalog_items_mv (gender);
CREATE INDEX catalog_items_mv_sort_idx ON private.catalog_items_mv (sort_order, name);

CREATE VIEW public.catalog_items AS
SELECT
  source,
  id,
  name,
  description,
  brand,
  category,
  group_name,
  gender,
  image_url,
  hover_image_url,
  sort_order,
  color_hexes,
  color_names
FROM private.catalog_items_mv
ORDER BY sort_order, name;

GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT SELECT ON public.catalog_items TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_catalog_items_mv()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'private', 'public'
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.catalog_items_mv;
$$;

REVOKE ALL ON FUNCTION public.refresh_catalog_items_mv() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_items_mv() TO service_role;