import { describe, expect, it } from "vitest";
import { stripBbFooterLinks } from "./bbFeatures.ts";

describe("stripBbFooterLinks", () => {
  it("removes BG858 footer links, keeps real features", () => {
    expect(stripBbFooterLinks([
      "600D Polyester", "TearAway label for ease of rebranding",
      "Full Terms and Conditions", "Modern Slavery Statement", "Privacy Statement", "Sitemap",
    ])).toEqual(["600D Polyester", "TearAway label for ease of rebranding"]);
  });
  it("keeps genuine text that only mentions the words", () => {
    const keep = ["Made in a factory with a modern slavery audit", "Privacy pocket"];
    expect(stripBbFooterLinks(keep)).toEqual(keep);
  });
});
