CREATE OR REPLACE FUNCTION public.enforce_approved_mug_net_price()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE net_price numeric;
BEGIN
  IF NEW.source = 'etx' AND NEW.style_code IN (
    '7e1a0c00-0000-4000-8000-000000000001',
    '7e1a0c00-0000-4000-8000-000000000002',
    '7e1a0c00-0000-4000-8000-000000000003',
    '7e1a0c00-0000-4000-8000-000000000004'
  ) THEN
    SELECT round(coalesce(p.price_override,p.retail_price)::numeric,2) INTO net_price
    FROM public.products p WHERE p.id::text = NEW.style_code AND p.brand = 'ETX Latvia';
    IF net_price > 0 THEN
      IF TG_TABLE_NAME = 'catalog_variant_prices' THEN
        NEW.retail_price := net_price;
      ELSE
        NEW.min_price := net_price;
        NEW.max_price := net_price;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.enforce_approved_mug_net_price() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_approved_mug_net_price() TO service_role;
CREATE TRIGGER approved_mug_variant_net_price BEFORE INSERT OR UPDATE ON public.catalog_variant_prices FOR EACH ROW EXECUTE FUNCTION public.enforce_approved_mug_net_price();
CREATE TRIGGER approved_mug_range_net_price BEFORE INSERT OR UPDATE ON public.catalog_price_ranges FOR EACH ROW EXECUTE FUNCTION public.enforce_approved_mug_net_price();
COMMENT ON FUNCTION public.enforce_approved_mug_net_price() IS 'Only the four approved sublimation mug IDs use owner-provided products prices as net. Other products, visibility gates and supplier formulas are unchanged.';