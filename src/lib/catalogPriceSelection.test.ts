import { describe, expect, it } from "vitest";
import { lowestPriceColorIndex, lowestPriceVariant } from "./catalogPriceSelection";

const colors = [{ code: "020-99", name: "Black" }, { code: "020-00", name: "White" }];
const rows = [
  { color_code: "99", size: "4", retail_price: 12 },
  { color_code: "00", size: "5", retail_price: 8 },
  { color_code: "00", size: "4", retail_price: 10 },
  { color_code: "99", size: "5", retail_price: 0 },
];
describe("lowest initial catalog price", () => {
  it("selects the lowest positive price with its colour and size", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" })).toEqual({ color: "020-00", size: "M", price: 8 });
  });
  it("keeps an explicitly chosen colour", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" }, "020-99")).toEqual({ color: "020-99", size: "S", price: 12 });
  });
  it("keeps an explicitly chosen size", () => {
    expect(lowestPriceVariant(rows, colors, { S: "4", M: "5" }, null, "S")).toEqual({ color: "020-00", size: "S", price: 10 });
  });
  it("starts a card on the cheapest priced colour, ignoring zero", () => {
    expect(lowestPriceColorIndex([0, 12, 8, 10], (price) => price)).toBe(2);
  });
});