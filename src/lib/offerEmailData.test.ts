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