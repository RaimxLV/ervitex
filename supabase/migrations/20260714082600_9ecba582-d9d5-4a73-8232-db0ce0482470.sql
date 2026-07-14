
-- PF Concept catalog tables (data feed v3 mirror)

CREATE TABLE IF NOT EXISTS public.pf_styles (
  model_code TEXT PRIMARY KEY,
  description TEXT,
  ext_desc TEXT,
  keywords TEXT,
  product_comments TEXT,
  brand TEXT,
  category_group TEXT,
  category TEXT,
  material TEXT,
  simple_material TEXT,
  gender TEXT,
  country_of_origin TEXT,
  main_image TEXT,
  color_count INT DEFAULT 0,
  item_count INT DEFAULT 0,
  attributes JSONB,
  raw JSONB,
  last_synced_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.pf_styles TO anon, authenticated;
GRANT ALL ON public.pf_styles TO service_role;
ALTER TABLE public.pf_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_styles public read" ON public.pf_styles FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS pf_styles_brand_idx ON public.pf_styles(brand);
CREATE INDEX IF NOT EXISTS pf_styles_category_idx ON public.pf_styles(category);
CREATE INDEX IF NOT EXISTS pf_styles_group_idx ON public.pf_styles(category_group);

CREATE TABLE IF NOT EXISTS public.pf_variants (
  item_code TEXT PRIMARY KEY,
  model_code TEXT NOT NULL REFERENCES public.pf_styles(model_code) ON DELETE CASCADE,
  size TEXT,
  size_grid TEXT,
  gender TEXT,
  color_code TEXT,
  color_desc TEXT,
  base_color TEXT,
  hex_color TEXT,
  pms_color TEXT,
  material TEXT,
  ean_code TEXT,
  weight_gr NUMERIC,
  qty_per_carton INT,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.pf_variants TO anon, authenticated;
GRANT ALL ON public.pf_variants TO service_role;
ALTER TABLE public.pf_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_variants public read" ON public.pf_variants FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS pf_variants_model_idx ON public.pf_variants(model_code);

CREATE TABLE IF NOT EXISTS public.pf_images (
  id BIGSERIAL PRIMARY KEY,
  model_code TEXT NOT NULL,
  item_code TEXT,
  kind TEXT NOT NULL,
  filename TEXT NOT NULL,
  url_500 TEXT,
  url_1600 TEXT,
  sort_order INT DEFAULT 0
);
GRANT SELECT ON public.pf_images TO anon, authenticated;
GRANT ALL ON public.pf_images TO service_role;
ALTER TABLE public.pf_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_images public read" ON public.pf_images FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS pf_images_model_idx ON public.pf_images(model_code);
CREATE UNIQUE INDEX IF NOT EXISTS pf_images_unique ON public.pf_images(model_code, COALESCE(item_code,''), kind, filename);

-- Summary view for fast listing
CREATE OR REPLACE VIEW public.pf_style_summary AS
SELECT
  s.model_code,
  s.description,
  s.ext_desc,
  s.brand,
  s.category_group,
  s.category,
  s.material,
  s.gender,
  s.main_image,
  s.color_count,
  s.item_count,
  ('https://images.pfconcept.com/ProductImages_All/JPG/500x500/' || COALESCE(s.main_image, s.model_code || '.jpg')) AS main_image_url
FROM public.pf_styles s;

GRANT SELECT ON public.pf_style_summary TO anon, authenticated;
