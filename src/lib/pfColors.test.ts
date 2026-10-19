import { describe, expect, it } from "vitest";
import { pfVariantColor } from "./pfColors";

describe("pfVariantColor (PF feed 2026-10-19)", () => {
  it("K1058B2C divkrāsu: H_GREY+ROYAL, nevis tikai H_GREY", () => {
    expect(pfVariantColor([
      { colorCode: "H_GREY", colorDesc: "Heather grey", hexColor: "BEBBBB" },
      { colorCode: "ROYAL", colorDesc: "Royal blue", hexColor: "2F4F8F" },
    ])).toMatchObject({ color_code: "H_GREY+ROYAL", color_desc: "Heather grey / Royal blue", hex_color: "BEBBBB" });
  });
  it("dažādas otrās krāsas dod dažādas atslēgas", () => {
    const a = pfVariantColor([{ colorCode: "H_GREY" }, { colorCode: "BLACK" }])!.color_code;
    const b = pfVariantColor([{ colorCode: "H_GREY" }, { colorCode: "PURPLE" }])!.color_code;
    expect(a).not.toBe(b);
  });
  it("vienkrāsas objekts paliek nemainīgs", () => {
    expect(pfVariantColor({ colorCode: "BLACK", colorDesc: "Black" })!.color_code).toBe("BLACK");
  });
  it("bez krāsas -> null", () => {
    expect(pfVariantColor([])).toBeNull();
  });
});
