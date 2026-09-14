ALTER TABLE public.nwg_auth
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS access_token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS refresh_in_progress boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS refresh_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS price_sync_in_progress boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price_sync_started_at timestamptz;

REVOKE ALL ON public.nwg_auth FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.nwg_auth TO service_role;

COMMENT ON COLUMN public.nwg_auth.refresh_in_progress IS 'Cross-invocation lease preventing concurrent use of a rotating NWG refresh token';
COMMENT ON COLUMN public.nwg_auth.price_sync_in_progress IS 'Cross-invocation lease preventing overlapping NWG price synchronization runs';