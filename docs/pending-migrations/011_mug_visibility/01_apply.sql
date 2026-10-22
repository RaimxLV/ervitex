-- APPLIED 2026-10-22 by root via DB tool (not via migration_stage). Record only; do not re-run.
-- Scope: exactly four mug IDs; guarded active = true AND brand IN ('Ervitex','ETX Latvia').
-- Effect: brand -> 'ETX Latvia' (admin form had saved public label 'Ervitex'), hidden_manual -> false.
-- Prices unchanged: 1.90 / 2.40 / 4.20 / 3.00. catalog_items ETX branch is a live view; no refresh run.
UPDATE public.products SET brand = 'ETX Latvia', hidden_manual = false
 WHERE id IN ('7e1a0c00-0000-4000-8000-000000000001','7e1a0c00-0000-4000-8000-000000000002',
              '7e1a0c00-0000-4000-8000-000000000003','7e1a0c00-0000-4000-8000-000000000004')
   AND active = true AND brand IN ('Ervitex','ETX Latvia');
