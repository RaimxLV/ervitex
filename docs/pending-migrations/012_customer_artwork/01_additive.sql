CREATE TABLE public.quote_artwork (
  id uuid PRIMARY KEY,
  quote_id uuid NOT NULL REFERENCES public.quote_requests(id) ON DELETE CASCADE,
  path text NOT NULL UNIQUE,
  original_name text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size BETWEEN 1 AND 15728640),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  mime text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','clean','infected')),
  stored boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quote_artwork TO authenticated;
GRANT ALL ON public.quote_artwork TO service_role;
ALTER TABLE public.quote_artwork ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin artwork status only" ON public.quote_artwork FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE FUNCTION public.reserve_quote_artwork(_request uuid, _key uuid, _file uuid, _path text, _name text, _size bigint, _digest text, _mime text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q public.quote_requests%ROWTYPE; prior public.quote_artwork%ROWTYPE; n integer; total bigint;
BEGIN
  SELECT * INTO q FROM public.quote_requests WHERE id=_request FOR UPDATE;
  IF q.id IS NULL OR q.submission_key IS DISTINCT FROM _key THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _size NOT BETWEEN 1 AND 15728640 OR length(_name)>180 OR _digest !~ '^[a-f0-9]{64}$'
    OR _path !~ ('^'||_request::text||'/'||_file::text||'-artwork\.(png|jpg|jpeg|webp|gif|tif|tiff|pdf|ai|eps|svg|psd|zip)$') THEN RAISE EXCEPTION 'Invalid file'; END IF;
  SELECT * INTO prior FROM public.quote_artwork WHERE id=_file;
  IF FOUND THEN
    IF prior.quote_id IS DISTINCT FROM _request OR prior.sha256 IS DISTINCT FROM _digest OR prior.byte_size IS DISTINCT FROM _size OR prior.path IS DISTINCT FROM _path THEN RAISE EXCEPTION 'Retry identity mismatch'; END IF;
    RETURN CASE WHEN prior.stored THEN 'existing' ELSE 'new' END;
  END IF;
  SELECT count(*),coalesce(sum(byte_size),0) INTO n,total FROM public.quote_artwork WHERE quote_id=_request;
  IF n>=10 OR total+_size>52428800 THEN RAISE EXCEPTION 'File limit exceeded'; END IF;
  INSERT INTO public.quote_artwork(id,quote_id,path,original_name,byte_size,sha256,mime) VALUES(_file,_request,_path,_name,_size,_digest,_mime);
  RETURN 'new';
END $$;
REVOKE ALL ON FUNCTION public.reserve_quote_artwork(uuid,uuid,uuid,text,text,bigint,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_quote_artwork(uuid,uuid,uuid,text,text,bigint,text,text) TO service_role;