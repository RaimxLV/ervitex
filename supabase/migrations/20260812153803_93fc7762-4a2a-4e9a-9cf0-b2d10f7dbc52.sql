SELECT cron.alter_job(
  job_id := 56,
  command := $$SELECT public.invoke_sync_function('nwg-price-sync', '?limit=100000&batch=400&onlyMissing=0');$$,
  active := true
);

SELECT cron.alter_job(
  job_id := 61,
  active := false
);