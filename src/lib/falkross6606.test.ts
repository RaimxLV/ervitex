import { describe, expect, it } from "vitest";
import { prepareQuery, searchMatches } from "./catalogSearch";
import { readFileSync } from "node:fs";
describe("approved exact FR Retro Trucker discovery", () => {
  it("discovers only 306.73 Retro Trucker URL, not the two-tone model", () => {
    const source = readFileSync("supabase/functions/falkross-sync/index.ts", "utf8");
    const target = /const TARGET_DISCOVERY = (.*);/.exec(source)?.[1];
    expect(target).toContain('/Products/NEW-2026/Retro-Trucker.html');
    expect(target).toContain('mpn: "6606"');
    expect(target).not.toContain('6606T');
  });
  it("matches factual Yupoong through the Flexfit search family without relabelling", () => {
    const item = { id: "6606", source: "fr", brand: "Classics / Yupoong", name: "Retro Trucker" };
    expect(searchMatches([item], prepareQuery("Flexfit 6606")).exact).toContain(item);
    expect(item.brand).toBe("Classics / Yupoong");
  });
});