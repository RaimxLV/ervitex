import { expect, it } from "vitest";
import { requestOfferData } from "./requestOffer";
const request = { id: "synthetic", name: "Synthetic", email: "test@example.invalid", assigned_pm_name: "Ilona", assigned_pm_email: "ilona@ervitex.lv", print_method: "dtf", print_placement: "Priekšpuse", print_colors: "2", items: [{ id: "line", source: "ss", productId: "STTU169", qty: 50, size: "M", colorName: "Black", unitPrice: 12 }] };
it("conversion preserves manager, quantities, color, size and unresolved order printing", () => {
  const data = requestOfferData(request);
  expect(data.items[0].qty).toBe(50); expect(data.items[0].size).toBe("M"); expect(data.items[0].colorName).toBe("Black");
  expect(data.items[0].prints).toEqual([{ method: "DTF", placement: "Priekšpuse", price: null, mode: "unit", scope: "order" }]);
  expect(data.pm_email).toBe("ilona@ervitex.lv"); expect(data.quote_request_id).toBe("synthetic"); expect(data.note).toContain("Nepieciešama apdruka");
});
it("uses confirmed worksheet and keeps existing prints/discount rather than doubling decoration", () => {
  const prints = [{ method: "DTF", price: 3, scope: "order", mode: "total" }];
  const data = requestOfferData({ ...request, worksheet_items: [{ ...request.items[0], qty: 80, prints }], worksheet_discount: { type: "percent", value: 10 } });
  expect(data.items[0].qty).toBe(80); expect(data.items[0].prints).toEqual(prints); expect(data.discount).toEqual({ type: "percent", value: 10 });
});
it("no vs unspecified remain distinct after conversion without fabricated prints", () => {
  const none = requestOfferData({ ...request, print_method: "none" }); const unspecified = requestOfferData({ ...request, print_method: null });
  expect(none.note).toContain("Bez apdrukas"); expect(unspecified.note).toContain("Apdruka nav norādīta"); expect(none.items[0].prints).toBeUndefined(); expect(unspecified.items[0].prints).toBeUndefined();
});