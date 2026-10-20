-- Integration regression: test requests and rotation changes roll back.
BEGIN;
SELECT id FROM public.quote_assignment_rotation WHERE id = 1 FOR UPDATE;
UPDATE public.quote_assignment_rotation SET next_position = 0 WHERE id = 1;
DO $$
DECLARE
  client_email text := 'assignment-' || gen_random_uuid()::text || '@example.invalid';
  request_id uuid;
  slug text;
  pm_email text;
  position integer;
BEGIN
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', client_email, '[]') RETURNING id, assigned_pm_slug, assigned_pm_email INTO request_id, slug, pm_email;
  IF slug <> 'laura' OR pm_email <> 'birojs@ervitex.lv' THEN RAISE EXCEPTION 'First new client must go to Laura/office'; END IF;
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', upper(client_email), '[]') RETURNING assigned_pm_slug INTO slug;
  IF slug <> 'laura' THEN RAISE EXCEPTION 'Repeated client must remain with Laura, ignoring email case'; END IF;
  SELECT next_position INTO position FROM public.quote_assignment_rotation WHERE id = 1;
  IF position <> 1 THEN RAISE EXCEPTION 'Repeat must not advance rotation'; END IF;
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', 'new-' || client_email, '[]') RETURNING assigned_pm_slug INTO slug;
  IF slug <> 'ilona' THEN RAISE EXCEPTION 'Second new client must go to Ilona'; END IF;
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', 'third-' || client_email, '[]') RETURNING assigned_pm_slug INTO slug;
  IF slug <> 'justine' THEN RAISE EXCEPTION 'Third new client must go to Justine'; END IF;
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', 'fourth-' || client_email, '[]') RETURNING assigned_pm_slug INTO slug;
  IF slug <> 'santa' THEN RAISE EXCEPTION 'Fourth new client must go to Santa'; END IF;
  UPDATE public.quote_requests SET assigned_pm_slug = 'evita', assigned_pm_name = 'Evita', assigned_pm_email = 'info@t-bode.lv', assigned_at = clock_timestamp() WHERE id = request_id;
  INSERT INTO public.quote_requests (name, email, items)
  VALUES ('Assignment test', client_email, '[]') RETURNING assigned_pm_slug INTO slug;
  IF slug <> 'evita' THEN RAISE EXCEPTION 'Repeat must follow latest handoff to Evita'; END IF;
END;
$$;
ROLLBACK;