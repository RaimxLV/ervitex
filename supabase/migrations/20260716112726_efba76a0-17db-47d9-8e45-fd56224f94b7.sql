
-- ============ BEECHFIELD BRANDS CATALOG ============

CREATE TABLE public.bb_styles (
  style_code text PRIMARY KEY,
  brand text NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  sub_category text,
  gender text,
  material text,
  weight text,
  care text,
  features jsonb,
  sizes text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bb_styles TO anon, authenticated;
GRANT ALL ON public.bb_styles TO service_role;
ALTER TABLE public.bb_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bb_styles public read" ON public.bb_styles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bb_styles admin write" ON public.bb_styles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX bb_styles_brand_idx ON public.bb_styles (brand);
CREATE INDEX bb_styles_category_idx ON public.bb_styles (category);

CREATE TABLE public.bb_variants (
  sku text PRIMARY KEY,
  style_code text NOT NULL REFERENCES public.bb_styles(style_code) ON DELETE CASCADE,
  color_name text,
  color_hex text,
  size text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bb_variants TO anon, authenticated;
GRANT ALL ON public.bb_variants TO service_role;
ALTER TABLE public.bb_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bb_variants public read" ON public.bb_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bb_variants admin write" ON public.bb_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX bb_variants_style_idx ON public.bb_variants (style_code);
CREATE INDEX bb_variants_color_idx ON public.bb_variants (color_name);

CREATE TABLE public.bb_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_code text NOT NULL REFERENCES public.bb_styles(style_code) ON DELETE CASCADE,
  color_name text,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bb_images TO anon, authenticated;
GRANT ALL ON public.bb_images TO service_role;
ALTER TABLE public.bb_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bb_images public read" ON public.bb_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bb_images admin write" ON public.bb_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX bb_images_style_idx ON public.bb_images (style_code);

-- Retail price already includes markup — public read is fine
CREATE TABLE public.bb_prices (
  sku text PRIMARY KEY REFERENCES public.bb_variants(sku) ON DELETE CASCADE,
  retail_price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.bb_prices TO anon, authenticated;
GRANT ALL ON public.bb_prices TO service_role;
ALTER TABLE public.bb_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bb_prices public read" ON public.bb_prices FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bb_prices admin write" ON public.bb_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- updated_at triggers
CREATE TRIGGER bb_styles_updated BEFORE UPDATE ON public.bb_styles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER bb_variants_updated BEFORE UPDATE ON public.bb_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER bb_prices_updated BEFORE UPDATE ON public.bb_prices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
