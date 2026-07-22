
-- Grant anon+authenticated SELECT on all supplier catalog tables so public product detail loads work
GRANT SELECT ON public.ss_styles, public.ss_variants, public.ss_images TO anon, authenticated;
GRANT SELECT ON public.nwg_styles, public.nwg_variants, public.nwg_images, public.nwg_skus TO anon, authenticated;
GRANT SELECT ON public.pf_styles, public.pf_variants, public.pf_images TO anon, authenticated;
GRANT SELECT ON public.bb_styles, public.bb_variants, public.bb_images TO anon, authenticated;
GRANT SELECT ON public.mf_styles, public.mf_variants, public.mf_images TO anon, authenticated;

-- Ensure NWG sizes are publicly readable (was authenticated-only)
DROP POLICY IF EXISTS "Auth read nwg_skus" ON public.nwg_skus;
CREATE POLICY "Public read nwg_skus" ON public.nwg_skus FOR SELECT TO anon, authenticated USING (true);
