-- Rollback 007 only AFTER translate-text is redeployed to a version that does not use these objects.
DROP FUNCTION IF EXISTS public.translation_record_stats(integer, integer, integer, integer, integer, integer);
DROP FUNCTION IF EXISTS public.translation_take_budget(text, integer, integer);
DROP FUNCTION IF EXISTS public.translation_release(text[]);
DROP FUNCTION IF EXISTS public.translation_complete(jsonb, text);
DROP FUNCTION IF EXISTS public.translation_claim(text[], text);
DROP TABLE IF EXISTS public.translation_stats;
DROP TABLE IF EXISTS public.translation_rate;
DROP TABLE IF EXISTS public.translation_cache;
