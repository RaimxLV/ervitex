import { describe, expect, it } from "vitest";
import { thumbUrl } from "./imageProxy";

describe("catalog thumbnails", () => {
  it("resizes supplier Cloudinary images without changing model or colour", () => {
    expect(thumbUrl("https://res.cloudinary.com/www-stanleystella-com/t_pim/TechnicalNames/PFM0_STWW973_C002.jpg"))
      .toBe("https://res.cloudinary.com/www-stanleystella-com/t_pim/f_auto,q_auto,c_limit,w_500/TechnicalNames/PFM0_STWW973_C002.jpg");
  });
  it("replaces its native resize instead of stacking transformations", () => {
    const original = "https://res.cloudinary.com/demo/image/upload/v123/black.jpg";
    expect(thumbUrl(thumbUrl(original), 400)).toBe("https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_400/v123/black.jpg");
  });
  it("keeps already small supplier URLs unchanged and handles missing photos", () => {
    expect(thumbUrl("https://supplier.example/black-500.jpg")).toBe("https://supplier.example/black-500.jpg");
    expect(thumbUrl(null)).toBeNull();
  });
});