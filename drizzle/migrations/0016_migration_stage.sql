CREATE TABLE public.migration_stage (name text PRIMARY KEY, body text NOT NULL, body_md5 text GENERATED ALWAYS AS (md5(body)) STORED, staged_at timestamptz NOT NULL DEFAULT now());
COMMENT ON TABLE public.migration_stage IS 'Reviewed migration SQL staged by the sandbox for byte-exact execution inside a migration; not app data';
REVOKE ALL ON public.migration_stage FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.migration_stage TO sandbox_exec;
GRANT ALL ON public.migration_stage TO service_role;
ALTER TABLE public.migration_stage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sandbox stage insert" ON public.migration_stage FOR INSERT TO sandbox_exec WITH CHECK (true);
CREATE POLICY "sandbox stage read" ON public.migration_stage FOR SELECT TO sandbox_exec USING (true);