import { expect, it } from "vitest";
import { exactCodeHits, prepareQuery, searchScore } from "./catalogSearch";
it("digits", () => {
  const q = prepareQuery("169");
  const a = searchScore({ id: "STTU169", name: "Creator" }, q);
  const b = searchScore({ id: "STTU1690", name: "X" }, q);
  const c = searchScore({ id: "AB2169", name: "Y" }, q);
  expect(a > b && b > c && c > 0).toBe(true);
});

it("digits-only query keeps several codes and ranks the Stanley/Stella style first with tie-break", () => {
  const q = prepareQuery("169");
  expect(searchScore({ id: "STTU169", name: "Creator" }, q)).toBe(searchScore({ id: "169", name: "Fit-T LS" }, q));
});
it("digits-only query never narrows to one exact code", () => {
  expect(exactCodeHits([{ id: "169" }, { id: "STTU169" }], prepareQuery("169"))).toBeNull();
});
it("full letter code narrows to that product", () => {
  expect(exactCodeHits([{ id: "169" }, { id: "STTU169" }], prepareQuery("sttu169"))?.size).toBe(1);
});
