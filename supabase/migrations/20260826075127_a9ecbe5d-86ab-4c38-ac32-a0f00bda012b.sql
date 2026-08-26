CREATE MATERIALIZED VIEW IF NOT EXISTS private.nwg_orderable_mv AS
SELECT s.product_number
FROM public.nwg_styles s
WHERE s.brand = ANY (ARRAY['Craft','Clique','ProJob','Cutter & Buck'])
  AND COALESCE(s.published, true) = true
  AND COALESCE(s.archived, false) = false
  AND NULLIF(btrim(s.name), '') IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.nwg_skus k
    JOIN public.nwg_variants v ON v.product_number = k.product_number AND v.item_number = k.item_number
    WHERE k.product_number = s.product_number
      AND COALESCE(k.active, true) = true
      AND COALESCE(k.discontinued, false) = false
      AND k.purchase_price IS NOT NULL AND k.purchase_price > 0
  );

CREATE UNIQUE INDEX IF NOT EXISTS nwg_orderable_mv_pk ON private.nwg_orderable_mv (product_number);
CREATE INDEX IF NOT EXISTS catalog_items_mv_category ON private.catalog_items_mv (category);
CREATE INDEX IF NOT EXISTS catalog_items_mv_source_id ON private.catalog_items_mv (source, id);

CREATE OR REPLACE VIEW public.catalog_items AS
WITH base AS (
  SELECT m.source, m.id, m.name, m.description, m.brand, m.category, m.group_name,
         m.gender, m.image_url, m.hover_image_url, m.sort_order, m.colors
  FROM private.catalog_items_mv m
  WHERE m.source <> 'nwg'
     OR m.id IN (SELECT o.product_number FROM private.nwg_orderable_mv o)
  UNION ALL
  SELECT 'ru'::text AS source,
    s.style_code AS id, s.name, s.description,
    COALESCE(NULLIF(s.brand, ''), 'Russell') AS brand,
    s.category, s.category AS group_name, s.gender,
    COALESCE(NULLIF(s.main_image_url, ''), (
      SELECT i.url FROM public.ru_images i WHERE i.style_code = s.style_code
      ORDER BY i.sort_order, i.id LIMIT 1)) AS image_url,
    (SELECT i.url FROM public.ru_images i WHERE i.style_code = s.style_code
      ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1) AS hover_image_url,
    600000 AS sort_order,
    COALESCE((
      SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''), 'n', NULLIF(v.color_name, ''), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name)
        FILTER (WHERE NULLIF(v.color_name, '') IS NOT NULL OR NULLIF(v.color_hex, '') IS NOT NULL)
      FROM public.ru_variants v WHERE v.style_code = s.style_code), '[]'::jsonb) AS colors
  FROM public.ru_styles s
  WHERE COALESCE(s.published, true) = true AND COALESCE(s.hidden_by_admin, false) = false
)
SELECT source, id, name, description, brand, category, group_name, gender,
  image_url, hover_image_url, sort_order, colors,
  COALESCE(ARRAY(SELECT elem.value ->> 'h' FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value) WHERE (elem.value ->> 'h') IS NOT NULL), ARRAY[]::text[]) AS color_hexes,
  COALESCE(ARRAY(SELECT elem.value ->> 'n' FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value) WHERE (elem.value ->> 'n') IS NOT NULL), ARRAY[]::text[]) AS color_names
FROM base
ORDER BY sort_order, name;

CREATE OR REPLACE FUNCTION public.refresh_catalog_items_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'private', 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.nwg_orderable_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.catalog_items_mv;
END;
$function$;