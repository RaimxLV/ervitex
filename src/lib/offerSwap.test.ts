import { describe, expect, it } from "vitest";
import { applyModelSwap, offerGroupKey, swapMissingCount, type ModelSwapReplacement } from "./requestPresentation";
import type { OfferItem } from "./offer";

const item = (over: Partial<OfferItem>): OfferItem => ({
  id: "x", source: "fr", productId: "6606CT", name: "Corduroy Retro Trucker", code: "6606CT",
  brand: "Build Your Brand", image: null, colorName: "Black", colorHex: "#000", colorCode: "blk",
  size: "One Size", qty: 5, unitPrice: 10.08, ...over,
} as OfferItem);

const repl: ModelSwapReplacement = {
  source: "fr", productId: "6606", name: "Retro Trucker", code: "6606", brand: "Classics / Yupoong",
  image: "img.jpg", colorName: "Black", colorHex: "#111", colorCode: "black",
};

describe("applyModelSwap", () => {
  it("nomaina tikai izvēlēto grupu, saglabājot daudzumu, atlaidi un apdruku", () => {
    const a = item({ id: "a", qty: 5, discountPercent: 10, prints: [{ method: "dtf", placements: [], price: 25 } as never] });
    const b = item({ id: "b", productId: "STSW262", source: "ss", code: "STSW262", colorName: "Black", size: "S", qty: 4, unitPrice: 19.25 });
    const { items, missing } = applyModelSwap([a, b], offerGroupKey(a), repl, new Map([["One Size", 6.98]]));
    expect(missing).toBe(0);
    const swapped = items[0];
    expect(swapped.id).toBe("a");
    expect(swapped.productId).toBe("6606");
    expect(swapped.name).toBe("Retro Trucker");
    expect(swapped.qty).toBe(5);
    expect(swapped.discountPercent).toBe(10);
    expect(swapped.prints).toEqual(a.prints);
    expect(swapped.unitPrice).toBe(6.98);
    expect(items[1]).toBe(b);
  });

  it("izmēram bez precīzas cenas rindas cena ir null, nevis cita varianta cena", () => {
    const a = item({ id: "a", size: "S" });
    const { items, missing } = applyModelSwap([a], offerGroupKey(a), repl, new Map([["XS", 19.25]]));
    expect(missing).toBe(1);
    expect(items[0].unitPrice).toBeNull();
    expect(items[0].size).toBe("S");
  });

  it("cena nāk no tā paša izmēra rindas, nevis lētākās", () => {
    const a = item({ id: "a", size: "L" });
    const { items } = applyModelSwap([a], offerGroupKey(a), repl, new Map([["S", 10], ["L", 12]]));
    expect(items[0].unitPrice).toBe(12);
  });

  it("krāsas identitāte nāk no jaunā modeļa, vecais colorCode nepaliek", () => {
    const a = item({ id: "a" });
    const { items } = applyModelSwap([a], offerGroupKey(a), repl, new Map([["One Size", 6.98]]));
    expect(items[0].colorCode).toBe("black");
    expect(items[0].colorName).toBe("Black");
    expect(items[0].colorHex).toBe("#111");
    expect(items[0].sku).toBeNull();
  });

  it("nomaina visas grupas rindas, bet neaiztiek citu grupu ar to pašu kodu citā krāsā", () => {
    const black1 = item({ id: "b1", size: "S", qty: 2 });
    const black2 = item({ id: "b2", size: "M", qty: 3 });
    const white = item({ id: "w", colorName: "White", colorCode: "wht", size: "S", qty: 7 });
    const { items } = applyModelSwap([black1, black2, white], offerGroupKey(black1), repl, new Map([["S", 6.98], ["M", 6.98]]));
    expect(items[0].productId).toBe("6606");
    expect(items[1].productId).toBe("6606");
    expect(items[2].productId).toBe("6606CT");
    expect(items[2].colorName).toBe("White");
    expect(items[2].qty).toBe(7);
  });
});

describe("swapMissingCount", () => {
  it("> 0, ja kādam grupas izmēram jaunajam modelim nav cenas — nomaiņu bloķējam", () => {
    const s = item({ id: "s", size: "S" });
    const m = item({ id: "m", size: "M" });
    const other = item({ id: "o", productId: "STSW262", source: "ss", size: "S" });
    const prices = new Map<string, number | null>([["S", 6.98]]);
    expect(swapMissingCount([s, m, other], offerGroupKey(s), prices)).toBe(1);
  });

  it("izmērs bez izmēra (null) meklējas ar '-' atslēgu", () => {
    const noSize = item({ id: "n", size: null });
    expect(swapMissingCount([noSize], offerGroupKey(noSize), new Map([["One Size", 6.98]]))).toBe(1);
    expect(swapMissingCount([noSize], offerGroupKey(noSize), new Map([["-", 6.98]]))).toBe(0);
  });

  it("0, kad visiem grupas izmēriem ir precīza cena — nomaiņu drīkst apstiprināt", () => {
    const s = item({ id: "s", size: "S" });
    const m = item({ id: "m", size: "M" });
    const prices = new Map<string, number | null>([["S", 6.98], ["M", 6.98]]);
    expect(swapMissingCount([s, m], offerGroupKey(s), prices)).toBe(0);
  });
});
