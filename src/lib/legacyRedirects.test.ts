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
  it.each([
    ["audumu-maisini", "/catalog?category=Tote%20Bags"],
    ["somas/auduma-somas-maisini", "/catalog?category=Tote%20Bags"],
    ["somas/mugursomas", "/catalog?category=Backpacks"],
    ["aksesuari/cimdi", "/catalog?category=Gloves"],
    ["aksesuari/dvieli", "/catalog?category=Towels"],
    ["pletkrekli", "/catalog?category=Shirts%2CShirts%20%26%20Knitwear"],
    ["t-krekli/bernu-t-krekli", "/catalog?category=T-shirts%2CT-Shirts&gender=Kids%2CBaby"],
    ["polo-krekli/vririesu-polo-krekli", "/catalog?category=Polos&gender=Men%2CUnisex"],
    ["berniem", "/catalog?gender=Kids%2CBaby"],
    ["termovela", "/catalog?q=termo"],
  ])("preserves the relevant destination for %s", (oldPath, target) => {
    expect(legacyTarget(oldPath)).toBe(target);
  });
});
