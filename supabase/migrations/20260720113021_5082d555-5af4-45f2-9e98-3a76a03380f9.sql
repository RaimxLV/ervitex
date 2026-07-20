-- Recompute PF Concept public retail prices with correct formula: supplier * 1.0165
UPDATE public.pf_public_retail_prices p
SET retail_price = ROUND((pr.price * 1.0165)::numeric, 2),
    updated_at = now()
FROM public.pf_prices pr
WHERE p.item_code = pr.item_code
  AND pr.price IS NOT NULL
  AND pr.price > 0;