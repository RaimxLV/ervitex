import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
it("keeps the Malfini importer on the authorized 1.75 multiplier", () => {
  const source = readFileSync("supabase/functions/malfini-sync/index.ts", "utf8");
  const markup = Number(source.match(/const MARKUP = ([\d.]+);/)?.[1]);
  expect(markup).toBe(1.75);
  expect(Number((4.95 * markup).toFixed(4))).toBe(8.6625);
  expect(Number((4.57 * markup).toFixed(4))).toBe(7.9975);
});
it("keeps the Russell audit multiplier at 1.70", () => {
  const source = readFileSync("docs/audits/sql/2026-10-20-price-recompute.sql", "utf8");
  const markup = Number(source.match(/select 'ru'.*p\.retail_price\*([\d.]+)/)?.[1]);
  expect(markup).toBe(1.70);
  expect(Number((10 * markup).toFixed(2))).toBe(17);
});