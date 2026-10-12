import { describe, expect, it } from "vitest";
import { BleachBan, TumbleDry, DryCleanBan, Iron, assignCareIcons } from "./CareIcons";
import { TriangleAlert, WashingMachine } from "lucide-react";

describe("care icon meaning", () => {
  it("preserves Latvian drying and dry cleaning prohibitions", () => {
    const items = assignCareIcons(["Nežāvēt veļas žāvētājā", "Netīrīt ķīmiski"]);
    expect(items.map(item => item.Icon)).toEqual([TumbleDry, DryCleanBan]);
    expect(items.every(item => item.ban)).toBe(true);
  });
  it("does not mark permitted tumble drying as prohibited", () => {
    const item = assignCareIcons(["Tumble dry at reduced temperature, max. 60 °C"])[0];
    expect(item.Icon).toBe(TumbleDry);
    expect(item.ban).toBe(false);
  });
  it("recognizes supplier dryclean prohibition", () => {
    const item = assignCareIcons(["Do Not Dryclean"])[0];
    expect(item.Icon).toBe(DryCleanBan);
    expect(item.ban).toBe(true);
  });
  it("uses an iron for temperature-qualified ironing", () => {
    expect(assignCareIcons(["Iron at a maximum sole plate temperature of 160 °C"])[0].Icon).toBe(Iron);
  });
  it("keeps the same symbol for repeated instructions", () => {
    const icons = assignCareIcons(["Nebalināt", "Do not bleach"]);
    expect(icons.every((item) => item.Icon === BleachBan && item.ban)).toBe(true);
  });

  it("uses washing symbols rather than unrelated unused icons", () => {
    const icons = assignCareIcons(["Mazgāt saudzīgi", "Wash separately"]);
    expect(icons.every((item) => item.Icon === WashingMachine)).toBe(true);
  });

  it("uses a neutral caution for unknown instructions", () => {
    expect(assignCareIcons(["Special care required"])[0].Icon).toBe(TriangleAlert);
  });
});