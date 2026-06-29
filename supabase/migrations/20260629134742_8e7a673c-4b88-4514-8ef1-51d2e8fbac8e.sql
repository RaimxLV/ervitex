
ALTER TABLE public.ss_styles
  ADD COLUMN IF NOT EXISTS sequence_style integer,
  ADD COLUMN IF NOT EXISTS style_main_segment text,
  ADD COLUMN IF NOT EXISTS new_style boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS ss_styles_sequence_idx ON public.ss_styles (sequence_style) WHERE archived = false AND published = true;

ALTER TABLE public.ss_variants
  ADD COLUMN IF NOT EXISTS new_color boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS new_style boolean DEFAULT false;

DROP VIEW IF EXISTS public.ss_style_summary CASCADE;

CREATE VIEW public.ss_style_summary
WITH (security_invoker = true)
AS
WITH cover AS (
  SELECT DISTINCT ON (i.style_code)
    i.style_code, i.storage_path, i.source_url
  FROM public.ss_images i
  WHERE i.is_main = true OR i.image_type = 'Packshot'
  ORDER BY i.style_code, (i.is_main) DESC NULLS LAST, i.sort_order ASC
),
over_img AS (
  SELECT DISTINCT ON (i.style_code)
    i.style_code, i.storage_path, i.source_url
  FROM public.ss_images i
  WHERE i.is_over = true OR i.image_type = 'Studio'
  ORDER BY i.style_code, (i.is_over) DESC NULLS LAST, i.sort_order ASC
),
variant_agg AS (
  SELECT
    v.style_code,
    COUNT(DISTINCT v.color_code) FILTER (WHERE v.published) AS color_count,
    COUNT(DISTINCT v.size_code) FILTER (WHERE v.published) AS size_count,
    bool_or(v.new_color) AS has_new_color
  FROM public.ss_variants v
  GROUP BY v.style_code
)
SELECT
  s.style_code, s.name, s.short_description, s.long_description,
  s.category, s.category_code, s.type, s.type_code, s.gender, s.segment,
  s.style_main_segment, s.fit, s.neckline, s.sleeve,
  s.composition, s.weight_gsm, s.wash_instructions, s.brand,
  s.sequence_style, s.new_style, s.published, s.archived,
  COALESCE(va.color_count, 0)::int AS color_count,
  COALESCE(va.size_count, 0)::int AS size_count,
  COALESCE(va.has_new_color, false) AS has_new_color,
  c.storage_path AS cover_storage_path,
  c.source_url   AS cover_source_url,
  o.storage_path AS over_storage_path,
  o.source_url   AS over_source_url
FROM public.ss_styles s
LEFT JOIN cover c    ON c.style_code = s.style_code
LEFT JOIN over_img o ON o.style_code = s.style_code
LEFT JOIN variant_agg va ON va.style_code = s.style_code
WHERE s.published = true AND s.archived = false;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
