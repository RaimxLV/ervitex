REVOKE SELECT ON public.nwg_skus FROM anon, authenticated;
GRANT SELECT (sku, product_number, item_number, size, size_sequence, size_name, ean, availability, retail_price, currency, discontinued, active, created_at) ON public.nwg_skus TO anon, authenticated;

REVOKE SELECT ON public.ru_prices FROM anon;
GRANT SELECT (style_code, retail_price, currency, updated_at) ON public.ru_prices TO anon;

REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (id, category_id, name_lv, name_en, description_lv, description_en, long_description_lv, long_description_en, material, min_order, retail_price, printing_techs, featured, is_new, active, created_at, updated_at, brand, ss_style_code, ss_in_stock, price_override, hidden_manual, hide_when_oos, last_synced_at, nwg_product_number) ON public.products TO anon;

DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'delete_email(text,bigint)','enqueue_email(text,jsonb)','read_email_batch(text,integer,integer)',
    'move_to_dlq(text,text,bigint,jsonb)','email_queue_dispatch()','invoke_sync_function(text,text)',
    'nwg_price_targets(boolean,integer,integer)','nwg_propagate_purchase_prices()',
    'refresh_catalog_items_mv()','refresh_catalog_prices()','refresh_mf_public_retail_prices()',
    'refresh_ss_public_retail_prices()','refresh_ss_style_summary()','ss_fill_missing_variant_prices()',
    'ss_sku_retail_prices()'
  ] LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%s TO service_role', f);
  END LOOP;
END $$;

REVOKE EXECUTE ON FUNCTION public.get_product_wholesale(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.price_audit_lookup(text,integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.price_audit_mismatches(text,integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.price_audit_summary() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.supplier_price_health() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reap_stale_syncs(integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_quote_worksheet_discount(text,jsonb) FROM PUBLIC, anon;