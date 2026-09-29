CREATE OR REPLACE VIEW public.catalog_items AS
 WITH base AS (
         SELECT m.source, m.id, m.name, m.description, m.brand, m.category, m.group_name, m.gender, m.image_url, m.hover_image_url, m.sort_order, m.colors
           FROM private.catalog_items_mv m
          WHERE ((m.source <> 'nwg'::text) OR (m.id IN ( SELECT r.style_code FROM public.catalog_price_ranges r WHERE r.source = 'nwg' AND r.min_price > 0)))
        UNION ALL
         SELECT 'ru'::text, s.style_code, s.name, s.description,
            COALESCE(NULLIF(s.brand, ''::text), 'Russell'::text), s.category, s.category, s.gender,
            COALESCE(NULLIF(s.main_image_url, ''::text), ( SELECT i.url FROM ru_images i WHERE (i.style_code = s.style_code) ORDER BY i.sort_order, i.id LIMIT 1)),
            ( SELECT i.url FROM ru_images i WHERE (i.style_code = s.style_code) ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1),
            600000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''::text), 'n', NULLIF(v.color_name, ''::text), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name) FILTER (WHERE ((NULLIF(v.color_name, ''::text) IS NOT NULL) OR (NULLIF(v.color_hex, ''::text) IS NOT NULL)))
                   FROM ru_variants v WHERE (v.style_code = s.style_code)), '[]'::jsonb)
           FROM ru_styles s
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false))
        )
 SELECT source, id, name, description, brand, category, group_name, gender, image_url, hover_image_url, sort_order, colors,
    COALESCE(ARRAY( SELECT (elem.value ->> 'h'::text) FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value) WHERE ((elem.value ->> 'h'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_hexes,
    COALESCE(ARRAY( SELECT (elem.value ->> 'n'::text) FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value) WHERE ((elem.value ->> 'n'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_names
   FROM base
  ORDER BY sort_order, name;

GRANT SELECT ON private.catalog_items_mv TO anon, authenticated;
ALTER VIEW public.catalog_items SET (security_invoker = true);

REVOKE EXECUTE ON FUNCTION public.quote_request_event_log() FROM PUBLIC, anon, authenticated;