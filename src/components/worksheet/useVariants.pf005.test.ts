import { describe, expect, it } from "vitest";
import { priceForVariant, sizesForColor, type VariantPrice } from "./useVariants";
import { catalogColorPrice } from "@/lib/catalogPriceSelection";

// 005 fiksācija: catalog_variant_prices pēc rekey (color_code = pilnā PF atslēga), cenas nemainītas.
const rows: VariantPrice[] = [
  { sku: "K1058B2C", color_code: "H_GREY+ROYAL", size: "3/4", retail_price: 14.42 },
  { sku: "K1058B2E", color_code: "H_GREY+ROYAL", size: "5/6", retail_price: 14.42 },
  { sku: "K1058B7E", color_code: "H_GREY+PURPLE", size: "5/6", retail_price: 14.42 },
  { sku: "22020095", color_code: "BLACK+WHITE", size: null, retail_price: 10 },
  { sku: "22020099", color_code: "BLACK+WHITE", size: null, retail_price: 10 },
];

describe("PF piedāvājuma izvēle ar pilno krāsas atslēgu", () => {
  it("krāsa+izmērs → sava SKU un cena", () => {
    expect(priceForVariant("pf", rows, "H_GREY+ROYAL", "5/6")).toMatchObject({ price: 14.42, sku: "K1058B2E", ambiguous: false });
  });
  it("izmēri tikai izvēlētajai divkrāsu krāsai", () => {
    expect(sizesForColor("pf", rows, "H_GREY+PURPLE").map((s) => [s.size, s.price])).toEqual([["5/6", 14.42]]);
  });
  it("vecā vienkrāsas atslēga H_GREY nedod citas krāsas cenu", () => {
    expect(priceForVariant("pf", rows, "H_GREY", "3/4").price).toBeNull();
    expect(sizesForColor("pf", rows, "H_GREY")).toEqual([]);
  });
  it("22020095/99: bez cenas un atzīmēts, nevis patvaļīga SKU", () => {
    expect(priceForVariant("pf", rows, "BLACK+WHITE", null)).toMatchObject({ price: null, sku: null, ambiguous: true });
  });
  it("kartītes cena PF pēc k precīzi", () => {
    const map = new Map([["pf:K1058:h_grey+royal", 14.42], ["pf:K1058:h_grey", 15.13]]);
    expect(catalogColorPrice(map, "pf", "K1058", { c: "K1058B2C", n: "Heather grey / Royal blue", k: "H_GREY+ROYAL" })).toBe(14.42);
    expect(catalogColorPrice(map, "pf", "K1058", { c: "K1058B7E", n: "Heather grey / Purple", k: "H_GREY+PURPLE" })).toBeUndefined();
  });
  it("citi avoti nemainās", () => {
    expect(priceForVariant("ss", [{ color_code: "C001", size: "M", retail_price: 5 }], "C001", "M")).toMatchObject({ price: 5, sku: null });
  });
});
