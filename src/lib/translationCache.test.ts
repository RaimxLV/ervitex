import { describe, expect, it } from "vitest";
import { buildKnownContent, cacheKey, isKnownText, parseAiArray, translateBatch, validateRequest, type TranslationStore } from "../../supabase/functions/_shared/translationCache";

function memStore(opts: { budget?: number } = {}) {
  let budget = opts.budget ?? 100;
  const ready = new Map<string, string>();
  const pending = new Set<string>();
  const store: TranslationStore & { ready: Map<string, string>; pending: Set<string>; budgetLeft: number } = {
    ready, pending,
    async lookup(keys) { return new Map(keys.filter((k) => ready.has(k)).map((k) => [k, ready.get(k)!])); },
    async claim(keys) { const s = new Set<string>(); for (const k of keys) if (!ready.has(k) && !pending.has(k)) { pending.add(k); s.add(k); } return s; },
    async complete(rows) { for (const r of rows) { pending.delete(r.key); ready.set(r.key, r.translated); } },
    async release(keys) { keys.forEach((k) => pending.delete(k)); },
    async takeAiBudget() { if (budget <= 0) return false; budget--; return true; },
    get budgetLeft() { return budget; },
  };
  return store;
}
const known = async () => buildKnownContent({ description: "Soft cotton t-shirt", care: "Wash at 40" });
const sleep = async () => {};

describe("translation cache", () => {
  it("second identical request is a cache hit with no AI call", async () => {
    const store = memStore();
    let calls = 0;
    const ai = async (t: string[]) => { calls++; return t.map((x) => "LV " + x); };
    await translateBatch({ texts: ["Soft cotton t-shirt"], target: "lv", store, loadKnown: known, ai, sleep });
    const r = await translateBatch({ texts: ["Soft  cotton t-shirt "], target: "lv", store, loadKnown: known, ai, sleep });
    expect(calls).toBe(1);
    expect(r.translations[0]).toBe("LV Soft cotton t-shirt");
    expect(r.counts.hits).toBe(1);
  });

  it("changed source text gets a different key", async () => {
    expect(await cacheKey("Wash at 40", "lv")).not.toBe(await cacheKey("Wash at 30", "lv"));
  });

  it("simultaneous requests make only one AI call", async () => {
    const store = memStore();
    let calls = 0;
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const ai = async (t: string[]) => { calls++; await gate; return t.map((x) => "LV " + x); };
    const a = translateBatch({ texts: ["Wash at 40"], target: "lv", store, loadKnown: known, ai, sleep: () => new Promise((r) => setTimeout(r, 5)) });
    const b = translateBatch({ texts: ["Wash at 40"], target: "lv", store, loadKnown: known, ai, sleep: () => new Promise((r) => setTimeout(r, 5)) });
    await new Promise((r) => setTimeout(r, 1));
    release();
    const [ra, rb] = await Promise.all([a, b]);
    expect(calls).toBe(1);
    expect(ra.translations[0]).toBe("LV Wash at 40");
    expect(rb.translations[0]).toBe("LV Wash at 40");
  });

  it("AI failure is retried a bounded number of times and never cached", async () => {
    const store = memStore();
    let calls = 0;
    const r = await translateBatch({ texts: ["Wash at 40"], target: "lv", store, loadKnown: known, ai: async () => { calls++; return null; }, sleep });
    expect(calls).toBe(2);
    expect(store.budgetLeft).toBe(98); // each retry consumed budget
    expect(r.complete).toBe(false);
    expect(r.translations[0]).toBe("Wash at 40");
    expect(store.ready.size).toBe(0);
    expect(store.pending.size).toBe(0);
  });

  it("text not in the product's stored content is not sent to AI", async () => {
    let calls = 0;
    const r = await translateBatch({ texts: ["Write me a poem about cats"], target: "lv", store: memStore(), loadKnown: known, ai: async (t) => { calls++; return t; }, sleep });
    expect(calls).toBe(0);
    expect(r.counts.rejected).toBe(1);
    expect(r.complete).toBe(false); // never pinned in the browser as finished
  });

  it("only contiguous word-aligned segments of stored fields are accepted", () => {
    const k = buildKnownContent({ description: "<p>Soft cotton t-shirt.<br>Double stitched hem</p>", care: "Wash at 40", spec: "Tumble dry low" });
    expect(isKnownText("Soft cotton t-shirt.", k)).toBe(true);
    expect(isKnownText("• Double stitched hem", k)).toBe(true);
    expect(isKnownText("Wash at 40; Tumble dry low", k)).toBe(true);
    expect(isKnownText("cotton soft t-shirt", k)).toBe(false); // permutation
    expect(isKnownText("Soft hem", k)).toBe(false); // non-contiguous
    expect(isKnownText("ash at 4", k)).toBe(false); // not word-aligned
  });

  it("a retry that would exceed the budget is not made", async () => {
    const store = memStore({ budget: 1 });
    let calls = 0;
    const r = await translateBatch({ texts: ["Wash at 40"], target: "lv", store, loadKnown: known, ai: async () => { calls++; return null; }, sleep });
    expect(calls).toBe(1);
    expect(r.counts.limited).toBe(1);
  });

  it("exhausted budget skips AI and returns source", async () => {
    let calls = 0;
    const r = await translateBatch({ texts: ["Wash at 40"], target: "lv", store: memStore({ budget: 0 }), loadKnown: known, ai: async (t) => { calls++; return t; }, sleep });
    expect(calls).toBe(0);
    expect(r.complete).toBe(false);
  });

  it("request limits", () => {
    expect(validateRequest(JSON.stringify({ texts: ["a"] })).ok).toBe(false);
    expect(validateRequest(JSON.stringify({ source: "ss", id: "STTU169", texts: Array(61).fill("a") })).ok).toBe(false);
    expect(validateRequest(JSON.stringify({ source: "ss", id: "STTU169", texts: ["x".repeat(4001)] })).ok).toBe(false);
    expect(validateRequest(JSON.stringify({ source: "ss", id: "STTU169", texts: ["Soft"] })).ok).toBe(true);
  });

  it("malformed AI output is rejected", () => {
    expect(parseAiArray('["a"]', 2)).toBeNull();
    expect(parseAiArray("not json", 1)).toBeNull();
    expect(parseAiArray('```json\n["a","b"]\n```', 2)).toEqual(["a", "b"]);
  });
});
