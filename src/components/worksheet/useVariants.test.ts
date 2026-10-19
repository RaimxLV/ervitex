import { describe, expect, it } from "vitest";
import { priceForVariant, sizesForColor } from "./useVariants";

const rows = [
  { color_code: "C001", size: "S", retail_price: 6.39 },
  { color_code: "C001", size: "M", retail_price: 6.39 },
  { color_code: "C089", size: "M", retail_price: 6.91 },
];

describe("priceForVariant", () => {
  it("returns the exact colour and size price", () => {
    expect(priceForVariant("ss", rows, "C089", "M").price).toBe(6.91);
  });
  it("never borrows another colour's cheaper price", () => {
    expect(priceForVariant("ss", rows, "C999", "M").price).toBeNull();
  });
  it("never borrows another size of the same colour", () => {
    expect(priceForVariant("ss", rows, "C089", "S").price).toBeNull();
  });
  it("without a colour on a coloured model returns null instead of the minimum", () => {
    expect(priceForVariant("ss", rows, null, "M").price).toBeNull();
  });
  it("allows a colourless model-wide price only for model-wide sources", () => {
    const wide = [{ color_code: null, size: null, retail_price: 12 }];
    expect(priceForVariant("ru", wide, "Black", "M").price).toBe(12);
    expect(priceForVariant("etx", wide, null, null).price).toBe(12);
    expect(priceForVariant("ss", wide, "Black", "M").price).toBeNull();
  });
  it("conflicting prices for one combination give null, not the minimum", () => {
    const dup = [
      { color_code: "Black", size: "M", retail_price: 5 },
      { color_code: "Black", size: "M", retail_price: 7 },
    ];
    expect(priceForVariant("utt", dup, "Black", "M").price).toBeNull();
  });
});

describe("sizesForColor", () => {
  it("lists only sizes of the chosen colour", () => {
    expect(sizesForColor("ss", rows, "C089")).toEqual([{ size: "M", raw: "M", price: 6.91 }]);
  });
  it("unknown colour shows no sizes from other colours", () => {
    expect(sizesForColor("ss", rows, "C999")).toEqual([]);
  });
  it("without colour lists sizes but no cross-colour price", () => {
    expect(sizesForColor("ss", rows, null).map((s) => s.price)).toEqual([null, null]);
  });
});
