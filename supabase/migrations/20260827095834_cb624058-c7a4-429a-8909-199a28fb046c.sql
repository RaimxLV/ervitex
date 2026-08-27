CREATE OR REPLACE FUNCTION public.price_audit_summary()
 RETURNS TABLE(source text, variants bigint, checked bigint, mismatches bigint, missing_base bigint, max_diff numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  select e.source,
         count(*)::bigint,
         count(*) filter (where e.expected is not null)::bigint,
         count(*) filter (where e.expected is not null and abs(e.expected - e.actual) > 0.02)::bigint,
         count(*) filter (where e.expected is null)::bigint,
         coalesce(max(abs(e.expected - e.actual)), 0)
  from private.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
  group by e.source
  order by e.source
$function$;

CREATE OR REPLACE FUNCTION public.price_audit_mismatches(_source text DEFAULT NULL::text, _limit integer DEFAULT 200)
 RETURNS TABLE(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric, diff numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  select e.source, e.sku, e.style_code, e.base_price, e.expected, e.actual,
         round(e.actual - e.expected, 2)
  from private.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
    and (_source is null or e.source = _source)
    and (e.expected is null or abs(e.expected - e.actual) > 0.02)
  order by e.source, abs(coalesce(e.actual - e.expected, 0)) desc
  limit greatest(1, least(coalesce(_limit, 200), 1000))
$function$;

CREATE OR REPLACE FUNCTION public.price_audit_lookup(_q text, _limit integer DEFAULT 100)
 RETURNS TABLE(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric, diff numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  select e.source, e.sku, e.style_code, e.base_price, e.expected, e.actual,
         round(coalesce(e.actual - e.expected, 0), 2)
  from private.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
    and (e.sku ilike '%' || _q || '%' or e.style_code ilike '%' || _q || '%')
  order by e.source, e.sku
  limit greatest(1, least(coalesce(_limit, 100), 500))
$function$;