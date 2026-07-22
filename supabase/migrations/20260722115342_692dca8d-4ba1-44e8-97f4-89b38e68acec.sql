
-- 1. Lock down SECURITY DEFINER pgmq/email helpers: only service_role should call
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;

-- 2. Pin search_path on functions that lacked it
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;

-- 3. email_send_state: revoke any Data API access from anon/authenticated
REVOKE ALL ON public.email_send_state FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.email_send_state TO service_role;

-- 4. Storage: drop broken "owner IS NOT NULL" public SELECT policies.
-- Buckets product-images and ss-images are public buckets served via CDN,
-- so no RLS SELECT is needed for anonymous reads.
DROP POLICY IF EXISTS "Public can read exact product image paths" ON storage.objects;
DROP POLICY IF EXISTS "Public can read exact ss image paths" ON storage.objects;

-- 5. quote-attachments: bind uploads to a real quote_requests row.
-- Files must be uploaded at path "<quote_request_id>/<filename>".
DROP POLICY IF EXISTS "Quote attachments upload internal" ON storage.objects;

CREATE POLICY "Quote attachments upload bound to request"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'quote-attachments'
  AND COALESCE((metadata->>'size')::bigint, 0) <= 20971520
  AND octet_length(name) < 260
  AND position('/' in name) > 0
  AND (split_part(name, '/', 1))::uuid IN (
    SELECT id FROM public.quote_requests
  )
);
