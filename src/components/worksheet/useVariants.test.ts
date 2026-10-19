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

describe("model-wide sources with mixed rows", () => {
  const mixed = [
    { color_code: null, size: null, retail_price: 12 },
    { color_code: "Black", size: null, retail_price: 15 },
  ];
  it("without colour uses only the colourless row, not coloured ones", () => {
    expect(priceForVariant("ru", mixed, null, null).price).toBe(12);
  });
  it("exact colour row wins over the colourless one", () => {
    expect(priceForVariant("ru", mixed, "Black", null).price).toBe(15);
  });
  it("unknown colour falls back only to the colourless row", () => {
    expect(priceForVariant("etx", mixed, "Red", null).price).toBe(12);
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

describe("Russell deklarētie izmēri", () => {
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const rows = [{ color_code: null, size: null, retail_price: 12.5 }];
  it("rāda 8 ru_styles izmērus ar vienu modeļa cenu", () => {
    const out = sizesForColor("ru", rows, "0R013M0-36", sizes);
    expect(out.map((r) => r.size)).toEqual(sizes);
    expect(new Set(out.map((r) => r.price))).toEqual(new Set([12.5]));
  });
  it("tukšs saraksts neizdomā izmērus", () => {
    expect(sizesForColor("ru", rows, null, []).map((r) => r.size)).toEqual(["-"]);
  });
  it("konfliktējošas cenas -> null", () => {
    const out = sizesForColor("ru", [...rows, { color_code: null, size: null, retail_price: 14 }], null, sizes);
    expect(out.every((r) => r.price === null)).toBe(true);
  });
  it("citi avoti ignorē deklarētos izmērus", () => {
    const out = sizesForColor("ss", [{ color_code: "C001", size: "M", retail_price: 9 }], "C001", sizes);
    expect(out.map((r) => r.size)).toEqual(["M"]);
  });
});
