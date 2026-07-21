
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS items JSONB,
  ADD COLUMN IF NOT EXISTS print_method TEXT,
  ADD COLUMN IF NOT EXISTS print_placement TEXT,
  ADD COLUMN IF NOT EXISTS print_colors TEXT,
  ADD COLUMN IF NOT EXISTS deadline TEXT,
  ADD COLUMN IF NOT EXISTS file_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS assigned_pm_email TEXT,
  ADD COLUMN IF NOT EXISTS assigned_pm_name TEXT;

-- Ensure public can create a quote (RLS insert policy). Keep existing SELECT policies untouched.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='quote_requests' AND policyname='Anyone can create quote request'
  ) THEN
    CREATE POLICY "Anyone can create quote request"
      ON public.quote_requests FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

GRANT INSERT ON public.quote_requests TO anon, authenticated;

-- Storage bucket policies: allow public uploads to quote-attachments (public bucket) and public read
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can upload quote attachments'
  ) THEN
    CREATE POLICY "Public can upload quote attachments"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'quote-attachments');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can read quote attachments'
  ) THEN
    CREATE POLICY "Public can read quote attachments"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'quote-attachments');
  END IF;
END $$;
