import { expect, it } from "vitest";
import { offerEmailData } from "./offerEmailData";
import { money, type Offer } from "./offer";

it("carries each item's percentage, euro reduction and discounted total to email", () => {
  const offer: Offer = { id: "test", title: "", client_name: "", client_company: null, client_email: null, client_phone: null, note: null, status: "sent", vat_rate: 21, created_at: "", updated_at: "", items: [{ id: "item", source: "ss", productId: "STTU169", code: "STTU169", name: "Creator", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 10, unitPrice: 20, discountPercent: 15 }] };
  const data = offerEmailData(offer);
  expect(data.items[0].discountPercent).toBe(15);
  expect(data.items[0].discountAmount).toBe(money(30));
  expect(data.items[0].lineTotal).toBe(money(170));
  expect(data.gross).toBe(money(205.7));
});
it("zero-priced goods remain zero, not price-on-request; English uses the same totals", () => {
  const offer: Offer = { id: "synthetic", title: "Test", client_name: "Test", client_company: null, client_email: null, client_phone: null, note: null, status: "sent", vat_rate: 21, created_at: "", updated_at: "", items: [{ id: "item", source: "ss", productId: "STTU169", code: "STTU169", name: "Creator", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 10, unitPrice: 0, prints: [{ method: "DTF", price: 0, scope: "order" }] }] };
  const data = offerEmailData(offer, "en");
  expect(data.items[0].unitPrice).toBe(money(0)); expect(data.items[0].lineTotal).toBe(money(0)); expect(data.gross).toBe(money(0)); expect(data.note).toContain("Decoration for all items: DTF —");
});