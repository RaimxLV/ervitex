import { describe, expect, it, vi } from "vitest";
import { catalogColorParam, catalogColorPrice } from "./catalogPriceSelection";
import { normalizeCatalogSort, prepareQuery, rankedSearchResults, searchMatches } from "./catalogSearch";
import { supplierSizeLabel } from "./supplierSizeLabels";
import { createRowsLoader } from "./headerSearchRows";
import { sameCartVariant } from "./quoteCartIdentity";

describe("A02 BB card colour prices", () => {
  const prices = new Map<string, number>([
    ["bb:W952:soft white/bottle green", 11.68],
    ["bb:W950:soft white/navy", 8.96],
    ["bb:W930:natural black tie dye", 8.21],
    ["bb:W952:", 5],
  ]);
  it("matches the authoritative spaced name when the synthetic code misses", () => {
    expect(catalogColorPrice(prices, "bb", "W952", { c: "W952-SOFTWHITE/BOTTLEGREEN", n: "Soft White/Bottle Green" })).toBe(11.68);
    expect(catalogColorPrice(prices, "bb", "W950", { c: "W950-SOFTWHITENAVY", n: "Soft White/Navy" })).toBe(8.96);
    expect(catalogColorPrice(prices, "bb", "W930", { c: "W930-NATURALBLACKTIEDYE", n: "Natural Black Tie Dye" })).toBe(8.21);
  });
  it("rejects another colour, another style and model-wide fallback", () => {
    expect(catalogColorPrice(prices, "bb", "W952", { c: "W952-SOFTWHITE", n: "Soft White" })).toBeUndefined();
    expect(catalogColorPrice(prices, "bb", "W950", { c: "W950-SOFTWHITE/BOTTLEGREEN", n: "Soft White/Bottle Green" })).toBeUndefined();
  });
  it("navigates BB cards with the authoritative colour name", () => {
    expect(catalogColorParam("bb", { c: "W952-SOFTWHITE/BOTTLEGREEN", n: "Soft White/Bottle Green" })).toBe("Soft White/Bottle Green");
    expect(catalogColorParam("ss", { c: "C002", n: "Black" })).toBe("C002");
  });
});

describe("A04 sort normalization", () => {
  it("maps legacy values and defaults unknown", () => {
    expect(normalizeCatalogSort("name-asc")).toBe("az");
    expect(normalizeCatalogSort("name-desc")).toBe("za");
    expect(normalizeCatalogSort("price-asc")).toBe("price_asc");
    expect(normalizeCatalogSort("price-desc")).toBe("price_desc");
    expect(normalizeCatalogSort("featured")).toBe("featured");
    expect(normalizeCatalogSort("bogus")).toBe("newest");
    expect(normalizeCatalogSort(null)).toBe("newest");
  });
});

describe("A05 sorting within search groups", () => {
  const items = [
    { id: "0R957M0", source: "ru", name: "Men", p: 30 },
    { id: "0R957F0", source: "ru", name: "Ladies", p: 20 },
    { id: "0R958M0", source: "ru", name: "Other men", p: 5 },
    { id: "0R959F0", source: "ru", name: "Other ladies", p: 50 },
    { id: "957", source: "mf", name: "Malfini", p: 1 },
  ];
  for (const dir of [1, -1]) {
    it(`keeps exact before related with price ${dir > 0 ? "asc" : "desc"}`, () => {
      const pq = prepareQuery("R957");
      const m = searchMatches(items, pq);
      const out = rankedSearchResults(items, pq, (a, b) => (a.p - b.p) * dir);
      const exact = out.slice(0, m.exact.length);
      expect(new Set(exact)).toEqual(new Set(m.exact));
      expect(new Set(out.slice(m.exact.length))).toEqual(new Set(m.related));
      expect(exact.map((x) => x.p)).toEqual([...m.exact].map((x) => x.p).sort((a, b) => (a - b) * dir));
      expect(m.related.some((x) => x.source !== "ru")).toBe(false);
    });
  }
});

describe("A01 Russell 0R957M0 collar sizes", () => {
  it("formats distinct codes but keeps raw identity", () => {
    expect(supplierSizeLabel("ru", "0R957M0", "S1", "lv")).toBe("S · apkakle 15″ (S1)");
    expect(supplierSizeLabel("ru", "0R957M0", "S2", "en")).toBe("S · collar 14.5″ (S2)");
    expect(supplierSizeLabel("ru", "0R957M0", "3X2", "en")).toBe("3XL · collar 19″ (3X2)");
    expect(supplierSizeLabel("ru", "0R957F0", "S1", "en")).toBe("S1");
    expect(supplierSizeLabel("mf", "0R957M0", "S1", "en")).toBe("S1");
    const base = { source: "ru", productId: "0R957M0", colorCode: "Black" };
    expect(sameCartVariant({ ...base, size: "S1" }, { ...base, size: "S2" })).toBe(false);
    expect(sameCartVariant({ ...base, size: "S1" }, JSON.parse(JSON.stringify({ ...base, size: "S1" })))).toBe(true);
    expect(JSON.parse(JSON.stringify({ size: "S1" })).size).toBe("S1");
  });
});

describe("A08 header search loader", () => {
  const ok = (data: unknown[]) => ({ data, error: null, count: data.length });
  it("rejects on a failed page, then succeeds on retry and caches", async () => {
    let fail = true;
    const fetchPage = vi.fn(async (table: string) => {
      if (table === "catalog_items") return fail ? { data: null, error: new Error("timeout") } : ok([{ source: "ru", id: "0R957M0", name: "Shirt" }]);
      return ok([{ source: "ru", style_code: "0R957M0", min_price: 10 }]);
    });
    const loader = createRowsLoader({ readCache: async () => null, fetchPage, fetchRemnants: async () => ok([]) });
    await expect(loader.load()).rejects.toThrow();
    fail = false;
    expect((await loader.load()).map((r) => r.id)).toEqual(["0R957M0"]);
    const calls = fetchPage.mock.calls.length;
    await loader.load();
    expect(fetchPage.mock.calls.length).toBe(calls);
  });
  it("rejects when remnants fail and returns valid empty results", async () => {
    const bad = createRowsLoader({ readCache: async () => ({ items: [], prices: [] }), fetchPage: async () => ok([]), fetchRemnants: async () => ({ data: null, error: new Error("x") }) });
    await expect(bad.load()).rejects.toThrow();
    const empty = createRowsLoader({ readCache: async () => ({ items: [], prices: [] }), fetchPage: async () => ok([]), fetchRemnants: async () => ok([]) });
    expect(await empty.load()).toEqual([]);
  });
});

import { thumbCandidates } from "@/components/HeaderSearch";
describe("A03 header thumbnail same-row fallback", () => {
  it("tries main proxy, main, then same-model hover; bounded and deduped", () => {
    const main = "https://cdn.fruitoftheloom.eu/resources/images/product/0R957M/36/large/64070.jpg";
    const hover = "https://cdn.fruitoftheloom.eu/resources/images/product/0R957M/BZ/large/64037.jpg";
    const list = thumbCandidates([main, hover]);
    expect(list.length).toBe(4);
    expect(list[1]).toBe(main);
    expect(list[3]).toBe(hover);
    expect(thumbCandidates([main, main]).length).toBe(2);
    expect(thumbCandidates([null, undefined])).toEqual([]);
  });
});
