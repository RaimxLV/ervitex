-- Replace slow view with a materialized view for fast public reads
DROP VIEW IF EXISTS public.ss_style_summary CASCADE;

CREATE MATERIALIZED VIEW public.ss_style_summary AS
WITH cover AS (
  SELECT DISTINCT ON (i.style_code) i.style_code, i.storage_path, i.source_url
  FROM ss_images i
  WHERE i.is_main = true OR i.image_type = 'Packshot'
  ORDER BY i.style_code, i.is_main DESC NULLS LAST, i.sort_order
),
over_img AS (
  SELECT DISTINCT ON (i.style_code) i.style_code, i.storage_path, i.source_url
  FROM ss_images i
  WHERE i.is_over = true OR i.image_type = 'Studio'
  ORDER BY i.style_code, i.is_over DESC NULLS LAST, i.sort_order
),
variant_agg AS (
  SELECT v.style_code,
    count(DISTINCT v.color_code) FILTER (WHERE v.published) AS color_count,
    count(DISTINCT v.size_code) FILTER (WHERE v.published) AS size_count,
    bool_or(v.new_color) AS has_new_color
  FROM ss_variants v
  GROUP BY v.style_code
),
stock_agg AS (
  SELECT v.style_code, COALESCE(sum(st.quantity),0)::integer AS total_stock
  FROM ss_variants v
  LEFT JOIN ss_stock st ON st.sku = v.sku
  WHERE v.published = true
  GROUP BY v.style_code
)
SELECT s.style_code, s.name, s.short_description, s.long_description, s.category, s.category_code,
  s.type, s.type_code, s.gender, s.segment, s.style_main_segment, s.fit, s.neckline, s.sleeve,
  s.composition, s.weight_gsm, s.wash_instructions, s.specifications, s.brand, s.sequence_style,
  s.new_style, s.published, s.archived,
  c.source_url AS main_picture_url, o.source_url AS over_picture_url,
  s.raw,
  COALESCE(va.color_count,0) AS color_count,
  COALESCE(va.size_count,0)  AS size_count,
  COALESCE(va.has_new_color,false) AS has_new_color,
  COALESCE(sa.total_stock,0) AS total_stock,
  c.storage_path AS cover_storage_path, c.source_url AS cover_source_url,
  o.storage_path AS over_storage_path,  o.source_url AS over_source_url,
  COALESCE(c.storage_path, c.source_url) AS cover_url,
  COALESCE(o.storage_path, o.source_url) AS over_url
FROM ss_styles s
LEFT JOIN cover c ON c.style_code = s.style_code
LEFT JOIN over_img o ON o.style_code = s.style_code
LEFT JOIN variant_agg va ON va.style_code = s.style_code
LEFT JOIN stock_agg sa ON sa.style_code = s.style_code
WHERE s.published AND NOT s.archived;

CREATE UNIQUE INDEX ss_style_summary_pk ON public.ss_style_summary(style_code);
CREATE INDEX ss_style_summary_seq_idx ON public.ss_style_summary(sequence_style NULLS LAST, name);

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
GRANT ALL ON public.ss_style_summary TO service_role;

-- Helper to refresh from edge function after a sync
CREATE OR REPLACE FUNCTION public.refresh_ss_style_summary()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ss_style_summary;
$$;

REVOKE ALL ON FUNCTION public.refresh_ss_style_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_ss_style_summary() TO service_role, authenticated;