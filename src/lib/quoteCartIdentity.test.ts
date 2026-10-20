import { expect, it } from "vitest";
import { sameCartVariant } from "./quoteCartIdentity";
const row = { source: "mf", productId: "169", colorCode: "01", size: "M" };
it("cart merges only the same supplier, model, color and size", () => {
  expect(sameCartVariant(row, { ...row })).toBe(true);
  for (const other of [{ ...row, source: "ss" }, { ...row, productId: "170" }, { ...row, colorCode: "02" }, { ...row, size: "L" }]) expect(sameCartVariant(row, other)).toBe(false);
});