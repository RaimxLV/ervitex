CREATE OR REPLACE FUNCTION public.validate_nwg_identifier_chain()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'nwg_variants' THEN
    IF NEW.item_number IS NULL OR NEW.product_number IS NULL
       OR left(NEW.item_number, length(NEW.product_number) + 1) <> NEW.product_number || '-' THEN
      RAISE EXCEPTION 'NWG variant % does not belong to product %', NEW.item_number, NEW.product_number;
    END IF;
  ELSIF TG_TABLE_NAME = 'nwg_skus' THEN
    IF NEW.sku IS NULL OR NEW.product_number IS NULL
       OR left(NEW.sku, length(NEW.product_number) + 1) <> NEW.product_number || '-' THEN
      RAISE EXCEPTION 'NWG SKU % does not belong to product %', NEW.sku, NEW.product_number;
    END IF;
    IF NEW.item_number IS NOT NULL THEN
      IF left(NEW.sku, length(NEW.item_number) + 1) <> NEW.item_number || '-'
         OR left(NEW.item_number, length(NEW.product_number) + 1) <> NEW.product_number || '-' THEN
        RAISE EXCEPTION 'NWG SKU % does not belong to variant % / product %', NEW.sku, NEW.item_number, NEW.product_number;
      END IF;
    END IF;
  ELSIF TG_TABLE_NAME = 'nwg_images' AND NEW.item_number IS NOT NULL THEN
    IF NEW.product_number IS NULL
       OR left(NEW.item_number, length(NEW.product_number) + 1) <> NEW.product_number || '-' THEN
      RAISE EXCEPTION 'NWG image variant % does not belong to product %', NEW.item_number, NEW.product_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;