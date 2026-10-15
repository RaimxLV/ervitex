create table if not exists public.catalog_remnants (source text not null, style_code text not null, primary key (source, style_code));
alter table public.catalog_remnants enable row level security;
create policy "Public read remnants" on public.catalog_remnants for select using (true);
grant select on public.catalog_remnants to anon, authenticated;

create or replace function public.refresh_catalog_remnants()
returns void language plpgsql security definer set search_path = public set statement_timeout = '120s' as $$
begin
  create temp table _r on commit drop as select * from public.catalog_remnant_styles();
  delete from public.catalog_remnants c where not exists (select 1 from _r where _r.source=c.source and _r.style_code=c.style_code);
  insert into public.catalog_remnants select source, style_code from _r on conflict do nothing;
end $$;
revoke all on function public.refresh_catalog_remnants() from public, anon, authenticated;
revoke execute on function public.catalog_remnant_styles() from anon, authenticated;

select public.refresh_catalog_remnants();

select cron.schedule('refresh-catalog-remnants', '15 * * * *', 'select public.refresh_catalog_remnants()');