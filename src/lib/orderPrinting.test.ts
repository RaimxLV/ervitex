import { describe, expect, it } from "vitest";
import { getOrderPrints, setOrderPrints, removeOfferItem, itemHasPrinting } from "./orderPrinting";
import { itemPrintNet, offerTotals, type OfferItem } from "./offer";

const items: OfferItem[] = [2, 3].map((qty, index) => ({ id: String(index), source: "ss", productId: "STTU169", code: "STTU169", name: "Creator", brand: null, image: null, colorName: "Black", colorHex: null, size: index ? "M" : "S", qty, unitPrice: 10 }));
describe("shared offer printing", () => {
  it("applies DTF per unit across all products", () => {
    const next = setOrderPrints(items, [{ method: "DTF", price: 4, mode: "unit" }]);
    expect(offerTotals(next).print).toBe(20);
    expect(itemPrintNet(next[0])).toBe(0);
    expect(offerTotals(next).gross).toBe(84.7);
  });
  it("counts a shared screen print total once alongside individual printing", () => {
    const next = setOrderPrints([{ ...items[0], prints: [{ method: "DTF", price: 3 }] }, items[1]], [{ method: "Sietspiede", price: 50, mode: "total" }]);
    expect(offerTotals(next).print).toBe(56);
  });
  it("retains shared printing when its host product is deleted", () => {
    const next = removeOfferItem(setOrderPrints(items, [{ method: "Sietspiede", price: 50, mode: "total" }]), "0");
    expect(getOrderPrints(next)).toEqual([{ method: "Sietspiede", price: 50, mode: "total", scope: "order" }]);
    expect(offerTotals(next).print).toBe(50);
  });
  it("replaces shared printing without deleting individual printing", () => {
    const next = setOrderPrints([{ ...items[0], prints: [{ method: "Izšūšana", price: 2 }] }, items[1]], [{ method: "DTF", price: 4 }]);
    const edited = setOrderPrints(next, [{ method: "Sietspiede", price: 5 }]);
    expect(getOrderPrints(edited)).toHaveLength(1);
    expect(itemPrintNet(edited[0])).toBe(4);
    expect(offerTotals(edited).print).toBe(29);
  });
  it("shows a product as undecorated only when it has no printing of its own and none shared", () => {
    expect(itemHasPrinting(items[0], [])).toBe(false);
    expect(itemHasPrinting({ ...items[0], prints: [{ method: "DTF", price: 3 }] }, [])).toBe(true);
    expect(itemHasPrinting(items[0], getOrderPrints(setOrderPrints(items, [{ method: "Sietspiede", price: 50, mode: "total" }])))).toBe(true);
  });
});