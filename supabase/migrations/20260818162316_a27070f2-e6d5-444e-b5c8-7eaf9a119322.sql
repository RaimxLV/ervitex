CREATE TABLE public.pm_offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  title text NOT NULL DEFAULT '',
  client_name text NOT NULL DEFAULT '',
  client_company text,
  client_email text,
  client_phone text,
  note text,
  status text NOT NULL DEFAULT 'draft',
  vat_rate numeric NOT NULL DEFAULT 21,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pm_offers TO authenticated;
GRANT ALL ON public.pm_offers TO service_role;

ALTER TABLE public.pm_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage offers" ON public.pm_offers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pm_offers_updated_at BEFORE UPDATE ON public.pm_offers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX pm_offers_created_at_idx ON public.pm_offers (created_at DESC);

CREATE OR REPLACE FUNCTION public.get_pm_offer(_token text)
RETURNS TABLE (
  id uuid, title text, client_name text, client_company text,
  note text, status text, vat_rate numeric, items jsonb,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.title, o.client_name, o.client_company,
         o.note, o.status, o.vat_rate, o.items, o.created_at, o.updated_at
  FROM public.pm_offers o
  WHERE o.token = _token AND o.status <> 'draft'
$$;

REVOKE ALL ON FUNCTION public.get_pm_offer(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pm_offer(text) TO anon, authenticated;