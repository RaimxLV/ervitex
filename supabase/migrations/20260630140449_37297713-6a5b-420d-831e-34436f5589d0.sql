
-- Hide everything that is not in the 4 allowed catalog brands
UPDATE public.products
SET active = false, hidden_manual = true
WHERE brand IS DISTINCT FROM 'Stanley/Stella'
  AND (brand IS NULL OR brand NOT IN ('BagBase','Beechfield','Quadra','Westford Mill'));

-- Hide products from the 4 allowed brands that have no images at all
UPDATE public.products
SET active = false, hidden_manual = true
WHERE brand IN ('BagBase','Beechfield','Quadra','Westford Mill')
  AND id NOT IN (SELECT product_id FROM public.product_images);
