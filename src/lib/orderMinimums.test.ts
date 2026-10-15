import { describe, expect, it } from "vitest";
import { getOrderMinimum } from "./orderMinimums";
const rule = (category: string | null, name = "", source = "pf") => getOrderMinimum({ source, category, name });
describe("category-specific informational order minimums", () => {
  it("textiles start at 10", () => {
    for (const category of ["T-shirts", "Caps & Hats", "Towels", "Aprons", "Terry", "Workwear", "Kitchen Linen"]) expect(rule(category)?.minimum).toBe(10);
  });
  it("recommends 5 per textile colour and size", () => expect(rule("T-shirts")?.recommended).toEqual({ minimum: 5, sameSize: true }));
  it("promotional items without printing start at 10", () => {
    for (const category of ["Mugs", "Bottles", "Serving Boards & Sets", "Notebooks"]) expect(rule(category)?.minimum).toBe(10);
  });
  it("printed promotional items start at 25", () => expect(rule("Notebooks")?.printedMinimum).toBe(25));
  it("writing instruments without printing start at 25", () => {
    for (const category of ["Ballpoint Pens", "Pencils", "Markers", "Other Pens & Writing Accessories"]) expect(rule(category)?.minimum).toBe(25);
  });
  it("printed writing instruments start at 50", () => expect(rule("Fountain Pens")?.printedMinimum).toBe(50));
  it("bags start at 10", () => {
    for (const category of ["Backpacks", "Tote Bags", "Laptop & Tablet Bags"]) expect(rule(category)?.minimum).toBe(10);
  });
  it("recommends 5 per bag colour, not size", () => expect(rule("Bags")?.recommended).toEqual({ minimum: 5, sameSize: false }));
  it("gadgets start at 10", () => {
    for (const category of ["Speakers", "Headphones", "Gadgets", "USB Flash Drives"]) expect(rule(category)).toEqual({ kind: "gadgets", minimum: 10 });
  });
  it("umbrellas start at 10", () => expect(rule("Folding Umbrellas")).toEqual({ kind: "umbrellas", minimum: 10 }));
  it("sublimation starts at 10 without textile recommendation", () => expect(rule("Sporta formas sublimācija", "Sporta forma", "etx")).toEqual({ kind: "sublimation", minimum: 10 }));
  it("uses missing/coarse categories and bilingual product names", () => {
    expect(rule(null, "Flexfit cap", "fr")?.kind).toBe("textile");
    expect(rule("Accessories", "Cotton shopping bag", "bb")?.kind).toBe("bags");
    expect(rule("Office", "Lodīšu pildspalva")?.kind).toBe("writing");
  });
  it("does not turn notebooks into pens or printed pens into clothing", () => {
    expect(rule("Notebooks", "Notebook with pen")?.kind).toBe("promotional");
    expect(rule("Ballpoint Pens", "Polo pen")?.kind).toBe("writing");
    expect(rule("Tote Bags", "T-shirt tote bag")?.kind).toBe("bags");
  });
});
