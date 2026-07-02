CREATE UNIQUE INDEX IF NOT EXISTS nwg_images_unique_key
  ON public.nwg_images (product_number, item_number, resource_file_id, picture_angle)
  NULLS NOT DISTINCT;