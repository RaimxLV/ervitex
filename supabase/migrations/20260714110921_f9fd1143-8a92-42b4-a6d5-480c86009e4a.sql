
DROP MATERIALIZED VIEW IF EXISTS private.catalog_items_mv CASCADE;

CREATE MATERIALIZED VIEW private.catalog_items_mv AS
WITH
ss_color_rows AS (
  SELECT
    s.style_code,
    NULLIF(NULLIF(COALESCE(v.hex_color_code, c.hex, c.raw->>'HexaColourCode'), 'false'), '') AS hex,
    NULLIF(COALESCE(v.color_name, c.name), '') AS cname,
    v.color_code,
    (SELECT COALESCE(i.public_url, i.source_url)
       FROM public.ss_images i
      WHERE i.style_code = s.style_code
        AND i.color_code = v.color_code
        AND COALESCE(i.public_url, i.source_url) IS NOT NULL
        AND COALESCE(i.public_url, i.source_url) <> '[object Object]'
      ORDER BY i.is_main DESC NULLS LAST,
               (i.photo_shoot_code = 'Front') DESC,
               i.sort_order NULLS LAST
      LIMIT 1) AS url
  FROM public.ss_styles s
  LEFT JOIN public.ss_variants v
    ON v.style_code = s.style_code
   AND COALESCE(v.hidden_by_admin, false) = false
   AND COALESCE(v.published, true) = true
  LEFT JOIN public.ss_colors c ON c.code = v.color_code
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.hidden_by_admin, false) = false
    AND COALESCE(s.archived, false) = false
  GROUP BY s.style_code, v.hex_color_code, c.hex, c.raw, v.color_name, c.name, v.color_code
),
ss_colors_agg AS (
  SELECT style_code,
         jsonb_agg(jsonb_build_object('h', hex, 'n', cname, 'u', url)
                   ORDER BY (url IS NULL), cname NULLS LAST)
           FILTER (WHERE hex IS NOT NULL OR cname IS NOT NULL) AS colors
  FROM ss_color_rows
  GROUP BY style_code
),
ss AS (
  SELECT
    'ss'::text AS source,
    s.style_code AS id,
    s.name,
    COALESCE(s.short_description, s.long_description) AS description,
    'Stanley/Stella'::text AS brand,
    s.type AS category,
    s.category AS group_name,
    s.gender,
    (SELECT COALESCE(i.public_url, i.source_url)
       FROM public.ss_images i
      WHERE i.style_code = s.style_code
        AND COALESCE(i.public_url, i.source_url) IS NOT NULL
        AND COALESCE(i.public_url, i.source_url) <> '[object Object]'
      ORDER BY i.is_main DESC NULLS LAST,
               (i.photo_shoot_code = 'Front') DESC,
               i.sort_order NULLS LAST,
               i.created_at DESC NULLS LAST
      LIMIT 1) AS image_url,
    (SELECT COALESCE(i.public_url, i.source_url)
       FROM public.ss_images i
      WHERE i.style_code = s.style_code
        AND i.is_over = true
        AND COALESCE(i.public_url, i.source_url) IS NOT NULL
        AND COALESCE(i.public_url, i.source_url) <> '[object Object]'
      ORDER BY i.sort_order NULLS LAST, i.created_at DESC NULLS LAST
      LIMIT 1) AS hover_image_url,
    COALESCE(s.sequence_style, 999999) AS sort_order,
    COALESCE(ca.colors, '[]'::jsonb) AS colors
  FROM public.ss_styles s
  LEFT JOIN ss_colors_agg ca ON ca.style_code = s.style_code
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.hidden_by_admin, false) = false
    AND COALESCE(s.archived, false) = false
),
nwg_color_rows AS (
  SELECT DISTINCT ON (s.product_number, COALESCE(v.color_code, v.item_number))
    s.product_number,
    CASE
      WHEN v.web_color IS NOT NULL AND array_length(v.web_color,1) > 0 THEN
        CASE WHEN v.web_color[1] LIKE '#%' THEN v.web_color[1] ELSE '#'||v.web_color[1] END
      WHEN v.shade_color LIKE '#%' THEN v.shade_color
      ELSE NULL
    END AS hex,
    NULLIF(COALESCE(v.filter_color, v.color_name, v.shade_color), '') AS cname,
    v.main_picture_url AS url
  FROM public.nwg_styles s
  LEFT JOIN public.nwg_variants v ON v.product_number = s.product_number
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.archived, false) = false
),
nwg_colors_agg AS (
  SELECT product_number,
         jsonb_agg(jsonb_build_object('h', hex, 'n', cname, 'u', url)
                   ORDER BY (url IS NULL), cname NULLS LAST)
           FILTER (WHERE hex IS NOT NULL OR cname IS NOT NULL) AS colors
  FROM nwg_color_rows
  GROUP BY product_number
),
nwg AS (
  SELECT
    'nwg'::text AS source,
    s.product_number AS id,
    s.name,
    COALESCE(s.catalog_text, s.commerce_text, s.usp) AS description,
    s.brand,
    s.category,
    s.category AS group_name,
    s.gender,
    COALESCE(NULLIF(s.main_picture_url, ''),
      (SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url)
         FROM public.nwg_images i
        WHERE i.product_number = s.product_number
          AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL
        ORDER BY (i.picture_angle='front') DESC, i.sort_order NULLS LAST, i.id
        LIMIT 1)) AS image_url,
    (SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url)
       FROM public.nwg_images i
      WHERE i.product_number = s.product_number
        AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL
        AND COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url)
            <> COALESCE(NULLIF(s.main_picture_url,''),'')
      ORDER BY i.sort_order NULLS LAST, i.id
      LIMIT 1) AS hover_image_url,
    200000 AS sort_order,
    COALESCE(ca.colors, '[]'::jsonb) AS colors
  FROM public.nwg_styles s
  LEFT JOIN nwg_colors_agg ca ON ca.product_number = s.product_number
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.archived, false) = false
),
pf_color_rows AS (
  SELECT DISTINCT ON (s.model_code, COALESCE(v.color_code, v.item_code))
    s.model_code,
    CASE
      WHEN NULLIF(v.hex_color,'') IS NULL THEN NULL
      WHEN v.hex_color LIKE '#%' THEN v.hex_color
      ELSE '#'||v.hex_color
    END AS hex,
    NULLIF(COALESCE(v.base_color, v.color_desc), '') AS cname,
    (SELECT COALESCE(i.url_500, i.url_1600)
       FROM public.pf_images i
      WHERE i.model_code = s.model_code
        AND (i.item_code = v.item_code OR i.item_code IS NULL)
        AND COALESCE(i.url_500, i.url_1600) IS NOT NULL
      ORDER BY (i.item_code = v.item_code) DESC, i.sort_order NULLS LAST, i.id
      LIMIT 1) AS url
  FROM public.pf_styles s
  LEFT JOIN public.pf_variants v ON v.model_code = s.model_code
),
pf_colors_agg AS (
  SELECT model_code,
         jsonb_agg(jsonb_build_object('h', hex, 'n', cname, 'u', url)
                   ORDER BY (url IS NULL), cname NULLS LAST)
           FILTER (WHERE hex IS NOT NULL OR cname IS NOT NULL) AS colors
  FROM pf_color_rows
  GROUP BY model_code
),
pf AS (
  SELECT
    'pf'::text AS source,
    s.model_code AS id,
    s.description AS name,
    COALESCE(s.ext_desc, s.product_comments, s.keywords) AS description,
    s.brand,
    s.category,
    s.category_group AS group_name,
    s.gender,
    COALESCE(
      (SELECT COALESCE(i.url_500, i.url_1600)
         FROM public.pf_images i
        WHERE i.model_code = s.model_code
          AND COALESCE(i.url_500, i.url_1600) IS NOT NULL
        ORDER BY (i.kind='main') DESC, i.sort_order NULLS LAST, i.id
        LIMIT 1),
      CASE WHEN s.main_image IS NOT NULL AND s.main_image <> ''
           THEN 'https://images.pfconcept.com/ProductImages_All/JPG/500x500/' || s.main_image
           ELSE NULL END
    ) AS image_url,
    (SELECT COALESCE(i.url_500, i.url_1600)
       FROM public.pf_images i
      WHERE i.model_code = s.model_code
        AND COALESCE(i.url_500, i.url_1600) IS NOT NULL
        AND i.kind <> 'main'
      ORDER BY i.sort_order NULLS LAST, i.id
      LIMIT 1) AS hover_image_url,
    300000 AS sort_order,
    COALESCE(ca.colors, '[]'::jsonb) AS colors
  FROM public.pf_styles s
  LEFT JOIN pf_colors_agg ca ON ca.model_code = s.model_code
)
SELECT * FROM ss
UNION ALL SELECT * FROM nwg
UNION ALL SELECT * FROM pf;

CREATE INDEX catalog_items_mv_source_idx ON private.catalog_items_mv (source);
CREATE INDEX catalog_items_mv_brand_idx  ON private.catalog_items_mv (brand);
CREATE INDEX catalog_items_mv_cat_idx    ON private.catalog_items_mv (category);
CREATE INDEX catalog_items_mv_id_idx     ON private.catalog_items_mv (source, id);

GRANT SELECT ON private.catalog_items_mv TO anon, authenticated;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

CREATE OR REPLACE VIEW public.catalog_items
WITH (security_invoker = true) AS
SELECT
  source, id, name, description, brand, category, group_name, gender,
  image_url, hover_image_url, sort_order,
  colors,
  -- Back-compat parallel arrays (derived from colors JSONB)
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(jsonb_path_query_array(colors,'$[*].h')) WHERE true), ARRAY[]::text[]) AS color_hexes,
  COALESCE(ARRAY(SELECT jsonb_array_elements_text(jsonb_path_query_array(colors,'$[*].n')) WHERE true), ARRAY[]::text[]) AS color_names
FROM private.catalog_items_mv
ORDER BY sort_order, name;

GRANT SELECT ON public.catalog_items TO anon, authenticated;
