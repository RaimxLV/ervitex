-- 1. Noliktavas atzīmes
CREATE TABLE public.stock_flags (
  source text NOT NULL,
  item_id text NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (source, item_id)
);
GRANT SELECT ON public.stock_flags TO anon, authenticated;
GRANT INSERT, DELETE, UPDATE ON public.stock_flags TO authenticated;
GRANT ALL ON public.stock_flags TO service_role;
ALTER TABLE public.stock_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view stock flags" ON public.stock_flags FOR SELECT USING (true);
CREATE POLICY "Admins insert stock flags" ON public.stock_flags FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update stock flags" ON public.stock_flags FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete stock flags" ON public.stock_flags FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Rekvizīti un atlaide
ALTER TABLE public.quote_requests
  ADD COLUMN billing jsonb,
  ADD COLUMN worksheet_discount jsonb;
ALTER TABLE public.pm_offers
  ADD COLUMN discount jsonb,
  ADD COLUMN client_billing jsonb;

CREATE OR REPLACE FUNCTION public.validate_discount(_d jsonb)
RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE v numeric;
BEGIN
  IF _d IS NULL OR jsonb_typeof(_d) = 'null' THEN RETURN; END IF;
  IF jsonb_typeof(_d) <> 'object' OR COALESCE(_d->>'type','') NOT IN ('percent','amount') THEN
    RAISE EXCEPTION 'Nederīga atlaide';
  END IF;
  BEGIN v := COALESCE(NULLIF(_d->>'value',''),'0')::numeric;
  EXCEPTION WHEN others THEN RAISE EXCEPTION 'Nederīga atlaide'; END;
  IF v < 0 OR (_d->>'type' = 'percent' AND v > 100) OR v > 1000000 THEN RAISE EXCEPTION 'Nederīga atlaide'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.get_quote_worksheet_extras(_token text)
RETURNS TABLE(discount jsonb, billing jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT q.worksheet_discount, q.billing FROM public.quote_requests q
  WHERE _token ~ '^[a-f0-9]{20,64}$' AND q.action_token = _token
$$;

CREATE OR REPLACE FUNCTION public.set_quote_worksheet_discount(_token text, _discount jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE qid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Nav atļauts'; END IF;
  PERFORM public.validate_discount(_discount);
  UPDATE public.quote_requests SET worksheet_discount = _discount
   WHERE action_token = _token RETURNING id INTO qid;
  IF qid IS NULL THEN RETURN false; END IF;
  INSERT INTO public.quote_events (quote_id, event_type, actor_name, details)
  VALUES (qid, 'discount_changed', NULL, jsonb_build_object('discount', _discount));
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.validate_quote_billing()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.billing IS NOT NULL THEN
    IF jsonb_typeof(NEW.billing) <> 'object' OR length(NEW.billing::text) > 3000 THEN
      RAISE EXCEPTION 'Nederīgi rekvizīti';
    END IF;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER quote_requests_validate_billing BEFORE INSERT OR UPDATE OF billing ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_quote_billing();

DROP FUNCTION public.get_pm_offer(text);
CREATE FUNCTION public.get_pm_offer(_token text)
 RETURNS TABLE(id uuid, title text, client_name text, client_company text, note text, status text, vat_rate numeric, items jsonb, pm_name text, pm_email text, created_at timestamptz, updated_at timestamptz, discount jsonb, client_billing jsonb)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT o.id, o.title, o.client_name, o.client_company, o.note, o.status, o.vat_rate, o.items,
         o.pm_name, o.pm_email, o.created_at, o.updated_at, o.discount, o.client_billing
  FROM public.pm_offers o WHERE o.token = _token AND o.status <> 'draft'
$$;
GRANT EXECUTE ON FUNCTION public.get_pm_offer(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_quote_worksheet_extras(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_quote_worksheet_discount(text, jsonb) TO authenticated;