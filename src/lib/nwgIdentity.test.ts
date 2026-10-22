import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/client", () => ({ supabase: {} }));
import { nwgSkuVariants, nwgColorLabel } from "./nwgIdentity";
import { catalogColorPrice, lowestPriceVariant } from "./catalogPriceSelection";

const variant = (item: string, code: string, name: string | null = null) => ({
  product_number: "1907087", item_number: item, color_code: code, color_name: name,
  shade_color: null, main_picture_url: `${item}.jpg`,
});
describe("NWG exact SKU identity", () => {
  it("1907087 selects the real 000 item, image and price, not orphan Unicolor 0000", () => {
    const real = variant("1907087-000", "000");
    const selected = nwgSkuVariants([variant("1907087-0000", "0000", "Unicolor"), real],
      [{ product_number: "1907087", item_number: real.item_number, sku: "1907087-000-110" }]);
    expect(selected).toEqual([real]);
    expect(nwgColorLabel(real)).toBe("000");
    const colors = selected.map(v => ({ code: v.item_number, name: nwgColorLabel(v) }));
    expect(lowestPriceVariant([{ color_code: "000", size: "110/116", retail_price: 82.5 }], colors))
      .toEqual({ color: "1907087-000", size: "110/116", price: 82.5 });
    expect(Number((82.5 * 1.21).toFixed(2))).toBe(99.83);
  });
  it("does not alias nearby distinct zero codes or cross-model items", () => {
    const real = variant("1907087-000", "000");
    const other = variant("1907087-0000", "0000", "Unicolor");
    expect(nwgSkuVariants([real, other], [{ product_number: "different", item_number: real.item_number, sku: "x" }])).toEqual([]);
    expect(nwgSkuVariants([real, other], [real, other].map(v => ({ ...v, sku: `${v.item_number}-110` })))).toEqual([real, other]);
    expect(catalogColorPrice(new Map([["nwg:1907087:000", { price: 82.5 }]]), "nwg", "1907087", { c: other.item_number })).toBeUndefined();
  });
  it("does not manufacture a SKU for an orphan or remove zero-stock real SKUs", () => {
    const real = variant("1907087-000", "000");
    expect(nwgSkuVariants([real], [])).toEqual([]);
    expect(nwgSkuVariants([real], [{ product_number: "1907087", item_number: real.item_number, sku: "1907087-000-110", availability: 0 }])).toEqual([real]);
  });
});