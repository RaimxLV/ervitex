-- 005 rollback — restores previous MV/view/function and derived cache from backups.
-- Added columns are left in place (harmless, unused by old definitions); drop them only by a separate reviewed step.
-- OLD: recreate private.catalog_items_mv + public.catalog_items, preserving existing ACLs.
CREATE TEMP TABLE pf005_acl ON COMMIT DROP AS
  SELECT c.oid::regclass::text AS obj, a.grantee, a.privilege_type
    FROM pg_class c CROSS JOIN LATERAL aclexplode(c.relacl) a
   WHERE c.oid IN ('private.catalog_items_mv'::regclass, 'public.catalog_items'::regclass);
DROP VIEW public.catalog_items;
DROP MATERIALIZED VIEW private.catalog_items_mv;
CREATE MATERIALIZED VIEW private.catalog_items_mv AS
WITH ss_color_rows AS (
         SELECT s.style_code,
            NULLIF(NULLIF(COALESCE(v.hex_color_code, c.hex, (c.raw ->> 'HexaColourCode'::text)), 'false'::text), ''::text) AS hex,
            NULLIF(COALESCE(v.color_name, c.name), ''::text) AS cname,
            v.color_code,
            ( SELECT min(v2.sku) AS min
                   FROM ss_variants v2
                  WHERE ((v2.style_code = s.style_code) AND (v2.color_code = v.color_code))) AS code,
            ( SELECT COALESCE(i.public_url, i.source_url) AS "coalesce"
                   FROM ss_images i
                  WHERE ((i.style_code = s.style_code) AND (i.color_code = v.color_code) AND (COALESCE(i.public_url, i.source_url) IS NOT NULL) AND (COALESCE(i.public_url, i.source_url) <> '[object Object]'::text))
                  ORDER BY i.is_main DESC NULLS LAST, (i.photo_shoot_code = 'Front'::text) DESC, i.sort_order
                 LIMIT 1) AS url
           FROM ((ss_styles s
             LEFT JOIN ss_variants v ON (((v.style_code = s.style_code) AND (COALESCE(v.hidden_by_admin, false) = false) AND (COALESCE(v.published, true) = true))))
             LEFT JOIN ss_colors c ON ((c.code = v.color_code)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false) AND (COALESCE(s.archived, false) = false))
          GROUP BY s.style_code, v.hex_color_code, c.hex, c.raw, v.color_name, c.name, v.color_code
        ), ss_colors_agg AS (
         SELECT ss_color_rows.style_code,
            jsonb_agg(jsonb_build_object('h', ss_color_rows.hex, 'n', ss_color_rows.cname, 'u', ss_color_rows.url, 'c', ss_color_rows.code) ORDER BY (ss_color_rows.url IS NULL), ss_color_rows.cname) FILTER (WHERE ((ss_color_rows.hex IS NOT NULL) OR (ss_color_rows.cname IS NOT NULL))) AS colors
           FROM ss_color_rows
          GROUP BY ss_color_rows.style_code
        ), ss AS (
         SELECT 'ss'::text AS source,
            s.style_code AS id,
            s.name,
            COALESCE(s.short_description, s.long_description) AS description,
            'Stanley/Stella'::text AS brand,
            s.type AS category,
            s.category AS group_name,
            s.gender,
            ( SELECT COALESCE(i.public_url, i.source_url) AS "coalesce"
                   FROM ss_images i
                  WHERE ((i.style_code = s.style_code) AND (COALESCE(i.public_url, i.source_url) IS NOT NULL) AND (COALESCE(i.public_url, i.source_url) <> '[object Object]'::text))
                  ORDER BY i.is_main DESC NULLS LAST, (i.photo_shoot_code = 'Front'::text) DESC, i.sort_order, i.created_at DESC NULLS LAST
                 LIMIT 1) AS image_url,
            ( SELECT COALESCE(i.public_url, i.source_url) AS "coalesce"
                   FROM ss_images i
                  WHERE ((i.style_code = s.style_code) AND (i.is_over = true) AND (COALESCE(i.public_url, i.source_url) IS NOT NULL) AND (COALESCE(i.public_url, i.source_url) <> '[object Object]'::text))
                  ORDER BY i.sort_order, i.created_at DESC NULLS LAST
                 LIMIT 1) AS hover_image_url,
            COALESCE(s.sequence_style, 999999) AS sort_order,
            COALESCE(ca.colors, '[]'::jsonb) AS colors
           FROM (ss_styles s
             LEFT JOIN ss_colors_agg ca ON ((ca.style_code = s.style_code)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false) AND (COALESCE(s.archived, false) = false))
        ), nwg_color_rows AS (
         SELECT DISTINCT ON (s.product_number, COALESCE(v.color_code, v.item_number)) s.product_number,
                CASE
                    WHEN ((v.web_color IS NOT NULL) AND (array_length(v.web_color, 1) > 0)) THEN
                    CASE
                        WHEN (v.web_color[1] ~~ '#%'::text) THEN v.web_color[1]
                        ELSE ('#'::text || v.web_color[1])
                    END
                    WHEN (v.shade_color ~~ '#%'::text) THEN v.shade_color
                    ELSE NULL::text
                END AS hex,
            NULLIF(COALESCE(v.filter_color, v.color_name, v.shade_color), ''::text) AS cname,
            v.item_number AS code,
            v.main_picture_url AS url
           FROM (nwg_styles s
             LEFT JOIN nwg_variants v ON ((v.product_number = s.product_number)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.archived, false) = false))
        ), nwg_colors_agg AS (
         SELECT nwg_color_rows.product_number,
            jsonb_agg(jsonb_build_object('h', nwg_color_rows.hex, 'n', nwg_color_rows.cname, 'u', nwg_color_rows.url, 'c', nwg_color_rows.code) ORDER BY (nwg_color_rows.url IS NULL), nwg_color_rows.cname) FILTER (WHERE ((nwg_color_rows.hex IS NOT NULL) OR (nwg_color_rows.cname IS NOT NULL))) AS colors
           FROM nwg_color_rows
          GROUP BY nwg_color_rows.product_number
        ), nwg AS (
         SELECT 'nwg'::text AS source,
            s.product_number AS id,
            s.name,
            COALESCE(s.catalog_text, s.commerce_text, s.usp) AS description,
            s.brand,
            s.category,
            s.category AS group_name,
            s.gender,
            COALESCE(NULLIF(s.main_picture_url, ''::text), ( SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) AS "coalesce"
                   FROM nwg_images i
                  WHERE ((i.product_number = s.product_number) AND (COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL))
                  ORDER BY (i.picture_angle = 'front'::text) DESC, i.sort_order, i.id
                 LIMIT 1)) AS image_url,
            ( SELECT COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) AS "coalesce"
                   FROM nwg_images i
                  WHERE ((i.product_number = s.product_number) AND (COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) IS NOT NULL) AND (COALESCE(i.standard_url, i.large_thumbnail_url, i.image_url, i.high_res_url) <> COALESCE(NULLIF(s.main_picture_url, ''::text), ''::text)))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS hover_image_url,
            200000 AS sort_order,
            COALESCE(ca.colors, '[]'::jsonb) AS colors
           FROM (nwg_styles s
             LEFT JOIN nwg_colors_agg ca ON ((ca.product_number = s.product_number)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.archived, false) = false))
        ), pf_color_rows AS (
         SELECT DISTINCT ON (s.model_code, COALESCE(v.color_code, v.item_code)) s.model_code,
                CASE
                    WHEN (NULLIF(v.hex_color, ''::text) IS NULL) THEN NULL::text
                    WHEN (v.hex_color ~~ '#%'::text) THEN v.hex_color
                    ELSE ('#'::text || v.hex_color)
                END AS hex,
            NULLIF(COALESCE(v.base_color, v.color_desc), ''::text) AS cname,
            v.item_code AS code,
            ( SELECT COALESCE(i.url_500, i.url_1600) AS "coalesce"
                   FROM pf_images i
                  WHERE ((i.model_code = s.model_code) AND ((i.item_code = v.item_code) OR (i.item_code IS NULL)) AND (COALESCE(i.url_500, i.url_1600) IS NOT NULL))
                  ORDER BY (i.item_code = v.item_code) DESC, i.sort_order, i.id
                 LIMIT 1) AS url
           FROM (pf_styles s
             LEFT JOIN pf_variants v ON ((v.model_code = s.model_code)))
        ), pf_colors_agg AS (
         SELECT pf_color_rows.model_code,
            jsonb_agg(jsonb_build_object('h', pf_color_rows.hex, 'n', pf_color_rows.cname, 'u', pf_color_rows.url, 'c', pf_color_rows.code) ORDER BY (pf_color_rows.url IS NULL), pf_color_rows.cname) FILTER (WHERE ((pf_color_rows.hex IS NOT NULL) OR (pf_color_rows.cname IS NOT NULL))) AS colors
           FROM pf_color_rows
          GROUP BY pf_color_rows.model_code
        ), pf AS (
         SELECT 'pf'::text AS source,
            s.model_code AS id,
            s.description AS name,
            COALESCE(s.ext_desc, s.product_comments, s.keywords) AS description,
            s.brand,
            s.category,
            s.category_group AS group_name,
            s.gender,
            COALESCE(( SELECT COALESCE(i.url_500, i.url_1600) AS "coalesce"
                   FROM pf_images i
                  WHERE ((i.model_code = s.model_code) AND (COALESCE(i.url_500, i.url_1600) IS NOT NULL))
                  ORDER BY (i.kind = 'main'::text) DESC, i.sort_order, i.id
                 LIMIT 1),
                CASE
                    WHEN ((s.main_image IS NOT NULL) AND (s.main_image <> ''::text)) THEN ('https://images.pfconcept.com/ProductImages_All/JPG/500x500/'::text || s.main_image)
                    ELSE NULL::text
                END) AS image_url,
            ( SELECT COALESCE(i.url_500, i.url_1600) AS "coalesce"
                   FROM pf_images i
                  WHERE ((i.model_code = s.model_code) AND (COALESCE(i.url_500, i.url_1600) IS NOT NULL) AND (i.kind <> 'main'::text))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS hover_image_url,
            300000 AS sort_order,
            COALESCE(ca.colors, '[]'::jsonb) AS colors
           FROM (pf_styles s
             LEFT JOIN pf_colors_agg ca ON ((ca.model_code = s.model_code)))
        ), bb_color_rows AS (
         SELECT s.style_code,
            NULLIF(v.color_hex, ''::text) AS hex,
            NULLIF(v.color_name, ''::text) AS cname,
            ( SELECT min(v2.sku) AS min
                   FROM bb_variants v2
                  WHERE ((v2.style_code = s.style_code) AND (COALESCE(lower(v2.color_name), ''::text) = COALESCE(lower(v.color_name), ''::text)))) AS code,
            ( SELECT i.url
                   FROM bb_images i
                  WHERE ((i.style_code = s.style_code) AND (COALESCE(lower(i.color_name), ''::text) = COALESCE(lower(v.color_name), ''::text)))
                  ORDER BY i.is_primary DESC NULLS LAST, i.sort_order
                 LIMIT 1) AS url
           FROM (bb_styles s
             LEFT JOIN bb_variants v ON (((v.style_code = s.style_code) AND (COALESCE(v.active, true) = true))))
          WHERE (COALESCE(s.active, true) = true)
          GROUP BY s.style_code, v.color_hex, v.color_name
        ), bb_colors_agg AS (
         SELECT bb_color_rows.style_code,
            jsonb_agg(jsonb_build_object('h', bb_color_rows.hex, 'n', bb_color_rows.cname, 'u', bb_color_rows.url, 'c', bb_color_rows.code) ORDER BY (bb_color_rows.url IS NULL), bb_color_rows.cname) FILTER (WHERE ((bb_color_rows.hex IS NOT NULL) OR (bb_color_rows.cname IS NOT NULL))) AS colors
           FROM bb_color_rows
          GROUP BY bb_color_rows.style_code
        ), bb AS (
         SELECT 'bb'::text AS source,
            s.style_code AS id,
            s.name,
            s.description,
            s.brand,
            s.category,
            s.sub_category AS group_name,
            s.gender,
            ( SELECT i.url
                   FROM bb_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.is_primary DESC NULLS LAST, i.sort_order
                 LIMIT 1) AS image_url,
            ( SELECT i.url
                   FROM bb_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.is_primary, i.sort_order
                 OFFSET 1
                 LIMIT 1) AS hover_image_url,
            400000 AS sort_order,
            COALESCE(ca.colors, '[]'::jsonb) AS colors
           FROM (bb_styles s
             LEFT JOIN bb_colors_agg ca ON ((ca.style_code = s.style_code)))
          WHERE (COALESCE(s.active, true) = true)
        ), mf_color_rows AS (
         SELECT DISTINCT ON (s.style_code, v.color_code) s.style_code,
            NULL::text AS hex,
            NULLIF(v.color_name, ''::text) AS cname,
            v.color_code,
            ( SELECT min(v2.sku) AS min
                   FROM mf_variants v2
                  WHERE ((v2.style_code = s.style_code) AND (v2.color_code = v.color_code))) AS code,
            ( SELECT i.url
                   FROM mf_images i
                  WHERE ((i.style_code = s.style_code) AND (i.color_code = v.color_code))
                  ORDER BY (i.view_code = 'c'::text) DESC, i.sort_order, i.id
                 LIMIT 1) AS url
           FROM (mf_styles s
             LEFT JOIN mf_variants v ON ((v.style_code = s.style_code)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false))
        ), mf_colors_agg AS (
         SELECT mf_color_rows.style_code,
            jsonb_agg(jsonb_build_object('h', mf_color_rows.hex, 'n', mf_color_rows.cname, 'u', mf_color_rows.url, 'c', mf_color_rows.code) ORDER BY (mf_color_rows.url IS NULL), mf_color_rows.cname) FILTER (WHERE ((mf_color_rows.hex IS NOT NULL) OR (mf_color_rows.cname IS NOT NULL))) AS colors
           FROM mf_color_rows
          GROUP BY mf_color_rows.style_code
        ), mf AS (
         SELECT 'mf'::text AS source,
            s.style_code AS id,
            s.name,
            COALESCE(s.description, s.subtitle) AS description,
            s.trademark AS brand,
            s.category_name AS category,
            s.category_name AS group_name,
            s.gender,
            ( SELECT i.url
                   FROM mf_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY (i.view_code = 'c'::text) DESC, i.sort_order, i.id
                 LIMIT 1) AS image_url,
            ( SELECT i.url
                   FROM mf_images i
                  WHERE ((i.style_code = s.style_code) AND (i.view_code <> 'c'::text))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS hover_image_url,
            500000 AS sort_order,
            COALESCE(ca.colors, '[]'::jsonb) AS colors
           FROM (mf_styles s
             LEFT JOIN mf_colors_agg ca ON ((ca.style_code = s.style_code)))
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false))
        )
 SELECT ss.source,
    ss.id,
    ss.name,
    ss.description,
    ss.brand,
    ss.category,
    ss.group_name,
    ss.gender,
    ss.image_url,
    ss.hover_image_url,
    ss.sort_order,
    ss.colors
   FROM ss
