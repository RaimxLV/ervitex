UPDATE public.ru_styles
SET description = NULLIF(btrim(regexp_replace(
      regexp_replace(description, '^\s*FEATURES\s+CERTIFICATES\s*', '', 'i'),
      '\s*ADD TO CART[\s\S]*$', '', 'i')), ''),
    updated_at = now()
WHERE description IS NOT NULL;

UPDATE public.ru_styles
SET fabric = NULL, updated_at = now()
WHERE fabric IS NOT NULL AND btrim(lower(fabric)) IN ('colour.', 'colour', '.');