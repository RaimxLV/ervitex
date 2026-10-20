// Shared, dependency-free translation cache core used by the translate-text
// edge function (Deno) and its vitest suite (Node). No imports on purpose.

/** Bump when the prompt/model contract changes so old cache rows are ignored. */
export const TRANSLATION_VERSION = "v1";

export const LIMITS = {
  maxBodyBytes: 64 * 1024,
  maxItems: 60,
  maxItemChars: 4000,
  maxTotalChars: 20000,
  pollAttempts: 4,
  pollDelayMs: 1500,
  aiAttempts: 2,
};

/** Catalog sources whose product text may be translated, mapped to their style table/key. */
export const SOURCE_TABLES: Record<string, { table: string; key: string }> = {
  ss: { table: "ss_styles", key: "style_code" },
  nwg: { table: "nwg_styles", key: "product_number" },
  bb: { table: "bb_styles", key: "style_code" },
  mf: { table: "mf_styles", key: "style_code" },
  ru: { table: "ru_styles", key: "style_code" },
  utt: { table: "utt_styles", key: "style_code" },
  fr: { table: "falkross_styles", key: "style_code" },
  pf: { table: "pf_styles", key: "model_code" },
};

export type Target = "lv" | "en";

export function canonicalText(s: string): string {
  return s
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

export function needsTranslation(s: string): boolean {
  return /[a-zA-Z]/.test(s);
}

export async function cacheKey(text: string, target: Target): Promise<string> {
  const data = new TextEncoder().encode(`${TRANSLATION_VERSION}|${target}|${canonicalText(text)}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function tokens(s: string): string[] {
  return (s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]{3,}/g) || []);
}

/** Collect every word token from all string leaves of server-known product rows. */
export function buildKnownTokens(values: unknown): Set<string> {
  const out = new Set<string>();
  const walk = (v: unknown, depth: number) => {
    if (depth > 8 || v == null) return;
    if (typeof v === "string") { for (const t of tokens(v)) out.add(t); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (typeof v === "object") { for (const x of Object.values(v as Record<string, unknown>)) walk(x, depth + 1); }
  };
  walk(values, 0);
  return out;
}

/** A text is server-known only if every word of it occurs in the product's stored content. */
export function isKnownText(text: string, known: Set<string>): boolean {
  const toks = tokens(text);
  if (toks.length === 0) return text.trim().length <= 24; // e.g. "XL", "S-M"
  return toks.every((t) => known.has(t));
}

export type ValidRequest = { ok: true; source: string; id: string; target: Target; texts: string[] };
export type InvalidRequest = { ok: false; status: number; error: string };

export function validateRequest(raw: string): ValidRequest | InvalidRequest {
  if (new TextEncoder().encode(raw).length > LIMITS.maxBodyBytes) return { ok: false, status: 413, error: "body_too_large" };
  let body: any;
  try { body = JSON.parse(raw); } catch { return { ok: false, status: 400, error: "invalid_json" }; }
  if (!body || typeof body !== "object") return { ok: false, status: 400, error: "invalid_body" };
  const { source, id, texts } = body;
  const target: Target = body.target === "en" ? "en" : "lv";
  if (typeof source !== "string" || !SOURCE_TABLES[source]) return { ok: false, status: 400, error: "unknown_source" };
  if (typeof id !== "string" || !/^[A-Za-z0-9._\-]{1,64}$/.test(id)) return { ok: false, status: 400, error: "invalid_id" };
  if (!Array.isArray(texts) || texts.length === 0) return { ok: false, status: 400, error: "no_texts" };
  if (texts.length > LIMITS.maxItems) return { ok: false, status: 413, error: "too_many_items" };
  let total = 0;
  for (const t of texts) {
    if (typeof t !== "string") return { ok: false, status: 400, error: "invalid_text" };
    if (t.length > LIMITS.maxItemChars) return { ok: false, status: 413, error: "text_too_long" };
    total += t.length;
  }
  if (total > LIMITS.maxTotalChars) return { ok: false, status: 413, error: "total_too_long" };
  return { ok: true, source, id, target, texts };
}

/** Parse the model's reply; returns null (never the source texts) on any mismatch so errors are not cached. */
export function parseAiArray(content: string, n: number): string[] | null {
  let c = content || "";
  const m = c.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) c = m[1].trim();
  try {
    const arr = JSON.parse(c);
    if (!Array.isArray(arr) || arr.length !== n) return null;
    if (!arr.every((x) => typeof x === "string" && x.trim().length > 0)) return null;
    return arr;
  } catch {
    return null;
  }
}

export interface TranslationStore {
  lookup(keys: string[]): Promise<Map<string, string>>;
  /** Atomically claim keys nobody is translating (or whose lease expired). */
  claim(keys: string[], target: Target): Promise<Set<string>>;
  complete(rows: { key: string; target: Target; source: string; translated: string }[]): Promise<void>;
  release(keys: string[]): Promise<void>;
  /** Returns true when an AI call is allowed for this caller and globally. */
  takeAiBudget(): Promise<boolean>;
}

export type Counts = { hits: number; misses: number; aiCalls: number; aiFailures: number; rejected: number; limited: number };

export async function translateBatch(opts: {
  texts: string[];
  target: Target;
  store: TranslationStore;
  /** Loads server-known product content tokens; called only when there are cache misses. */
  loadKnown: () => Promise<Set<string> | null>;
  ai: (texts: string[], target: Target) => Promise<string[] | null>;
  sleep?: (ms: number) => Promise<void>;
}): Promise<{ translations: string[]; complete: boolean; counts: Counts }> {
  const { texts, target, store, loadKnown, ai } = opts;
  const sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const counts: Counts = { hits: 0, misses: 0, aiCalls: 0, aiFailures: 0, rejected: 0, limited: 0 };
  const out = texts.slice();
  const keyOf: (string | null)[] = [];
  const canon = new Map<string, string>();
  for (const t of texts) {
    const c = canonicalText(t);
    if (!needsTranslation(c)) { keyOf.push(null); continue; }
    const k = await cacheKey(c, target);
    keyOf.push(k);
    canon.set(k, c);
  }
  const keys = [...canon.keys()];
  const found = keys.length ? await store.lookup(keys) : new Map<string, string>();
  counts.hits = keys.filter((k) => found.has(k)).length;
  let missing = keys.filter((k) => !found.has(k));
  counts.misses = missing.length;
  const unresolved = new Set<string>();

  if (missing.length) {
    const known = await loadKnown();
    const allowed = missing.filter((k) => known && isKnownText(canon.get(k)!, known));
    counts.rejected = missing.length - allowed.length;
    missing = allowed;
  }

  if (missing.length) {
    const claimed = await store.claim(missing, target);
    const mine = missing.filter((k) => claimed.has(k));
    const others = missing.filter((k) => !claimed.has(k));
    if (mine.length) {
      if (!(await store.takeAiBudget())) {
        counts.limited = mine.length;
        await store.release(mine);
        mine.forEach((k) => unresolved.add(k));
      } else {
        let result: string[] | null = null;
        for (let attempt = 0; attempt < LIMITS.aiAttempts && !result; attempt++) {
          counts.aiCalls++;
          try { result = await ai(mine.map((k) => canon.get(k)!), target); } catch { result = null; }
          if (!result) { counts.aiFailures++; if (attempt + 1 < LIMITS.aiAttempts) await sleep(1000); }
        }
        if (result) {
          const rows = mine.map((k, i) => ({ key: k, target, source: canon.get(k)!, translated: result![i] }));
          await store.complete(rows);
          rows.forEach((r) => found.set(r.key, r.translated));
        } else {
          await store.release(mine);
          mine.forEach((k) => unresolved.add(k));
        }
      }
    }
    // Another request is translating these right now: wait briefly for its result instead of paying twice.
    let pending = others;
    for (let i = 0; i < LIMITS.pollAttempts && pending.length; i++) {
      await sleep(LIMITS.pollDelayMs);
      const got = await store.lookup(pending);
      got.forEach((v, k) => found.set(k, v));
      pending = pending.filter((k) => !got.has(k));
    }
    pending.forEach((k) => unresolved.add(k));
  }

  texts.forEach((_, i) => {
    const k = keyOf[i];
    if (k && found.has(k)) out[i] = found.get(k)!;
  });
  // Rejected texts are deterministic (never translatable), so they don't make the result incomplete.
  return { translations: out, complete: unresolved.size === 0, counts };
}
