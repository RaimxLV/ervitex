-- Populate hex codes from variant raw data into ss_colors
UPDATE public.ss_colors c
SET hex = sub.hex
FROM (
  SELECT DISTINCT ON (raw->>'ColorCode')
    raw->>'ColorCode' AS code,
    raw->>'HexaColorCode' AS hex,
    raw->>'Color' AS name
  FROM public.ss_variants
  WHERE raw->>'HexaColorCode' IS NOT NULL
    AND raw->>'HexaColorCode' <> ''
) sub
WHERE c.code = sub.code
  AND (c.hex IS NULL OR c.hex = '');

-- Add missing color rows
INSERT INTO public.ss_colors (code, name, hex)
SELECT DISTINCT ON (raw->>'ColorCode')
  raw->>'ColorCode',
  raw->>'Color',
  raw->>'HexaColorCode'
FROM public.ss_variants
WHERE raw->>'ColorCode' IS NOT NULL
  AND raw->>'ColorCode' NOT IN (SELECT code FROM public.ss_colors)
ON CONFLICT (code) DO NOTHING;

-- Rebuild style summary view with extra fields
DROP VIEW IF EXISTS public.ss_style_summary;
CREATE VIEW public.ss_style_summary
WITH (security_invoker=on) AS
SELECT
  s.style_code,
  s.name,
  s.short_description,
  s.long_description,
  s.category,
  s.gender,
  s.segment,
  s.composition,
  s.type,
  s.brand,
  s.fit,
  s.weight_gsm,
  s.neckline,
  s.sleeve,
  s.raw,
  COALESCE(stk.total_stock, 0) AS total_stock,
  COALESCE(vc.color_count, 0) AS color_count,
  COALESCE(vc.size_count, 0) AS size_count,
  img.storage_path AS image_path,
  img.public_url AS image_url
FROM public.ss_styles s
LEFT JOIN (
  SELECT v.style_code,
    COUNT(DISTINCT v.color_code) AS color_count,
    COUNT(DISTINCT v.size_code) AS size_count
  FROM public.ss_variants v
  WHERE v.hidden_by_admin = false
  GROUP BY v.style_code
) vc ON vc.style_code = s.style_code
LEFT JOIN (
  SELECT v.style_code, SUM(COALESCE(st.quantity, 0))::bigint AS total_stock
  FROM public.ss_variants v
  LEFT JOIN public.ss_stock st ON st.sku = v.sku
  WHERE v.hidden_by_admin = false
  GROUP BY v.style_code
) stk ON stk.style_code = s.style_code
LEFT JOIN LATERAL (
  SELECT storage_path, public_url
  FROM public.ss_images i
  WHERE i.style_code = s.style_code
  ORDER BY i.sort_order ASC NULLS LAST, i.created_at ASC NULLS LAST
  LIMIT 1
) img ON true
WHERE s.published = true AND s.hidden_by_admin = false;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;