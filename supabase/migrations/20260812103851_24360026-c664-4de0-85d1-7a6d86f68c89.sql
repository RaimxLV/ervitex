-- Nightly automatic partner catalog + price refresh.
CREATE OR REPLACE FUNCTION public.invoke_sync_function(fn text, qs text DEFAULT '')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE key text;
BEGIN
  SELECT decrypted_secret INTO key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key';
  IF key IS NULL THEN
    RAISE WARNING 'invoke_sync_function: no service role key in vault';
    RETURN;
  END IF;
  PERFORM net.http_post(
    url := 'https://ifwshbcwsehekbadsooh.supabase.co/functions/v1/' || fn || qs,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Lovable-Context', 'cron',
      'Authorization', 'Bearer ' || key
    ),
    body := '{}'::jsonb
  );
END;
$$;

REVOKE ALL ON FUNCTION public.invoke_sync_function(text, text) FROM PUBLIC, anon, authenticated;

SELECT cron.unschedule(jobname) FROM cron.job
 WHERE jobname IN ('nightly-ss-sync','nightly-nwg-sync','nightly-mf-sync','nightly-pf-sync','nightly-bb-sync','nightly-nwg-prices','nightly-price-refresh');

SELECT cron.schedule('nightly-ss-sync',      '0 1 * * *', $c$ SELECT public.invoke_sync_function('stanley-stella-sync'); $c$);
SELECT cron.schedule('nightly-nwg-sync',     '20 1 * * *', $c$ SELECT public.invoke_sync_function('nwg-sync'); $c$);
SELECT cron.schedule('nightly-mf-sync',      '40 1 * * *', $c$ SELECT public.invoke_sync_function('malfini-sync'); $c$);
SELECT cron.schedule('nightly-pf-sync',      '0 2 * * *', $c$ SELECT public.invoke_sync_function('pf-concept-sync'); $c$);
SELECT cron.schedule('nightly-bb-sync',      '20 2 * * *', $c$ SELECT public.invoke_sync_function('beechfield-sync'); $c$);
SELECT cron.schedule('nightly-nwg-prices',   '0 3 * * *', $c$ SELECT public.invoke_sync_function('nwg-price-sync', '?limit=40000&batch=400&onlyMissing=1'); $c$);
SELECT cron.schedule('nightly-price-refresh','30 5 * * *', $c$ SELECT public.refresh_catalog_prices(); $c$);