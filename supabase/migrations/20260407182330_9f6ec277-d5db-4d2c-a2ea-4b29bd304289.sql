
CREATE OR REPLACE FUNCTION public.format_product_description(input_text text, is_english boolean DEFAULT false)
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  cleaned text;
  intro text := '';
  specs text := '';
  line text;
  lines text[];
  spec_header text;
  is_spec boolean := false;
  label_match text[];
BEGIN
  IF input_text IS NULL OR trim(input_text) = '' THEN
    RETURN input_text;
  END IF;

  cleaned := input_text;
  cleaned := regexp_replace(cleaned, 'Elektroniskais katalogs[^\n]*', '', 'gi');
  cleaned := regexp_replace(cleaned, 'Par apdrukas iespējām jautāt mums!?', '', 'gi');
  cleaned := regexp_replace(cleaned, 'Par cenu un pieejamību jautāt mums!?', '', 'gi');
  cleaned := trim(cleaned);

  -- If single line, insert newlines before known labels
  IF position(E'\n' in cleaned) = 0 THEN
    cleaned := regexp_replace(cleaned, '\s+(Materiāls\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Material\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Sastāvs\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Izmērs\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Izmēri\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Blīvums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Svars\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Tilpums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Ietilpība\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Diametrs\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Garums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Platums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Augstums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Krāsas\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Krāsa\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Iepakojums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Apdrukas laukums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Apdrukas tehnoloģija\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Rokturu garums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Komplektā\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Baterija\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Jauda\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Gramāža\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Minimālais pasūtījums\s*:)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Pieejama\s)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Pieejamas\s)', E'\n\\1', 'gi');
    cleaned := regexp_replace(cleaned, '\s+(Atbilst\s)', E'\n\\1', 'gi');
  END IF;

  lines := regexp_split_to_array(cleaned, E'\n');
  spec_header := CASE WHEN is_english THEN E'\n### Technical Specifications' ELSE E'\n### Tehniskā specifikācija' END;

  FOREACH line IN ARRAY lines LOOP
    line := trim(line);
    IF line = '' THEN CONTINUE; END IF;

    -- Check if line starts with a known spec label followed by colon
    IF line ~* '^\s*(?:Materiāls|Material|Sastāvs|Composition|Izmērs|Izmēri|Size|Sizes|Blīvums|Density|Gramāža|Weight|Svars|Tilpums|Volume|Capacity|Ietilpība|Diametrs|Diameter|Garums|Length|Platums|Width|Augstums|Height|Krāsas|Krāsa|Colors|Colours|Color|Minimālais pasūtījums|Minimum order|Iepakojums|Packaging|Packing|Apdrukas laukums|Printing area|Apdrukas tehnoloģija|Printing technology|Rokturu garums|Handle length|Komplektā|Includes|Included|Baterija|Battery|Jauda|Power|Uzlādes laiks|Charging time|Ūdens necaurlaidība|Water resistance|Atbilst)\s*:' THEN
      is_spec := true;
      -- Bold the label part
      line := regexp_replace(line, '^([A-Za-zĀ-žā-ž\s]+)\s*:', '**\1:**', 'i');
      specs := specs || E'\n' || '• ' || line;
    ELSIF line ~* '^\s*(?:Pieejama|Pieejamas)\s' AND is_spec THEN
      specs := specs || E'\n' || '• ' || line;
    ELSIF is_spec THEN
      specs := specs || E'\n' || '• ' || line;
    ELSE
      IF intro != '' THEN intro := intro || E'\n'; END IF;
      intro := intro || line;
    END IF;
  END LOOP;

  IF specs != '' THEN
    RETURN trim(intro || E'\n' || spec_header || specs);
  ELSE
    RETURN trim(intro);
  END IF;
END;
$$;

UPDATE products
SET 
  description_lv = public.format_product_description(description_lv, false),
  description_en = public.format_product_description(description_en, true),
  long_description_lv = CASE WHEN long_description_lv IS NOT NULL AND long_description_lv != '' 
    THEN public.format_product_description(long_description_lv, false) 
    ELSE long_description_lv END,
  long_description_en = CASE WHEN long_description_en IS NOT NULL AND long_description_en != '' 
    THEN public.format_product_description(long_description_en, true) 
    ELSE long_description_en END,
  updated_at = now()
WHERE description_lv IS NOT NULL AND description_lv != '';

DROP FUNCTION IF EXISTS public.format_product_description(text, boolean);
