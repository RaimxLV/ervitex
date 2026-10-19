BEGIN;
CREATE TEMP TABLE billing_validation_test (billing jsonb);
CREATE TRIGGER validate_billing BEFORE INSERT ON billing_validation_test FOR EACH ROW EXECUTE FUNCTION public.validate_quote_billing();
INSERT INTO billing_validation_test VALUES ('{"bank":"Swedbank","iban":"LV80BANK0000435195001","bic":"HABALV22"}');
DO $$ BEGIN
 IF (SELECT billing->>'iban' FROM billing_validation_test LIMIT 1) <> 'LV80BANK0000435195001' THEN RAISE EXCEPTION 'IBAN lost'; END IF;
 BEGIN
  INSERT INTO billing_validation_test VALUES ('{"iban":"bad"}');
  RAISE EXCEPTION 'Malformed IBAN accepted';
 EXCEPTION WHEN OTHERS THEN
  IF SQLERRM <> 'Nederīgs IBAN' THEN RAISE; END IF;
 END;
END $$;
ROLLBACK;