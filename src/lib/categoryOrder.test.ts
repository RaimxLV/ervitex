import { describe, expect, it } from "vitest";
import { categoryOrderUpdates, moveCategory } from "./categoryOrder";

const rows = [
  { id: "mugs", sort_order: 10, name: "Krūzes" },
  { id: "shirts", sort_order: 20, name: "T-krekli" },
  { id: "polo", sort_order: 30, name: "Polo krekli" },
];

describe("category ordering", () => {
  it("moves a clicked category to any position without changing category content", () => {
    const moved = moveCategory(rows, "mugs", "polo");
    expect(moved.map(row => row.id)).toEqual(["shirts", "polo", "mugs"]);
    expect(moved[2]).toBe(rows[0]);
    expect(rows.map(row => row.id)).toEqual(["mugs", "shirts", "polo"]);
  });
  it("moves upwards and ignores cancelled, stale or same-target drops", () => {
    expect(moveCategory(rows, "polo", "mugs").map(row => row.id)).toEqual(["polo", "mugs", "shirts"]);
    expect(moveCategory(rows, "missing", "mugs")).toBe(rows);
    expect(moveCategory(rows, "mugs", "missing")).toBe(rows);
    expect(moveCategory(rows, "mugs", "mugs")).toBe(rows);
  });
  it("saves only existing IDs and their new order, never category data", () => {
    expect(categoryOrderUpdates(moveCategory(rows, "shirts", "polo"))).toEqual([
      { id: "polo", sort_order: 20 }, { id: "shirts", sort_order: 30 },
    ]);
    expect(categoryOrderUpdates(rows)).toEqual([]);
    expect(categoryOrderUpdates([{ id: "mugs", sort_order: null }])).toEqual([{ id: "mugs", sort_order: 10 }]);
  });
});