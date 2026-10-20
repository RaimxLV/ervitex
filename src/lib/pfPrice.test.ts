import { describe, it, expect } from "vitest";
import { pfFirstBarStandardPrice } from "../../supabase/functions/_shared/pfPrice";

describe("PF feed base price", () => {
  it("clearance+promotion with standardPrice returns null (hold, never promo/standard)", () => {
    const seg = '10029600","clearance":"C","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39,"type":"N"}]}],"promotion":[{"startDate":"2026-10-16","scales":[{"scale":[{"priceBar":1,"standardPrice":2.7}]}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("clearance without promotion returns null", () => {
    const seg = '1","clearance":"C","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39,"type":"N"}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("promotion without clearance returns null", () => {
    const seg = '1","clearance":"","scales":[{"scale":[{"priceBar":1,"nettPrice":1.39}]}],"promotion":[{"startDate":"2026-10-16","scales":[{"scale":[{"priceBar":1,"standardPrice":1.69}]}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("flag detection tolerates whitespace", () => {
    const seg = '1", "clearance" : "C" , "scales":[{"scale":[{ "nettPrice" : 2.5 , "priceBar" : 1 }]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBeNull();
  });
  it("normal item uses first bar nett, not cheapest bulk bar", () => {
    const seg = '10016500","clearance":"","scales":[{"scale":[{"priceBar":50,"nettPrice":7.64,"type":"N"},{"priceBar":1000,"nettPrice":7.2,"type":"N"}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBe(7.64);
  });
  it("normal item tolerates property order", () => {
    const seg = '1","clearance":"","scales":[{"scale":[{"nettPrice":3.1,"priceBar":1}]}]},';
    expect(pfFirstBarStandardPrice(seg)).toBe(3.1);
  });
});
