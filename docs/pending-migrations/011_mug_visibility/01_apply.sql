-- Fix brand stored by admin form ("Ervitex" -> internal "ETX Latvia") for the four mugs only.
-- Unhide ONLY after explicit owner confirmation; then refresh catalogue.
BEGIN;
UPDATE public.products SET brand = 'ETX Latvia'
 WHERE id IN ('7e1a0c00-0000-4000-8000-000000000001','7e1a0c00-0000-4000-8000-000000000002',
              '7e1a0c00-0000-4000-8000-000000000003','7e1a0c00-0000-4000-8000-000000000004')
   AND brand = 'Ervitex';
-- Optional, requires approval to publish the mugs:
-- UPDATE public.products SET hidden_manual = false WHERE id IN (...same four...);
-- SELECT public.refresh_catalog_items_mv();
COMMIT;
