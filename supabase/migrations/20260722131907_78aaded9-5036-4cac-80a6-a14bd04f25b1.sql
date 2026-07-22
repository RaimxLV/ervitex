GRANT INSERT ON public.quote_requests TO anon;
GRANT INSERT ON public.quote_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT ALL ON storage.objects TO service_role;

DROP POLICY IF EXISTS "Quote attachments upload bound to request" ON storage.objects;
CREATE POLICY "Quote attachments upload bound to request"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'quote-attachments'
  AND COALESCE((metadata ->> 'size')::bigint, 0) <= 20971520
  AND octet_length(name) < 260
  AND position('/' in name) > 0
  AND split_part(name, '/', 1)::uuid IN (
    SELECT id FROM public.quote_requests
  )
);