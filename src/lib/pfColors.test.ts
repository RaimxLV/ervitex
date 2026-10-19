import { describe, expect, it } from "vitest";
import { pfCatalogColors, pfColorKeyMatches, pfVariantColor, type PfVariantRow } from "./pfColors";
import { colorCodeCandidates, colorCodeMatches } from "./colorCodeMatch";
import { cardImageFrames } from "@/hooks/useCatalogCardImages";

describe("pfVariantColor (PF feed v3 2026-10-18T13:40:28Z)", () => {
  it("K1058B2C divkrāsu: H_GREY+ROYAL, nevis tikai H_GREY", () => {
    expect(pfVariantColor([
      { colorCode: "H_GREY", colorDesc: "Heather grey", hexColor: "BEBBBB" },
      { colorCode: "ROYAL", colorDesc: "Royal blue", hexColor: "2F4F8F" },
    ])).toMatchObject({ color_code: "H_GREY+ROYAL", color_desc: "Heather grey / Royal blue", hex_color: "BEBBBB" });
  });
  it("10650504 = Black / Silver, 10650503 = Steel / Gold", () => {
    expect(pfVariantColor([{ colorCode: "BLACK", colorDesc: "Black" }, { colorCode: "SILVER", colorDesc: "Silver" }])!.color_code).toBe("BLACK+SILVER");
    expect(pfVariantColor([{ colorCode: "Steel", colorDesc: "Steel" }, { colorCode: "GOLD", colorDesc: "Gold" }])!.color_desc).toBe("Steel / Gold");
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

describe("PF saliktās atslēgas saskaņošana", () => {
  it("H_GREY+ROYAL nesakrīt ar H_GREY vai H_GREY+PURPLE", () => {
    expect(pfColorKeyMatches("H_GREY+ROYAL", "h_grey+royal")).toBe(true);
    expect(pfColorKeyMatches("H_GREY+ROYAL", "H_GREY")).toBe(false);
    expect(colorCodeMatches("H_GREY+ROYAL", "H_GREY+PURPLE")).toBe(false);
    expect(colorCodeMatches("NAVYBLUE+H_GREY", "H_GREY")).toBe(false);
    expect(colorCodeCandidates("H_GREY+ROYAL")).toEqual(["h_grey+royal"]);
  });
  it("PF SKU attēli: 10650504 nerāda 10650503 foto (MF '50' atvasinājums nedarbojas PF)", () => {
    const rows = [
      { color: "10650503", url: "https://x/steel-gold.jpg" },
      { color: "10650504", url: "https://x/black-silver.jpg" },
    ];
    const frames = cardImageFrames(rows, "10650504", null, false, "pf");
    expect(frames.some((u) => u.includes("black-silver"))).toBe(true);
    expect(frames.some((u) => u.includes("steel-gold"))).toBe(false);
  });
});

// Reālās K1058 SKU (DB + feed 2026-10-18); cenas ir esošās publiskās cenas, nemainītas.
const row = (item_code: string, color_key: string | null, size: string, retail_price: number, feed_active = true): PfVariantRow =>
  ({ item_code, color_key, color_label: color_key, size, feed_active, retail_price, has_image: true });

describe("pfCatalogColors end-to-end fiksācija", () => {
  const k1058 = [
    row("K1058B2C", "H_GREY+ROYAL", "3/4", 14.42), row("K1058B2E", "H_GREY+ROYAL", "5/6", 14.42),
    row("K1058B7E", "H_GREY+PURPLE", "5/6", 14.42),
    row("K1058B7C", null, "3/4", 15.13, false), // feed vairs nav — atvecojusi
    row("K1058B2G", null, "7/8", 15.13, false),
  ];
  it("K1058: katra divkrāsu krāsa atsevišķi, savs SKU attēlam, atvecojušās nerādās", () => {
    const colors = pfCatalogColors(k1058);
    expect(colors.map((c) => c.k)).toEqual(["H_GREY+ROYAL", "H_GREY+PURPLE"]);
    expect(colors[0]).toMatchObject({ c: "K1058B2C", prices: { "3/4": 14.42, "5/6": 14.42 } });
    expect(colors.flatMap((c) => Object.values(c.prices))).not.toContain(15.13);
  });
  it("106505: Black/Silver 131.08 un Steel/Gold 113.97 paliek atšķirīgi; 10650500 atvecojusi", () => {
    const colors = pfCatalogColors([
      row("10650500", null, "", 89.08, false),
      row("10650503", "Steel+GOLD", "", 113.97),
      row("10650504", "BLACK+SILVER", "", 131.08),
    ]);
    expect(colors.map((c) => [c.k, c.c, c.prices[""]])).toEqual([["Steel+GOLD", "10650503", 113.97], ["BLACK+SILVER", "10650504", 131.08]]);
  });
  it("vienā krāsas+izmēra grupā atšķirīgas cenas -> null, nevis min", () => {
    const [c] = pfCatalogColors([row("22020095", "BLACK+WHITE", "", 10), row("22020099", "BLACK+WHITE", "", 12)]);
    expect(c.prices[""]).toBeNull();
  });
  it("swatch SKU izvēlas to, kam ir foto", () => {
    const [c] = pfCatalogColors([{ ...row("A1", "X+Y", "S", 5), has_image: false }, row("A2", "X+Y", "M", 5)]);
    expect(c.c).toBe("A2");
  });
});
