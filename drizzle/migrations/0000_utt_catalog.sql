CREATE TABLE public.utt_styles (
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
GRANT SELECT ON public.utt_styles TO anon, authenticated;
GRANT ALL ON public.utt_styles TO service_role;
ALTER TABLE public.utt_styles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "utt_styles public read" ON public.utt_styles FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX utt_styles_brand_idx ON public.utt_styles (brand);
CREATE TRIGGER utt_styles_updated BEFORE UPDATE ON public.utt_styles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.utt_variants (
  sku text PRIMARY KEY,
  style_code text NOT NULL REFERENCES public.utt_styles(style_code) ON DELETE CASCADE,
  color_name text,
  color_hex text,
  size text,
  size_order integer NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.utt_variants TO anon, authenticated;
GRANT ALL ON public.utt_variants TO service_role;
ALTER TABLE public.utt_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "utt_variants public read" ON public.utt_variants FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX utt_variants_style_idx ON public.utt_variants (style_code);

CREATE TABLE public.utt_prices (
  sku text PRIMARY KEY REFERENCES public.utt_variants(sku) ON DELETE CASCADE,
  purchase_price numeric,
  special_price numeric,
  currency text NOT NULL DEFAULT 'EUR',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.utt_prices TO service_role;
ALTER TABLE public.utt_prices ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.utt_images (
  id bigserial PRIMARY KEY,
  style_code text NOT NULL REFERENCES public.utt_styles(style_code) ON DELETE CASCADE,
  color_name text,
  source_path text NOT NULL,
  url text,
  sort_order integer NOT NULL DEFAULT 0,
  failed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (style_code, source_path)
);
GRANT SELECT ON public.utt_images TO anon, authenticated;
GRANT ALL ON public.utt_images TO service_role;
GRANT USAGE ON SEQUENCE public.utt_images_id_seq TO service_role;
ALTER TABLE public.utt_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "utt_images public read" ON public.utt_images FOR SELECT TO anon, authenticated USING (url IS NOT NULL);
CREATE INDEX utt_images_style_idx ON public.utt_images (style_code);
CREATE INDEX utt_images_pending_idx ON public.utt_images (id) WHERE url IS NULL;

CREATE OR REPLACE FUNCTION public.utt_markup(_brand text)
RETURNS numeric LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT CASE _brand WHEN 'Gildan' THEN 2.0 WHEN 'Kariban' THEN 1.8 WHEN 'Regatta' THEN 1.75 END::numeric
$$;

CREATE OR REPLACE FUNCTION public.refresh_catalog_prices()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET statement_timeout TO '900s'
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
  INSERT INTO public.catalog_variant_prices (source, sku, style_code, color_code, size, retail_price, currency)
  SELECT 'utt', v.sku, v.style_code, v.color_name, v.size,
         ROUND((p.purchase_price * public.utt_markup(s.brand))::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.utt_prices p
    JOIN public.utt_variants v ON v.sku = p.sku
    JOIN public.utt_styles s ON s.style_code = v.style_code
   WHERE p.purchase_price > 0 AND v.active AND s.published AND NOT s.hidden_by_admin
     AND public.utt_markup(s.brand) IS NOT NULL
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
REVOKE EXECUTE ON FUNCTION public.refresh_catalog_prices() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_prices() TO service_role;

CREATE OR REPLACE FUNCTION private.price_audit_expected()
 RETURNS TABLE(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  SELECT cv.source, cv.sku, cv.style_code,
         COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE st.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) AS base_price,
         ROUND((COALESCE(
           COALESCE(pl.rec_price, NULLIF(k.retail_price, 0)) *
             CASE st.brand
               WHEN 'Clique' THEN 0.37
               WHEN 'Craft' THEN 0.50
               WHEN 'ProJob' THEN 0.60
               WHEN 'Cutter & Buck' THEN 0.60
             END,
           NULLIF(k.purchase_price, 0)
         ) * CASE st.brand WHEN 'Craft' THEN 1.5 WHEN 'ProJob' THEN 1.5 WHEN 'Cutter & Buck' THEN 1.5 ELSE 1.75 END)::numeric, 2) AS expected,
         cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.nwg_skus k ON k.sku = cv.sku
    LEFT JOIN public.nwg_styles st ON st.product_number = k.product_number
    LEFT JOIN public.nwg_pricelist pl ON pl.product_number = k.product_number AND pl.rec_price > 0
   WHERE cv.source = 'nwg'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.purchase_price,
         ROUND(p.purchase_price * 1.75, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.ss_prices p ON p.sku = cv.sku
   WHERE cv.source = 'ss'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.mf_prices p ON p.sku = cv.sku
   WHERE cv.source = 'mf'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.price, ROUND(p.price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.pf_prices p ON p.item_code = cv.sku
   WHERE cv.source = 'pf'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.retail_price, ROUND(p.retail_price, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.bb_prices p ON p.sku = cv.sku
   WHERE cv.source = 'bb'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.wholesale_price, ROUND(p.wholesale_price * 1.65, 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.ru_prices p ON p.style_code = cv.style_code
   WHERE cv.source = 'ru'
  UNION ALL
  SELECT cv.source, cv.sku, cv.style_code, p.purchase_price,
         ROUND(p.purchase_price * public.utt_markup(s.brand), 2), cv.retail_price
    FROM public.catalog_variant_prices cv
    LEFT JOIN public.utt_prices p ON p.sku = cv.sku
    LEFT JOIN public.utt_styles s ON s.style_code = cv.style_code
   WHERE cv.source = 'utt'
$function$;

CREATE OR REPLACE FUNCTION public.supplier_price_health()
 RETURNS TABLE(source text, total_variants bigint, priced_variants bigint, contract_priced bigint, fallback_priced bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT health.*
  FROM (
    SELECT 'stanley-stella'::text AS source,
           count(*)::bigint AS total_variants,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'ss' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint AS priced_variants,
           0::bigint AS contract_priced,
           0::bigint AS fallback_priced
    FROM public.ss_variants v
    WHERE v.published = true
    UNION ALL
    SELECT 'nwg'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'nwg' AND c.sku = k.sku AND c.retail_price > 0
           ))::bigint,
           count(*) FILTER (WHERE k.purchase_price > 0)::bigint,
           count(*) FILTER (
             WHERE COALESCE(k.purchase_price, 0) <= 0
               AND k.retail_price > 0
               AND EXISTS (
                 SELECT 1 FROM public.catalog_variant_prices c
                 WHERE c.source = 'nwg' AND c.sku = k.sku AND c.retail_price > 0
               )
           )::bigint
    FROM public.nwg_skus k
    JOIN public.nwg_styles s ON s.product_number = k.product_number
    WHERE s.brand IN ('Craft', 'Clique', 'ProJob', 'Cutter & Buck')
      AND COALESCE(s.published, true) = true
      AND COALESCE(s.archived, false) = false
      AND COALESCE(k.active, true) = true
      AND COALESCE(k.discontinued, false) = false
    UNION ALL
    SELECT 'pf'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'pf' AND c.sku = v.item_code AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.pf_variants v
    UNION ALL
    SELECT 'bb'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'bb' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.bb_variants v
    JOIN public.bb_styles s ON s.style_code = v.style_code
    WHERE s.active = true AND v.active = true
    UNION ALL
    SELECT 'malfini'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'mf' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.mf_variants v
    JOIN public.mf_styles s ON s.style_code = v.style_code
    WHERE s.published = true AND s.hidden_by_admin = false
    UNION ALL
    SELECT 'utt'::text,
           count(*)::bigint,
           count(*) FILTER (WHERE EXISTS (
             SELECT 1 FROM public.catalog_variant_prices c
             WHERE c.source = 'utt' AND c.sku = v.sku AND c.retail_price > 0
           ))::bigint,
           0::bigint,
           0::bigint
    FROM public.utt_variants v
    JOIN public.utt_styles s ON s.style_code = v.style_code
    WHERE v.active AND s.published AND NOT s.hidden_by_admin
  ) health
  WHERE public.has_role(auth.uid(), 'admin'::public.app_role)
$function$;

CREATE OR REPLACE VIEW public.catalog_items WITH (security_invoker = true) AS
 WITH base AS (
         SELECT m.source, m.id, m.name, m.description, m.brand, m.category, m.group_name, m.gender,
            m.image_url, m.hover_image_url, m.sort_order, m.colors
           FROM private.catalog_items_mv m
          WHERE m.source <> 'nwg'::text OR (m.id IN ( SELECT r.style_code
                   FROM catalog_price_ranges r
                  WHERE r.source = 'nwg'::text AND r.min_price > 0::numeric))
        UNION ALL
         SELECT 'ru'::text AS text, s.style_code, s.name, s.description,
            COALESCE(NULLIF(s.brand, ''::text), 'Russell'::text) AS "coalesce",
            s.category, s.category, s.gender,
            COALESCE(NULLIF(s.main_image_url, ''::text), ( SELECT i.url FROM ru_images i
                  WHERE i.style_code = s.style_code ORDER BY i.sort_order, i.id LIMIT 1)) AS "coalesce",
            ( SELECT i.url FROM ru_images i WHERE i.style_code = s.style_code
                  ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1) AS url,
            600000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''::text), 'n', NULLIF(v.color_name, ''::text), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name) FILTER (WHERE NULLIF(v.color_name, ''::text) IS NOT NULL OR NULLIF(v.color_hex, ''::text) IS NOT NULL) AS jsonb_agg
                   FROM ru_variants v WHERE v.style_code = s.style_code), '[]'::jsonb) AS "coalesce"
           FROM ru_styles s
          WHERE COALESCE(s.published, true) = true AND COALESCE(s.hidden_by_admin, false) = false
        UNION ALL
         SELECT 'utt'::text, s.style_code, s.name, s.description, s.brand,
            s.category, s.category, s.gender,
            ( SELECT i.url FROM utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
                  ORDER BY i.sort_order, i.id LIMIT 1),
            ( SELECT i.url FROM utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL
                  ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1),
            700000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name)
                   FROM ( SELECT DISTINCT ON (v.color_name) v.color_name, NULLIF(v.color_hex, ''::text) AS color_hex
                            FROM utt_variants v
                           WHERE v.style_code = s.style_code AND v.active AND NULLIF(v.color_name, ''::text) IS NOT NULL
                           ORDER BY v.color_name) c), '[]'::jsonb)
           FROM utt_styles s
          WHERE s.published AND NOT s.hidden_by_admin
            AND EXISTS (SELECT 1 FROM catalog_price_ranges r WHERE r.source = 'utt' AND r.style_code = s.style_code AND r.min_price > 0)
            AND EXISTS (SELECT 1 FROM utt_images i WHERE i.style_code = s.style_code AND i.url IS NOT NULL)
        )
 SELECT source, id, name, description, brand, category, group_name, gender, image_url, hover_image_url, sort_order, colors,
    COALESCE(ARRAY( SELECT elem.value ->> 'h'::text
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE (elem.value ->> 'h'::text) IS NOT NULL), ARRAY[]::text[]) AS color_hexes,
    COALESCE(ARRAY( SELECT elem.value ->> 'n'::text
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE (elem.value ->> 'n'::text) IS NOT NULL), ARRAY[]::text[]) AS color_names
   FROM base
  ORDER BY sort_order, name;

SELECT cron.schedule('nightly-utt-sync', '50 2 * * *', $c$ SELECT public.invoke_sync_function('utt-sync'); $c$);