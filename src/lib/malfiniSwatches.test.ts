import { describe, expect, it } from "vitest";
import { malfiniSwatchUrl } from "./malfiniSwatches";

describe("Malfini authoritative colour swatches", () => {
  it.each([
    ["43", "jpg"], ["63", "png"], ["44", "jpg"], ["02", "jpg"],
  ])("retains the supplier's exact swatch for colour %s", (code, extension) => {
    const url = `https://api.malfini.com/image/color/base/${code}.${extension}`;
    expect(malfiniSwatchUrl(code, url)).toBe(url);
  });
  it("never substitutes another colour's swatch", () => {
    expect(malfiniSwatchUrl("02", "https://api.malfini.com/image/color/base/44.jpg")).toBeNull();
  });
  it("does not invent a URL or accept unverified image origins", () => {
    expect(malfiniSwatchUrl("43", null)).toBeNull();
    expect(malfiniSwatchUrl("43", "https://example.com/image/color/base/43.jpg")).toBeNull();
    expect(malfiniSwatchUrl("43", "https://api.malfini.com/image/color/base/43.jpg?other=02")).toBeNull();
  });
});