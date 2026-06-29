
-- Widen ss_images unique key so multiple photos per (style,color,type) survive upsert
DROP INDEX IF EXISTS public.ss_images_unique_key;
DROP INDEX IF EXISTS public.ss_images_unique_src;
CREATE UNIQUE INDEX ss_images_unique_src
  ON public.ss_images (style_code, COALESCE(color_code,''), COALESCE(image_type,''), COALESCE(fname, source_url));

-- Rebuild style summary to derive cover image from ss_images so the catalog
-- shows pictures even before main_picture_url is populated on ss_styles.
DROP VIEW IF EXISTS public.ss_style_summary;
CREATE VIEW public.ss_style_summary
WITH (security_invoker = on) AS
SELECT
  s.style_code, s.name, s.short_description, s.long_description,
  s.category, s.category_code, s.type, s.type_code, s.gender, s.segment,
  s.composition, s.fit, s.neckline, s.sleeve, s.weight_gsm, s.brand,
  s.wash_instructions, s.specifications,
  s.main_picture_url, s.over_picture_url,
  cov.cover_url,
  ovr.over_url,
  s.published, s.hidden_by_admin, s.raw,
  COALESCE(stk.total_stock, 0) AS total_stock,
  COALESCE(cc.color_count, 0) AS color_count,
  COALESCE(sc.size_count, 0) AS size_count
FROM public.ss_styles s
LEFT JOIN (
  SELECT v.style_code, sum(GREATEST(st.quantity, 0)) AS total_stock
  FROM public.ss_variants v LEFT JOIN public.ss_stock st ON st.sku = v.sku
  GROUP BY v.style_code
) stk ON stk.style_code = s.style_code
LEFT JOIN (
  SELECT style_code, count(DISTINCT color_code) AS color_count
  FROM public.ss_variants WHERE color_code IS NOT NULL GROUP BY style_code
) cc ON cc.style_code = s.style_code
LEFT JOIN (
  SELECT style_code, count(DISTINCT size_code) AS size_count
  FROM public.ss_variants WHERE size_code IS NOT NULL GROUP BY style_code
) sc ON sc.style_code = s.style_code
LEFT JOIN LATERAL (
  SELECT i.source_url AS cover_url FROM public.ss_images i
  WHERE i.style_code = s.style_code
  ORDER BY (i.is_main IS TRUE) DESC, COALESCE(i.sort_order, 999), i.id
  LIMIT 1
) cov ON true
LEFT JOIN LATERAL (
  SELECT i.source_url AS over_url FROM public.ss_images i
  WHERE i.style_code = s.style_code AND (i.is_over IS TRUE OR i.image_type ILIKE 'Duo')
  ORDER BY COALESCE(i.sort_order, 999), i.id
  LIMIT 1
) ovr ON true;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
GRANT ALL ON public.ss_style_summary TO service_role;
