DO $migration$
DECLARE existing_definition text;
BEGIN
  existing_definition := rtrim(pg_get_viewdef('public.catalog_items'::regclass, true), E';\n ');
  IF existing_definition NOT LIKE '%''etx''::text%' THEN
    EXECUTE 'CREATE OR REPLACE VIEW public.catalog_items WITH (security_invoker = true) AS (' || existing_definition || ') UNION ALL
    SELECT ''etx''::text AS source, p.id::text AS id, p.name_lv AS name,
      p.description_lv AS description, p.brand, c.name_lv AS category,
      c.name_lv AS group_name, NULL::text AS gender,
      (SELECT i.url FROM public.product_images i WHERE i.product_id=p.id ORDER BY i.sort_order, i.id LIMIT 1) AS image_url,
      (SELECT i.url FROM public.product_images i WHERE i.product_id=p.id ORDER BY i.sort_order, i.id OFFSET 1 LIMIT 1) AS hover_image_url,
      800000::integer AS sort_order,
      COALESCE((SELECT jsonb_agg(jsonb_build_object(''h'', pc.hex_code, ''n'', pc.name, ''u'', NULLIF(pc.image_url,''''), ''c'', pc.id::text) ORDER BY pc.created_at,pc.id) FROM public.product_colors pc WHERE pc.product_id=p.id), ''[]''::jsonb) AS colors,
      COALESCE((SELECT array_agg(pc.hex_code) FROM public.product_colors pc WHERE pc.product_id=p.id AND pc.hex_code IS NOT NULL), ARRAY[]::text[]) AS color_hexes,
      COALESCE((SELECT array_agg(pc.name) FROM public.product_colors pc WHERE pc.product_id=p.id), ARRAY[]::text[]) AS color_names
    FROM public.products p JOIN public.categories c ON c.id=p.category_id
    WHERE p.brand=''ETX Latvia'' AND p.active=true AND p.hidden_manual=false';
  END IF;
END
$migration$;
GRANT SELECT ON public.catalog_items TO anon, authenticated;
GRANT ALL ON public.catalog_items TO service_role;