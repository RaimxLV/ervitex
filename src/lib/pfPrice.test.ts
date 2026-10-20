import { describe, it, expect } from "vitest";
import { pfFirstBarStandardPrice } from "../../supabase/functions/_shared/pfPrice";

describe("PF feed base price", () => {
  it("clearance item uses first-bar standard price, not clearance nett", () => {
    const seg = '10029600","clearance":"C","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39,"type":"N"},{"priceBar":100,"nettPrice":1.2,"type":"N"}]}],"promotion":[{"startDate":"2026-10-16","scales":[{"scale":[{"priceBar":1,"standardPrice":1.69},{"priceBar":100,"standardPrice":1.5}]}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBe(1.69);
  });
  it("clearance item without standard price returns null (prior price kept)", () => {
    const seg = '1","clearance":"C","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39,"type":"N"}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("promotion without standard price returns null", () => {
    const seg = '1","clearance":"","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39}]}],"promotion":[{"startDate":"2026-10-16","scales":[]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("tolerates whitespace and property order", () => {
    const seg = '1", "clearance" : "C", "promotion": [ { "scales":[{"scale":[{ "standardPrice" : 2.5 , "priceBar" : 1 }]}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBe(2.5);
  });
  it("normal item uses first bar nett, not cheapest bulk bar", () => {
    const seg = '10016500","clearance":"","scales":[{"scale":[{"priceBar":50,"nettPrice":7.64,"type":"N"},{"priceBar":1000,"nettPrice":7.2,"type":"N"}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBe(7.64);
  });
});
