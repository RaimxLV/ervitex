CREATE TABLE public.tech_galleries (
  tech_id text PRIMARY KEY,
  images text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tech_galleries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tech_galleries TO authenticated;
GRANT ALL ON public.tech_galleries TO service_role;
ALTER TABLE public.tech_galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view galleries" ON public.tech_galleries FOR SELECT USING (true);
CREATE POLICY "Super admin manages galleries" ON public.tech_galleries FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND lower(auth.jwt()->>'email') = 'ofsetadruka@gmail.com')
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND lower(auth.jwt()->>'email') = 'ofsetadruka@gmail.com');
CREATE TRIGGER tech_galleries_updated BEFORE UPDATE ON public.tech_galleries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Super admin uploads gallery files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin') AND lower(auth.jwt()->>'email') = 'ofsetadruka@gmail.com');
CREATE POLICY "Super admin deletes gallery files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin') AND lower(auth.jwt()->>'email') = 'ofsetadruka@gmail.com');
