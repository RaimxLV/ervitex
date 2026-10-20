import { expect, it } from "vitest";
import { attachmentName, consumerCartAllowed, offerGroupKey, printStatusLabel, replacedOfferItem } from "./requestPresentation";
import type { OfferItem } from "./offer";
const item: OfferItem = { id: "x", source: "ss", productId: "STTU169", name: "Creator", code: "STTU169", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 50, unitPrice: 12, colorKey: "old", sku: "old", prints: [{ method: "DTF", price: null, scope: "order" }] };
it("distinguishes explicit printing, none and unspecified independently of zero price", () => {
  expect(printStatusLabel("dtf")).toBe("Nepieciešama apdruka"); expect(printStatusLabel("none")).toBe("Bez apdrukas"); expect(printStatusLabel(null)).toBe("Apdruka nav norādīta");
});
it("replacement keeps quantities sizes and prints but clears foreign price and variant identity", () => {
  const next = replacedOfferItem(item, { productId: "NEW", colorName: "Red" });
  expect(next.qty).toBe(50); expect(next.size).toBe("M"); expect(next.prints).toEqual(item.prints); expect(next.unitPrice).toBeNull(); expect(next.sku).toBeNull(); expect(next.colorKey).toBeNull();
});
it("same label with distinct supplier color keys cannot merge", () => { expect(offerGroupKey(item)).not.toBe(offerGroupKey({ ...item, colorKey: "new" })); });
it("consumer cart stays off internal and token workflows", () => { for (const path of ["/saraksts/token", "/piedavajums/token", "/offers/new", "/admin/requests", "/request"]) expect(consumerCartAllowed(path)).toBe(false); expect(consumerCartAllowed("/catalog")).toBe(true); });
it("malformed percent encoded filename remains readable", () => { expect(attachmentName("a/%E0%A4%A.pdf?token=x")).toBe("%E0%A4%A.pdf"); });