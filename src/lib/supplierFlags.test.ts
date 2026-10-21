import { expect, it } from "vitest";
import { isMalfiniNomenclatureOutlet, malfiniUnitPrices } from "../../supabase/functions/_shared/supplierFlags";
import { lowestPriceVariant } from "./catalogPriceSelection";

it("MF139 outlet XS is excluded, not repriced from the regular sizes", () => {
  expect(isMalfiniNomenclatureOutlet({ outlet: 10 })).toBe(true);
  expect(isMalfiniNomenclatureOutlet({ outlet: null })).toBe(false);
  expect(isMalfiniNomenclatureOutlet({ outlet: 0 })).toBe(false);
});

it("MF139 Blue Atoll and Navy same size keep the exact 5.25 × 1.75 price", () => {
  const prices = malfiniUnitPrices([{ productSizeCode: "1394413", limit: 1, price: 5.25 }, { productSizeCode: "1394413", limit: 10, price: 4.73 }, { productSizeCode: "1390213", limit: 1, price: 5.25 }]);
  expect(prices.get("1394413")?.price).toBe(5.25);
  expect(prices.get("1390213")?.price).toBe(5.25);
  const net = Number((5.25 * 1.75).toFixed(2));
  expect(net).toBe(9.19);
  const rows = [{ color_code: "44", size: "S", retail_price: net }, { color_code: "02", size: "S", retail_price: net }];
  const colors = [{ code: "44", name: "Blue Atoll" }, { code: "02", name: "Navy Blue" }];
  expect(lowestPriceVariant(rows, colors, {}, "44", "S").price).toBe(9.19);
  expect(lowestPriceVariant(rows, colors, {}, "02", "S").price).toBe(9.19);
  expect(lowestPriceVariant(rows, colors, {}, "02", "XS").price).toBeNull();
});