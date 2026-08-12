create or replace function public.price_audit_expected()
returns table(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric)
language sql
stable
security definer
set search_path = public
as $$
  select cv.source, cv.sku, cv.style_code,
         s.purchase_price as base_price,
         round(s.purchase_price * 1.67, 2) as expected,
         cv.retail_price as actual
  from catalog_variant_prices cv
  left join nwg_skus s on s.sku = cv.sku
  where cv.source = 'nwg'
  union all
  select cv.source, cv.sku, cv.style_code,
         l.price, round(l.price, 2), cv.retail_price
  from catalog_variant_prices cv
  left join lateral (
    select l.price from ss_price_list_2026 l
    where l.style_code = cv.style_code
    order by abs(l.price - cv.retail_price) limit 1
  ) l on true
  where cv.source = 'ss'
  union all
  select cv.source, cv.sku, cv.style_code,
         p.wholesale_price, round(p.wholesale_price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join mf_prices p on p.sku = cv.sku
  where cv.source = 'mf'
  union all
  select cv.source, cv.sku, cv.style_code,
         p.price, round(p.price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join pf_prices p on p.item_code = cv.sku
  where cv.source = 'pf'
  union all
  select cv.source, cv.sku, cv.style_code,
         p.retail_price, round(p.retail_price, 2), cv.retail_price
  from catalog_variant_prices cv
  left join bb_prices p on p.sku = cv.sku
  where cv.source = 'bb'
  union all
  select cv.source, cv.sku, cv.style_code,
         p.wholesale_price, round(p.wholesale_price * 1.65, 2), cv.retail_price
  from catalog_variant_prices cv
  left join ru_prices p on p.style_code = cv.style_code
  where cv.source = 'ru'
$$;

revoke all on function public.price_audit_expected() from public, anon, authenticated;

create or replace function public.price_audit_summary()
returns table(source text, variants bigint, checked bigint, mismatches bigint, missing_base bigint, max_diff numeric)
language sql
stable
security definer
set search_path = public
as $$
  select e.source,
         count(*)::bigint,
         count(*) filter (where e.expected is not null)::bigint,
         count(*) filter (where e.expected is not null and abs(e.expected - e.actual) > 0.02)::bigint,
         count(*) filter (where e.expected is null)::bigint,
         coalesce(max(abs(e.expected - e.actual)), 0)
  from public.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
  group by e.source
  order by e.source
$$;

grant execute on function public.price_audit_summary() to authenticated;

create or replace function public.price_audit_mismatches(_source text default null, _limit int default 200)
returns table(source text, sku text, style_code text, base_price numeric, expected numeric, actual numeric, diff numeric)
language sql
stable
security definer
set search_path = public
as $$
  select e.source, e.sku, e.style_code, e.base_price, e.expected, e.actual,
         round(e.actual - e.expected, 2)
  from public.price_audit_expected() e
  where public.has_role(auth.uid(), 'admin')
    and (_source is null or e.source = _source)
    and (e.expected is null or abs(e.expected - e.actual) > 0.02)
  order by e.source, abs(coalesce(e.actual - e.expected, 0)) desc
  limit greatest(1, least(coalesce(_limit, 200), 1000))
$$;

grant execute on function public.price_audit_mismatches(text, int) to authenticated;