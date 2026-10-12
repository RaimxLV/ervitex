import { describe, it, expect } from "vitest";
import { applyOrder } from "./filterOrder";

describe("applyOrder", () => {
  it("puts saved order first and keeps new filters after it", () => {
    const out = applyOrder(["a", "b", "c", "d"], ["c", "a"], (x) => x);
    expect(out).toEqual(["c", "a", "b", "d"]);
  });
  it("ignores saved values that no longer exist", () => {
    expect(applyOrder(["a", "b"], ["z", "b"], (x) => x)).toEqual(["b", "a"]);
  });
});
