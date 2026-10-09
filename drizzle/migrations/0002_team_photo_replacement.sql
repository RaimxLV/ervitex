ALTER TABLE public.team_photo_settings ADD COLUMN IF NOT EXISTS photo_url text;
GRANT SELECT ON public.team_photo_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.team_photo_settings TO authenticated;
GRANT ALL ON public.team_photo_settings TO service_role;