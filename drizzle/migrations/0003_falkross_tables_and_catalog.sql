-- Falk&Ross (Build Your Brand + Flexfit) catalog tables, mirroring the utt_* pattern.
CREATE TABLE public.falkross_styles (
  style_code text PRIMARY KEY,
  brand text NOT NULL,
  name text,
  description text,
  category text,
  gender text,
  fabric text,
  weight text,
  cut text,
  details text,
  care text,
  sizes text[],
  is_new boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  hidden_by_admin boolean NOT NULL DEFAULT false,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.falkross_styles TO anon, authenticated;
GRANT ALL ON public.falkross_styles TO service_role;
ALTER TABLE public.falkross_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "falkross_styles public read" ON public.falkross_styles FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX falkross_styles_brand_idx ON public.falkross_styles (brand);

CREATE TABLE public.falkross_variants (
  sku text PRIMARY KEY,
  style_code text NOT NULL REFERENCES public.falkross_styles(style_code) ON DELETE CASCADE,
  color_name text,
  color_hex text,
  size text,
  size_order integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.falkross_variants TO anon, authenticated;
GRANT ALL ON public.falkross_variants TO service_role;
ALTER TABLE public.falkross_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "falkross_variants public read" ON public.falkross_variants FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX falkross_variants_style_idx ON public.falkross_variants (style_code);
CREATE INDEX falkross_variants_color_idx ON public.falkross_variants (color_name);

-- Buying prices are internal: service_role only, never granted to anon/authenticated.
CREATE TABLE public.falkross_prices (
  sku text PRIMARY KEY,
  purchase_price numeric,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.falkross_prices TO service_role;
ALTER TABLE public.falkross_prices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.falkross_images (
  id bigserial PRIMARY KEY,
  style_code text NOT NULL REFERENCES public.falkross_styles(style_code) ON DELETE CASCADE,
  color_name text,
  source_path text NOT NULL,
  url text,
  sort_order integer NOT NULL DEFAULT 0,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (style_code, source_path)
);
GRANT SELECT ON public.falkross_images TO anon, authenticated;
GRANT ALL ON public.falkross_images TO service_role;
ALTER TABLE public.falkross_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "falkross_images public read" ON public.falkross_images FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX falkross_images_style_idx ON public.falkross_images (style_code);

-- Resumable sync queue (internal).
CREATE TABLE private.falkross_queue (
  url text PRIMARY KEY,
  brand text NOT NULL,
  mpn text,
  title text,
  done boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON private.falkross_queue TO service_role;

-- Public catalog view: add the Falk&Ross branch next to utt.
CREATE OR REPLACE VIEW public.catalog_items AS
WITH base AS (
  SELECT m.source, m.id, m.name, m.description, m.brand, m.category, m.group_name,
         m.gender, m.image_url, m.hover_image_url, m.sort_order, m.colors
    FROM private.catalog_items_mv m
   WHERE m.source <> 'nwg'
      OR m.id IN (SELECT r.style_code FROM public.catalog_price_ranges r
                  WHERE r.source = 'nwg' AND r.min_price > 0)
  UNION ALL
  SELECT 'ru'::text AS source, s.style_code, s.name, s.description,
         COALESCE(NULLIF(s.brand, ''), 'Russell') AS brand,
         s.category, s.category, s.gender,
         COALESCE(NULLIF(s.main_image_url, ''), (
           SELECT i.url FROM public.ru_images i WHERE i.style_code = s.style_code
            ORDER BY i.sort_order, i.id LIMIT 1)),
         (SELECT i.url FROM public.ru_images i WHERE i.style_code = s.style_code
           ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1),
         600000,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''), 'n', NULLIF(v.color_name, ''), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name)
             FROM public.ru_variants v WHERE v.style_code = s.style_code), '[]'::jsonb)
    FROM public.ru_styles s
   WHERE COALESCE(s.published, true) = true AND COALESCE(s.hidden_by_admin, false) = false
  UNION ALL
  SELECT 'utt'::text AS source, s.style_code, s.name, s.description, s.brand, s.category, s.category, s.gender,
         (SELECT i.url FROM public.utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
           ORDER BY i.sort_order, i.id LIMIT 1),
         (SELECT i.url FROM public.utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
           ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1),
         700000,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name)
             FROM (SELECT DISTINCT ON (v.color_name) v.color_name, NULLIF(v.color_hex, '') AS color_hex
                     FROM public.utt_variants v
                    WHERE v.style_code = s.style_code AND v.active AND NULLIF(v.color_name, '') IS NOT NULL
                    ORDER BY v.color_name) c), '[]'::jsonb)
    FROM public.utt_styles s
   WHERE s.published AND NOT s.hidden_by_admin
     AND EXISTS (SELECT 1 FROM public.catalog_price_ranges r WHERE r.source = 'utt' AND r.style_code = s.style_code AND r.min_price > 0)
     AND EXISTS (SELECT 1 FROM public.utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL)
  UNION ALL
  SELECT 'fr'::text AS source, s.style_code, s.name, s.description, s.brand, s.category, s.category, s.gender,
         (SELECT i.url FROM public.falkross_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
           ORDER BY i.sort_order, i.id LIMIT 1),
         (SELECT i.url FROM public.falkross_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
           ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1),
         750000,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name)
             FROM (SELECT DISTINCT ON (v.color_name) v.color_name, NULLIF(v.color_hex, '') AS color_hex
                     FROM public.falkross_variants v
                    WHERE v.style_code = s.style_code AND v.active AND NULLIF(v.color_name, '') IS NOT NULL
                    ORDER BY v.color_name) c), '[]'::jsonb)
    FROM public.falkross_styles s
   WHERE s.published AND NOT s.hidden_by_admin
     AND EXISTS (SELECT 1 FROM public.catalog_price_ranges r WHERE r.source = 'fr' AND r.style_code = s.style_code AND r.min_price > 0)
     AND EXISTS (SELECT 1 FROM public.falkross_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL)
)
SELECT source, id, name, description, brand, category, group_name, gender,
       image_url, hover_image_url, sort_order, colors,
       COALESCE(ARRAY(
         SELECT elem.value ->> 'h' FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE elem.value ->> 'h' IS NOT NULL), ARRAY[]::text[]) AS color_hexes,
       COALESCE(ARRAY(
         SELECT elem.value ->> 'n' FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE elem.value ->> 'n' IS NOT NULL), ARRAY[]::text[]) AS color_names
  FROM base
 ORDER BY sort_order, name;

