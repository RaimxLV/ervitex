ALTER TABLE public.ss_stock DROP CONSTRAINT IF EXISTS ss_stock_sku_fkey;
ALTER TABLE public.ss_stock DROP CONSTRAINT IF EXISTS ss_stock_style_code_fkey;
ALTER TABLE public.ss_prices DROP CONSTRAINT IF EXISTS ss_prices_sku_fkey;
ALTER TABLE public.ss_prices DROP CONSTRAINT IF EXISTS ss_prices_style_code_fkey;
ALTER TABLE public.ss_images DROP CONSTRAINT IF EXISTS ss_images_style_code_fkey;
ALTER TABLE public.ss_combos DROP CONSTRAINT IF EXISTS ss_combos_style_code_fkey;
ALTER TABLE public.ss_combos DROP CONSTRAINT IF EXISTS ss_combos_combo_style_code_fkey;
ALTER TABLE public.ss_variants DROP CONSTRAINT IF EXISTS ss_variants_style_code_fkey;