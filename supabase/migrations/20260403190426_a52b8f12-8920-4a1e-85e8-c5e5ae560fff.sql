
-- Fix misclassified color hex codes: set to NULL where name is numeric/code-based and hex was incorrectly set to #000000
-- Then update recognizable color names with correct hex codes

-- Step 1: Null out all #000000 entries that are NOT actually "black"
UPDATE product_colors 
SET hex_code = NULL 
WHERE hex_code = '#000000' 
  AND name NOT ILIKE '%black%'
  AND name NOT ILIKE '%noir%'
  AND name NOT ILIKE '%schwarz%';

-- Step 2: Fix known color names with better hex values
UPDATE product_colors SET hex_code = '#FFFFFF' WHERE hex_code IS NULL AND (name ILIKE '%white%' OR name ILIKE '%balts%');
UPDATE product_colors SET hex_code = '#DC2626' WHERE hex_code IS NULL AND (name ILIKE '%red%' OR name ILIKE '%sarkans%');
UPDATE product_colors SET hex_code = '#1B2A4A' WHERE hex_code IS NULL AND (name ILIKE '%navy%');
UPDATE product_colors SET hex_code = '#6B7280' WHERE hex_code IS NULL AND (name ILIKE '%grey%' OR name ILIKE '%gray%' OR name ILIKE '%pelēks%');
UPDATE product_colors SET hex_code = '#2563EB' WHERE hex_code IS NULL AND (name ILIKE '%blue%' OR name ILIKE '%zils%') AND name NOT ILIKE '%navy%' AND name NOT ILIKE '%dark%' AND name NOT ILIKE '%sky%' AND name NOT ILIKE '%royal%';
UPDATE product_colors SET hex_code = '#16A34A' WHERE hex_code IS NULL AND (name ILIKE '%green%' OR name ILIKE '%zaļš%') AND name NOT ILIKE '%olive%' AND name NOT ILIKE '%forest%' AND name NOT ILIKE '%dark%';
UPDATE product_colors SET hex_code = '#EAB308' WHERE hex_code IS NULL AND (name ILIKE '%yellow%' OR name ILIKE '%dzeltens%');
UPDATE product_colors SET hex_code = '#EA580C' WHERE hex_code IS NULL AND (name ILIKE '%orange%' OR name ILIKE '%oranžs%');
UPDATE product_colors SET hex_code = '#EC4899' WHERE hex_code IS NULL AND (name ILIKE '%pink%' OR name ILIKE '%rozā%');
UPDATE product_colors SET hex_code = '#7C3AED' WHERE hex_code IS NULL AND (name ILIKE '%purple%' OR name ILIKE '%violet%');
UPDATE product_colors SET hex_code = '#78350F' WHERE hex_code IS NULL AND (name ILIKE '%brown%' OR name ILIKE '%brūns%');
UPDATE product_colors SET hex_code = '#7F1D1D' WHERE hex_code IS NULL AND (name ILIKE '%burgundy%' OR name ILIKE '%maroon%' OR name ILIKE '%bordo%');
UPDATE product_colors SET hex_code = '#A3A06C' WHERE hex_code IS NULL AND name ILIKE '%khaki%';
UPDATE product_colors SET hex_code = '#F5F0E8' WHERE hex_code IS NULL AND (name ILIKE '%natural%' OR name ILIKE '%cream%' OR name ILIKE '%ivory%');
UPDATE product_colors SET hex_code = '#6B7234' WHERE hex_code IS NULL AND name ILIKE '%olive%';
UPDATE product_colors SET hex_code = '#0D9488' WHERE hex_code IS NULL AND (name ILIKE '%teal%' OR name ILIKE '%turquoise%');
UPDATE product_colors SET hex_code = '#87CEEB' WHERE hex_code IS NULL AND name ILIKE '%sky%';
UPDATE product_colors SET hex_code = '#1D4ED8' WHERE hex_code IS NULL AND name ILIKE '%royal%';
UPDATE product_colors SET hex_code = '#374151' WHERE hex_code IS NULL AND (name ILIKE '%charcoal%' OR name ILIKE '%anthracite%');
UPDATE product_colors SET hex_code = '#C2B280' WHERE hex_code IS NULL AND (name ILIKE '%sand%' OR name ILIKE '%beige%' OR name ILIKE '%tan%');
UPDATE product_colors SET hex_code = '#00563F' WHERE hex_code IS NULL AND (name ILIKE '%forest%' OR name ILIKE '%bottle%');
UPDATE product_colors SET hex_code = '#F97316' WHERE hex_code IS NULL AND name ILIKE '%coral%';
UPDATE product_colors SET hex_code = '#84CC16' WHERE hex_code IS NULL AND name ILIKE '%lime%';
UPDATE product_colors SET hex_code = '#D97706' WHERE hex_code IS NULL AND name ILIKE '%gold%';
UPDATE product_colors SET hex_code = '#94A3B8' WHERE hex_code IS NULL AND name ILIKE '%silver%';
UPDATE product_colors SET hex_code = '#800020' WHERE hex_code IS NULL AND name ILIKE '%wine%';
UPDATE product_colors SET hex_code = '#E8D5B7' WHERE hex_code IS NULL AND name ILIKE '%camel%';
UPDATE product_colors SET hex_code = '#FF00FF' WHERE hex_code IS NULL AND (name ILIKE '%fuchsia%' OR name ILIKE '%magenta%');
UPDATE product_colors SET hex_code = '#D1D5DB' WHERE hex_code IS NULL AND name ILIKE '%light grey%';
UPDATE product_colors SET hex_code = '#4B5563' WHERE hex_code IS NULL AND name ILIKE '%dark grey%';
UPDATE product_colors SET hex_code = '#1E3A5F' WHERE hex_code IS NULL AND name ILIKE '%dark blue%';
UPDATE product_colors SET hex_code = '#14532D' WHERE hex_code IS NULL AND name ILIKE '%dark green%';
UPDATE product_colors SET hex_code = '#7F1D1D' WHERE hex_code IS NULL AND name ILIKE '%dark red%';
