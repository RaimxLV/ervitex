
CREATE SCHEMA IF NOT EXISTS private;

-- Move MV to private schema
DROP MATERIALIZED VIEW IF EXISTS public.catalog_items_mv;

CREATE MATERIALIZED VIEW IF NOT EXISTS private.catalog_items_mv AS
SELECT * FROM public.catalog_items;

CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_mv_pk
  ON private.catalog_items_mv (source, id);
CREATE INDEX IF NOT EXISTS catalog_items_mv_brand_idx ON private.catalog_items_mv (brand);
CREATE INDEX IF NOT EXISTS catalog_items_mv_category_idx ON private.catalog_items_mv (category);
CREATE INDEX IF NOT EXISTS catalog_items_mv_gender_idx ON private.catalog_items_mv (gender);

-- Replace the public view to read from the cached MV
CREATE OR REPLACE VIEW public.catalog_items
WITH (security_invoker = true) AS
SELECT * FROM private.catalog_items_mv;

GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;
GRANT SELECT ON private.catalog_items_mv TO postgres, service_role;

CREATE OR REPLACE FUNCTION public.refresh_catalog_items_mv()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = private, public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY private.catalog_items_mv;
$$;

REVOKE EXECUTE ON FUNCTION public.refresh_catalog_items_mv() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_catalog_items_mv() TO service_role;

REFRESH MATERIALIZED VIEW private.catalog_items_mv;
