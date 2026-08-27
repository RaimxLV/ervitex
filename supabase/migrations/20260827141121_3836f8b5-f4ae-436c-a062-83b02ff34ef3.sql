select cron.unschedule('nightly-pf-sync');
select cron.schedule('nightly-pf-prices', '0 2 * * *', $$select public.invoke_sync_function('pf-concept-sync', '?mode=prices')$$);
select cron.unschedule('nightly-bb-sync');
select cron.schedule('nightly-bb-sync', '20 2 * * 1', $$select public.invoke_sync_function('beechfield-sync', '?limit=25')$$);
update public.sync_logs
   set status = 'error',
       finished_at = now(),
       message = coalesce(message, 'Process netika pabeigts (pārtraukts pusceļā)')
 where status = 'running'
   and started_at < now() - interval '2 hours';