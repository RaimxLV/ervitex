CREATE TABLE public.team_photo_settings (
  slug text PRIMARY KEY,
  zoom numeric NOT NULL DEFAULT 1 CHECK (zoom >= 1 AND zoom <= 2),
  position_x numeric NOT NULL DEFAULT 50 CHECK (position_x >= 0 AND position_x <= 100),
  position_y numeric NOT NULL DEFAULT 50 CHECK (position_y >= 0 AND position_y <= 100),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.team_photo_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.team_photo_settings TO authenticated;
GRANT ALL ON public.team_photo_settings TO service_role;

ALTER TABLE public.team_photo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team photo settings"
ON public.team_photo_settings FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can add team photo settings"
ON public.team_photo_settings FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team photo settings"
ON public.team_photo_settings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team photo settings"
ON public.team_photo_settings FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.team_photo_settings (slug, zoom, position_x, position_y) VALUES
  ('vilnis', 1, 50, 50),
  ('eriks', 1, 50, 50),
  ('laura', 1, 50, 50),
  ('ilona', 1, 50, 50),
  ('santa', 1, 50, 50),
  ('justine', 1, 50, 50),
  ('evita', 1, 50, 50);