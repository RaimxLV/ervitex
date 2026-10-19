import { describe, expect, it } from "vitest";
import { isExcludedStartingColor, lowestPriceColorIndex, lowestPriceVariant } from "./catalogPriceSelection";

const colors = [{ code: "020-99", name: "Black" }, { code: "020-00", name: "White" }];
const rows = [
  { color_code: "99", size: "4", retail_price: 12 },
  { color_code: "00", size: "5", retail_price: 8 },
  { color_code: "00", size: "4", retail_price: 10 },
  { color_code: "99", size: "5", retail_price: 0 },
];
describe("lowest initial catalog price", () => {
  it("keeps an explicitly chosen colour", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" }, "020-99")).toEqual({ color: "020-99", size: "S", price: 12 });
  });
  it("keeps an explicitly chosen size", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" }, "020-00", "S")).toEqual({ color: "020-00", size: "S", price: 10 });
  });
  it("starts a card on the cheapest priced colour, ignoring zero", () => {
    expect(lowestPriceColorIndex([0, 12, 8, 10], (price) => price)).toBe(2);
  });
});
describe("white colour excluded from starting price", () => {
  it("skips white on cards", () => {
    expect(lowestPriceColorIndex([{ n: "White", p: 5 }, { n: "Black", p: 7 }], (c) => c.p)).toBe(1);
  });
  it("falls back to white when it is the only priced colour", () => {
    expect(lowestPriceColorIndex([{ n: "White", p: 5 }, { n: "Black", p: 0 }], (c) => c.p)).toBe(0);
  });
  it("skips white in the product view default", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" })).toEqual({ color: "020-99", size: "S", price: 12 });
  });
});

import { colorCodeMatches } from "@/lib/colorCodeMatch";
describe("card starting colour excludes White and Natural only", () => {
  it("selects cheapest allowed colour, not second entry or in-stock-only colour", () => {
    const options = [
      { name: "White", price: 3, stock: 20 },
      { name: "Natural", price: 4, stock: 20 },
      { name: "Red", price: 9, stock: 10 },
      { name: "Black", price: 7, stock: 0 },
      { name: "Blue", price: 0, stock: 10 },
    ];
    expect(lowestPriceColorIndex(options, (c) => c.price)).toBe(3);
  });
  it("falls back to cheapest positive White/Natural without hiding the model", () => {
    expect(lowestPriceColorIndex([{ n: "White", p: 5 }, { n: "Natural", p: 3 }], (c) => c.p)).toBe(1);
  });
  it("ignores unpriced excluded variants in fallback", () => {
    expect(lowestPriceColorIndex([{ n: "White", p: 0 }, { n: "Natural", p: 3 }], (c) => c.p)).toBe(1);
  });
  it.each(["White", " white ", "balts", "balta", "Natural", "natural", "Natural Raw"])("excludes the exact starting-colour equivalent %s", (name) => {
    expect(isExcludedStartingColor(name)).toBe(true);
    expect(lowestPriceColorIndex([{ name, p: 3 }, { name: "Black", p: 7 }], (c) => c.p)).toBe(1);
  });
  it.each(["Black/White", "Natural/Black", "Natural Stone", "Off White", "White Sand"])("does not broadly exclude %s", (name) => {
    expect(isExcludedStartingColor(name)).toBe(false);
    expect(lowestPriceColorIndex([{ name, p: 3 }, { name: "Black", p: 7 }], (c) => c.p)).toBe(0);
  });
  it.each(["White", "Natural", "Natural Raw"])("preserves manually requested %s and its actual price", (name) => {
    const colors = [{ code: "chosen", name }, { code: "black", name: "Black" }];
    const rows = [{ color_code: "chosen", size: "M", retail_price: 3 }, { color_code: "black", size: "M", retail_price: 7 }];
    expect(lowestPriceVariant(rows, colors, {}, "chosen", "M")).toEqual({ color: "chosen", size: "M", price: 3 });
  });
  it("returns no choice for zero, negative or non-finite prices", () => {
    expect(lowestPriceColorIndex([0, -1, NaN, Infinity], (p) => p)).toBe(-1);
  });
});

describe("SS colour codes", () => {
  it("Aloe STTU169C0891L matches price colour C089, not White C001", () => {
    expect(colorCodeMatches("STTU169C0891L", "C089")).toBe(true);
    expect(colorCodeMatches("STTU169C0891L", "C001")).toBe(false);
    expect(colorCodeMatches("STTU169C0021L", "C002")).toBe(true);
  });
});
