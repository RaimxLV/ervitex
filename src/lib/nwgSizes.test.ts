import { describe, expect, it } from "vitest";
import { nwgDuplicateSizeLabels } from "./nwgSizes";

describe("nwgDuplicateSizeLabels", () => {
  it("flags only labels shared by two size codes (649066 S/M = 4 and 5)", () => {
    const rows = [
      { item: "649066-99", code: "4", label: "S/M" },
      { item: "649066-99", code: "5", label: "S/M" },
      { item: "649066-99", code: "6", label: "L/XL" },
      { item: "649066-99", code: "7", label: "L/XL" },
      { item: "1234-10", code: "4", label: "S" },
      { item: "1234-10", code: "5", label: "M" },
    ];
    expect([...nwgDuplicateSizeLabels(rows)].sort()).toEqual(["L/XL", "S/M"]);
  });
  it("same code repeated is not a duplicate", () => {
    expect(nwgDuplicateSizeLabels([{ item: "a", code: "4", label: "S" }, { item: "a", code: "4", label: "S" }]).size).toBe(0);
  });
});
