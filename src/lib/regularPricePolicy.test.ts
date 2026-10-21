import { describe, expect, it } from "vitest";
import { malfiniPriceWrite } from "../../supabase/functions/_shared/regularPricePolicy";
import { isMalfiniOutlet, isMalfiniNomenclatureOutlet } from "../../supabase/functions/_shared/supplierFlags";
const normal = { price: 5.25, currency: "EUR" };
describe("actual narrow MF importer write policy", () => {
  it("normal new SKU writes 5.25 ×1.75, not a blanket freeze", () => {
    expect(malfiniPriceWrite("1394413", false, normal, undefined)).toEqual({ sku: "1394413", wholesale_price: 5.25, retail_price: 9.1875, suggested_retail_price: null, currency: "EUR" });
  });
  it("sale begins: 4.73 never writes or nulls existing same-SKU price", () => {
    expect(malfiniPriceWrite("1394412", isMalfiniNomenclatureOutlet({ outlet: 10 }), { price: 4.73, currency: "EUR" }, undefined)).toBeNull();
  });
  it("model OUTLET blocks prices even with nomenclature marker zero", () => {
    expect(malfiniPriceWrite("1394412", isMalfiniOutlet({ categoryName: "OUTLET" }), normal, undefined)).toBeNull();
  });
  it("sale ends: non-promo unit flow resumes", () => {
    expect(malfiniPriceWrite("1394413", false, normal, undefined)?.retail_price).toBe(9.1875);
  });
  it("missing unit price skips write; recommended price cannot substitute", () => {
    expect(malfiniPriceWrite("1394412", false, undefined, { price: 20, currency: "EUR" })).toBeNull();
  });
  it("unknown promo SKU cannot copy 5.25 from another size", () => {
    expect(malfiniPriceWrite("1394412", true, normal, undefined)).toBeNull();
  });
  it("zero stock does not affect normal price write", () => {
    const stock = { quantity: 0, sku: "1394413" };
    expect(malfiniPriceWrite(stock.sku, false, normal, undefined)?.wholesale_price).toBe(5.25);
  });
});