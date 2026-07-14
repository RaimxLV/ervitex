
DROP INDEX IF EXISTS public.pf_images_unique;
ALTER TABLE public.pf_images ALTER COLUMN item_code SET DEFAULT '';
UPDATE public.pf_images SET item_code = '' WHERE item_code IS NULL;
ALTER TABLE public.pf_images ALTER COLUMN item_code SET NOT NULL;
CREATE UNIQUE INDEX pf_images_unique ON public.pf_images(model_code, item_code, kind, filename);
