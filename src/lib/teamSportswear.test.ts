import { describe, expect, it } from "vitest";
import { sportswearGross, teamSportswearPrices } from "./teamSportswear";
import { applyOrder } from "./filterOrder";

describe("Team sportswear price list", () => {
  it.each([
    ["shirt", 16.5, 19.97], ["shorts", 16.5, 19.97],
    ["reversible-shirt", 20, 24.2], ["reversible-shorts", 22, 26.62],
    ["warmup-short", 16, 19.36], ["warmup-long", 20, 24.2],
    ["warmup-zip", 25, 30.25], ["warmup-hood", 28, 33.88],
    ["referee", 19.9, 24.08], ["beach", 13.5, 16.34],
  ])("%s matches the supplied net price and 21%% VAT", (id, net, gross) => {
    const row = teamSportswearPrices.find(p => p.id === id);
    expect(row?.net).toBe(net);
    expect(sportswearGross(Number(net))).toBe(gross);
  });
  it("uses saved manual order and keeps newly added products", () => {
    expect(applyOrder([{ id: "shirt" }, { id: "shorts" }, { id: "new" }], ["shorts", "shirt"], p => p.id).map(p => p.id)).toEqual(["shorts", "shirt", "new"]);
  });
});