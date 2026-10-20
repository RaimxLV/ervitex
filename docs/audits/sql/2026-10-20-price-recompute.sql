-- READ-ONLY. Recomputes expected public NET unit price per visible variant using the
-- exact formulas of public.refresh_catalog_prices()/refresh_utt_catalog_prices()
-- (current definitions), LEFT JOINed from every visible variant to catalog_variant_prices.
-- Output: one row per visible variant with expected, actual, status. No writes.
with exp as (
  -- SS: purchase x1.75 (ss_sku_retail_prices)
  select 'ss'::text src, v.sku, v.style_code,
         case when p.purchase_price > 0 then round(p.purchase_price*1.75,2) end expected
    from ss_variants v join ss_styles s using(style_code)
    left join ss_prices p on p.sku=v.sku
   where v.published and s.published and not coalesce(s.archived,false) and not s.hidden_by_admin and not v.hidden_by_admin
  union all
  -- MF: mf_prices.retail_price (already marked-up feed field), non-outlet
  select 'mf', v.sku, v.style_code, case when p.retail_price>0 then round(p.retail_price::numeric,2) end
    from mf_variants v join mf_styles s using(style_code) left join mf_prices p on p.sku=v.sku
   where s.published and not s.hidden_by_admin and not s.is_outlet
  union all
  select 'bb', v.sku, v.style_code, case when p.retail_price>0 then round(p.retail_price::numeric,2) end
    from bb_variants v join bb_styles s using(style_code) left join bb_prices p on p.sku=v.sku
   where s.active and v.active
  union all
  -- PF: pf_public_retail_prices (first supplier band x1.65, built by importer)
  select 'pf', v.item_code, v.model_code, case when p.retail_price>0 then round(p.retail_price::numeric,2) end
    from pf_variants v join pf_styles s using(model_code) left join pf_public_retail_prices p on p.item_code=v.item_code
   where v.feed_active and s.feed_active
  union all
  select 'ru', s.style_code, s.style_code, case when p.retail_price>0 then round(p.retail_price*1.65,2) end
    from ru_styles s left join ru_prices p using(style_code)
   where s.published and not s.hidden_by_admin
  union all
  -- UTT: own purchase x brand markup; outlier guard -> no price (by policy)
  select 'utt', b.sku, b.style_code,
         case when b.pp >= 1 and b.pp >= greatest(r.med, st.med)*0.75 then round(b.pp*utt_markup(b.brand),2) end
    from (select v.sku, v.style_code, v.size, s.brand, p.purchase_price pp
            from utt_variants v join utt_styles s using(style_code) left join utt_prices p on p.sku=v.sku
           where v.active and s.published and not s.hidden_by_admin and not v.outlet and utt_markup(s.brand) is not null) b
    left join (select v.style_code, v.size, percentile_cont(0.5) within group (order by p.purchase_price) med
                 from utt_variants v join utt_styles s using(style_code) join utt_prices p on p.sku=v.sku
                where p.purchase_price>0 and v.active and s.published and not s.hidden_by_admin and not v.outlet
                group by 1,2) r on r.style_code=b.style_code and r.size is not distinct from b.size
    left join (select v.style_code, percentile_cont(0.5) within group (order by p.purchase_price) med
                 from utt_variants v join utt_styles s using(style_code) join utt_prices p on p.sku=v.sku
                where p.purchase_price>0 and v.active and s.published and not s.hidden_by_admin and not v.outlet
                group by 1) st on st.style_code=b.style_code
  union all
  select 'fr', v.sku, v.style_code, case when p.purchase_price>0 then round(p.purchase_price*1.55,2) end
    from falkross_variants v join falkross_styles s using(style_code) left join falkross_prices p on p.sku=v.sku
   where v.active and s.published and not s.hidden_by_admin
  union all
  select 'nwg', k.sku, k.product_number,
         nullif(round((coalesce(coalesce(pl.rec_price, nullif(k.retail_price,0)) *
           case s.brand when 'Clique' then 0.37 when 'Craft' then 0.50 when 'ProJob' then 0.60 when 'Cutter & Buck' then 0.60 end,
           nullif(k.purchase_price,0)) *
           case s.brand when 'Clique' then 1.75 else 1.5 end)::numeric,2),0)
    from nwg_skus k join nwg_styles s on s.product_number=k.product_number
    join nwg_variants v on v.product_number=k.product_number and v.item_number=k.item_number
    left join nwg_pricelist pl on pl.product_number=k.product_number and pl.rec_price>0
   where s.brand in ('Craft','Clique','ProJob','Cutter & Buck') and coalesce(s.published,true)
     and not coalesce(s.archived,false) and coalesce(k.active,true) and not coalesce(k.discontinued,false)
)
select e.src, e.sku, e.style_code, e.expected, c.retail_price actual,
       case when e.expected is null and c.sku is null then 'no_price_expected_and_none'
            when e.expected is null then 'priced_without_base'
            when c.sku is null then 'missing_price'
            when c.retail_price <= 0 then 'zero_price'
            when abs(c.retail_price - e.expected) > 0.02 then 'mismatch'
            else 'ok' end status
  from exp e left join catalog_variant_prices c on c.source=e.src and c.sku=e.sku;
