
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS print_method text,
  ADD COLUMN IF NOT EXISTS print_placement text,
  ADD COLUMN IF NOT EXISTS print_colors text,
  ADD COLUMN IF NOT EXISTS deadline text,
  ADD COLUMN IF NOT EXISTS file_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS assigned_pm_email text,
  ADD COLUMN IF NOT EXISTS assigned_pm_name text;

CREATE OR REPLACE FUNCTION public.validate_quote_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.name IS NULL OR length(trim(NEW.name)) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name length';
  END IF;
  IF NEW.email IS NULL OR length(NEW.email) > 255
     OR NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;
  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 50 THEN
    RAISE EXCEPTION 'Phone too long';
  END IF;
  IF NEW.company IS NOT NULL AND length(NEW.company) > 200 THEN
    RAISE EXCEPTION 'Company too long';
  END IF;
  IF NEW.message IS NOT NULL AND length(NEW.message) > 10000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;
  IF NEW.assigned_pm_email IS NOT NULL AND length(NEW.assigned_pm_email) > 255 THEN
    RAISE EXCEPTION 'PM email too long';
  END IF;
  IF jsonb_typeof(NEW.items) <> 'array' THEN
    RAISE EXCEPTION 'Items must be an array';
  END IF;
  IF jsonb_array_length(NEW.items) > 200 THEN
    RAISE EXCEPTION 'Too many items';
  END IF;
  IF array_length(NEW.file_urls, 1) > 20 THEN
    RAISE EXCEPTION 'Too many files';
  END IF;
  NEW.status := 'new';
  RETURN NEW;
END;
$function$;

DROP POLICY IF EXISTS "Anyone can submit a valid quote" ON public.quote_requests;
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
  AND (message IS NULL OR length(message) <= 10000)
  AND status = 'new'
);

DROP POLICY IF EXISTS "Public read quote attachments" ON storage.objects;
CREATE POLICY "Public read quote attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'quote-attachments');

DROP POLICY IF EXISTS "Anyone can upload quote attachments" ON storage.objects;
CREATE POLICY "Anyone can upload quote attachments"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'quote-attachments');
