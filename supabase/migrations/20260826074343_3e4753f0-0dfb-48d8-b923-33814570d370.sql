ALTER TABLE public.pm_offers
  ADD COLUMN IF NOT EXISTS pm_name text,
  ADD COLUMN IF NOT EXISTS pm_email text;

DROP FUNCTION IF EXISTS public.get_pm_offer(text);

CREATE FUNCTION public.get_pm_offer(_token text)
 RETURNS TABLE(id uuid, title text, client_name text, client_company text, note text, status text, vat_rate numeric, items jsonb, pm_name text, pm_email text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT o.id, o.title, o.client_name, o.client_company,
         o.note, o.status, o.vat_rate, o.items, o.pm_name, o.pm_email, o.created_at, o.updated_at
  FROM public.pm_offers o
  WHERE o.token = _token AND o.status <> 'draft'
$function$;