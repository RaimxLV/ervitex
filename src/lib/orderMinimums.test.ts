import { describe, expect, it } from "vitest";
import { getOrderMinimum } from "./orderMinimums";
const rule = (category: string | null, name = "", source = "pf") => getOrderMinimum({ source, category, name });
describe("category-specific informational order minimums", () => {
  it.each(["Shorts", "Trousers", "Outerwear", "Fleece", "Knitwear", "Softshell", "Workwear", "Bodywarmers", "Sportswear", "Vests", "Jerseys", "Polos", "Sweatshirts", "Dresses", "Skirts", "Underwear", "Shirts", "Jackets", "Hoodies", "Caps", "Towels", "Aprons", "Bikses", "Virsjakas", "Krekli", "Šorti", "Kleitas", "Svārki", "Apakšveļa", "Trikotāža", "Flīss", "Adīti džemperi", "Sporta apģērbs"])("%s has textile 10 and recommended 5 per colour/size", (category) => {
    expect(rule(category, "", "unknown")).toEqual({ kind: "textile", minimum: 10, recommended: { minimum: 5, sameSize: true } });
  });
  it("does not detect cap or vest inside unrelated words", () => {
    for (const name of ["Capsule", "Capacity", "Invest", "Desktop organiser"]) expect(rule(null, name)?.kind).toBe("generic");
  });
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
  it("explicit sublimation mugs use 10, not the printed promotional minimum", () => {
    expect(rule("Sublimation", "Ceramic mug")).toEqual({ kind: "sublimation", minimum: 10 });
    expect(rule("Sporta formas sublimācija", "Dvielis 30 x 50 CM", "etx")).toEqual({ kind: "sublimation", minimum: 10 });
  });
  it("a sublimation capability does not change a mug's 10/25 policy", () => {
    expect(rule("Standard Mugs", "Sublimation ceramic mug")).toEqual({ kind: "promotional", minimum: 10, printedMinimum: 25 });
    expect(rule(null, "Sublimation ceramic mug")).toEqual({ kind: "promotional", minimum: 10, printedMinimum: 25 });
  });
  it("textile totes recommend 5 per colour only", () => {
    expect(rule("Textiles", "Cotton tote bag", "ss")).toEqual({ kind: "bags", minimum: 10, recommended: { minimum: 5, sameSize: false } });
    expect(rule("Bags", "T-shirt tote bag", "ss")?.recommended?.sameSize).toBe(false);
  });
  it("notebooks in mixed writing categories remain promotional 10/25", () => {
    expect(rule("Notebooks & Writing", "Notebook with pen")).toEqual({ kind: "promotional", minimum: 10, printedMinimum: 25 });
  });
  it("unknown products use generic 10 without supplier-based recommendations", () => {
    for (const source of ["pf", "ss", "nwg", "bb", "mf", "ru", "utt", "fr", "etx", "unknown"]) {
      expect(rule(null, "Unknown article", source)).toEqual({ kind: "generic", minimum: 10 });
    }
  });
  it("bounded actual examples from all nine sources keep category policies", () => {
    const examples = [
      ["ss", "Hoodies", "MINI CRUISER2.0", "textile"],
      ["mf", "T-shirts", "Classic", "textile"],
      ["ru", "T-shirts", "Workwear Polycotton Twill Trousers", "textile"],
      ["utt", "Sweats & Hoodies", "Heavy Blend™ Adult Crewneck Sweatshirt", "textile"],
      ["fr", "", "110 Organic Cap", "textile"],
      ["bb", "", "Original 5 Panel Cap", "textile"],
      ["nwg", "Jackets", "Sanders", "textile"],
      ["pf", "Hard Cover Notebooks", "Teak A5 recycled hard cover notebook with lined pages", "promotional"],
      ["etx", "Sporta formas sublimācija", "Sporta maisiņš", "sublimation"],
    ];
    for (const [source, category, name, kind] of examples) expect(rule(category, name, source)?.kind).toBe(kind);
  });
  it("uses original product type as fallback before a generic name", () => {
    expect(getOrderMinimum({ source: "pf", category: "Office", productType: "Ballpoint Pens", name: "Rattan" })).toEqual({ kind: "writing", minimum: 25, printedMinimum: 50 });
  });
});
