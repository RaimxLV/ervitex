import { createClient } from "npm:@supabase/supabase-js@2";
import {
  LIMITS,
  SOURCE_TABLES,
  buildKnownContent,
  parseAiArray,
  translateBatch,
  validateRequest,
  type Target,
  type TranslationStore,
} from "../_shared/translationCache.ts";

// Model unchanged from the previous version on purpose (cost audit 2026-10-20).
const MODEL = "google/gemini-2.5-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const raw = await req.text();
  const parsed = validateRequest(raw);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
  const { source, id, target, texts } = parsed;

  const backendUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!backendUrl || !serviceKey || !lovableKey) return json({ error: "unavailable" }, 503);
  const db = createClient(backendUrl, serviceKey, { auth: { persistSession: false } });

  const ip = (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const ipHash = (await sha256(`translate|${ip}`)).slice(0, 32);

  // Per-caller request limit (also counts cache hits). Fails closed if the schema is missing.
  const gate = await db.rpc("translation_take_budget", { _ip_hash: ipHash, _requests: 1, _ai_calls: 0 });
  if (gate.error || gate.data !== "ok") {
    console.log(JSON.stringify({ evt: "translate", outcome: gate.error ? "budget_error" : gate.data }));
    return json({ translations: texts, complete: false }, gate.error ? 200 : 429);
  }

  const leaseToken = crypto.randomUUID();
  const store: TranslationStore = {
    async lookup(keys) {
      const { data, error } = await db.from("translation_cache").select("key,translated").in("key", keys).eq("status", "ready");
      if (error) throw error;
      return new Map((data || []).map((r: any) => [r.key, r.translated]));
    },
    async claim(keys, tgt) {
      const { data, error } = await db.rpc("translation_claim", { _keys: keys, _target: tgt, _token: leaseToken, _lease_seconds: LIMITS.leaseSeconds });
      if (error) throw error;
      return new Set((data || []) as string[]);
    },
    async complete(rows) {
      const { error } = await db.rpc("translation_complete", { _rows: rows, _model: MODEL, _token: leaseToken });
      if (error) throw error;
    },
    async release(keys) {
      await db.rpc("translation_release", { _keys: keys, _token: leaseToken });
    },
    async takeAiBudget() {
      const { data, error } = await db.rpc("translation_take_budget", { _ip_hash: ipHash, _requests: 0, _ai_calls: 1 });
      return !error && data === "ok";
    },
  };

  const loadKnown = async () => {
    const meta = SOURCE_TABLES[source];
    const [style, override, pfVariants] = await Promise.all([
      db.from(meta.table).select("*").eq(meta.key, id).maybeSingle(),
      db.from("catalog_overrides").select("name_lv,name_en,description_lv,description_en").eq("source", source).eq("item_id", id).maybeSingle(),
      source === "pf" ? db.from("pf_variants").select("material").eq("model_code", id).limit(200) : Promise.resolve({ data: null }),
    ]);
    if (!style.data) return null;
    return buildKnownContent([style.data, override.data, pfVariants.data]);
  };

  const ai = async (items: string[], tgt: Target) => {
    const targetLang = tgt === "en" ? "English" : "Latvian";
    const prompt = `Translate each item in the JSON array below to ${targetLang}. Preserve bullet markers (•, -, ✓), line breaks, numbers and units. Do not add commentary. Return ONLY a JSON array of the same length with translated strings.

INPUT: ${JSON.stringify(items)}
OUTPUT:`;
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: AbortSignal.timeout(LIMITS.aiTimeoutMs),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], temperature: 0.2 }),
    });
    if (!r.ok) { await r.body?.cancel(); throw new Error(`ai_${r.status}`); }
    const data = await r.json();
    return parseAiArray(data.choices?.[0]?.message?.content || "", items.length);
  };

  try {
    const result = await translateBatch({ texts, target, store, loadKnown, ai });
    const c = result.counts;
    console.log(JSON.stringify({ evt: "translate", source, items: texts.length, ...c, complete: result.complete }));
    await db.rpc("translation_record_stats", {
      _hits: c.hits, _misses: c.misses, _ai_calls: c.aiCalls, _ai_failures: c.aiFailures, _rejected: c.rejected, _limited: c.limited,
    });
    return json({ translations: result.translations, complete: result.complete });
  } catch (e) {
    console.log(JSON.stringify({ evt: "translate", outcome: "error", message: (e as Error).message.slice(0, 120) }));
    return json({ translations: texts, complete: false });
  }
});

