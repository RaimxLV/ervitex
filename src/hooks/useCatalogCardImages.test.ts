import { describe, expect, it } from "vitest";
import { cardImageFrames } from "./useCatalogCardImages";

const rows = [
  { color: "Black", url: "https://cdn.fruitoftheloom.eu/resources/images/product/0R013M/36/large/28174.jpg" },
  { color: "Bottle Green", url: "https://cdn.fruitoftheloom.eu/resources/images/product/0R013M/38/large/28261.jpg" },
];
const model = "https://cdn.fruitoftheloom.eu/model-default.jpg";

describe("cardImageFrames (Russell bez krāsas kataloga bildes)", () => {
  it("chosen colour photo leads, model fallback photo is dropped", () => {
    const f = cardImageFrames(rows, "Bottle Green", model, false, "ru");
    expect(f[0]).toContain("/38/");
    expect(f).not.toContain(model);
    expect(f.some((u) => u.includes("/36/"))).toBe(false);
  });
  it("two colours give different first photos", () => {
    expect(cardImageFrames(rows, "Black", model, false, "ru")[0]).not.toBe(cardImageFrames(rows, "Bottle Green", model, false, "ru")[0]);
  });
  it("colour without photos keeps model photo, never another colour's", () => {
    const f = cardImageFrames(rows, "Orange", model, false, "ru");
    expect(f).toEqual([model]);
  });
});
