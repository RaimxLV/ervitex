SELECT cron.unschedule('nightly-nwg-prices');
SELECT cron.unschedule('nwg-prices-watchdog');
SELECT cron.alter_job(job_id := (SELECT jobid FROM cron.job WHERE jobname = 'nightly-nwg-assortments'), schedule := '10 1 * * 1');
SELECT cron.alter_job(job_id := (SELECT jobid FROM cron.job WHERE jobname = 'nightly-nwg-styles'), schedule := '30 1 * * 1');