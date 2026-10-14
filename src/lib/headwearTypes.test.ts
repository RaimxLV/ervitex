import { describe, expect, it } from "vitest";
import { headwearType, isHeadwearCategory, matchesHeadwearType } from "./headwearTypes";

describe("headwear description classification", () => {
  it.each([
    ["Classic Cap", "Classic 6-panel cap in unbrushed cotton twill", "cap"],
    ["Cerus cap", "Made of mesh with a cool fit finish", "cap"],
    ["Retro Trucker Cap", "", "trucker"],
    ["Cap", "Cotton front panels and mesh rear panels", "trucker"],
    ["Drift Snapback", "Designed with a classic flat visor", "flat"],
    ["Curved Visor Snapback", "", "cap"],
    ["Flexfit Flat Visor", "", "flat"],
    ["Bandana Print Bucket Hat", "", "bucket"],
    ["Fisherman Beanie", "The fisherman beanie", "beanie"],
    ["Baily", "Light and comfortable hat with soft fleece lining", "winter"],
    ["Jersey Beanie", "", "winter"],
    ["Hera sun visor", "", "visor"],
    ["Active Cap", "Underside of visor in black", "cap"],
    ["Windblock Fleece Headband", "Nordic ski hat", "headband"],
    ["BALACLAVA EXTREME", "", "balaclava"],
    ["Heracles bandana", "", "bandana"],
    ["Straw Hat", "", "brimmed"],
    ["9046 FLEECE HAT", "", "winter"],
    ["Unknown hat", "", "other"],
  ])("classifies %s using its own name/description", (name, description, expected) => {
    expect(headwearType(name, description)).toBe(expected);
  });
  it("is available only for headwear categories", () => {
    expect(isHeadwearCategory("Caps & Hats")).toBe(true);
    expect(isHeadwearCategory("Headwear")).toBe(true);
    expect(isHeadwearCategory("T-shirts")).toBe(false);
  });
  it("does not restrict other products when headwear is not selected", () => {
    expect(matchesHeadwearType("T-shirts", "other", new Set(["cap"]), false)).toBe(true);
  });
  it("restricts selected headwear types, excluding different types and non-headwear", () => {
    expect(matchesHeadwearType("Caps & Hats", "cap", new Set(["cap"]), true)).toBe(true);
    expect(matchesHeadwearType("Caps & Hats", "beanie", new Set(["cap"]), true)).toBe(false);
    expect(matchesHeadwearType("T-shirts", "cap", new Set(["cap"]), true)).toBe(false);
  });
});