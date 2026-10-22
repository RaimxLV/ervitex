import { describe, expect, it } from "vitest";
import { fabricSpecLabel, hasFabricGrammage, normalizeFabricText } from "./fabricDensity";

describe("fabric grammage versus actual mass", () => {
  it.each(["280 g/m²", "280 g/m2", "280 g/m^2", "280 GSM", "280 gsm", "280 g / m²"])("classifies %s as fabric density", (value) => {
    expect(hasFabricGrammage(value)).toBe(true);
    expect(fabricSpecLabel("Weight", value, "lv")).toBe("Blīvums");
    expect(normalizeFabricText(`Auduma svars: ${value}`, "lv")).toBe(`Blīvums: ${value}`);
  });
  it.each(["Weight: 280 g", "Shipping weight: 2 kg", "Iepakojuma svars: 500 g", "Svars: 2 kg"])("preserves actual mass %s", (text) => {
    expect(normalizeFabricText(text, "lv")).toBe(text);
    expect(hasFabricGrammage(text)).toBe(false);
  });
  it("normalizes cached Latvian and English labels with original numbers/units", () => {
    expect(normalizeFabricText("Fabric weight: 180 g/m²; Svars: 2 kg", "lv")).toBe("Blīvums: 180 g/m²; Svars: 2 kg");
    expect(fabricSpecLabel("Svars", "280 g/m²", "lv")).toBe("Blīvums");
    expect(fabricSpecLabel("Weight", "280 g", "lv")).toBe("Weight");
  });
});