
-- Public summary view for NWG catalog
CREATE OR REPLACE VIEW public.nwg_style_summary AS
SELECT
  s.product_number,
  s.name,
  s.brand,
  s.category,
  s.gender,
  s.fit,
  s.fabrics,
  s.commerce_text,
  s.catalog_text,
  s.usp,
  s.weight,
  s.country_of_origin,
  s.retail_price,
  s.currency,
  COALESCE(s.main_picture_url, (
    SELECT v.main_picture_url FROM public.nwg_variants v
    WHERE v.product_number = s.product_number AND v.main_picture_url IS NOT NULL
    ORDER BY v.item_number LIMIT 1
  )) AS main_picture_url,
  (
    SELECT v.main_picture_url FROM public.nwg_variants v
    WHERE v.product_number = s.product_number AND v.main_picture_url IS NOT NULL
    ORDER BY v.item_number OFFSET 1 LIMIT 1
  ) AS hover_picture_url,
  (SELECT COUNT(*) FROM public.nwg_variants v WHERE v.product_number = s.product_number) AS color_count,
  (SELECT COUNT(DISTINCT sk.size) FROM public.nwg_skus sk WHERE sk.product_number = s.product_number AND sk.active) AS size_count,
  (SELECT COALESCE(SUM(GREATEST(sk.availability, 0)), 0) FROM public.nwg_skus sk WHERE sk.product_number = s.product_number AND sk.active) AS total_stock
FROM public.nwg_styles s
WHERE s.published = true AND s.archived = false;

GRANT SELECT ON public.nwg_style_summary TO anon, authenticated;
