
CREATE POLICY "ss-images public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'ss-images');

CREATE POLICY "ss-images admin write"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'ss-images' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'ss-images' AND public.has_role(auth.uid(), 'admin'::app_role));
