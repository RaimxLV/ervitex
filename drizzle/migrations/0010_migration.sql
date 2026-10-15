create or replace function public.catalog_remnant_styles()
returns table(source text, style_code text)
language sql stable security definer set search_path = public as $$
  with v as (
    select 'nwg'::text src, s.product_number code, st.category cat, st.name nm,
           count(distinct s.item_number) c, count(distinct s.size) n, array_agg(distinct s.size) sz
      from nwg_skus s join nwg_styles st using(product_number)
     where coalesce(s.active,true) and not coalesce(st.archived,false) group by 1,2,3,4
    union all select 'utt', v.style_code, st.category, st.name, count(distinct v.color_name), count(distinct v.size), array_agg(distinct v.size)
      from utt_variants v join utt_styles st using(style_code) where v.active and st.published group by 1,2,3,4
    union all select 'fr', v.style_code, st.category, st.name, count(distinct v.color_name), count(distinct v.size), array_agg(distinct v.size)
      from falkross_variants v join falkross_styles st using(style_code) where v.active and st.published group by 1,2,3,4
    union all select 'mf', v.style_code, st.category_name, st.name, count(distinct v.color_code), count(distinct v.size_name), array_agg(distinct v.size_name)
      from mf_variants v join mf_styles st using(style_code) where st.published group by 1,2,3,4
    union all select 'ss', v.style_code, st.category, st.name, count(distinct v.color_code), count(distinct v.size_code), array_agg(distinct v.size_code)
      from ss_variants v join ss_styles st using(style_code)
     where st.published and not coalesce(st.archived,false) and coalesce(v.published,true) group by 1,2,3,4
  )
  select src, code from v
   where c = 1 and n between 1 and 2
     and coalesce(cat,'') || ' ' || coalesce(nm,'') !~* '(hat|cap|beanie|headwear|bag|påse|kasse|sock|glove|scarf|apron|towel|bottle|accessor|additional|footwear|shoe|umbrella|balaclava|warmer|kitchen|galge|box|shield)'
     and not exists (select 1 from unnest(sz) x where x is null or x ~* '^(0|u|uni|one ?size|os|tu)$' or x like '%/%' or x ~* 'mm');
$$;
revoke all on function public.catalog_remnant_styles() from public;
grant execute on function public.catalog_remnant_styles() to anon, authenticated;