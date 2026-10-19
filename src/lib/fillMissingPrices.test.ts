import { describe, expect, it } from "vitest";
import { fillMissingPrices } from "./fillMissingPrices";

const bagRows = [
  { color_code: "Fire Red", size: null, retail_price: 2.63 },
  { color_code: "Black", size: null, retail_price: 2.63 },
];

describe("fillMissingPrices", () => {
  it("bag without size gets the supplier price instead of 0", async () => {
    const [line] = await fillMissingPrices(
      [{ source: "bb", productId: "B45", colorName: "Fire Red", size: null, unitPrice: null }],
      async () => bagRows,
    );
    expect(line.unitPrice).toBe(2.63);
  });

  it("keeps a price that is already set", async () => {
    const [line] = await fillMissingPrices(
      [{ source: "bb", productId: "B45", colorName: "Black", size: null, unitPrice: 5 }],
      async () => bagRows,
    );
    expect(line.unitPrice).toBe(5);
  });

  it("sized product picks the price of the exact size", async () => {
    const [line] = await fillMissingPrices(
      [{ source: "ss", productId: "X", colorCode: "C001", size: "XL", unitPrice: 0 }],
      async () => [
        { color_code: "C001", size: "S", retail_price: 10 },
        { color_code: "C001", size: "XL", retail_price: 12 },
      ],
    );
    expect(line.unitPrice).toBe(12);
  });

  it("unit price is the single quantity=1 price for 1, 10 and 100 pieces", async () => {
    const rows = [{ color_code: "C001", size: "M", retail_price: 6.39 }];
    const lines = [1, 10, 100].map((qty) => ({ source: "ss", productId: "X", colorCode: "C001", size: "M", qty, unitPrice: 0 }));
    const out = await fillMissingPrices(lines, async () => rows);
    expect(out.map((l) => l.unitPrice)).toEqual([6.39, 6.39, 6.39]);
  });
});
