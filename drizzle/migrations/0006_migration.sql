CREATE TABLE public.catalog_filter_order (
  key text PRIMARY KEY,
  order_values text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.catalog_filter_order ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.catalog_filter_order TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.catalog_filter_order TO authenticated;
GRANT ALL ON public.catalog_filter_order TO service_role;
CREATE POLICY "Anyone can read filter order" ON public.catalog_filter_order FOR SELECT USING (true);
CREATE POLICY "Admins insert filter order" ON public.catalog_filter_order FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins update filter order" ON public.catalog_filter_order FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Admins delete filter order" ON public.catalog_filter_order FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'::app_role));