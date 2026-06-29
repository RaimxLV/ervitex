
-- ============ STYLES (modeļi) ============
CREATE TABLE public.ss_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  category TEXT,
  type TEXT,
  gender TEXT,
  segment TEXT,
  composition TEXT,
  weight_gsm INTEGER,
  fit TEXT,
  neckline TEXT,
  sleeve TEXT,
  brand TEXT DEFAULT 'Stanley/Stella',
  published BOOLEAN NOT NULL DEFAULT true,
  hidden_by_admin BOOLEAN NOT NULL DEFAULT false,
  raw JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_styles_published_idx ON public.ss_styles(published, hidden_by_admin);
CREATE INDEX ss_styles_category_idx ON public.ss_styles(category);

GRANT SELECT ON public.ss_styles TO anon, authenticated;
GRANT ALL ON public.ss_styles TO service_role;
ALTER TABLE public.ss_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_styles public read" ON public.ss_styles FOR SELECT USING (published = true AND hidden_by_admin = false);
CREATE POLICY "ss_styles admin all" ON public.ss_styles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ VARIANTS (SKU) ============
CREATE TABLE public.ss_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL UNIQUE,
  style_code TEXT NOT NULL REFERENCES public.ss_styles(style_code) ON DELETE CASCADE,
  color_code TEXT,
  color_name TEXT,
  size_code TEXT,
  ean TEXT,
  hidden_by_admin BOOLEAN NOT NULL DEFAULT false,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_variants_style_idx ON public.ss_variants(style_code);
CREATE INDEX ss_variants_color_idx ON public.ss_variants(style_code, color_code);

GRANT SELECT ON public.ss_variants TO anon, authenticated;
GRANT ALL ON public.ss_variants TO service_role;
ALTER TABLE public.ss_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_variants public read" ON public.ss_variants FOR SELECT USING (hidden_by_admin = false);
CREATE POLICY "ss_variants admin all" ON public.ss_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ STOCK ============
CREATE TABLE public.ss_stock (
  sku TEXT PRIMARY KEY REFERENCES public.ss_variants(sku) ON DELETE CASCADE,
  style_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  incoming_quantity INTEGER DEFAULT 0,
  next_arrival_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_stock_style_idx ON public.ss_stock(style_code);

GRANT SELECT ON public.ss_stock TO anon, authenticated;
GRANT ALL ON public.ss_stock TO service_role;
ALTER TABLE public.ss_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_stock public read" ON public.ss_stock FOR SELECT USING (true);
CREATE POLICY "ss_stock admin all" ON public.ss_stock FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ PRICES (admin-only sensitive data) ============
CREATE TABLE public.ss_prices (
  sku TEXT PRIMARY KEY REFERENCES public.ss_variants(sku) ON DELETE CASCADE,
  style_code TEXT NOT NULL,
  purchase_price NUMERIC(10,2),
  suggested_retail_price NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_prices_style_idx ON public.ss_prices(style_code);

-- Prices are sensitive: only admins can read
GRANT SELECT ON public.ss_prices TO authenticated;
GRANT ALL ON public.ss_prices TO service_role;
ALTER TABLE public.ss_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_prices admin read" ON public.ss_prices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "ss_prices admin all" ON public.ss_prices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ IMAGES (mūsu storage URL) ============
CREATE TABLE public.ss_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL REFERENCES public.ss_styles(style_code) ON DELETE CASCADE,
  color_code TEXT,
  image_type TEXT,
  sort_order INTEGER DEFAULT 0,
  source_url TEXT,
  storage_path TEXT,
  public_url TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_images_style_idx ON public.ss_images(style_code);
CREATE INDEX ss_images_style_color_idx ON public.ss_images(style_code, color_code);
CREATE UNIQUE INDEX ss_images_unique_src ON public.ss_images(style_code, color_code, image_type, sort_order);

GRANT SELECT ON public.ss_images TO anon, authenticated;
GRANT ALL ON public.ss_images TO service_role;
ALTER TABLE public.ss_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_images public read" ON public.ss_images FOR SELECT USING (true);
CREATE POLICY "ss_images admin all" ON public.ss_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ COLORS ============
CREATE TABLE public.ss_colors (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT,
  raw JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ss_colors TO anon, authenticated;
GRANT ALL ON public.ss_colors TO service_role;
ALTER TABLE public.ss_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_colors public read" ON public.ss_colors FOR SELECT USING (true);
CREATE POLICY "ss_colors admin all" ON public.ss_colors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ SIZES ============
CREATE TABLE public.ss_sizes (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  raw JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ss_sizes TO anon, authenticated;
GRANT ALL ON public.ss_sizes TO service_role;
ALTER TABLE public.ss_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_sizes public read" ON public.ss_sizes FOR SELECT USING (true);
CREATE POLICY "ss_sizes admin all" ON public.ss_sizes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ COMBOS (saderīgo modeļu ieteikumi) ============
CREATE TABLE public.ss_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code TEXT NOT NULL REFERENCES public.ss_styles(style_code) ON DELETE CASCADE,
  combo_style_code TEXT NOT NULL,
  combo_type TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ss_combos_style_idx ON public.ss_combos(style_code);

GRANT SELECT ON public.ss_combos TO anon, authenticated;
GRANT ALL ON public.ss_combos TO service_role;
ALTER TABLE public.ss_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ss_combos public read" ON public.ss_combos FOR SELECT USING (true);
CREATE POLICY "ss_combos admin all" ON public.ss_combos FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ============ Update triggers ============
CREATE TRIGGER ss_styles_uat BEFORE UPDATE ON public.ss_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_variants_uat BEFORE UPDATE ON public.ss_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_stock_uat BEFORE UPDATE ON public.ss_stock FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_prices_uat BEFORE UPDATE ON public.ss_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_colors_uat BEFORE UPDATE ON public.ss_colors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ss_sizes_uat BEFORE UPDATE ON public.ss_sizes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
