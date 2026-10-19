import { describe, expect, it } from "vitest";
import { pfFindColor, pfResolveVariant, pfSkuMap } from "./pfVariantIdentity";

// Reālās SKU/cenas pēc 005 atslēgām (feed 2026-10-18); cenas nemainītas.
const rows = [
  { sku: "K1058B2C", color_code: "H_GREY+ROYAL", size: "3/4", retail_price: 14.42 },
  { sku: "K1058B2E", color_code: "H_GREY+ROYAL", size: "5/6", retail_price: 14.42 },
  { sku: "K1058B7E", color_code: "H_GREY+PURPLE", size: "5/6", retail_price: 14.42 },
  { sku: "10650504", color_code: "BLACK+SILVER", size: null, retail_price: 131.08 },
  { sku: "10650503", color_code: "Steel+GOLD", size: null, retail_price: 113.97 },
  { sku: "22020095", color_code: "BLACK+WHITE", size: null, retail_price: 10 },
  { sku: "22020099", color_code: "BLACK+WHITE", size: null, retail_price: 10 },
];

describe("pfResolveVariant", () => {
  it("precīza krāsa+izmērs → sava SKU un cena", () => {
    expect(pfResolveVariant(rows, "H_GREY+ROYAL", "5/6")).toEqual({ status: "ok", sku: "K1058B2E", price: 14.42 });
    expect(pfResolveVariant(rows, "BLACK+SILVER", null)).toEqual({ status: "ok", sku: "10650504", price: 131.08 });
  });
  it("cita divkrāsu krāsa vai vecā vienkrāsas atslēga nesakrīt", () => {
    expect(pfResolveVariant(rows, "H_GREY+PURPLE", "3/4").status).toBe("missing");
    expect(pfResolveVariant(rows, "H_GREY", "3/4").status).toBe("missing");
  });
  it("22020095/22020099 netiek sapludinātas pat ar vienādu cenu", () => {
    expect(pfResolveVariant(rows, "BLACK+WHITE", null)).toEqual({ status: "ambiguous", skus: ["22020095", "22020099"], price: null });
  });
});

describe("pfFindColor (saglabātās rindas)", () => {
  const colors = [{ k: "H_GREY+ROYAL", n: "Heather grey / Royal blue" }, { k: "H_GREY+PURPLE", n: "Heather grey / Purple" }];
  it("jaunā rinda ar colorKey", () => expect(pfFindColor(colors, { colorKey: "H_GREY+PURPLE" })).toBe(1));
  it("vecā rinda ar pilnu nosaukumu", () => expect(pfFindColor(colors, { colorName: "Heather grey / Royal blue" })).toBe(0));
  it("vecā rinda 'Heather grey' netiek minēta", () => expect(pfFindColor([...colors, { k: "X", n: "Heather grey" }, { k: "Y", n: "Heather grey" }], { colorName: "Heather grey" })).toBe(-1));
});

describe("pfSkuMap", () => {
  it("sadursme atzīmēta, nevis pārrakstīta", () => {
    const m = pfSkuMap([
      { item_code: "22020095", key: "BLACK+WHITE", size: null },
      { item_code: "22020099", key: "BLACK+WHITE", size: null },
      { item_code: "K1058B2C", key: "H_GREY+ROYAL", size: "3/4" },
    ]);
    expect(m.skus).toEqual({ "H_GREY+ROYAL|3/4": "K1058B2C" });
    expect(m.ambiguous).toEqual({ "BLACK+WHITE|": ["22020095", "22020099"] });
  });
});
