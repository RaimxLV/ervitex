CREATE OR REPLACE FUNCTION public.save_quote_worksheet(_token text, _items jsonb, _by text DEFAULT NULL::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target uuid;
  item jsonb;
  print jsonb;
  qty numeric;
  unit_price numeric;
  print_price numeric;
BEGIN
  IF _token IS NULL OR _token !~ '^[a-f0-9]{20,64}$' THEN
    RAISE EXCEPTION 'Nederīga saite';
  END IF;

  IF jsonb_typeof(_items) <> 'array' THEN
    RAISE EXCEPTION 'Nederīgs saraksts';
  END IF;

  IF jsonb_array_length(_items) > 300 THEN
    RAISE EXCEPTION 'Par daudz rindu';
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(_items) LOOP
    IF jsonb_typeof(item) <> 'object' THEN
      RAISE EXCEPTION 'Nederīga rinda';
    END IF;

    IF item ? 'qty' AND item->>'qty' IS NOT NULL AND item->>'qty' <> '' THEN
      BEGIN
        qty := (item->>'qty')::numeric;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Nederīgs skaits';
      END;
      IF qty < 0 OR qty > 100000 OR qty <> trunc(qty) THEN
        RAISE EXCEPTION 'Nederīgs skaits';
      END IF;
    END IF;

    IF item ? 'unitPrice' AND item->>'unitPrice' IS NOT NULL AND item->>'unitPrice' <> '' THEN
      BEGIN
        unit_price := (item->>'unitPrice')::numeric;
      EXCEPTION WHEN others THEN
        RAISE EXCEPTION 'Nederīga cena';
      END;
      IF unit_price < 0 OR unit_price > 100000 THEN
        RAISE EXCEPTION 'Nederīga cena';
      END IF;
    END IF;

    IF item ? 'prints' AND jsonb_typeof(item->'prints') = 'array' THEN
      FOR print IN SELECT value FROM jsonb_array_elements(item->'prints') LOOP
        IF jsonb_typeof(print) <> 'object' THEN
          RAISE EXCEPTION 'Nederīga apdruka';
        END IF;
        IF print ? 'price' AND print->>'price' IS NOT NULL AND print->>'price' <> '' THEN
          BEGIN
            print_price := (print->>'price')::numeric;
          EXCEPTION WHEN others THEN
            RAISE EXCEPTION 'Nederīga apdrukas cena';
          END;
          IF print_price < 0 OR print_price > 100000 THEN
            RAISE EXCEPTION 'Nederīga apdrukas cena';
          END IF;
        END IF;
      END LOOP;
    ELSIF item ? 'prints' AND jsonb_typeof(item->'prints') <> 'null' THEN
      RAISE EXCEPTION 'Nederīga apdruka';
    END IF;
  END LOOP;

  SELECT q.id INTO target
    FROM public.quote_requests q
   WHERE q.action_token = _token
     AND q.worksheet_locked = false;

  IF target IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.quote_requests
     SET worksheet_items = _items,
         worksheet_updated_at = now(),
         worksheet_updated_by = NULLIF(left(COALESCE(_by, ''), 120), '')
   WHERE id = target;

  RETURN true;
END;
$function$;