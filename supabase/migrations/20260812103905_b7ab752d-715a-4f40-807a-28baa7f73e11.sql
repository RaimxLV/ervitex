SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname IN ('nightly-catalog-mv','nightly-ss-summary-mv');
SELECT cron.schedule('nightly-catalog-mv',    '45 5 * * *', $c$ SELECT public.refresh_catalog_items_mv(); $c$);
SELECT cron.schedule('nightly-ss-summary-mv', '55 5 * * *', $c$ SELECT public.refresh_ss_style_summary(); $c$);