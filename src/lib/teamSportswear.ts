export const MANUAL_PRODUCT_ORDER_KEY = "__etx_products";

export const teamSportswearPrices = [
  { id: "shirt", lv: "Krekls", en: "Jersey", net: 16.5 },
  { id: "shorts", lv: "Šorti", en: "Shorts", net: 16.5 },
  { id: "reversible-shirt", lv: "Divpusējs krekls", en: "Reversible jersey", net: 20 },
  { id: "reversible-shorts", lv: "Divpusēji šorti", en: "Reversible shorts", net: 22 },
  { id: "warmup-short", lv: "Iesildīšanās krekls ar īsām rokām", en: "Short-sleeve warm-up shirt", net: 16 },
  { id: "warmup-long", lv: "Iesildīšanās krekls ar garām rokām", en: "Long-sleeve warm-up shirt", net: 20 },
  { id: "warmup-zip", lv: "Iesildīšanās krekls ar garām rokām, 1/4 rāvējslēdzēju", en: "Long-sleeve quarter-zip warm-up shirt", net: 25 },
  { id: "warmup-hood", lv: "Iesildīšanās krekls ar kapuci", en: "Hooded warm-up shirt", net: 28 },
  { id: "referee", lv: "Tiesnešu krekls", en: "Referee shirt", net: 19.9 },
  { id: "beach", lv: "Pludmales volejbola krekls", en: "Beach volleyball jersey", net: 13.5 },
] as const;

export function sportswearGross(net: number): number {
  return Math.round((net * 1.21 + Number.EPSILON) * 100) / 100;
}