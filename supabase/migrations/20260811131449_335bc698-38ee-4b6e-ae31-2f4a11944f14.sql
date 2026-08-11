ALTER VIEW public.catalog_items SET (security_invoker = true);

CREATE POLICY "Service manages NWG auth"
ON public.nwg_auth
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);