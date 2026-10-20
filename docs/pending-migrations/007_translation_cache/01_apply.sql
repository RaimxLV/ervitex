-- 007 translation cache + abuse budget for translate-text (additive only).
-- Tables/functions are service_role only: no anon/authenticated read or write.

CREATE TABLE IF NOT EXISTS public.translation_cache (
  key text PRIMARY KEY,
  target text NOT NULL CHECK (target IN ('lv','en')),
  source_text text,
  translated text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready')),
  manual boolean NOT NULL DEFAULT false,
  model text,
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

-- Claim keys for translation: new keys, or pending keys whose lease expired. Ready rows are never claimed.
CREATE OR REPLACE FUNCTION public.translation_claim(_keys text[], _target text)
RETURNS SETOF text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.translation_cache AS c (key, target, status, lease_until)
  SELECT DISTINCT k, _target, 'pending', now() + interval '90 seconds' FROM unnest(_keys) AS k
  ON CONFLICT (key) DO UPDATE SET lease_until = now() + interval '90 seconds', updated_at = now()
    WHERE c.status = 'pending' AND c.lease_until < now()
  RETURNING c.key;
$$;

-- Store results; manual (approved) rows are never overwritten.
CREATE OR REPLACE FUNCTION public.translation_complete(_rows jsonb, _model text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.translation_cache AS c (key, target, source_text, translated, status, model, lease_until)
  SELECT r->>'key', r->>'target', r->>'source', r->>'translated', 'ready', _model, NULL
  FROM jsonb_array_elements(_rows) AS r
  WHERE coalesce(r->>'translated','') <> ''
  ON CONFLICT (key) DO UPDATE SET source_text = EXCLUDED.source_text, translated = EXCLUDED.translated,
    status = 'ready', model = EXCLUDED.model, lease_until = NULL, updated_at = now()
    WHERE c.manual = false;
$$;

CREATE OR REPLACE FUNCTION public.translation_release(_keys text[])
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.translation_cache WHERE key = ANY(_keys) AND status = 'pending' AND manual = false;
$$;

-- Hourly per-caller limits (hashed IP, never raw) and a daily global AI budget.
CREATE OR REPLACE FUNCTION public.translation_take_budget(_ip_hash text, _requests integer, _ai_calls integer)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _hour timestamptz := date_trunc('hour', now());
  _day timestamptz := date_trunc('day', now());
  _n integer;
BEGIN
  IF _requests > 0 THEN
    INSERT INTO public.translation_rate (bucket, window_start, count) VALUES ('req:' || _ip_hash, _hour, _requests)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = translation_rate.count + EXCLUDED.count
    RETURNING count INTO _n;
    INSERT INTO public.translation_stats (day, requests) VALUES (current_date, 1)
    ON CONFLICT (day) DO UPDATE SET requests = translation_stats.requests + 1;
    IF _n > 600 THEN RETURN 'ip_requests'; END IF;
  END IF;
  IF _ai_calls > 0 THEN
    SELECT count INTO _n FROM public.translation_rate WHERE bucket = 'ai:global' AND window_start = _day;
    IF coalesce(_n, 0) + _ai_calls > 400 THEN RETURN 'global_ai'; END IF;
    SELECT count INTO _n FROM public.translation_rate WHERE bucket = 'ai:' || _ip_hash AND window_start = _hour;
    IF coalesce(_n, 0) + _ai_calls > 40 THEN RETURN 'ip_ai'; END IF;
    INSERT INTO public.translation_rate (bucket, window_start, count) VALUES ('ai:global', _day, _ai_calls)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = translation_rate.count + EXCLUDED.count;
    INSERT INTO public.translation_rate (bucket, window_start, count) VALUES ('ai:' || _ip_hash, _hour, _ai_calls)
    ON CONFLICT (bucket, window_start) DO UPDATE SET count = translation_rate.count + EXCLUDED.count;
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

REVOKE ALL ON FUNCTION public.translation_claim(text[], text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_complete(jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_release(text[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_take_budget(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.translation_record_stats(integer, integer, integer, integer, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.translation_claim(text[], text) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_complete(jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_release(text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_take_budget(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.translation_record_stats(integer, integer, integer, integer, integer, integer) TO service_role;
