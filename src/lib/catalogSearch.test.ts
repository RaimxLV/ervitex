import { expect, it } from "vitest";
import { keywordMatch, exactCodeHits, prepareQuery, rankedSearchResults, searchMatches, searchScore, codeParts } from "./catalogSearch";
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
const catalog = [
  { id: "STTU169", source: "ss", name: "Creator 2.0" },
  { id: "STTU168", source: "ss", name: "Creator 2.0 Kids" },
  { id: "STTU170", source: "ss", name: "Sparker" },
  { id: "STTU171", source: "ss", name: "Far" },
  { id: "STTU172", source: "ss", name: "Too far" },
  { id: "STSU168", source: "ss", name: "Drummer 2.0" },
  { id: "169", source: "mf", name: "Fit-T LS", colors: [{ c: "1694412" }] },
  { id: "170", source: "mf", name: "Malfini 170" },
  { id: "14169", source: "utt", name: "Regatta 14169" },
  { id: "RG168", source: "utt", name: "Regatta 168" },
  { id: "1694412", source: "other", name: "Unrelated" },
];
it("169 finds exact numeric component, never substring 14169 or 1694412", () => {
  const m = searchMatches(catalog, prepareQuery("169"));
  expect(ids(m.exact)).toEqual(["STTU169", "169"]);
  expect(ids(m.related)).not.toContain("14169");
  expect(ids(m.related)).not.toContain("1694412");
});
it("lowercase and spaced full code returns STTU169 as only exact, with same-family related", () => {
  for (const q of ["sttu169", " STTU-169 "]) {
    const m = searchMatches(catalog, prepareQuery(q));
    expect(ids(m.exact)).toEqual(["STTU169"]);
    expect(ids(m.related)).toEqual(["STTU168", "STTU170", "STTU171", "STTU172"]);
  }
});
it("169: only the top anchor STTU169 drives related codes; Malfini 169 stays exact, Malfini 171 excluded", () => {
  const items = [...catalog, { id: "171", source: "mf", name: "Origin" }];
  const m = searchMatches(items, prepareQuery("169"));
  expect(ids(m.exact)).toEqual(["STTU169", "169"]);
  expect(ids(m.related)).toEqual(["STTU168", "STTU170", "STTU171", "STTU172"]);
  expect(ids(m.related)).not.toContain("171");
  expect(ids(m.related)).not.toContain("170");
  expect(ids(m.related)).not.toContain("STSU168");
  expect(ids(m.related)).not.toContain("RG168");
});
it("±5 window includes visible STTU165, nearest four by distance then code", () => {
  const items = ["STTU169", "STTU165", "STTU170", "STTU175", "STTU163"].map((id) => ({ id, source: "ss" }));
  expect(ids(searchMatches(items, prepareQuery("169")).related)).toEqual(["STTU170", "STTU165"]);
});
it("no exact anchor → no numeric neighbours at all", () => {
  const items = catalog.filter((i) => !["STTU169", "169"].includes(i.id));
  const m = searchMatches(items, prepareQuery("169"));
  expect(m.exact).toEqual([]);
  expect(m.related).toEqual([]);
});
it("hidden products (not in visible list) are never anchors or neighbours", () => {
  const visible = catalog.filter((i) => i.id !== "STTU168");
  expect(ids(rankedSearchResults(visible, prepareQuery("169")))).not.toContain("STTU168");
});
it("menu and catalog order is identical regardless of input order", () => {
  expect(rankedSearchResults([...catalog].reverse(), prepareQuery("169"))).toEqual(rankedSearchResults(catalog, prepareQuery("169")));
});
it("four-digit query excludes longer codes and keeps same family neighbour", () => {
  const items = ["AB1672", "AB1673", "AB167200", "AB131672"].map((id) => ({ id }));
  expect(ids(rankedSearchResults(items, prepareQuery("1672")))).toEqual(["AB1672", "AB1673"]);
});
it("leading zeros must match length", () => {
  expect(searchScore({ id: "AB0167" }, prepareQuery("167"))).toBe(0);
  expect(searchScore({ id: "AB0167" }, prepareQuery("0167"))).toBeGreaterThan(0);
});
it("ordinary text search still works", () => {
  const items = [{ id: "X1", name: "Hooded sweatshirt" }, { id: "X2", name: "Apron" }];
  expect(ids(rankedSearchResults(items, prepareQuery("hudijs")))).toEqual(["X1"]);
  expect(ids(rankedSearchResults(items, prepareQuery("priekšauts")))).toEqual(["X2"]);
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
it("6400 finds real Gildan 64000 codes, never 64001/16400 substrings", () => {
  const items = [
    { id: "GI64000", source: "utt", name: "Softstyle Adult T-Shirt" },
    { id: "GIB64000", source: "utt", name: "Softstyle Youth T-Shirt" },
    { id: "GIL64000", source: "utt", name: "Softstyle Ladies T-Shirt" },
    { id: "GIL64000-EX", source: "utt", name: "Softstyle Ladies T-Shirt" },
    { id: "GI64001", source: "utt", name: "Other" },
    { id: "GI16400", source: "utt", name: "Other" },
    { id: "126400", source: "pf", name: "Glass cups" },
  ];
  const m = searchMatches(items, prepareQuery("6400"));
  expect(ids(m.exact)).toEqual(["GI64000", "GIB64000", "GIL64000", "GIL64000-EX"]);
  expect(m.related).toEqual([]);
});
it("no general zero expansion: 640↛64000, 5↛500, 169↛1690; leading zeros still strict", () => {
  expect(searchScore({ id: "GI64000" }, prepareQuery("640"))).toBe(0);
  expect(searchScore({ id: "B500" }, prepareQuery("5"))).toBe(0);
  expect(searchScore({ id: "STTU1690" }, prepareQuery("169"))).toBe(0);
  expect(searchScore({ id: "AB0167" }, prepareQuery("167"))).toBe(0);
  expect(searchScore({ id: "AB0167" }, prepareQuery("0167"))).toBeGreaterThan(0);
  expect(searchScore({ id: "GI64200" }, prepareQuery("6400"))).toBe(0);
});
it("exact 64000 still finds the Gildan family directly", () => {
  const items = [
    { id: "GI64000", source: "utt", name: "Softstyle Adult T-Shirt" },
    { id: "GIL64000-EX", source: "utt", name: "Softstyle Ladies T-Shirt" },
    { id: "GI64001", source: "utt", name: "Other" },
  ];
  expect(ids(searchMatches(items, prepareQuery("64000")).exact)).toEqual(["GI64000", "GIL64000-EX"]);
});
it("shorthand requires normalized UTT source and exact GI/GIB/GIL prefix", () => {
  for (const source of [undefined, "ss", "pf", "other", "utt-extra"]) expect(searchScore({ id: "GI64000", source }, prepareQuery("6400"))).toBe(0);
  for (const id of ["XGI64000", "GIX64000", "GIBA64000", "GILL64000", "AB64000"]) expect(searchScore({ id, source: "utt" }, prepareQuery("6400"))).toBe(0);
  expect(searchScore({ id: " gil64000-ex ", source: " UTT " }, prepareQuery(" 6400 "))).toBeGreaterThan(0);
});
it("uses token metadata, not four hardcoded IDs; leading zeros remain strict", () => {
  expect(searchScore({ id: "GI12340", source: "utt" }, prepareQuery("1234"))).toBeGreaterThan(0);
  expect(searchScore({ id: "GIB12340-EX", source: "utt" }, prepareQuery("1234"))).toBeGreaterThan(0);
  expect(searchScore({ id: "GI12341", source: "utt" }, prepareQuery("1234"))).toBe(0);
  expect(searchScore({ id: "GI123400", source: "utt" }, prepareQuery("1234"))).toBe(0);
  expect(searchScore({ id: "GI01230", source: "utt" }, prepareQuery("0123"))).toBeGreaterThan(0);
  expect(searchScore({ id: "GI01230", source: "utt" }, prepareQuery("123"))).toBe(0);
});
it("rejects extra numeric tokens and prohibited expansions even for UTT", () => {
  for (const id of ["GI64001", "GI16400", "GI640001", "GI64000-1", "GI64000-EX2", "GI6400-0", "GI64000.0"]) expect(searchScore({ id, source: "utt" }, prepareQuery("6400"))).toBe(0);
  expect(codeParts("GIL64000-EX")).toEqual({ prefix: "gil", digits: "64000", suffix: "ex" });
  for (const [id, query] of [["GI64000", "640"], ["GI00500", "5"], ["GI1690", "169"]]) expect(searchScore({ id, source: "utt" }, prepareQuery(query))).toBe(0);
});
it("shorthand never drives related-code suggestions", () => {
  const items = ["GI64000", "GI64001", "GI64002"].map((id) => ({ id, source: "utt" }));
  expect(searchMatches(items, prepareQuery("6400")).related).toEqual([]);
});
it("169 behavior preserved: exact STTU169 first, same-family related only", () => {
  const m = searchMatches(catalog, prepareQuery("169"));
  expect(ids(m.exact)).toEqual(["STTU169", "169"]);
  expect(ids(m.related)).toEqual(["STTU168", "STTU170", "STTU171", "STTU172"]);
});
it("filter keywords: priekšauts finds Aprons, T-krekls finds T-shirts", () => {
  expect(keywordMatch("Aprons", "Priekšauts")).toBe(true);
  expect(keywordMatch("T-shirts", "T-krekls")).toBe(true);
  expect(keywordMatch("Aprons", "T-krekls")).toBe(false);
});
it("Russell 957 / R957 finds 0R957M0 and 0R957F0 by exact numeric core only", () => {
  const items = [
    { id: "0R957M0", source: "ru", name: "Men's Shirt" },
    { id: "0R957F0", source: "ru", name: "Ladies' Shirt" },
    { id: "0R9570M0", source: "ru", name: "Other" },
    { id: "0R1957M0", source: "ru", name: "Other" },
    { id: "R957", source: "pf", name: "Not Russell" },
    { id: "957", source: "mf", name: "Malfini 957" },
  ];
  for (const q of ["957", "R957", "r 957"]) {
    const ex = ids(searchMatches(items, prepareQuery(q)).exact);
    expect(ex).toContain("0R957M0");
    expect(ex).toContain("0R957F0");
    expect(ex).not.toContain("0R9570M0");
    expect(ex).not.toContain("0R1957M0");
  }
  expect(ids(searchMatches(items, prepareQuery("95")).exact)).toEqual([]);
  expect(codeParts("0R957M0")).toBeNull();
  expect(codeParts("0R957M0", "ru")).toEqual({ prefix: "r", digits: "957", suffix: "m" });
});
