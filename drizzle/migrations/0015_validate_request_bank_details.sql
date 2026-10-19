CREATE OR REPLACE FUNCTION public.validate_quote_billing()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $function$
DECLARE k text; v text;
BEGIN
 IF NEW.billing IS NOT NULL THEN
  IF jsonb_typeof(NEW.billing) <> 'object' OR length(NEW.billing::text) > 3000 THEN RAISE EXCEPTION 'Nederīgi rekvizīti'; END IF;
  FOREACH k IN ARRAY ARRAY['bank','iban','bic'] LOOP
   IF NEW.billing ? k THEN
    IF jsonb_typeof(NEW.billing->k) <> 'string' THEN RAISE EXCEPTION 'Nederīgi bankas rekvizīti'; END IF;
    v := btrim(NEW.billing->>k);
    IF length(v) > 300 THEN RAISE EXCEPTION 'Nederīgi bankas rekvizīti'; END IF;
    IF k = 'iban' AND v <> '' AND upper(regexp_replace(v, '\s', '', 'g')) !~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$' THEN RAISE EXCEPTION 'Nederīgs IBAN'; END IF;
    IF k = 'bic' AND v <> '' AND upper(v) !~ '^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$' THEN RAISE EXCEPTION 'Nederīgs SWIFT/BIC'; END IF;
   END IF;
  END LOOP;
 END IF;
 RETURN NEW;
END; $function$;