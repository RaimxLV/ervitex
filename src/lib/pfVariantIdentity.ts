/**
 * PF varianta identitāte pēc 005: krāsa = pilnā atslēga (`color_key`, piem. H_GREY+ROYAL), cena un
 * SKU tikai no tās pašas krāsas+izmēra. Vairākas SKU vienā grupā (220200: 22020095/22020099) netiek
 * sapludinātas pat ar vienādu cenu — rezultāts ir „ambiguous”, un cena paliek pēc pieprasījuma.
 */
export interface PfSkuPrice {
  sku?: string | null;
  color_code: string | null;
  size: string | null;
  retail_price: number | null;
}

export type PfResolution =
  | { status: "ok"; sku: string | null; price: number | null }
  | { status: "ambiguous"; skus: string[]; price: null }
  | { status: "missing"; price: null };

const norm = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();
const sizeOf = (s?: string | null) => norm(s) || "-";

export function pfResolveVariant(rows: PfSkuPrice[], colorKey: string | null | undefined, size: string | null | undefined): PfResolution {
  const key = norm(colorKey);
  if (!key) return { status: "missing", price: null };
  const own = rows.filter((r) => norm(r.color_code) === key);
  const sized = own.filter((r) => sizeOf(r.size) === sizeOf(size));
  // Preces bez izmēra: der tikai tad, ja visām šīs krāsas rindām nav izmēra.
  const pool = sized.length ? sized : own.length && own.every((r) => sizeOf(r.size) === "-") ? own : [];
  if (!pool.length) return { status: "missing", price: null };
  const skus = [...new Set(pool.map((r) => (r.sku || "").trim()).filter(Boolean))];
  if (skus.length > 1) return { status: "ambiguous", skus: skus.sort(), price: null };
  const prices = [...new Set(pool.map((r) => Number(r.retail_price)).filter((n) => Number.isFinite(n) && n > 0))];
  return { status: "ok", sku: skus[0] ?? null, price: prices.length === 1 ? prices[0] : null };
}

/**
 * Saglabātas rindas krāsas atrašana. Jaunās rindas glabā `colorKey` (precīzi). Vecās rindas zina tikai
 * nosaukumu: der tikai viena precīza nosaukuma sakritība; „Heather grey” vairākām divkrāsu krāsām → -1.
 */
export function pfFindColor(
  colors: { k?: string | null; n?: string | null }[],
  item: { colorKey?: string | null; colorName?: string | null },
): number {
  if (norm(item.colorKey)) return colors.findIndex((c) => norm(c.k) === norm(item.colorKey));
  const name = norm(item.colorName);
  if (!name) return -1;
  const hits = colors.map((c, i) => (norm(c.n) === name ? i : -1)).filter((i) => i >= 0);
  return hits.length === 1 ? hits[0] : -1;
}

/** SKU karte `${key}|${size}`; sadursmes netiek pārrakstītas ar pēdējo, bet atzīmētas. */
export function pfSkuMap(variants: { item_code: string; key: string; size: string | null }[]) {
  const groups = new Map<string, Set<string>>();
  for (const v of variants) {
    const k = `${v.key}|${v.size ?? ""}`;
    const set = groups.get(k) ?? new Set<string>();
    set.add(v.item_code);
    groups.set(k, set);
  }
  const skus: Record<string, string> = {};
  const ambiguous: Record<string, string[]> = {};
  for (const [k, set] of groups) {
    if (set.size === 1) skus[k] = [...set][0];
    else ambiguous[k] = [...set].sort();
  }
  return { skus, ambiguous };
}
