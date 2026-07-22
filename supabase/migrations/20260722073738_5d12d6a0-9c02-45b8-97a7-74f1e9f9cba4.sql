DROP POLICY IF EXISTS "Quote attachments restricted upload" ON storage.objects;
CREATE POLICY "Quote attachments upload internal"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'quote-attachments'
  AND COALESCE((metadata->>'size')::bigint, 0) <= 20971520
  AND octet_length(name) < 260
);