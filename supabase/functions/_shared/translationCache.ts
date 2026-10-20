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
  /** AI fetch timeout; 2 attempts + backoff (~51 s) stay well inside the DB lease. */
  aiTimeoutMs: 25000,
  leaseSeconds: 90,
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

/** UI-compatible normalisation used only for matching (never for cache keys). */
export function normalizeForMatch(s: string): string {
  return s
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
    .replace(/[•▪✓·|]/g, " ")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Every string leaf (and object key) of the server-loaded product rows, normalised. */
export function buildKnownContent(values: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown, depth: number) => {
    if (depth > 8 || v == null) return;
    if (typeof v === "string") { const n = normalizeForMatch(v); if (n) out.push(n); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (typeof v === "object") {
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) { out.push(normalizeForMatch(k)); walk(x, depth + 1); }
    }
  };
  walk(values, 0);
  return out;
}

const WORD = /[\p{L}\p{N}]/u;
function containsAligned(leaf: string, part: string): boolean {
  for (let i = leaf.indexOf(part); i !== -1; i = leaf.indexOf(part, i + 1)) {
    const end = i + part.length;
    if ((i === 0 || !WORD.test(leaf[i - 1])) && (end === leaf.length || !WORD.test(leaf[end]))) return true;
  }
  return false;
}

/**
 * A text is server-known only if it is a contiguous, word-aligned segment of one stored
 * field, or whole such segments joined with "; " (as the care block does). Reordered or
 * invented word combinations are rejected.
 */
export function isKnownText(text: string, known: string[]): boolean {
  // "; " joins care segments; ": " joins a stored label with its stored value (e.g. "Brand: ProJob").
  const parts = text.split(/;\s*|:\s+/).map((p) => normalizeForMatch(p.replace(/^\s*[-*]\s*/, ""))).filter(Boolean);
  if (!parts.length) return false;
  return parts.every((p) => known.some((leaf) => containsAligned(leaf, p)));
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
  /** Atomically claim keys nobody is translating (or whose lease expired); fenced by this request's lease token. */
  claim(keys: string[], target: Target): Promise<Set<string>>;
  /** Writes only rows still owned by this request's lease token; never overwrites manual rows. */
  complete(rows: { key: string; target: Target; source: string; translated: string }[]): Promise<void>;
  release(keys: string[]): Promise<void>;
  /** Atomically reserves one AI call for this caller and globally; false when a cap is reached. */
  takeAiBudget(): Promise<boolean>;
}

export type Counts = { hits: number; misses: number; aiCalls: number; aiFailures: number; rejected: number; limited: number };

export async function translateBatch(opts: {
  texts: string[];
  target: Target;
  store: TranslationStore;
  /** Loads server-known product content; called only when there are cache misses. */
  loadKnown: () => Promise<string[] | null>;
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
      let result: string[] | null = null;
      let limited = false;
      for (let attempt = 0; attempt < LIMITS.aiAttempts && !result; attempt++) {
        // Every attempt, including retries, consumes budget.
        if (!(await store.takeAiBudget())) { limited = true; break; }
        counts.aiCalls++;
        try { result = await ai(mine.map((k) => canon.get(k)!), target); } catch { result = null; }
        if (!result) { counts.aiFailures++; if (attempt + 1 < LIMITS.aiAttempts) await sleep(1000); }
      }
      if (result) {
        const rows = mine.map((k, i) => ({ key: k, target, source: canon.get(k)!, translated: result![i] }));
        await store.complete(rows);
        rows.forEach((r) => found.set(r.key, r.translated));
      } else {
        if (limited) counts.limited = mine.length;
        await store.release(mine);
        mine.forEach((k) => unresolved.add(k));
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
  // Rejected texts stay untranslated and mark the result incomplete so the browser never pins them.
  return { translations: out, complete: unresolved.size === 0 && counts.rejected === 0, counts };
}
