-- PREPARED ONLY. Apply with the compatible frontend upload and both notifier changes.
-- Doing this before that coordinated release breaks the live direct-storage upload workflow.
DROP POLICY IF EXISTS "Quote attachments upload bound to request" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read quote attachments" ON storage.objects;

CREATE FUNCTION public.guard_quote_artwork_refs() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p text;
BEGIN
  -- Preserve existing historical refs when they are not being changed.
  IF TG_OP='UPDATE' AND NEW.file_urls IS NOT DISTINCT FROM OLD.file_urls THEN RETURN NEW; END IF;
  IF cardinality(NEW.file_urls)>10 THEN RAISE EXCEPTION 'Too many files'; END IF;
  FOREACH p IN ARRAY coalesce(NEW.file_urls,ARRAY[]::text[]) LOOP
    IF NOT EXISTS(SELECT 1 FROM public.quote_artwork a WHERE a.quote_id=NEW.id AND a.path=p AND a.stored) THEN
      RAISE EXCEPTION 'Unverified attachment reference';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_quote_artwork_refs() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER quote_artwork_refs_guard BEFORE INSERT OR UPDATE OF file_urls ON public.quote_requests FOR EACH ROW EXECUTE FUNCTION public.guard_quote_artwork_refs();