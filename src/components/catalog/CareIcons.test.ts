import { describe, expect, it } from "vitest";
import { BleachBan, assignCareIcons } from "./CareIcons";
import { TriangleAlert, WashingMachine } from "lucide-react";

describe("care icon meaning", () => {
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