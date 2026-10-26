import { describe, expect, it } from "vitest";
import { loadEnv } from "vite";
import { grossFromNet } from "./vat";

// Read-only integration coverage: checks the prices actually served to anonymous
// visitors, not just the prepared seed prices. No product/quote writes.
const env = loadEnv("development", process.cwd(), "VITE_SUPABASE_");
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;

describe("approved mugs: anonymous catalogue prices are owner net prices", () => {
  it.each([
    ["0001", 1.90, 2.30],
    ["0002", 2.40, 2.90],
    ["0003", 4.20, 5.08],
    ["0004", 3.00, 3.63],
  ])("mug %s", async (suffix, net, gross) => {
    if (!url || !key) throw new Error("Anonymous catalogue configuration is required for this read-only price check");
    const id = `7e1a0c00-0000-4000-8000-00000000${suffix}`;
    for (const [table, fields] of [
      ["catalog_variant_prices", "retail_price"],
      ["catalog_price_ranges", "min_price,max_price"],
    ]) {
      const params = new URLSearchParams({ select: fields, source: "eq.etx", style_code: `eq.${id}` });
      const response = await fetch(`${url}/rest/v1/${table}?${params}`, { headers: { apikey: key } });
      expect(response.status).toBe(200);
      const rows = await response.json() as Record<string, number>[];
      expect(rows).toHaveLength(1);
      for (const field of fields.split(",")) {
        expect(Number(rows[0][field])).toBe(net);
        expect(grossFromNet(Number(rows[0][field]))).toBe(gross);
      }
    }
  }, 20000);
});