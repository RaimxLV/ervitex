
-- View aggregating per-style summary for fast catalog browsing
CREATE OR REPLACE VIEW public.ss_style_summary
WITH (security_invoker = on) AS
SELECT
  s.style_code,
  s.name,
  s.short_description,
  s.category,
  s.gender,
  s.segment,
  s.composition,
  s.type,
  s.brand,
  COALESCE(stk.total_stock, 0)::int AS total_stock,
  COALESCE(v.color_count, 0)::int AS color_count,
  COALESCE(v.size_count, 0)::int AS size_count,
  img.storage_path AS image_path,
  img.public_url AS image_url
FROM public.ss_styles s
LEFT JOIN (
  SELECT style_code,
         COUNT(DISTINCT color_code) FILTER (WHERE color_code IS NOT NULL) AS color_count,
         COUNT(DISTINCT size_code) FILTER (WHERE size_code IS NOT NULL) AS size_count
  FROM public.ss_variants
  GROUP BY style_code
) v ON v.style_code = s.style_code
LEFT JOIN (
  SELECT style_code, SUM(quantity)::int AS total_stock
  FROM public.ss_stock
  GROUP BY style_code
) stk ON stk.style_code = s.style_code
LEFT JOIN LATERAL (
  SELECT storage_path, public_url
  FROM public.ss_images i
  WHERE i.style_code = s.style_code
  ORDER BY sort_order ASC NULLS LAST, created_at ASC
  LIMIT 1
) img ON true;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
