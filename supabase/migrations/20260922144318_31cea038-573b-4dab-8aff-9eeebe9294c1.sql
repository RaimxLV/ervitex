-- Slimmer catalog payload: keep every colour's hex/name (needed for the colour
-- filter) but only ship swatch image URLs for the first 8 colours with a hex,
-- which is all the grid can ever display. Cuts the catalog download roughly in half.
CREATE OR REPLACE FUNCTION public.catalog_items_lite(
  _source text DEFAULT NULL,
  _from integer DEFAULT 0,
  _limit integer DEFAULT 1000
)
RETURNS TABLE(
  source text,
  id text,
  name text,
  brand text,
  category text,
  group_name text,
  gender text,
  image_url text,
  hover_image_url text,
  colors jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT i.source, i.id, i.name, i.brand, i.category, i.group_name, i.gender,
         i.image_url, i.hover_image_url,
         COALESCE((
           SELECT jsonb_agg(
                    CASE WHEN c.with_url THEN
                      jsonb_build_object('c', c.c, 'h', c.h, 'n', c.n, 'u', c.u)
                    ELSE
                      jsonb_build_object('c', c.c, 'h', c.h, 'n', c.n)
                    END
                    ORDER BY c.ord
                  )
           FROM (
             SELECT e.value->>'c' AS c,
                    e.value->>'h' AS h,
                    e.value->>'n' AS n,
                    e.value->>'u' AS u,
                    e.ord,
                    (e.value->>'h') IS NOT NULL
                      AND row_number() OVER (
                            PARTITION BY (e.value->>'h') IS NOT NULL ORDER BY e.ord
                          ) <= 8 AS with_url
             FROM jsonb_array_elements(COALESCE(i.colors, '[]'::jsonb)) WITH ORDINALITY AS e(value, ord)
           ) c
         ), '[]'::jsonb) AS colors
  FROM public.catalog_items i
  WHERE (_source IS NULL OR i.source = _source)
  ORDER BY i.id
  OFFSET GREATEST(COALESCE(_from, 0), 0)
  LIMIT GREATEST(LEAST(COALESCE(_limit, 1000), 2000), 1);
$$;

GRANT EXECUTE ON FUNCTION public.catalog_items_lite(text, integer, integer) TO anon, authenticated, service_role;