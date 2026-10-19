-- 005 PF variant identity — NOT APPLIED. Order: 003 -> 004 -> 005 (see README.md).
-- Rebased on 003: definitions are read from the database at run time and changed only by the exact
-- PF fragments below; every other part (003 MF/UTT/SS outlet + exact-price logic) is carried over as is.
-- Aborts (whole transaction) if the live baseline is not the expected post-003/004 state.

DO $guard$
BEGIN
  IF md5((SELECT prosrc FROM pg_proc WHERE oid = 'public.refresh_catalog_prices()'::regprocedure)) <> '3fd1011aa68fb54f641895acc0cb9c8e' THEN
    RAISE EXCEPTION '005: refresh_catalog_prices is not the 003 version (apply 003 first, or re-generate 005)';
  END IF;
  IF md5((SELECT definition FROM pg_matviews WHERE schemaname = 'private' AND matviewname = 'catalog_items_mv')) <> '7dc17b02cb3b08461f1bf6800f1d57d0' THEN
    RAISE EXCEPTION '005: private.catalog_items_mv differs from the reviewed baseline';
  END IF;
  IF pg_get_viewdef('public.catalog_items'::regclass) NOT LIKE '%ms.is_outlet%' THEN
    RAISE EXCEPTION '005: public.catalog_items lacks the 003 outlet filter (apply 003 first)';
  END IF;
  IF to_regclass('private.utt_touched_20261019') IS NULL THEN
    RAISE EXCEPTION '005: 004 has not been applied';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'pf_variants' AND column_name = 'color_key') THEN
    RAISE EXCEPTION '005: already applied (pf_variants.color_key exists)';
  END IF;
END $guard$;

ALTER TABLE public.pf_variants
  ADD COLUMN color_key text,
  ADD COLUMN color_label text,
  ADD COLUMN feed_seen_at timestamptz,
  ADD COLUMN feed_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.pf_styles
  ADD COLUMN feed_seen_at timestamptz,
  ADD COLUMN feed_active boolean NOT NULL DEFAULT true;
COMMENT ON COLUMN public.pf_variants.color_key IS 'All feed colors.color codes joined with + (two-tone identity); color_code keeps the first colour for compatibility';
COMMENT ON COLUMN public.pf_variants.feed_active IS 'false = SKU absent from a verified-complete feed generation; row kept for history, never deleted';

-- Pre-005 definitions, kept for the rollback (service_role only).
CREATE TABLE private.pf005_saved_defs (name text PRIMARY KEY, def text NOT NULL, extra text, saved_at timestamptz NOT NULL DEFAULT now());
REVOKE ALL ON private.pf005_saved_defs FROM PUBLIC, anon, authenticated;
GRANT ALL ON private.pf005_saved_defs TO service_role;

DO $apply$
DECLARE
  mv_pairs text[][] := ARRAY[
    ARRAY[$o$DISTINCT ON (s.model_code, COALESCE(v.color_code, v.item_code))$o$, $n$DISTINCT ON (s.model_code, COALESCE(v.color_key, v.color_code, v.item_code))$n$],
    ARRAY[$o$NULLIF(COALESCE(v.base_color, v.color_desc), ''::text) AS cname$o$, $n$NULLIF(COALESCE(v.color_label, v.base_color, v.color_desc), ''::text) AS cname,
            COALESCE(v.color_key, v.color_code) AS ckey$n$],
    ARRAY[$o$LEFT JOIN pf_variants v ON ((v.model_code = s.model_code)))
        ), pf_colors_agg AS ($o$, $n$LEFT JOIN pf_variants v ON (((v.model_code = s.model_code) AND COALESCE(v.feed_active, true))))
          ORDER BY s.model_code, COALESCE(v.color_key, v.color_code, v.item_code), (EXISTS ( SELECT 1 FROM pf_images i2 WHERE ((i2.model_code = s.model_code) AND (i2.item_code = v.item_code)))) DESC, v.item_code
        ), pf_colors_agg AS ($n$],
    ARRAY[$o$jsonb_build_object('h', pf_color_rows.hex, 'n', pf_color_rows.cname, 'u', pf_color_rows.url, 'c', pf_color_rows.code)$o$, $n$jsonb_build_object('h', pf_color_rows.hex, 'n', pf_color_rows.cname, 'u', pf_color_rows.url, 'c', pf_color_rows.code, 'k', pf_color_rows.ckey)$n$],
    ARRAY[$o$             LEFT JOIN pf_colors_agg ca ON ((ca.model_code = s.model_code)))
        ), bb_color_rows AS ($o$, $n$             LEFT JOIN pf_colors_agg ca ON ((ca.model_code = s.model_code)))
          WHERE COALESCE(s.feed_active, true)
        ), bb_color_rows AS ($n$]];
  fn_pairs text[][] := ARRAY[
    ARRAY[$o$COALESCE(v.color_code, v.color_desc, p.item_code), v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p LEFT JOIN public.pf_variants v ON v.item_code = p.item_code WHERE p.retail_price > 0 ON CONFLICT DO NOTHING;$o$, $n$COALESCE(v.color_key, v.color_code, v.color_desc, p.item_code), v.size, ROUND(p.retail_price::numeric, 2), COALESCE(p.currency, 'EUR')
    FROM public.pf_public_retail_prices p LEFT JOIN public.pf_variants v ON v.item_code = p.item_code WHERE p.retail_price > 0 AND COALESCE(v.feed_active, true) ON CONFLICT DO NOTHING;$n$]];
  mv_def text; view_def text; view_opts text[]; fn_def text; i int; r record;
  acl_mv aclitem[]; acl_view aclitem[]; idx text[];
