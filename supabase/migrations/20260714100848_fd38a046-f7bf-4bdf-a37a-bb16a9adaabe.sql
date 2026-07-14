
DROP VIEW IF EXISTS public.catalog_items;

CREATE VIEW public.catalog_items AS
-- Stanley/Stella
SELECT
  'ss'::text                                            AS source,
  s.style_code                                          AS id,
  s.name                                                AS name,
  s.short_description                                   AS description,
  COALESCE(s.brand, 'Stanley/Stella')                   AS brand,
  s.category                                            AS category,
  s.type                                                AS group_name,
  s.gender                                              AS gender,
  s.main_picture_url                                    AS image_url,
  s.over_picture_url                                    AS hover_image_url,
  s.sequence_style                                      AS sort_order,
  COALESCE((
    SELECT array_agg(DISTINCT lower(v.hex_color_code)) FILTER (WHERE v.hex_color_code IS NOT NULL)
    FROM public.ss_variants v WHERE v.style_code = s.style_code
  ), ARRAY[]::text[])                                   AS color_hexes,
  COALESCE((
    SELECT array_agg(DISTINCT v.color_name) FILTER (WHERE v.color_name IS NOT NULL)
    FROM public.ss_variants v WHERE v.style_code = s.style_code
  ), ARRAY[]::text[])                                   AS color_names
FROM public.ss_styles s
WHERE s.published = true AND s.hidden_by_admin = false AND s.archived = false

UNION ALL

-- New Wave Group (only whitelisted brands, matches NwgPage)
SELECT
  'nwg'::text,
  n.product_number,
  n.name,
  n.commerce_text,
  n.brand,
  n.category,
  NULL::text,
  n.gender,
  n.main_picture_url,
  NULL::text,
  NULL::integer,
  COALESCE((
    SELECT array_agg(DISTINCT
      CASE
        WHEN v.shade_color LIKE '#%' THEN lower(v.shade_color)
        WHEN v.web_color IS NOT NULL AND array_length(v.web_color, 1) >= 1 AND v.web_color[1] IS NOT NULL THEN
          CASE WHEN v.web_color[1] LIKE '#%' THEN lower(v.web_color[1]) ELSE lower('#' || v.web_color[1]) END
        ELSE NULL
      END
    ) FILTER (WHERE v.shade_color IS NOT NULL OR (v.web_color IS NOT NULL AND array_length(v.web_color, 1) >= 1))
    FROM public.nwg_variants v WHERE v.product_number = n.product_number
  ), ARRAY[]::text[]),
  COALESCE((
    SELECT array_agg(DISTINCT v.color_name) FILTER (WHERE v.color_name IS NOT NULL)
    FROM public.nwg_variants v WHERE v.product_number = n.product_number
  ), ARRAY[]::text[])
FROM public.nwg_styles n
WHERE n.published = true AND n.archived = false
  AND lower(n.brand) IN ('clique','craft','craft teamwear','cutter & buck','projob','sagaform','untagged movement')

UNION ALL

-- PF Concept
SELECT
  'pf'::text,
  p.model_code,
  p.description,
  p.ext_desc,
  p.brand,
  p.category,
  p.category_group,
  p.gender,
  p.main_image,
  NULL::text,
  NULL::integer,
  COALESCE((
    SELECT array_agg(DISTINCT
      CASE WHEN v.hex_color LIKE '#%' THEN lower(v.hex_color) ELSE lower('#' || v.hex_color) END
    ) FILTER (WHERE v.hex_color IS NOT NULL AND v.hex_color <> '')
    FROM public.pf_variants v WHERE v.model_code = p.model_code
  ), ARRAY[]::text[]),
  COALESCE((
    SELECT array_agg(DISTINCT v.color_desc) FILTER (WHERE v.color_desc IS NOT NULL)
    FROM public.pf_variants v WHERE v.model_code = p.model_code
  ), ARRAY[]::text[])
FROM public.pf_styles p;

GRANT SELECT ON public.catalog_items TO anon, authenticated;
