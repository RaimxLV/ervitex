import { describe, expect, it } from "vitest";
import { isMalfiniOutlet, isMalfiniNomenclatureOutlet, malfiniUnitPrices, parseUttOutlet } from "./supplierFlags.ts";

it("MF1394412 supplier outlet=10 is promotion metadata, not normal-price proof", () => {
  expect(isMalfiniNomenclatureOutlet({ outlet: 10 })).toBe(true);
  expect(isMalfiniNomenclatureOutlet({ outlet: null })).toBe(false);
  expect(isMalfiniNomenclatureOutlet({ outlet: 0 })).toBe(false);
});

describe("malfiniUnitPrices", () => {
  it("uses only the quantity=1 tier, never a cheaper bulk tier", () => {
    const m = malfiniUnitPrices([
      { productSizeCode: "A", limit: 100, price: 3 },
      { productSizeCode: "A", limit: 1, price: 4 },
      { productSizeCode: "A", limit: 10, price: 3.5 },
    ]);
    expect(m.get("A")?.price).toBe(4);
  });
  it("SKU with only bulk tiers stays unpriced", () => {
    expect(malfiniUnitPrices([{ productSizeCode: "B", limit: 50, price: 2 }]).has("B")).toBe(false);
  });
  it("conflicting single-piece prices stay unpriced, not MIN", () => {
    expect(malfiniUnitPrices([
      { productSizeCode: "C", limit: 1, price: 2 },
      { productSizeCode: "C", limit: 1, price: 3 },
    ]).has("C")).toBe(false);
  });
  it("missing limit is not treated as quantity 1", () => {
    expect(malfiniUnitPrices([{ productSizeCode: "D", price: 2 }]).has("D")).toBe(false);
  });
});

describe("isMalfiniOutlet", () => {
  it("detects OUTLET by name or code", () => {
    expect(isMalfiniOutlet({ categoryName: "OUTLET", categoryCode: "outlet" })).toBe(true);
    expect(isMalfiniOutlet({ categoryName: "Outlet" })).toBe(true);
    expect(isMalfiniOutlet({ categoryName: "T-shirts", categoryCode: "tshirts" })).toBe(false);
  });
});

describe("parseUttOutlet", () => {
  it("reads integer and string 0/1", () => {
    expect(parseUttOutlet(1, "x")).toBe(true);
    expect(parseUttOutlet(0, "x")).toBe(false);
    expect(parseUttOutlet("1", "x")).toBe(true);
  });
  it.each([null, undefined, "", "yes", 2, true])("rejects %p instead of silently false", (v) => {
    expect(() => parseUttOutlet(v, "x")).toThrow(/unrecognised/);
  });
});
