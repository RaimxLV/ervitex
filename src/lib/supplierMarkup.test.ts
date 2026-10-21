import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { malfiniPriceWrite } from "../../supabase/functions/_shared/regularPricePolicy";
it("keeps the Malfini importer on the authorized 1.75 multiplier", () => {
  expect(malfiniPriceWrite("TEST1", false, { price: 1, currency: "EUR" }, undefined)?.retail_price).toBe(1.75);
  expect(malfiniPriceWrite("TEST2", false, { price: 4.95, currency: "EUR" }, undefined)?.retail_price).toBe(8.6625);
  expect(malfiniPriceWrite("TEST3", false, { price: 4.57, currency: "EUR" }, undefined)?.retail_price).toBe(7.9975);
});
it("keeps the Russell audit multiplier at 1.70", () => {
  const source = readFileSync("docs/audits/sql/2026-10-20-price-recompute.sql", "utf8");
  const markup = Number(source.match(/select 'ru'.*p\.retail_price\*([\d.]+)/)?.[1]);
  expect(markup).toBe(1.70);
  expect(Number((10 * markup).toFixed(2))).toBe(17);
});