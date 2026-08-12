create or replace function public.price_audit_lookup(_q text, _limit int default 100)
returns table(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric, diff numeric)
language sql
stable
security definer
set search_path = public
as $$
  select e.source, e.sku, e.style_code, e.base_price, e.expected, e.actual,
         round(coalesce(e.actual - e.expected, 0), 2)
  from private.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
    and (e.sku ilike '%' || _q || '%' or e.style_code ilike '%' || _q || '%')
  order by e.source, e.sku
  limit greatest(1, least(coalesce(_limit, 100), 500))
$$;

revoke all on function public.price_audit_lookup(text, int) from public, anon;
grant execute on function public.price_audit_lookup(text, int) to authenticated;