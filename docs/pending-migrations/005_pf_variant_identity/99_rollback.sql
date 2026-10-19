-- 005 rollback. Order: 005 rollback -> 004 rollback -> 003 rollback (003 rollback replaces
-- refresh_catalog_prices/catalog_items with full pre-003 snapshots and must never run while 005 is live).
-- Restores the exact pre-005 (= post-003/004) definitions saved by 01_schema.sql, then data from backups.
DO $rb$
DECLARE mv_def text; view_def text; view_opts text; fn_def text; idx text; acl_mv aclitem[]; acl_view aclitem[]; r record; s text;
BEGIN
  IF to_regclass('private.pf005_saved_defs') IS NULL THEN RAISE EXCEPTION '005 rollback: 005 not applied'; END IF;
  SELECT def, extra INTO mv_def, idx FROM private.pf005_saved_defs WHERE name = 'mv';
  SELECT def, extra INTO view_def, view_opts FROM private.pf005_saved_defs WHERE name = 'view';
  SELECT def INTO fn_def FROM private.pf005_saved_defs WHERE name = 'fn';
  IF pg_get_functiondef('public.refresh_catalog_prices()'::regprocedure) NOT LIKE '%v.color_key%' THEN
    RAISE EXCEPTION '005 rollback: refresh_catalog_prices is not the 005 version (changed after 005?)';
  END IF;
  SELECT relacl INTO acl_view FROM pg_class WHERE oid = 'public.catalog_items'::regclass;
  SELECT relacl INTO acl_mv FROM pg_class WHERE oid = 'private.catalog_items_mv'::regclass;
  DROP VIEW public.catalog_items;
  DROP MATERIALIZED VIEW private.catalog_items_mv;
  EXECUTE 'CREATE MATERIALIZED VIEW private.catalog_items_mv AS ' || rtrim(mv_def, '; ' || E'\n');
  FOREACH s IN ARRAY string_to_array(idx, E';\n') LOOP EXECUTE s; END LOOP;
  EXECUTE format('CREATE VIEW public.catalog_items WITH (%s) AS %s', view_opts, rtrim(view_def, '; ' || E'\n'));
  FOR r IN SELECT 'private.catalog_items_mv' obj, (aclexplode(acl_mv)).* UNION ALL SELECT 'public.catalog_items', (aclexplode(acl_view)).* LOOP
    IF r.grantee <> (SELECT relowner FROM pg_class WHERE oid = r.obj::regclass) THEN
      EXECUTE format('GRANT %s ON %s TO %s', r.privilege_type, r.obj,
        CASE WHEN r.grantee = 0 THEN 'PUBLIC' ELSE quote_ident(pg_get_userbyid(r.grantee)) END);
    END IF;
  END LOOP;
  EXECUTE fn_def;
END $rb$;

UPDATE public.pf_variants v SET color_key = b.color_key, color_label = b.color_label, feed_seen_at = b.feed_seen_at, feed_active = b.feed_active
  FROM private.pf005_backup_variants b WHERE v.item_code = b.item_code;
UPDATE public.pf_styles s SET feed_seen_at = b.feed_seen_at, feed_active = b.feed_active
  FROM private.pf005_backup_styles b WHERE s.model_code = b.model_code;
DELETE FROM public.catalog_variant_prices WHERE source = 'pf';
INSERT INTO public.catalog_variant_prices SELECT * FROM private.pf005_backup_cvp;
UPDATE public.catalog_price_ranges r SET min_price = b.min_price, max_price = b.max_price, updated_at = b.updated_at
  FROM private.pf005_backup_ranges b WHERE r.source = b.source AND r.style_code = b.style_code;
SELECT public.refresh_catalog_items_mv();
-- Added columns and private.pf005_* tables are kept (unused by restored definitions) until a separate reviewed cleanup.
