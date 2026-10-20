import { expect, it } from "vitest";
import { validateOfferForSend } from "./offerValidation";
const item = { id: "one", source: "ss", productId: "STTU169", qty: 20, unitPrice: 7.19, size: "M", colorName: "Black" };
it("rejects invalid quantities and nonfinite monetary input before sending", () => {
  for (const qty of [-1, 0, 1.5, 100001]) expect(() => validateOfferForSend({ items: [{ ...item, qty }], vat_rate: 21 })).toThrow();
  for (const price of [-1, Infinity, NaN]) expect(() => validateOfferForSend({ items: [{ ...item, unitPrice: price }], vat_rate: 21 })).toThrow();
});
it("unresolved prices are permitted in drafts but not a sent financial offer", () => { expect(() => validateOfferForSend({ items: [{ ...item, unitPrice: null }], vat_rate: 21 })).toThrow(); expect(validateOfferForSend({ items: [item], vat_rate: 21 })[0].qty).toBe(20); });
it("rejects unfinished printing and invalid discounts VAT", () => {
  expect(() => validateOfferForSend({ items: [{ ...item, prints: [{ method: "DTF", price: null }] }], vat_rate: 21 })).toThrow();
  expect(() => validateOfferForSend({ items: [item], vat_rate: NaN })).toThrow();
  expect(() => validateOfferForSend({ items: [item], vat_rate: 21, discount: { type: "percent", value: 101 } })).toThrow();
});
it("accepts legacy non-variant rows without invented color/size", () => {
  const { size, colorName, ...legacy } = item;
  expect(validateOfferForSend({ items: [legacy], vat_rate: 21 })[0].unitPrice).toBe(7.19);
});