
-- Remove redundant permissive INSERT policy on quote_requests (kept validated one)
DROP POLICY IF EXISTS "Anyone can create quote request" ON public.quote_requests;

-- Tighten quote-attachments storage policies
DROP POLICY IF EXISTS "Anyone can upload quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Public can read quote attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read quote attachments" ON storage.objects;

-- Restricted upload: bucket scope, file size <= 15MB, allowed mime types only
CREATE POLICY "Quote attachments restricted upload"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'quote-attachments'
  AND coalesce((metadata->>'size')::bigint, 0) <= 15728640
  AND lower(coalesce(metadata->>'mimetype','')) IN (
    'image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/postscript','application/illustrator',
    'application/zip'
  )
  AND octet_length(name) < 260
);

-- Only admins can read attachments directly; clients access via signed URLs
CREATE POLICY "Admins can read quote attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'quote-attachments'
  AND private.has_role(auth.uid(), 'admin'::app_role)
);
