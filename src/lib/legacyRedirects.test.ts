import { describe, expect, it } from "vitest";
import { legacyTarget } from "./legacyRedirects";

describe("legacyTarget", () => {
  it("maps contacts", () => expect(legacyTarget("kontakti")).toBe("/contact"));
  it("maps tech pages", () => expect(legacyTarget("termodruka")).toBe("/tehnologijas/termodruka"));
  it("maps subcategories to parent category", () =>
    expect(legacyTarget("polo-krekli/viriesu")).toBe("/catalog?category=Polos"));
  it("maps manufacturers to search", () => expect(legacyTarget("shop/manufacturers/bag-base")).toBe("/catalog?q=bag%20base"));
  it("falls back to catalog", () => expect(legacyTarget("darba-apavi")).toBe("/catalog"));
  it("empty goes home", () => expect(legacyTarget("")).toBe("/"));
});
