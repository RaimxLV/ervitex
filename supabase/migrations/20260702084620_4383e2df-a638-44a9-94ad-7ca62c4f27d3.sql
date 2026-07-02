
-- =============== NWG STYLES ================
CREATE TABLE public.nwg_styles (
  product_number text PRIMARY KEY,
  name text,
  brand text,
  category text,
  gender text,
  fit text,
  fabrics text,
  commerce_text text,
  catalog_text text,
  usp text,
  weight text,
  country_of_origin text,
  retail_price numeric,
  currency text DEFAULT 'EUR',
  main_picture_url text,
  assortment_ids text[],
  published boolean DEFAULT true,
  archived boolean DEFAULT false,
  archived_at timestamptz,
  raw jsonb,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.nwg_styles TO anon, authenticated;
GRANT ALL ON public.nwg_styles TO service_role;
ALTER TABLE public.nwg_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nwg_styles" ON public.nwg_styles FOR SELECT USING (true);
CREATE POLICY "Service manages nwg_styles" ON public.nwg_styles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============== NWG VARIANTS (colors) ================
CREATE TABLE public.nwg_variants (
  item_number text PRIMARY KEY,
  product_number text NOT NULL,
  color_name text,
  color_code text,
  web_color text[],
  filter_color text,
  shade_color text,
  outlet boolean DEFAULT false,
  main_picture_url text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_nwg_variants_product ON public.nwg_variants(product_number);
GRANT SELECT ON public.nwg_variants TO anon, authenticated;
GRANT ALL ON public.nwg_variants TO service_role;
ALTER TABLE public.nwg_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nwg_variants" ON public.nwg_variants FOR SELECT USING (true);
CREATE POLICY "Service manages nwg_variants" ON public.nwg_variants FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============== NWG SKUs (sizes) ================
CREATE TABLE public.nwg_skus (
  sku text PRIMARY KEY,
  product_number text NOT NULL,
  item_number text,
  size text,
  size_sequence text,
  ean text,
  availability integer,
  sales_price numeric,
  retail_price numeric,
  currency text DEFAULT 'EUR',
  discontinued boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_nwg_skus_product ON public.nwg_skus(product_number);
CREATE INDEX idx_nwg_skus_item ON public.nwg_skus(item_number);
-- Do NOT grant sales_price/retail_price to anon publicly — expose safe cols via view below.
GRANT SELECT ON public.nwg_skus TO authenticated;
GRANT ALL ON public.nwg_skus TO service_role;
ALTER TABLE public.nwg_skus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read nwg_skus" ON public.nwg_skus FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service manages nwg_skus" ON public.nwg_skus FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public view: only size + availability (no prices)
CREATE OR REPLACE VIEW public.nwg_skus_public AS
  SELECT sku, product_number, item_number, size, size_sequence, availability, discontinued, active
  FROM public.nwg_skus;
GRANT SELECT ON public.nwg_skus_public TO anon, authenticated;

-- =============== NWG IMAGES ================
CREATE TABLE public.nwg_images (
  id bigserial PRIMARY KEY,
  product_number text NOT NULL,
  item_number text,
  resource_file_id text,
  file_name text,
  picture_type text,
  picture_angle text,
  image_url text,
  thumbnail_url text,
  large_thumbnail_url text,
  high_res_url text,
  standard_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX ux_nwg_images_unique ON public.nwg_images(product_number, COALESCE(item_number,''), COALESCE(resource_file_id,''), COALESCE(picture_angle,''));
CREATE INDEX idx_nwg_images_product ON public.nwg_images(product_number);
CREATE INDEX idx_nwg_images_item ON public.nwg_images(item_number);
GRANT SELECT ON public.nwg_images TO anon, authenticated;
GRANT ALL ON public.nwg_images TO service_role;
ALTER TABLE public.nwg_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nwg_images" ON public.nwg_images FOR SELECT USING (true);
CREATE POLICY "Service manages nwg_images" ON public.nwg_images FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============== NWG ASSORTMENTS (category tree) ================
CREATE TABLE public.nwg_assortments (
  id text PRIMARY KEY,
  name text,
  parent_id text,
  raw jsonb,
  created_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.nwg_assortments TO anon, authenticated;
GRANT ALL ON public.nwg_assortments TO service_role;
ALTER TABLE public.nwg_assortments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read nwg_assortments" ON public.nwg_assortments FOR SELECT USING (true);
CREATE POLICY "Service manages nwg_assortments" ON public.nwg_assortments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============== Link products -> NWG ================
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS nwg_product_number text;
CREATE INDEX IF NOT EXISTS idx_products_nwg_product_number ON public.products(nwg_product_number);
