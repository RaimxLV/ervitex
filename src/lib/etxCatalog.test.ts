import { describe, expect, it } from "vitest";
import { sublimationProducts } from "./etxCatalog";

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