import { describe, expect, it } from "vitest";
import { NAME_HEX_MAP, resolveHex, resolveHexParts } from "./colorNameHex";

// Visi Russell ru_variants color_name (DB 2026-10-22): neviens nedrīkst
// krist uz pelēko #e5e5e5 fallback, jo ru_variants nesatur color_hex/swatch_url.
const RUSSELL_COLOR_NAMES = [
  "Aqua", "Azure Blue", "Black", "Bottle Green", "Bright Navy", "Bright Red",
  "Bright Royal", "Bright Sky", "Burgundy", "Chocolate", "Classic Red",
  "Convoy Grey", "Corporate Blue", "Dark Olive", "Eucalyptus Green",
  "French Navy", "Fuchsia", "INDIGO BLUE", "Iron Grey", "Light Blue",
  "Light Oxford", "Mineral Blue", "MOCHA", "Mustard Yellow", "Natural",
  "Olive", "Orange", "Oxford Blue", "Petrol Blue", "Port", "Powder Rose",
  "Purple", "Silver", "Sky", "Sport Heather", "Stone", "Tan", "Titanium",
  "URBAN GREY", "White", "Yellow",
];

describe("resolveHex Russell krāsu nosaukumi", () => {
  it.each(RUSSELL_COLOR_NAMES)("%s neatkrīt uz pelēko fallback", (name) => {
    expect(resolveHex(null, name)).not.toBe("#e5e5e5");
  });

  it("Bright Royal izmanto to pašu kanonisko royal blue hex", () => {
    expect(resolveHex(null, "Bright Royal")).toBe(NAME_HEX_MAP.royalblue);
  });

  it("Titanium ir pelēks, nevis tan", () => {
    expect(resolveHex(null, "Titanium")).toBe(NAME_HEX_MAP.silver);
  });

  it("piegādātāja hex vienmēr pārspēj nosaukuma karti", () => {
    expect(resolveHex("#123456", "Bright Royal")).toBe("#123456");
  });

  it("nezināms nosaukums saglabā pelēko fallback", () => {
    expect(resolveHex(null, "Zxqwv Unk")).toBe("#e5e5e5");
  });
});

describe("resolveHexParts", () => {
  it("daudztoņu krāsas rāda abus toņus", () => {
    expect(resolveHexParts(null, "Black/Yellow")).toEqual(["#000000", "#eab308"]);
  });
});
