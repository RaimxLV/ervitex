DROP POLICY "Admins manage offers" ON public.pm_offers;
CREATE POLICY "Admins manage offers" ON public.pm_offers FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));