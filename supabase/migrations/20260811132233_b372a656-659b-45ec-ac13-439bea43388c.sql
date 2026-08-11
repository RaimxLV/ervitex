CREATE OR REPLACE FUNCTION public.validate_nwg_identifier_chain()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'nwg_variants' THEN
    IF NEW.item_number IS NULL OR NEW.product_number IS NULL OR NEW.item_number !~ ('^' || regexp_replace(NEW.product_number, '([\\.^$|()\\[\\]{}*+?\\-])', '\\\1', 'g') || '-.+') THEN
      RAISE EXCEPTION 'NWG variant % does not belong to product %', NEW.item_number, NEW.product_number;
    END IF;
  ELSIF TG_TABLE_NAME = 'nwg_skus' THEN
    IF NEW.sku IS NULL OR NEW.item_number IS NULL OR NEW.product_number IS NULL
       OR NEW.sku !~ ('^' || regexp_replace(NEW.item_number, '([\\.^$|()\\[\\]{}*+?\\-])', '\\\1', 'g') || '-.+')
       OR NEW.item_number !~ ('^' || regexp_replace(NEW.product_number, '([\\.^$|()\\[\\]{}*+?\\-])', '\\\1', 'g') || '-.+') THEN
      RAISE EXCEPTION 'NWG SKU % does not belong to variant % / product %', NEW.sku, NEW.item_number, NEW.product_number;
    END IF;
  ELSIF TG_TABLE_NAME = 'nwg_images' AND NEW.item_number IS NOT NULL THEN
    IF NEW.product_number IS NULL OR NEW.item_number !~ ('^' || regexp_replace(NEW.product_number, '([\\.^$|()\\[\\]{}*+?\\-])', '\\\1', 'g') || '-.+') THEN
      RAISE EXCEPTION 'NWG image variant % does not belong to product %', NEW.item_number, NEW.product_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS nwg_variants_identifier_chain ON public.nwg_variants;
CREATE TRIGGER nwg_variants_identifier_chain
BEFORE INSERT OR UPDATE OF item_number, product_number ON public.nwg_variants
FOR EACH ROW EXECUTE FUNCTION public.validate_nwg_identifier_chain();

DROP TRIGGER IF EXISTS nwg_skus_identifier_chain ON public.nwg_skus;
CREATE TRIGGER nwg_skus_identifier_chain
BEFORE INSERT OR UPDATE OF sku, item_number, product_number ON public.nwg_skus
FOR EACH ROW EXECUTE FUNCTION public.validate_nwg_identifier_chain();

DROP TRIGGER IF EXISTS nwg_images_identifier_chain ON public.nwg_images;
CREATE TRIGGER nwg_images_identifier_chain
BEFORE INSERT OR UPDATE OF item_number, product_number ON public.nwg_images
FOR EACH ROW EXECUTE FUNCTION public.validate_nwg_identifier_chain();