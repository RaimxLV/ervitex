import { describe, expect, it } from "vitest";
import { compareCatalogCodes, compareCatalogNames } from "./catalogCollation";

describe("catalog collation", () => {
  it("preserves the existing natural descending model order", () => {
    expect(["STTU9", "STTU100", "STTU10"].sort((a, b) => compareCatalogCodes(b, a))).toEqual(["STTU100", "STTU10", "STTU9"]);
  });
  it("matches existing Latvian and English name sorting", () => {
    const names = ["Žakete", "Ādas soma", "Audums", "Zābaks", "ādas soma"];
    for (const lang of ["lv", "en"] as const) {
      expect([...names].sort((a, b) => compareCatalogNames(a, b, lang))).toEqual([...names].sort((a, b) => a.localeCompare(b, lang, { sensitivity: "base" })));
    }
  });
});