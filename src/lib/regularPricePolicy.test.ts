import { describe, expect, it } from "vitest";
import { retainRegularPrice, canRetireSupplierItem } from "../../supabase/functions/_shared/regularPricePolicy";

describe("regular supplier prices", () => {
  it("sale begins: 4.73 cannot replace verified same-SKU 5.25", () => {
    expect(retainRegularPrice({ previous: 5.25, candidate: 4.73, standardVerified: false, promotional: true })).toBe(5.25);
  });
  it("sale ends: verified regular 5.25 is accepted", () => {
    expect(retainRegularPrice({ previous: 5.25, candidate: 5.25, standardVerified: true, promotional: false })).toBe(5.25);
  });
  it("missing standard field retains the previous regular value", () => {
    expect(retainRegularPrice({ previous: 5.25, candidate: null, standardVerified: false, promotional: false })).toBe(5.25);
  });
  it("unknown normal price is not invented from a discounted 4.73", () => {
    expect(retainRegularPrice({ previous: null, candidate: 4.73, standardVerified: false, promotional: true })).toBeNull();
  });
});

describe("supplier catalogue presence", () => {
  const full = { authoritative: true, successful: true, complete: true, expected: 36, received: 36, failed: 0 };
  it("zero stock or outlet cannot retire a listed variant", () => {
    expect(canRetireSupplierItem(full, true, false)).toBe(false);
  });
  it("partial response cannot retire an absent variant", () => {
    expect(canRetireSupplierItem({ ...full, complete: false, received: 1 }, false, false)).toBe(false);
  });
  it("failed sync cannot retire an absent variant", () => {
    expect(canRetireSupplierItem({ ...full, successful: false, failed: 1 }, false, false)).toBe(false);
  });
  it("successful complete authoritative absence allows removal", () => {
    expect(canRetireSupplierItem(full, false, false)).toBe(true);
  });
  it("manual business exclusions are not overridden", () => {
    expect(canRetireSupplierItem(full, false, true)).toBe(false);
  });
});