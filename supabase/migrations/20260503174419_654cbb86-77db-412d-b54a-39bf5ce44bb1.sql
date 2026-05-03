
DROP POLICY IF EXISTS "Anyone can submit a quote" ON public.quote_requests;

CREATE POLICY "Anyone can submit a valid quote"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  name IS NOT NULL
  AND length(btrim(name)) BETWEEN 2 AND 100
  AND email IS NOT NULL
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (phone IS NULL OR length(phone) <= 50)
  AND (company IS NULL OR length(company) <= 200)
  AND (message IS NULL OR length(message) <= 5000)
  AND status = 'new'
);
