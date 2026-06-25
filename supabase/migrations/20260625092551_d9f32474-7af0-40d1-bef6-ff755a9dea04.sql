CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_colors_product_id ON public.product_colors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON public.product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_products_active_created ON public.products(active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
ANALYZE public.products;
ANALYZE public.product_images;
ANALYZE public.product_colors;
ANALYZE public.product_sizes;