UNION ALL
 SELECT nwg.source,
    nwg.id,
    nwg.name,
    nwg.description,
    nwg.brand,
    nwg.category,
    nwg.group_name,
    nwg.gender,
    nwg.image_url,
    nwg.hover_image_url,
    nwg.sort_order,
    nwg.colors
   FROM nwg
UNION ALL
 SELECT pf.source,
    pf.id,
    pf.name,
    pf.description,
    pf.brand,
    pf.category,
    pf.group_name,
    pf.gender,
    pf.image_url,
    pf.hover_image_url,
    pf.sort_order,
    pf.colors
   FROM pf
UNION ALL
 SELECT bb.source,
    bb.id,
    bb.name,
    bb.description,
    bb.brand,
    bb.category,
    bb.group_name,
    bb.gender,
    bb.image_url,
    bb.hover_image_url,
    bb.sort_order,
    bb.colors
   FROM bb
UNION ALL
 SELECT mf.source,
    mf.id,
    mf.name,
    mf.description,
    mf.brand,
    mf.category,
    mf.group_name,
    mf.gender,
    mf.image_url,
    mf.hover_image_url,
    mf.sort_order,
    mf.colors
   FROM mf;
CREATE INDEX catalog_items_mv_category ON private.catalog_items_mv USING btree (category);
CREATE INDEX catalog_items_mv_source_id ON private.catalog_items_mv USING btree (source, id);
CREATE UNIQUE INDEX catalog_items_mv_pk ON private.catalog_items_mv USING btree (source, id);
CREATE INDEX catalog_items_mv_sort ON private.catalog_items_mv USING btree (sort_order, name);
CREATE VIEW public.catalog_items WITH (security_invoker = true) AS
( WITH base AS (
         SELECT m.source,
            m.id,
            m.name,
            m.description,
            m.brand,
            m.category,
            m.group_name,
            m.gender,
            m.image_url,
            m.hover_image_url,
            m.sort_order,
            m.colors
           FROM private.catalog_items_mv m
          WHERE ((m.source <> 'nwg'::text) OR (m.id IN ( SELECT r.style_code
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'nwg'::text) AND (r.min_price > (0)::numeric)))))
        UNION ALL
         SELECT 'ru'::text AS source,
            s.style_code,
            s.name,
            s.description,
            COALESCE(NULLIF(s.brand, ''::text), 'Russell'::text) AS brand,
            s.category,
            s.category,
            s.gender,
            COALESCE(NULLIF(s.main_image_url, ''::text), ( SELECT i.url
                   FROM ru_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.sort_order, i.id
                 LIMIT 1)) AS "coalesce",
            ( SELECT i.url
                   FROM ru_images i
                  WHERE (i.style_code = s.style_code)
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            600000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', NULLIF(v.color_hex, ''::text), 'n', NULLIF(v.color_name, ''::text), 'u', NULL::text, 'c', NULL::text) ORDER BY v.color_name) AS jsonb_agg
                   FROM ru_variants v
                  WHERE (v.style_code = s.style_code)), '[]'::jsonb) AS "coalesce"
           FROM ru_styles s
          WHERE ((COALESCE(s.published, true) = true) AND (COALESCE(s.hidden_by_admin, false) = false))
        UNION ALL
         SELECT 'utt'::text AS source,
            s.style_code,
            s.name,
            s.description,
            s.brand,
            s.category,
            s.category,
            s.gender,
            ( SELECT i.url
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS url,
            ( SELECT i.url
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            700000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name) AS jsonb_agg
                   FROM ( SELECT DISTINCT ON (v.color_name) v.color_name,
                            NULLIF(v.color_hex, ''::text) AS color_hex
                           FROM utt_variants v
                          WHERE ((v.style_code = s.style_code) AND v.active AND (NULLIF(v.color_name, ''::text) IS NOT NULL))
                          ORDER BY v.color_name) c), '[]'::jsonb) AS "coalesce"
           FROM utt_styles s
          WHERE (s.published AND (NOT s.hidden_by_admin) AND (EXISTS ( SELECT 1
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'utt'::text) AND (r.style_code = s.style_code) AND (r.min_price > (0)::numeric)))) AND (EXISTS ( SELECT 1
                   FROM utt_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL)))))
        UNION ALL
         SELECT 'fr'::text AS source,
            s.style_code,
            s.name,
            s.description,
            s.brand,
            s.category,
            s.category,
            s.gender,
            ( SELECT i.url
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 LIMIT 1) AS url,
            ( SELECT i.url
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL))
                  ORDER BY i.sort_order, i.id
                 OFFSET 1
                 LIMIT 1) AS url,
            750000,
            COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', c.color_hex, 'n', c.color_name, 'u', NULL::text, 'c', c.color_name) ORDER BY c.color_name) AS jsonb_agg
                   FROM ( SELECT DISTINCT ON (v.color_name) v.color_name,
                            NULLIF(v.color_hex, ''::text) AS color_hex
                           FROM falkross_variants v
                          WHERE ((v.style_code = s.style_code) AND v.active AND (NULLIF(v.color_name, ''::text) IS NOT NULL))
                          ORDER BY v.color_name) c), '[]'::jsonb) AS "coalesce"
           FROM falkross_styles s
          WHERE (s.published AND (NOT s.hidden_by_admin) AND (EXISTS ( SELECT 1
                   FROM catalog_price_ranges r
                  WHERE ((r.source = 'fr'::text) AND (r.style_code = s.style_code) AND (r.min_price > (0)::numeric)))) AND (EXISTS ( SELECT 1
                   FROM falkross_images i
                  WHERE ((i.style_code = s.style_code) AND (i.url IS NOT NULL)))))
        )
 SELECT base.source,
    base.id,
    base.name,
    base.description,
    base.brand,
    base.category,
    base.group_name,
    base.gender,
    base.image_url,
    base.hover_image_url,
    base.sort_order,
    base.colors,
    COALESCE(ARRAY( SELECT (elem.value ->> 'h'::text)
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE ((elem.value ->> 'h'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_hexes,
    COALESCE(ARRAY( SELECT (elem.value ->> 'n'::text)
           FROM jsonb_array_elements(COALESCE(base.colors, '[]'::jsonb)) elem(value)
          WHERE ((elem.value ->> 'n'::text) IS NOT NULL)), ARRAY[]::text[]) AS color_names
   FROM base
  ORDER BY base.sort_order, base.name)
UNION ALL
 SELECT 'etx'::text AS source,
    (p.id)::text AS id,
    p.name_lv AS name,
    p.description_lv AS description,
    p.brand,
    c.name_lv AS category,
    c.name_lv AS group_name,
    NULL::text AS gender,
    ( SELECT i.url
           FROM product_images i
          WHERE (i.product_id = p.id)
          ORDER BY i.sort_order, i.id
         LIMIT 1) AS image_url,
    ( SELECT i.url
           FROM product_images i
          WHERE (i.product_id = p.id)
          ORDER BY i.sort_order, i.id
         OFFSET 1
         LIMIT 1) AS hover_image_url,
    800000 AS sort_order,
    COALESCE(( SELECT jsonb_agg(jsonb_build_object('h', pc.hex_code, 'n', pc.name, 'u', NULLIF(pc.image_url, ''::text), 'c', (pc.id)::text) ORDER BY pc.created_at, pc.id) AS jsonb_agg
           FROM product_colors pc
          WHERE (pc.product_id = p.id)), '[]'::jsonb) AS colors,
    COALESCE(( SELECT array_agg(pc.hex_code) AS array_agg
           FROM product_colors pc
          WHERE ((pc.product_id = p.id) AND (pc.hex_code IS NOT NULL))), ARRAY[]::text[]) AS color_hexes,
    COALESCE(( SELECT array_agg(pc.name) AS array_agg
           FROM product_colors pc
          WHERE (pc.product_id = p.id)), ARRAY[]::text[]) AS color_names
   FROM (products p
     JOIN categories c ON ((c.id = p.category_id)))
  WHERE ((p.brand = 'ETX Latvia'::text) AND (p.active = true) AND (p.hidden_manual = false));
DO $acl$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM pf005_acl LOOP
    EXECUTE format('GRANT %s ON %s TO %s', r.privilege_type, r.obj,
      CASE WHEN r.grantee = 0 THEN 'PUBLIC' ELSE quote_ident(pg_get_userbyid(r.grantee)) END);
  END LOOP;
END $acl$;

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
  -- UTT sends clearance prices for leftovers. Reference = higher of the size median and the style median;
  -- prices >25% below it use the reference, and anything still under 1 EUR purchase (all-clearance styles) gets no price.
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
  ), sty AS (
    SELECT style_code, percentile_cont(0.5) WITHIN GROUP (ORDER BY purchase_price) AS med
      FROM base GROUP BY style_code
  ), priced AS (
    SELECT b.*, CASE WHEN b.purchase_price < GREATEST(r.med, s.med) * 0.75 THEN GREATEST(r.med, s.med) ELSE b.purchase_price END AS regular
      FROM base b
      JOIN reg r ON r.style_code = b.style_code AND r.size IS NOT DISTINCT FROM b.size
      JOIN sty s ON s.style_code = b.style_code
  )
  SELECT 'utt', sku, style_code, color_name, size,
         ROUND((regular * public.utt_markup(brand))::numeric, 2), COALESCE(currency, 'EUR')
    FROM priced WHERE regular >= 1.0
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

  INSERT INTO public.catalog_variant_prices(source,sku,style_code,color_code,size,retail_price,currency)
    SELECT 'etx',p.id::text,p.id::text,NULL,'-',COALESCE(p.price_override,p.retail_price)/1.21,'EUR' FROM public.products p
    WHERE p.brand='ETX Latvia' AND p.active AND NOT p.hidden_manual AND COALESCE(p.price_override,p.retail_price)>0;
    DELETE FROM public.catalog_price_ranges WHERE source IS NOT NULL;
  INSERT INTO public.catalog_price_ranges (source, style_code, min_price, max_price, currency)
  SELECT source, style_code, MIN(retail_price), MAX(retail_price), COALESCE(MAX(currency), 'EUR')
    FROM public.catalog_variant_prices GROUP BY source, style_code;
END;
$function$;
UPDATE public.pf_variants v SET color_key = b.color_key, color_label = b.color_label, feed_seen_at = b.feed_seen_at, feed_active = b.feed_active
  FROM public.pf005_backup_variants b WHERE v.item_code = b.item_code;
UPDATE public.pf_styles s SET feed_seen_at = b.feed_seen_at, feed_active = b.feed_active
  FROM public.pf005_backup_styles b WHERE s.model_code = b.model_code;
DELETE FROM public.catalog_variant_prices WHERE source = 'pf';
INSERT INTO public.catalog_variant_prices SELECT * FROM public.pf005_backup_cvp;
UPDATE public.catalog_price_ranges r SET min_price = b.min_price, max_price = b.max_price, updated_at = b.updated_at
  FROM public.pf005_backup_ranges b WHERE r.source = b.source AND r.style_code = b.style_code;
SELECT public.refresh_catalog_items_mv();
