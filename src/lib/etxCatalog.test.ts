import { describe, expect, it } from "vitest";
import { catalogCategories, catalogBrandForCategory, ETX_BRAND, publicCatalogBrand, sublimationProducts } from "./etxCatalog";

it("sublimation towels retain both categories with one row when both are selected", () => {
  const rows = ["Dvielis 30 x 50 CM", "Dvielis 50 x 100 CM", "Dvielis 70 x 140 CM"].map(name => ({ source: "etx", category: "Sporta formas sublimācija", name }));
  expect(rows.every(row => catalogCategories(row).includes("Towels"))).toBe(true);
  expect(rows.every(row => catalogCategories(row).includes("Sporta formas sublimācija"))).toBe(true);
  const selected = new Set(["Towels", "Sporta formas sublimācija"]);
  expect(rows.filter(row => catalogCategories(row).some(category => selected.has(category)))).toHaveLength(3);
  expect(catalogCategories({ source: "etx", category: "Sporta formas sublimācija", name: "Sporta krekls" })).toEqual(["Sporta formas sublimācija"]);
});

describe("Sporta formu ražotājs", () => {
  it("visām sporta formām rāda Ervitex, nevis veco piegādātāja nosaukumu", () => {
    expect(publicCatalogBrand("ETX Latvia")).toBe("Ervitex");
    expect(publicCatalogBrand("ETX Latvia", "etx")).toBe("Ervitex");
    expect(publicCatalogBrand(null, "etx")).toBe("Ervitex");
    expect(publicCatalogBrand("Craft", "nwg")).toBe("Craft");
  });
});

describe("Sublimācijas saistītās preces", () => {
  it("atstāj tikai ETX Latvia sporta formas sublimācijas kategorijā", () => {
    const etx = { source: "etx", brand: "ETX Latvia", category: "Sporta formas sublimācija" };
    expect(sublimationProducts([
      etx,
      { source: "pf", brand: "Unbranded", category: "Standard Mugs" },
      { source: "nwg", brand: "Craft", category: "Tops" },
      { source: "etx", brand: "Other", category: etx.category },
      { source: "etx", brand: etx.brand, category: "T-shirts" },
    ])).toEqual([etx]);
  });
});

describe("catalogBrandForCategory", () => {
  it("sporta formu kategoriju saglabā ar kataloga iekšējo zīmolu", () => {
    expect(catalogBrandForCategory("Sporta formas sublimācija", "sporta-formas-sublimacija", "Ervitex")).toBe(ETX_BRAND);
  });

  it("citu kategoriju zīmolu nemaina", () => {
    expect(catalogBrandForCategory("T-krekli", "t-krekli", "Ervitex")).toBe("Ervitex");
  });
});
import { catalogCategories as cc2, storedProductBrand, isEtxSublimationCategory } from "./etxCatalog";
describe("admin ETX categories map to public facets", () => {
  it("admin mug category 'Krūzes (sublimācija)' is in Mugs and sublimation", () => {
    expect(cc2({ source: "etx", category: "Krūzes (sublimācija)", name: "Balta krūze" })).toContain("Mugs");
    expect(isEtxSublimationCategory("Krūzes (sublimācija)")).toBe(true);
  });
  it("form brand Ervitex is stored as ETX Latvia", () => {
    expect(storedProductBrand("Ervitex")).toBe("ETX Latvia");
    expect(storedProductBrand("Clique")).toBe("Clique");
  });
});
