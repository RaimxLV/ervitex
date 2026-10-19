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
    expect(decodeURIComponent(f[0])).toContain("/38/");
    expect(f).not.toContain(model);
    expect(f.some((u) => decodeURIComponent(u).includes("/36/"))).toBe(false);
  });
  it("two colours give different first photos", () => {
    expect(cardImageFrames(rows, "Black", model, false, "ru")[0]).not.toBe(cardImageFrames(rows, "Bottle Green", model, false, "ru")[0]);
  });
  it("colour without photos keeps model photo, never another colour's", () => {
    const f = cardImageFrames(rows, "Orange", model, false, "ru");
    expect(f).toEqual([model]);
  });
});

describe("izvēlētā krāsa bez savām bildēm", () => {
  it("nerāda modeļa melno vai bezkrāsas kadrus", () => {
    expect(cardImageFrames([{ color: null, url: "https://x/model.jpg" } as never], "GREEN", "https://x/black.jpg", false)).toEqual([]);
  });
  it("savas zaļās bildes joprojām rāda", () => {
    const out = cardImageFrames([{ color: "GREEN", url: "https://x/green.jpg" } as never], "GREEN", "https://x/black.jpg", false);
    expect(out).toHaveLength(1);
    expect(out[0]).toContain("green.jpg");
  });
});
