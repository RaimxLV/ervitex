import { describe, expect, it } from "vitest";
import { isAnalyticsHost, isPrivatePath } from "./analytics";

describe("isAnalyticsHost", () => {
  it("allows only the production domains", () => {
    expect(isAnalyticsHost("www.ervitex.lv")).toBe(true);
    expect(isAnalyticsHost("ervitex.lv")).toBe(true);
  });

  it("blocks preview, lovable.app and localhost so they never pollute GA", () => {
    expect(isAnalyticsHost("id-preview--720c1872-d106-476c-970d-190420757416.lovable.app")).toBe(false);
    expect(isAnalyticsHost("ervitex.lovable.app")).toBe(false);
    expect(isAnalyticsHost("localhost")).toBe(false);
  });
});

describe("isPrivatePath", () => {
  it("blocks every private/token route family", () => {
    for (const p of [
      "/login",
      "/request",
      "/admin",
      "/admin/quotes",
      "/offers",
      "/offers/abc-123",
      "/piedavajums/some-token",
      "/saraksts/some-token",
      "/nodot/some-token",
    ]) {
      expect(isPrivatePath(p)).toBe(true);
    }
  });

  it("allows public pages", () => {
    for (const p of ["/", "/catalog", "/catalog/item/pf/210777", "/about", "/contact", "/services"]) {
      expect(isPrivatePath(p)).toBe(false);
    }
  });

  it("does not over-match public paths that merely start with a private word", () => {
    expect(isPrivatePath("/requestmore")).toBe(false);
    expect(isPrivatePath("/offerside")).toBe(false);
  });
});
