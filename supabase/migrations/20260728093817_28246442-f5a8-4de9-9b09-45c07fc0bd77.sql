CREATE OR REPLACE VIEW public.catalog_items AS
WITH base AS (
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
    colors
  FROM private.catalog_items_mv
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
    COALESCE(
      NULLIF(s.main_image_url, ''),
      (
        SELECT i.url
        FROM public.ru_images i
        WHERE i.style_code = s.style_code
        ORDER BY i.sort_order, i.id
        LIMIT 1
      )
    ) AS image_url,
    (
      SELECT i.url
      FROM public.ru_images i
      WHERE i.style_code = s.style_code
      ORDER BY i.sort_order, i.id
      OFFSET 1
      LIMIT 1
    ) AS hover_image_url,
    600000 AS sort_order,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'h', NULLIF(v.color_hex, ''),
            'n', NULLIF(v.color_name, ''),
            'u', NULL,
            'c', NULL
          )
          ORDER BY v.color_name
        ) FILTER (WHERE NULLIF(v.color_name, '') IS NOT NULL OR NULLIF(v.color_hex, '') IS NOT NULL)
        FROM public.ru_variants v
        WHERE v.style_code = s.style_code
      ),
      '[]'::jsonb
    ) AS colors
  FROM public.ru_styles s
  WHERE COALESCE(s.published, true) = true
    AND COALESCE(s.hidden_by_admin, false) = false
)
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
  colors,
  COALESCE(
    ARRAY(
      SELECT elem ->> 'h'
      FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) AS elem
      WHERE elem ->> 'h' IS NOT NULL
    ),
    ARRAY[]::text[]
  ) AS color_hexes,
  COALESCE(
    ARRAY(
      SELECT elem ->> 'n'
      FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) AS elem
      WHERE elem ->> 'n' IS NOT NULL
    ),
    ARRAY[]::text[]
  ) AS color_names
FROM base
ORDER BY sort_order, name;

GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT ALL ON public.catalog_items TO service_role;