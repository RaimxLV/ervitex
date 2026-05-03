
-- 1. Restrict direct SELECT on products to admins only
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Create a public view exposing only non-sensitive product fields
CREATE OR REPLACE VIEW public.products_public
WITH (security_invoker = off) AS
SELECT
  id,
  category_id,
  name_lv,
  name_en,
  description_lv,
  description_en,
  long_description_lv,
  long_description_en,
  material,
  min_order,
  retail_price,
  printing_techs,
  brand,
  featured,
  is_new,
  active,
  created_at,
  updated_at
FROM public.products
WHERE active = true;

GRANT SELECT ON public.products_public TO anon, authenticated;

-- 3. Validation trigger for quote_requests
CREATE OR REPLACE FUNCTION public.validate_quote_request()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.name IS NULL OR length(trim(NEW.name)) < 2 OR length(NEW.name) > 100 THEN
    RAISE EXCEPTION 'Invalid name length';
  END IF;

  IF NEW.email IS NULL
     OR length(NEW.email) > 255
     OR NEW.email !~* '^[A-Za-z0-9._%%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 50 THEN
    RAISE EXCEPTION 'Phone too long';
  END IF;

  IF NEW.company IS NOT NULL AND length(NEW.company) > 200 THEN
    RAISE EXCEPTION 'Company too long';
  END IF;

  IF NEW.message IS NOT NULL AND length(NEW.message) > 5000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;

  -- Force status to 'new' on insert from public
  NEW.status := 'new';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quote_requests_validate ON public.quote_requests;
CREATE TRIGGER quote_requests_validate
BEFORE INSERT ON public.quote_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_quote_request();
