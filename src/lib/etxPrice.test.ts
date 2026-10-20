import { describe, expect, it } from "vitest";
import { grossFromNet } from "./vat";
import { offerTotals, type OfferItem } from "./offer";

// ETX/sublimation catalog price 33 € is NET; published as-is (no ÷1.21), VAT added once.
const item: OfferItem = { id: "a", source: "etx", productId: "x", name: "Sporta forma SUB", code: "", brand: null, image: null, colorName: null, colorHex: null, size: "-", qty: 1, unitPrice: 33 };

describe("sublimation net pricing", () => {
  it("33 net → 39.93 gross, VAT 6.93", () => {
    expect(grossFromNet(33)).toBe(39.93);
    const t = offerTotals([item]);
    expect(t.net).toBe(33); expect(t.vat).toBe(6.93); expect(t.gross).toBe(39.93);
  });
  it("quantity totals: 10 × 33 net = 330 net, 399.30 gross", () => {
    const t = offerTotals([{ ...item, qty: 10 }]);
    expect(t.net).toBe(330); expect(t.gross).toBe(399.3);
  });
  it("no double VAT", () => {
    expect(offerTotals([item]).gross).not.toBe(grossFromNet(39.93));
  });
});
