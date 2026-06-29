
-- ss_styles: add real S/S fields
ALTER TABLE public.ss_styles
  ADD COLUMN IF NOT EXISTS category_code text,
  ADD COLUMN IF NOT EXISTS type_code text,
  ADD COLUMN IF NOT EXISTS main_picture_url text,
  ADD COLUMN IF NOT EXISTS over_picture_url text,
  ADD COLUMN IF NOT EXISTS wash_instructions text,
  ADD COLUMN IF NOT EXISTS specifications text;

-- ss_variants: add hex + sequencing + weight + price brackets (jsonb)
ALTER TABLE public.ss_variants
  ADD COLUMN IF NOT EXISTS hex_color_code text,
  ADD COLUMN IF NOT EXISTS color_group text,
  ADD COLUMN IF NOT EXISTS color_sequence integer,
  ADD COLUMN IF NOT EXISTS size_sequence integer,
  ADD COLUMN IF NOT EXISTS weight_grams numeric,
  ADD COLUMN IF NOT EXISTS published boolean DEFAULT true;

-- ss_stock: add real S/S fields
ALTER TABLE public.ss_stock
  ADD COLUMN IF NOT EXISTS variant_code text,
  ADD COLUMN IF NOT EXISTS location_code text,
  ADD COLUMN IF NOT EXISTS receipt_date date;

-- ss_images: add photo metadata + flags. Make storage_path optional (hotlink from S/S CDN).
ALTER TABLE public.ss_images
  ADD COLUMN IF NOT EXISTS photo_style text,
  ADD COLUMN IF NOT EXISTS photo_shoot_code text,
  ADD COLUMN IF NOT EXISTS fname text,
  ADD COLUMN IF NOT EXISTS is_main boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_over boolean DEFAULT false;

-- Ensure source_url is required (used as primary display URL)
ALTER TABLE public.ss_images ALTER COLUMN source_url SET NOT NULL;

-- Unique key for upsert: one row per (style, color, photo type, sequence)
DROP INDEX IF EXISTS ss_images_unique_key;
CREATE UNIQUE INDEX IF NOT EXISTS ss_images_unique_key
  ON public.ss_images (style_code, COALESCE(color_code,''), COALESCE(image_type,''), COALESCE(sort_order,0));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS ss_variants_style_idx ON public.ss_variants(style_code);
CREATE INDEX IF NOT EXISTS ss_variants_color_idx ON public.ss_variants(color_code);
CREATE INDEX IF NOT EXISTS ss_images_style_color_idx ON public.ss_images(style_code, color_code);
CREATE INDEX IF NOT EXISTS ss_stock_style_idx ON public.ss_stock(style_code);

-- Rebuild summary view with the new fields
DROP VIEW IF EXISTS public.ss_style_summary;
CREATE VIEW public.ss_style_summary AS
SELECT
  s.style_code,
  s.name,
  s.short_description,
  s.long_description,
  s.category,
  s.category_code,
  s.type,
  s.type_code,
  s.gender,
  s.segment,
  s.composition,
  s.fit,
  s.neckline,
  s.sleeve,
  s.weight_gsm,
  s.brand,
  s.wash_instructions,
  s.specifications,
  s.main_picture_url,
  s.over_picture_url,
  s.published,
  s.hidden_by_admin,
  s.raw,
  COALESCE(stk.total_stock, 0)::bigint AS total_stock,
  COALESCE(cc.color_count, 0)::bigint AS color_count,
  COALESCE(sc.size_count, 0)::bigint AS size_count
FROM public.ss_styles s
LEFT JOIN (
  SELECT v.style_code, SUM(GREATEST(st.quantity,0)) AS total_stock
  FROM public.ss_variants v
  LEFT JOIN public.ss_stock st ON st.sku = v.sku
  GROUP BY v.style_code
) stk ON stk.style_code = s.style_code
LEFT JOIN (
  SELECT style_code, COUNT(DISTINCT color_code) AS color_count
  FROM public.ss_variants WHERE color_code IS NOT NULL GROUP BY style_code
) cc ON cc.style_code = s.style_code
LEFT JOIN (
  SELECT style_code, COUNT(DISTINCT size_code) AS size_count
  FROM public.ss_variants WHERE size_code IS NOT NULL GROUP BY style_code
) sc ON sc.style_code = s.style_code;

GRANT SELECT ON public.ss_style_summary TO anon, authenticated;
