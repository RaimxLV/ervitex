import { describe, expect, it } from "vitest";
import { translations } from "./translations";

const years = new Date().getFullYear() - 1998;

const withYears = (lv: string) => lv.replace(/\{years\}/g, String(years));

describe("founding year auto-increment", () => {
  it("year texts use the {years} placeholder", () => {
    for (const key of ["about.heroText", "about.blockStabilityBody1", "about.precisionDesc", "why.experience"] as const) {
      expect(translations[key].lv).toContain("{years}");
      expect(translations[key].en).toContain("{years}");
    }
  });

  it("no stale hardcoded year remains", () => {
    for (const text of Object.values(translations)) {
      expect(text.lv).not.toContain("28 gadu");
      expect(text.en).not.toContain("28 years");
    }
  });

  it("substitution yields the current anniversary count", () => {
    expect(withYears("{years}+ gadu pieredze")).toBe(`${years}+ gadu pieredze`);
    expect(years).toBeGreaterThanOrEqual(28);
  });
});
