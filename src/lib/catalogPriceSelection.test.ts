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
  it.each(["White", " white ", "balts", "balta", "Off White", "Soft White", "Vintage White", "Natural", "natural", "Natural Raw"])("excludes the exact starting-colour equivalent %s", (name) => {
    expect(isExcludedStartingColor(name)).toBe(true);
    expect(lowestPriceColorIndex([{ name, p: 3 }, { name: "Black", p: 7 }], (c) => c.p)).toBe(1);
  });
  it.each(["Black/White", "Natural/Black", "Natural Stone", "White Sand"])("does not broadly exclude %s", (name) => {
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
  it("STSK180 child numeric size and baby B2 size retain exact colour price", () => {
    const prices = new Map([["ss:STSK180:c089", 19.25], ["ss:STSK180:c002", 19.25], ["ss:STSB920:c149", 11.38]]);
    expect(catalogColorPrice(prices, "ss", "STSK180", { c: "STSK180C08903", n: "Aloe" })).toBe(19.25);
    expect(catalogColorPrice(prices, "ss", "STSK180", { c: "STSK180C00212", n: "Black" })).toBe(19.25);
    expect(catalogColorPrice(prices, "ss", "STSB920", { c: "STSB920C149B2", n: "Blue Soul" })).toBe(11.38);
    expect(lowestPriceVariant([{ color_code: "C089", size: "3-4/98-104cm", retail_price: 19.25 }], [{ code: "C089", name: "Aloe" }], {}, "STSK180C08903")).toEqual({ color: "C089", size: "3-4/98-104cm", price: 19.25 });
    expect(Number((19.25 * 1.21).toFixed(2))).toBe(23.29);
  });
  it("detail default excludes Natural just like cards, but explicit unpriced colour stays unpriced", () => {
    const colors = [{ code: "C054", name: "Natural Raw" }, { code: "C002", name: "Black" }, { code: "C089", name: "Aloe" }];
    const rows = [{ color_code: "C054", size: "M", retail_price: 5 }, { color_code: "C002", size: "M", retail_price: 7 }];
    expect(lowestPriceVariant(rows, colors).color).toBe("C002");
    expect(lowestPriceVariant(rows, colors, {}, "C089").price).toBeNull();
    expect(lowestPriceVariant([{ color_code: "C002", size: "M", retail_price: 0 }], colors).price).toBeNull();
  });
  it("Aloe STTU169C0891L matches price colour C089, not White C001", () => {
    expect(colorCodeMatches("STTU169C0891L", "C089")).toBe(true);
    expect(colorCodeMatches("STTU169C0891L", "C001")).toBe(false);
    expect(colorCodeMatches("STTU169C0021L", "C002")).toBe(true);
  });
});

import { catalogColorPrice } from "./catalogPriceSelection";
describe("catalogColorPrice", () => {
  const p = (e: [string, number][]) => new Map(e);
  it("RU model-wide colourless price applies to named colours", () => {
    expect(catalogColorPrice(p([["ru:0R013M0:", 12]]), "ru", "0R013M0", { c: null, n: "Black" })).toBe(12);
  });
  it("colourless price is not borrowed by non-model-wide sources", () => {
    expect(catalogColorPrice(p([["ss:STTU169:", 6]]), "ss", "STTU169", { c: "C999" })).toBeUndefined();
  });
  it("MF exact colour incl. leading zero and letter codes", () => {
    const m = p([["mf:174:21", 5], ["mf:174:00", 4], ["mf:S30:b5", 9], ["mf:T21:tc", 7]]);
    expect(catalogColorPrice(m, "mf", "174", { c: "1742112" })).toBe(5);
    expect(catalogColorPrice(m, "mf", "174", { c: "1740012" })).toBe(4);
    expect(catalogColorPrice(m, "mf", "S30", { c: "S30B539" })).toBe(9);
    expect(catalogColorPrice(m, "mf", "T21", { c: "T21TC37" })).toBe(7);
  });
  it("MF unknown colour never takes another colour's price", () => {
    expect(catalogColorPrice(p([["mf:174:21", 5]]), "mf", "174", { c: "1749912" })).toBeUndefined();
  });
});
