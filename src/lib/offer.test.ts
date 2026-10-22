import { describe, expect, it } from "vitest";
import { itemDiscountNet, itemUnitDiscountNet, itemUnitPriceNet, itemGoodsNet, itemTotalNet, offerTotals, type OfferItem } from "./offer";

const item: OfferItem = { id: "a", source: "ss", productId: "STTU169", name: "Creator", code: "STTU169", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 10, unitPrice: 20 };

describe("individual offer discounts", () => {
  it("shows the discount per unit without changing the screenshot's line or offer totals", () => {
    const line = { ...item, qty: 2, unitPrice: 26.25, discountPercent: 10, prints: [{ method: "DTF", placement: "Priekša", price: 25 }] };
    expect(itemUnitDiscountNet(line)).toBe(2.63);
    expect(itemUnitPriceNet(line)).toBe(23.62);
    expect(itemUnitPriceNet(line) + itemUnitDiscountNet(line)).toBe(26.25);
    expect(itemUnitPriceNet(item)).toBe(20);
    expect(itemUnitDiscountNet({ ...line, qty: 10 })).toBe(2.63);
    expect(itemDiscountNet(line)).toBe(5.25);
    expect(itemGoodsNet(line)).toBe(47.25);
    expect(itemTotalNet(line)).toBe(97.25);
    expect(offerTotals([line]).gross).toBe(117.67);
  });
  it("deducts each item's chosen percentage independently", () => {
    const first = { ...item, discountPercent: 15 };
    const second = { ...item, id: "b", discountPercent: 25 };
    expect(itemDiscountNet(first)).toBe(30);
    expect(itemGoodsNet(first)).toBe(170);
    expect(itemGoodsNet(second)).toBe(150);
    expect(offerTotals([first, second]).net).toBe(320);
    expect(offerTotals([first, second]).gross).toBe(387.2);
  });
  it("keeps decoration undiscounted", () => {
    expect(itemTotalNet({ ...item, discountPercent: 15, prints: [{ method: "DTF", price: 3 }] })).toBe(200);
  });
  it("applies the existing overall discount only to remaining goods", () => {
    const totals = offerTotals([{ ...item, discountPercent: 15 }], 21, { type: "percent", value: 10 });
    expect(totals.itemDiscount).toBe(30);
    expect(totals.discount).toBe(17);
    expect(totals.net).toBe(153);
  });
  it("preserves prices on old offers with no item discount", () => {
    expect(itemDiscountNet(item)).toBe(0);
    expect(offerTotals([item]).gross).toBe(242);
  });
  it("bounds percentages to zero through one hundred", () => {
    expect(itemGoodsNet({ ...item, discountPercent: 150 })).toBe(0);
    expect(itemGoodsNet({ ...item, discountPercent: -5 })).toBe(200);
  });
  it("recalculates the euro discount for changed quantities", () => {
    expect(itemDiscountNet({ ...item, qty: 5, discountPercent: 12.5 })).toBe(12.5);
  });
});
describe("admin summary arithmetic", () => {
  it("goods before discount minus item discount equals goods after discount", () => {
    const t = offerTotals([{ ...item, discountPercent: 15 }]);
    expect(t.goods + t.itemDiscount).toBe(200);
    expect(t.goods).toBe(170);
  });
  it("0% VAT stays 0%", () => {
    expect(offerTotals([item], 0).gross).toBe(200);
  });
});
