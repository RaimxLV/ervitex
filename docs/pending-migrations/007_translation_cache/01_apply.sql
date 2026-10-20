-- 007 translation cache + abuse budget for translate-text (additive only, no data changes).
-- Tables/functions are service_role only: no anon/authenticated read, write or execute.

CREATE TABLE IF NOT EXISTS public.translation_cache (
  key text PRIMARY KEY,
  target text NOT NULL CHECK (target IN ('lv','en')),
  source_text text,
  translated text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready')),
  manual boolean NOT NULL DEFAULT false,
  model text,
  lease_token uuid,
  lease_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.translation_cache FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.translation_cache TO service_role;
ALTER TABLE public.translation_cache ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.translation_rate (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (bucket, window_start)
);
REVOKE ALL ON public.translation_rate FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.translation_rate TO service_role;
ALTER TABLE public.translation_rate ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.translation_stats (
  day date PRIMARY KEY,
  requests integer NOT NULL DEFAULT 0,
  hits integer NOT NULL DEFAULT 0,
  misses integer NOT NULL DEFAULT 0,
  ai_calls integer NOT NULL DEFAULT 0,
  ai_failures integer NOT NULL DEFAULT 0,
  rejected integer NOT NULL DEFAULT 0,
  limited integer NOT NULL DEFAULT 0
);
REVOKE ALL ON public.translation_stats FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.translation_stats TO service_role;
ALTER TABLE public.translation_stats ENABLE ROW LEVEL SECURITY;

-- Claim keys: new keys, or pending keys whose lease expired. Ready rows are never claimed.
-- The caller's random token fences later complete/release calls.
CREATE OR REPLACE FUNCTION public.translation_claim(_keys text[], _target text, _token uuid, _lease_seconds integer)
RETURNS SETOF text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.translation_cache AS c (key, target, status, lease_token, lease_until)
  SELECT DISTINCT k, _target, 'pending', _token, now() + make_interval(secs => least(greatest(_lease_seconds, 30), 300))
  FROM unnest(_keys) AS k
  ON CONFLICT (key) DO UPDATE SET lease_token = EXCLUDED.lease_token, lease_until = EXCLUDED.lease_until, updated_at = now()
    WHERE c.status = 'pending' AND c.manual = false AND c.lease_until < now()
  RETURNING c.key;
$$;

-- Store results only for rows this token still owns; manual (approved) rows are never touched.
CREATE OR REPLACE FUNCTION public.translation_complete(_rows jsonb, _model text, _token uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n integer;
BEGIN
  UPDATE public.translation_cache c
     SET source_text = r->>'source', translated = r->>'translated', status = 'ready',
         model = _model, lease_token = NULL, lease_until = NULL, updated_at = now()
    FROM jsonb_array_elements(_rows) AS r
   WHERE c.key = r->>'key' AND c.status = 'pending' AND c.manual = false
     AND c.lease_token = _token AND coalesce(r->>'translated', '') <> '';
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

CREATE OR REPLACE FUNCTION public.translation_release(_keys text[], _token uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.translation_cache
   WHERE key = ANY(_keys) AND status = 'pending' AND manual = false AND lease_token = _token;
$$;

-- Capped increment: returns true only if the counter stayed within the cap. A single
-- INSERT .. ON CONFLICT DO UPDATE .. WHERE is atomic under concurrent callers (row lock).
CREATE OR REPLACE FUNCTION public.translation_rate_take(_bucket text, _window timestamptz, _n integer, _cap integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _hit integer;
BEGIN
  IF _n > _cap THEN RETURN false; END IF;
  INSERT INTO public.translation_rate AS r (bucket, window_start, count) VALUES (_bucket, _window, _n)
  ON CONFLICT (bucket, window_start) DO UPDATE SET count = r.count + EXCLUDED.count
    WHERE r.count + EXCLUDED.count <= _cap
  RETURNING 1 INTO _hit;
  RETURN _hit IS NOT NULL;
END;
$$;

-- Hourly per-caller limits (hashed IP, never raw) and a daily global AI budget.
CREATE OR REPLACE FUNCTION public.translation_take_budget(_ip_hash text, _requests integer, _ai_calls integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _hour timestamptz := date_trunc('hour', now());
  _day timestamptz := date_trunc('day', now());
BEGIN
  IF _requests > 0 THEN
    INSERT INTO public.translation_stats AS s (day, requests) VALUES (current_date, 1)
    ON CONFLICT (day) DO UPDATE SET requests = s.requests + 1;
    IF NOT public.translation_rate_take('req:' || _ip_hash, _hour, _requests, 600) THEN RETURN 'ip_requests'; END IF;
  END IF;
  IF _ai_calls > 0 THEN
    IF NOT public.translation_rate_take('ai:global', _day, _ai_calls, 400) THEN RETURN 'global_ai'; END IF;
    IF NOT public.translation_rate_take('ai:' || _ip_hash, _hour, _ai_calls, 40) THEN
      -- Refund the global reservation taken above (same transaction, row already locked by us).
      UPDATE public.translation_rate SET count = count - _ai_calls WHERE bucket = 'ai:global' AND window_start = _day;
      RETURN 'ip_ai';
    END IF;
  END IF;
  IF random() < 0.01 THEN
    DELETE FROM public.translation_rate WHERE window_start < now() - interval '2 days';
  END IF;
  RETURN 'ok';
END;
$$;

CREATE OR REPLACE FUNCTION public.translation_record_stats(_hits integer, _misses integer, _ai_calls integer, _ai_failures integer, _rejected integer, _limited integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.translation_stats AS s (day, hits, misses, ai_calls, ai_failures, rejected, limited)
  VALUES (current_date, _hits, _misses, _ai_calls, _ai_failures, _rejected, _limited)
  ON CONFLICT (day) DO UPDATE SET hits = s.hits + EXCLUDED.hits, misses = s.misses + EXCLUDED.misses,
    ai_calls = s.ai_calls + EXCLUDED.ai_calls, ai_failures = s.ai_failures + EXCLUDED.ai_failures,
    rejected = s.rejected + EXCLUDED.rejected, limited = s.limited + EXCLUDED.limited;
$$;

REVOKE ALL ON FUNCTION public.translation_claim(text[], text, uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_complete(jsonb, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_release(text[], uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_rate_take(text, timestamptz, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_take_budget(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_record_stats(integer, integer, integer, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.translation_claim(text[], text, uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_complete(jsonb, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_release(text[], uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_rate_take(text, timestamptz, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_take_budget(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_record_stats(integer, integer, integer, integer, integer, integer) TO service_role;
