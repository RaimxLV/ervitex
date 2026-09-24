GRANT SELECT ON public.team_photo_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_photo_settings TO authenticated;
GRANT ALL ON public.team_photo_settings TO service_role;