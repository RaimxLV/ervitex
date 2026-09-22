-- Measured: the trimmed payload saved only 5%, the catalog download is already
-- gzipped to ~78 KB per 1000 rows, so this helper is not needed.
DROP FUNCTION IF EXISTS public.catalog_items_lite(text, integer, integer);