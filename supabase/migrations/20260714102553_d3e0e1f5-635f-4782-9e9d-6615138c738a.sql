
-- Materialized view for catalog performance
CREATE MATERIALIZED VIEW IF NOT EXISTS public.catalog_items_mv AS
SELECT * FROM public.catalog_items;

CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_mv_pk
  ON public.catalog_items_mv (source, id);
CREATE INDEX IF NOT EXISTS catalog_items_mv_brand_idx ON public.catalog_items_mv (brand);
CREATE INDEX IF NOT EXISTS catalog_items_mv_category_idx ON public.catalog_items_mv (category);
CREATE INDEX IF NOT EXISTS catalog_items_mv_gender_idx ON public.catalog_items_mv (gender);

GRANT SELECT ON public.catalog_items_mv TO anon, authenticated;
GRANT ALL ON public.catalog_items_mv TO service_role;

CREATE OR REPLACE FUNCTION public.refresh_catalog_items_mv()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.catalog_items_mv;
$$;

REFRESH MATERIALIZED VIEW public.catalog_items_mv;
