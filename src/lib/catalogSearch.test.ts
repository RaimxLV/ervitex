import { expect, it } from "vitest";
import { prepareQuery, searchScore } from "./catalogSearch";
it("digits", () => {
  const q = prepareQuery("169");
  const a = searchScore({ id: "STTU169", name: "Creator" }, q);
  const b = searchScore({ id: "STTU1690", name: "X" }, q);
  const c = searchScore({ id: "AB2169", name: "Y" }, q);
  expect(a > b && b > c && c > 0).toBe(true);
});
