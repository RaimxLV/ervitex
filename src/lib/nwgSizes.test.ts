import { describe, expect, it } from "vitest";
import { nwgDuplicateSizeLabels } from "./nwgSizes";

describe("nwgDuplicateSizeLabels", () => {
  it("flags only labels shared by two size codes (649066 S/M = 4 and 5)", () => {
    const rows = [
      { item: "649066-99", code: "4", label: "S/M" },
      { item: "649066-99", code: "5", label: "S/M" },
      { item: "649066-99", code: "6", label: "L/XL" },
      { item: "649066-99", code: "7", label: "L/XL" },
      { item: "1234-10", code: "4", label: "S" },
      { item: "1234-10", code: "5", label: "M" },
    ];
    expect([...nwgDuplicateSizeLabels(rows)].sort()).toEqual(["L/XL", "S/M"]);
  });
  it("same code repeated is not a duplicate", () => {
    expect(nwgDuplicateSizeLabels([{ item: "a", code: "4", label: "S" }, { item: "a", code: "4", label: "S" }]).size).toBe(0);
  });
});

import { lowestPriceVariant } from "./catalogPriceSelection";
import { withSkuSizes } from "./nwgSizes";

describe("NWG duplicate size selection (649066)", () => {
  const rows = [
    { sku: "649066-99-4", color_code: "649066-99", size: "S/M", retail_price: 15.3, currency: "EUR" },
    { sku: "649066-99-5", color_code: "649066-99", size: "S/M", retail_price: 16.83, currency: "EUR" },
  ];
  const skuSizes = { "649066-99-4": "S/M (4)", "649066-99-5": "S/M (5)" };
  const colors = [{ code: "649066-99", name: "Black" }];
  it("initial size is the cheapest SKU's own label, not the shared name", () => {
    const s = lowestPriceVariant(withSkuSizes(rows, skuSizes) as any, colors as any);
    expect(s.size).toBe("S/M (4)");
    expect(s.price).toBe(15.3);
  });
  it("each duplicate option keeps its own SKU price", () => {
    expect(lowestPriceVariant(withSkuSizes(rows, skuSizes) as any, colors as any, {}, null, "S/M (5)").price).toBe(16.83);
    expect(lowestPriceVariant(withSkuSizes(rows, skuSizes) as any, colors as any, {}, null, "S/M (4)").price).toBe(15.3);
  });
});
