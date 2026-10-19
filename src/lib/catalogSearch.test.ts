import { expect, it } from "vitest";
import { keywordMatch, exactCodeHits, prepareQuery, rankedSearchResults, searchScore } from "./catalogSearch";
it("169 searches model identities, not Malfini colour/size SKUs", () => {
  const items = [
    { id: "169", source: "mf", name: "Fit-T LS", colors: [{ c: "1694412" }] },
    { id: "STTU169", source: "ss", name: "Creator 2.0", colors: [{ c: "STTU169C0891L" }] },
    { id: "STSU168", source: "ss", name: "Drummer 2.0", colors: [] },
    { id: "1694412", source: "other", name: "Unrelated model", colors: [] },
    { id: "134169", source: "other", name: "Unrelated model", colors: [] },
  ];
  expect(rankedSearchResults(items, prepareQuery("169")).map(item => item.id))
    .toEqual(["STTU169", "169", "STSU168"]);
  expect(rankedSearchResults(items, prepareQuery("1694412")).map(item => item.id))
    .toEqual(["1694412"]);
});
it("menu and catalog rank 167 identically regardless of candidate input order", () => {
  const items = ["STTU169", "STTU168", "STTU167", "134167", "16724", "AB168"].map(id => ({ id, source: id.startsWith("STTU") ? "ss" : "other" }));
  const menu = rankedSearchResults(items, prepareQuery("167"));
  const catalog = rankedSearchResults([...items].reverse(), prepareQuery("167"));
  expect(menu.map(i => i.id)).toEqual(["STTU167", "STTU168", "STTU169", "AB168"]);
  expect(catalog).toEqual(menu);
});
it("both search surfaces keep only the exact full STTU167 code", () => {
  const items = ["STTU169", "STTU167", "STTU1670"].map(id => ({ id }));
  expect(rankedSearchResults(items, prepareQuery("STTU167")).map(i => i.id)).toEqual(["STTU167"]);
});
it("shared results for four digits exclude longer codes", () => {
  const items = ["AB1672", "AB1673", "AB167200", "AB131672"].map(id => ({ id }));
  expect(rankedSearchResults(items, prepareQuery("1672")).map(i => i.id)).toEqual(["AB1672", "AB1673"]);
});
it("167 finds complete three-digit codes 167, 168 and 169 in relevance order", () => {
  const q = prepareQuery("167");
  const scores = ["STTU167", "STTU168", "STTU169"].map(id => searchScore({ id, source: "ss" }, q));
  expect(scores[0]).toBeGreaterThan(scores[1]);
  expect(scores[1]).toBeGreaterThan(scores[2]);
  expect(scores[2]).toBeGreaterThan(0);
});
it("167 excludes 134167 and 16724 even when names contain 167", () => {
  for (const id of ["134167", "16724", "STTU1670", "AB2167", "abc-167-24"]) {
    expect(searchScore({ id, name: "167", source: "ss" }, prepareQuery("167"))).toBe(0);
  }
});
it("four-digit queries exclude six-digit codes", () => {
  const q = prepareQuery("1672");
  expect(searchScore({ id: "AB1672" }, q)).toBeGreaterThan(0);
  expect(searchScore({ id: "AB1673" }, q)).toBeGreaterThan(0);
  expect(searchScore({ id: "167200" }, q)).toBe(0);
  expect(searchScore({ id: "131672" }, q)).toBe(0);
});
it("exact numeric codes precede nearby Stanley/Stella codes", () => {
  const q = prepareQuery("167");
  expect(searchScore({ id: "167", source: "malfini" }, q)).toBeGreaterThan(searchScore({ id: "STTU168", source: "ss" }, q));
});
it("numeric neighbours are limited to two and preserve leading-zero length", () => {
  expect(searchScore({ id: "STTU170" }, prepareQuery("167"))).toBe(0);
  expect(searchScore({ id: "AB0167" }, prepareQuery("167"))).toBe(0);
  expect(searchScore({ id: "AB0167" }, prepareQuery("0167"))).toBeGreaterThan(0);
});

it("169 ranks STTU169 ahead of Malfini 169", () => {
  const q = prepareQuery("169");
  expect(searchScore({ id: "STTU169", source: "ss", name: "Creator 2.0" }, q))
    .toBeGreaterThan(searchScore({ id: "169", source: "malfini", name: "Fit-T LS" }, q));
});
it("matching Stanley/Stella products have priority over other brands", () => {
  const q = prepareQuery("krekls");
  expect(searchScore({ id: "STTU169", brand: "Stanley/Stella", name: "Creator T-shirt" }, q))
    .toBeGreaterThan(searchScore({ id: "169", brand: "Malfini", name: "Krekls" }, q));
});
it("brand priority never includes an unrelated Stella product", () => {
  expect(searchScore({ id: "STTU169", source: "ss", name: "Creator" }, prepareQuery("cepure"))).toBe(0);
});
it("digits-only query never narrows to one exact code", () => {
  expect(exactCodeHits([{ id: "169" }, { id: "STTU169" }], prepareQuery("169"))).toBeNull();
});
it("full letter code narrows to that product", () => {
  expect(exactCodeHits([{ id: "169" }, { id: "STTU169" }], prepareQuery("sttu169"))?.size).toBe(1);
});
it("an exact other-brand code still excludes Stella products", () => {
  const item = { id: "GI5000", brand: "Gildan" };
  expect([...exactCodeHits([item, { id: "STTU169", source: "ss" }], prepareQuery("GI5000")) ?? []]).toEqual([item]);
});
it("filter keywords: priekšauts finds Aprons, T-krekls finds T-shirts", () => {
  expect(keywordMatch("Aprons", "Priekšauts")).toBe(true);
  expect(keywordMatch("T-shirts", "T-krekls")).toBe(true);
  expect(keywordMatch("Aprons", "T-krekls")).toBe(false);
});