-- Buying prices -> retail via the Falk&Ross markup (x1.55, Build Your Brand + Flexfit).
CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.catalog_variant_prices WHERE source IS NOT NULL;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'ss', r.sku, r.style_code, r.color_code, r.size_code, r.retail_price, 'EUR'
    FROM public.ss_sku_retail_prices() r WHERE r.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'mf', p.sku, v.style_code, v.color_code, COALESCE(v.size_name, v.size), ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.mf_prices p JOIN public.mf_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'bb', p.sku, v.style_code, v.color_name, v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.bb_prices p JOIN public.bb_variants v ON v.sku = p.sku WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'pf', p.item_code, COALESCE(v.model_code, p.model_code), COALESCE(v.color_code, v.color_desc, p.item_code), v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p LEFT JOIN public.pf_variants v ON v.item_code = p.item_code WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, retail_price, currency)
  SELECT 'ru', p.style_code, p.style_code, ROUND((p.retail_price * 1.65)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.ru_prices p WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;
  -- UTT sends clearance prices for leftover colours/sizes; use the regular (median) price of the same style and size.
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  WITH base AS (
    SELECT v.sku, v.style_code, v.color_name, v.size, p.purchase_price, p.currency, s.brand
      FROM public.utt_prices p
      JOIN public.utt_variants v ON v.sku = p.sku
      JOIN public.utt_styles s ON s.style_code = v.style_code
     WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin
       AND public.utt_markup(s.brand) IS NOT NULL
  ), reg AS (
    SELECT style_code, size, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med
      FROM base GROUP BY style_code, size
  )
  SELECT 'utt', b.sku, b.style_code, b.color_name, b.size,
         ROUND((GREATEST(b.purchase_price, CASE WHEN b.purchase_price < r.med * 0.75 THEN r.med ELSE 0 END) * public.utt_markup(b.brand))::numeric, 2),
         COALESCE(b.currency, 'EUR')
    FROM base b JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
  ON CONFLICT DO NOTHING;
  -- Falk&Ross (Build Your Brand / Flexfit): partner price x 1.55, no clearance rows in the feed.
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'fr', p.sku, v.style_code, v.color_name, v.size,
         ROUND((p.purchase_price * 1.55)::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.falkross_prices p
    JOIN public.falkross_variants v ON v.sku = p.sku
   WHERE p.purchase_price > 0 AND v.active
  ON CONFLICT DO NOTHING;
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'nwg', k.sku, k.product_number, v.color_code, COALESCE(NULLIF(k.size_name, ''), k.size),
         ROUND((COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE s.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) * CASE s.brand WHEN 'Craft' THEN 1.5 WHEN 'ProJob' THEN 1.5 WHEN 'Cutter & Buck' THEN 1.5 ELSE 1.75 END)::numeric, 2),
         'EUR'
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    JOIN public.nwg_variants v ON v.product_number = k.product_number AND v.item_number = k.item_number
    LEFT JOIN public.nwg_pricelist pl ON pl.product_number = k.product_number AND pl.rec_price > 0
   WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
     AND COALESCE(s.published, true) = true
     AND COALESCE(s.archived, false) = false
     AND COALESCE(k.active, true) = true
     AND COALESCE(k.discontinued, false) = false
     AND COALESCE(
       COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
         CASE s.brand
           WHEN 'Clique' THEN 0.37
           WHEN 'Craft' THEN 0.50
           WHEN 'ProJob' THEN 0.60
           WHEN 'Cutter & Buck' THEN 0.60
         END,
       NULLIF(k.purchase_price, 0),
       0
     ) > 0
  ON CONFLICT DO NOTHING;

  DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices GROUP BY source, style_code;
END;
$function$;