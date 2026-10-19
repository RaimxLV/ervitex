CREATE TABLE public.quote_assignment_rotation (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  next_position integer NOT NULL DEFAULT 0 CHECK (next_position BETWEEN 0 AND 3)
);
GRANT ALL ON public.quote_assignment_rotation TO service_role;
REVOKE ALL ON public.quote_assignment_rotation FROM anon, authenticated;
ALTER TABLE public.quote_assignment_rotation ENABLE ROW LEVEL SECURITY;
INSERT INTO public.quote_assignment_rotation (id, next_position)
SELECT 1, (count(DISTINCT lower(btrim(email))) % 4)::integer
FROM public.quote_requests
WHERE assigned_pm_slug IN ('laura', 'ilona', 'justine', 'santa');

CREATE INDEX IF NOT EXISTS quote_requests_client_assignment_idx
ON public.quote_requests (lower(btrim(email)), assigned_at DESC, created_at DESC)
WHERE assigned_pm_slug IS NOT NULL;

CREATE OR REPLACE FUNCTION public.assign_quote_request_manager()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  previous_slug text;
  position integer;
  rotation text[] := ARRAY['laura', 'ilona', 'justine', 'santa'];
BEGIN
  IF NEW.assigned_pm_slug IS NOT NULL THEN RETURN NEW; END IF;
  -- Serialize lookup and rotation, including simultaneous submissions by one client.
  SELECT next_position INTO position FROM public.quote_assignment_rotation WHERE id = 1 FOR UPDATE;
  SELECT q.assigned_pm_slug INTO previous_slug
  FROM public.quote_requests q
  WHERE lower(btrim(q.email)) = lower(btrim(NEW.email))
    AND q.assigned_pm_slug IN ('laura', 'ilona', 'justine', 'santa', 'evita', 'raimonds')
  ORDER BY COALESCE(q.assigned_at, q.created_at) DESC, q.created_at DESC, q.id DESC
  LIMIT 1;
  IF previous_slug IS NULL THEN
    NEW.assigned_pm_slug := rotation[position + 1];
    UPDATE public.quote_assignment_rotation SET next_position = (position + 1) % 4 WHERE id = 1;
  ELSE
    NEW.assigned_pm_slug := previous_slug;
  END IF;
  NEW.assigned_pm_name := CASE NEW.assigned_pm_slug
    WHEN 'laura' THEN 'Laura' WHEN 'ilona' THEN 'Ilona'
    WHEN 'justine' THEN 'Justīne' WHEN 'santa' THEN 'Santa'
    WHEN 'evita' THEN 'Evita' WHEN 'raimonds' THEN 'Raimonds' END;
  NEW.assigned_pm_email := CASE NEW.assigned_pm_slug
    WHEN 'laura' THEN 'birojs@ervitex.lv' WHEN 'ilona' THEN 'ilona@ervitex.lv'
    WHEN 'justine' THEN 'justine@ervitex.lv' WHEN 'santa' THEN 'santa.k@ervitex.lv'
    WHEN 'evita' THEN 'info@t-bode.lv' WHEN 'raimonds' THEN 'ofsetadruka@gmail.com' END;
  NEW.assigned_at := now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_quote_request_manager() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_quote_request_manager() TO service_role;
CREATE TRIGGER quote_requests_auto_assign BEFORE INSERT ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.assign_quote_request_manager();