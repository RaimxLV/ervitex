-- Loosen the WITH CHECK: the validate_quote_request BEFORE trigger already
-- forces status='new' and validates content. Requiring status='new' in the
-- policy is redundant and can misfire if a client sends a stray status field.
DROP POLICY IF EXISTS "Anyone can submit a valid quote" ON public.quote_requests;

CREATE POLICY "Anyone can submit a quote"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(btrim(name)) BETWEEN 2 AND 100
  AND email IS NOT NULL
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- Make sure grants are in place for public insert path.
GRANT INSERT ON public.quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quote_requests TO authenticated;
GRANT ALL ON public.quote_requests TO service_role;