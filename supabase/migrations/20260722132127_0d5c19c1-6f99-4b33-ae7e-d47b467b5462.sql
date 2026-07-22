CREATE OR REPLACE FUNCTION private.quote_request_exists(_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quote_requests
    WHERE id = _request_id
  );
$$;

REVOKE ALL ON FUNCTION private.quote_request_exists(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.quote_request_exists(uuid) TO anon, authenticated, service_role;

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
  AND private.quote_request_exists(split_part(name, '/', 1)::uuid)
);