import { describe, expect, it } from "vitest";
import { SUBLIMATION_MUGS, isSublimationMug, isApprovedMug, approvedMugSeed, mugPricePair, MUG_SUBLIMATION_PRINT_NET } from "./sublimationMugs";
import { getOrderMinimum } from "./orderMinimums";
import { catalogCategories, ETX_CATEGORY } from "./etxCatalog";
import { offerTotals, type OfferItem } from "./offer";

const byName = (n: string) => SUBLIMATION_MUGS.find((m) => m.name_lv === n)!;

describe("sublimation mug prices (owner net selling prices, +21% VAT)", () => {
  it.each([
    ["Balta krūze", 1.9, 2.3, 4.9, 5.93],
    ["DUO divkrāsu krūze", 2.4, 2.9, 5.4, 6.53],
    ["Krūze ar zelta vai sudraba osu", 4.2, 5.08, 7.2, 8.71],
    ["Krāsu mainošā krūze", 3, 3.63, 6, 7.26],
  ])("%s", (name, plainNet, plainGross, printedNet, printedGross) => {
    expect(mugPricePair(byName(name).retail_price)).toEqual({ plainNet, plainGross, printedNet, printedGross });
  });
  it("print surcharge is 3.00 net", () => expect(MUG_SUBLIMATION_PRINT_NET).toBe(3));
});

describe("mug rules", () => {
  it("minimum 10 for all sublimation mugs, printed or not", () => {
    for (const m of SUBLIMATION_MUGS) expect(getOrderMinimum({ source: "etx", category: ETX_CATEGORY, name: m.name_lv }).minimum).toBe(10);
  });
  it("mugs stay in sublimation and also appear in Mugs; towels unaffected", () => {
    expect(catalogCategories({ source: "etx", category: ETX_CATEGORY, name: "Balta krūze" })).toEqual([ETX_CATEGORY, "Mugs"]);
    expect(catalogCategories({ source: "etx", category: ETX_CATEGORY, name: "Dvielis 30 x 50 CM" })).toEqual([ETX_CATEGORY, "Towels"]);
    expect(isSublimationMug("ss", "Balta krūze")).toBe(false);
  });
  it("each colour has its own photo; gold and silver are separate", () => {
    const metal = byName("Krūze ar zelta vai sudraba osu").colors;
    expect(metal.map((c) => c.name)).toEqual(["Zelta osa", "Sudraba osa"]);
    expect(metal[0].image).toContain("zelta-osa");
    expect(metal[1].image).toContain("sudraba-osa");
    expect(byName("DUO divkrāsu krūze").colors).toHaveLength(22);
  });
});

describe("approved IDs only", () => {
  it("print preset/prices bind to the four reviewed IDs, not names", () => {
    for (const m of SUBLIMATION_MUGS) expect(isApprovedMug("etx", m.id)).toBe(true);
    expect(isApprovedMug("etx", "00000000-0000-4000-8000-000000000001")).toBe(false);
    expect(approvedMugSeed("etx", "some-future-mug")).toBeNull();
    expect(isApprovedMug("ss", SUBLIMATION_MUGS[0].id)).toBe(false);
  });
});

describe("offer math: print charged once", () => {
  it("10 white mugs with one 3.00 sublimation row = 49.00 net, 59.29 gross", () => {
    const item: OfferItem = { id: "a", source: "etx", productId: "x", name: "Balta krūze", code: "", brand: null, image: null, colorName: "Balta", colorHex: null, size: null, qty: 10, unitPrice: 1.9,
      prints: [{ method: "Sublimācija", placement: "", price: 3, mode: "unit" }] } as OfferItem;
    const t = offerTotals([item]);
    expect(t.net).toBe(49); expect(t.gross).toBe(59.29);
  });
});
