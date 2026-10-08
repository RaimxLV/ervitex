import { expect, it } from "vitest";
import { keywordMatch, exactCodeHits, prepareQuery, searchScore } from "./catalogSearch";
it("digits", () => {
  const q = prepareQuery("169");
  const a = searchScore({ id: "STTU169", name: "Creator" }, q);
  const b = searchScore({ id: "STTU1690", name: "X" }, q);
  const c = searchScore({ id: "AB2169", name: "Y" }, q);
  expect(a > b && b > c && c > 0).toBe(true);
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
