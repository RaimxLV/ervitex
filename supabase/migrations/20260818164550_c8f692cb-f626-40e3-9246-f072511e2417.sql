CREATE TABLE public.catalog_overrides (
  source text NOT NULL,
  item_id text NOT NULL,
  name_lv text,
  name_en text,
  description_lv text,
  description_en text,
  extra_images text[] NOT NULL DEFAULT '{}',
  hidden_images text[] NOT NULL DEFAULT '{}',
  price_override numeric,
  hide_price boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, item_id)
);

GRANT SELECT ON public.catalog_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_overrides TO authenticated;
GRANT ALL ON public.catalog_overrides TO service_role;

ALTER TABLE public.catalog_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalog overrides are publicly readable"
  ON public.catalog_overrides FOR SELECT USING (true);

CREATE POLICY "Admins manage catalog overrides"
  ON public.catalog_overrides FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER catalog_overrides_updated_at
  BEFORE UPDATE ON public.catalog_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();