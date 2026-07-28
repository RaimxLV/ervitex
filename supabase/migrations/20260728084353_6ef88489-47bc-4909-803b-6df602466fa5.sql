
CREATE TABLE IF NOT EXISTS public.ru_styles (
  style_code TEXT PRIMARY KEY,
  name TEXT,
  brand TEXT,
  category TEXT,
  gender TEXT,
  fabric TEXT,
  weight TEXT,
  description TEXT,
  features TEXT,
  sizes TEXT[],
  main_image_url TEXT,
  href TEXT,
  is_new BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  hidden_by_admin BOOLEAN NOT NULL DEFAULT false,
  raw JSONB,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ru_styles TO anon, authenticated;
GRANT ALL ON public.ru_styles TO service_role;
ALTER TABLE public.ru_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ru_styles_public_read" ON public.ru_styles FOR SELECT USING (true);
CREATE POLICY "ru_styles_admin_write" ON public.ru_styles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.ru_variants (
  style_code TEXT NOT NULL REFERENCES public.ru_styles(style_code) ON DELETE CASCADE,
  color_name TEXT NOT NULL,
  color_hex TEXT,
  swatch_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(style_code, color_name)
);
GRANT SELECT ON public.ru_variants TO anon, authenticated;
GRANT ALL ON public.ru_variants TO service_role;
ALTER TABLE public.ru_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ru_variants_public_read" ON public.ru_variants FOR SELECT USING (true);
CREATE POLICY "ru_variants_admin_write" ON public.ru_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.ru_prices (
  style_code TEXT PRIMARY KEY REFERENCES public.ru_styles(style_code) ON DELETE CASCADE,
  wholesale_price NUMERIC,
  retail_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'EUR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ru_prices TO anon, authenticated;
GRANT ALL ON public.ru_prices TO service_role;
ALTER TABLE public.ru_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ru_prices_public_read" ON public.ru_prices FOR SELECT USING (true);
CREATE POLICY "ru_prices_admin_write" ON public.ru_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.ru_images (
  id BIGSERIAL PRIMARY KEY,
  style_code TEXT NOT NULL REFERENCES public.ru_styles(style_code) ON DELETE CASCADE,
  color_name TEXT,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ru_images_style_idx ON public.ru_images(style_code);
GRANT SELECT ON public.ru_images TO anon, authenticated;
GRANT ALL ON public.ru_images TO service_role;
ALTER TABLE public.ru_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ru_images_public_read" ON public.ru_images FOR SELECT USING (true);
CREATE POLICY "ru_images_admin_write" ON public.ru_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
