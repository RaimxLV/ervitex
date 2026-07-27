
CREATE TABLE public.mega_menu_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL CHECK (section IN ('apparel','bags','promo','promo_link')),
  label_lv text NOT NULL,
  label_en text NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  auto_added boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX mega_menu_items_section_sort_idx ON public.mega_menu_items (section, sort_order);

GRANT SELECT ON public.mega_menu_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.mega_menu_items TO authenticated;
GRANT ALL ON public.mega_menu_items TO service_role;

ALTER TABLE public.mega_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mega_menu_items public read"
  ON public.mega_menu_items FOR SELECT
  USING (true);

CREATE POLICY "mega_menu_items admin insert"
  ON public.mega_menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "mega_menu_items admin update"
  ON public.mega_menu_items FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "mega_menu_items admin delete"
  ON public.mega_menu_items FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mega_menu_items_updated_at
  BEFORE UPDATE ON public.mega_menu_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
