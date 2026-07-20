UPDATE public.pf_public_retail_prices p
SET retail_price = ROUND((pp.price * 1.65)::numeric, 2),
    updated_at = now()
FROM public.pf_prices pp
WHERE p.item_code = pp.item_code
  AND pp.price IS NOT NULL
  AND pp.price > 0;