BEGIN
  SELECT definition INTO mv_def FROM pg_matviews WHERE schemaname = 'private' AND matviewname = 'catalog_items_mv';
  view_def := pg_get_viewdef('public.catalog_items'::regclass);
  SELECT reloptions, relacl INTO view_opts, acl_view FROM pg_class WHERE oid = 'public.catalog_items'::regclass;
  SELECT relacl INTO acl_mv FROM pg_class WHERE oid = 'private.catalog_items_mv'::regclass;
  SELECT array_agg(indexdef ORDER BY indexname) INTO idx FROM pg_indexes WHERE schemaname = 'private' AND tablename = 'catalog_items_mv';
  fn_def := pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure);
  INSERT INTO private.pf005_saved_defs (name, def, extra) VALUES
    ('mv', mv_def, array_to_string(idx, E';\n')),
    ('view', view_def, array_to_string(view_opts, ',')),
    ('fn', fn_def, NULL);

  FOR i IN 1 .. array_length(mv_pairs, 1) LOOP
    IF (length(mv_def) - length(replace(mv_def, mv_pairs[i][1], ''))) / length(mv_pairs[i][1]) <> 1 THEN
      RAISE EXCEPTION '005: MV fragment % not found exactly once', i;
    END IF;
    mv_def := replace(mv_def, mv_pairs[i][1], mv_pairs[i][2]);
  END LOOP;
  FOR i IN 1 .. array_length(fn_pairs, 1) LOOP
    IF (length(fn_def) - length(replace(fn_def, fn_pairs[i][1], ''))) / length(fn_pairs[i][1]) <> 1 THEN
      RAISE EXCEPTION '005: function fragment % not found exactly once', i;
    END IF;
    fn_def := replace(fn_def, fn_pairs[i][1], fn_pairs[i][2]);
  END LOOP;

  DROP VIEW public.catalog_items;
  DROP MATERIALIZED VIEW private.catalog_items_mv;
  EXECUTE 'CREATE MATERIALIZED VIEW private.catalog_items_mv AS ' || rtrim(mv_def, '; ' || E'\n');
  FOR i IN 1 .. coalesce(array_length(idx, 1), 0) LOOP EXECUTE idx[i]; END LOOP;
  EXECUTE format('CREATE VIEW public.catalog_items WITH (%s) AS %s', array_to_string(view_opts, ','), rtrim(view_def, '; ' || E'\n'));
  FOR r IN SELECT 'private.catalog_items_mv' obj, (aclexplode(acl_mv)).* UNION ALL SELECT 'public.catalog_items', (aclexplode(acl_view)).* LOOP
    IF r.grantee <> (SELECT relowner FROM pg_class WHERE oid = r.obj::regclass) THEN
      EXECUTE format('GRANT %s ON %s TO %s', r.privilege_type, r.obj,
        CASE WHEN r.grantee = 0 THEN 'PUBLIC' ELSE quote_ident(pg_get_userbyid(r.grantee)) END);
    END IF;
  END LOOP;
  IF pg_get_viewdef('public.catalog_items'::regclass) <> view_def THEN
    RAISE EXCEPTION '005: recreated public.catalog_items differs from the pre-005 (003) definition';
  END IF;
  EXECUTE fn_def;
END $apply$;
