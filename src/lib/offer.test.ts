import { describe, expect, it } from "vitest";
import { itemDiscountNet, itemGoodsNet, itemTotalNet, offerTotals, type OfferItem } from "./offer";

const item: OfferItem = { id: "a", source: "ss", productId: "STTU169", name: "Creator", code: "STTU169", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 10, unitPrice: 20 };

describe("individual offer discounts", () => {
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