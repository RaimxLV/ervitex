import { colorCodeCandidates, colorCodeMatches } from "@/lib/colorCodeMatch";

interface PriceRow { color_code: string | null; size: string | null; retail_price: number }
interface Color { code: string; name: string }
const norm = (value?: string | null) => (value || "").trim().toLowerCase();

/** White is priced below other colours, so it never sets the default starting price. */
export const isWhiteColor = (name?: string | null) => /^(white|balt[sa]?)$/.test(norm(name));
// Exact catalogue names, including supplier white shades and Natural Raw.
// Mixed colours and distinct shades such as Natural Stone remain eligible.
export const isExcludedStartingColor = (name?: string | null) =>
  isWhiteColor(name) || /^(off white|soft white|vintage white|natural|natural raw)$/.test(norm(name));
const colorName = (c: unknown) => {
  const o = c as { n?: string | null; name?: string | null } | null;
  return o?.n ?? o?.name ?? null;
};

/** Select only a real, positive-priced variant; explicit colour/size take precedence. */
export function lowestPriceVariant(
  rows: PriceRow[], colors: Color[], aliases: Record<string, string> = {},
  requestedColor?: string | null, requestedSize?: string | null,
) {
  const color = colors.find((c) => colorCodeMatches(c.code, requestedColor) ||
    (!!requestedColor && norm(c.name) === norm(requestedColor)));
  const label = (size: string | null) => Object.entries(aliases).find(([, raw]) => norm(raw) === norm(size))?.[0] || size;
  let candidates = rows.filter((r) => Number.isFinite(Number(r.retail_price)) && Number(r.retail_price) > 0);
  if (colors.length) candidates = candidates.filter((r) => !r.color_code || colors.some((c) => colorCodeMatches(c.code, r.color_code)));
  if (color) candidates = candidates.filter((r) => !r.color_code || colorCodeMatches(r.color_code, color.code));
  else {
    const isWhiteRow = (r: PriceRow) => isWhiteColor(r.color_code) ||
      colors.some((c) => isWhiteColor(c.name) && colorCodeMatches(c.code, r.color_code));
    const nonWhite = candidates.filter((r) => !isWhiteRow(r));
    if (nonWhite.length) candidates = nonWhite;
  }
  if (requestedSize) candidates = candidates.filter((r) => norm(r.size) === norm(requestedSize) || norm(label(r.size)) === norm(requestedSize));
  const row = candidates.reduce<PriceRow | null>((best, r) => !best || Number(r.retail_price) < Number(best.retail_price) ? r : best, null);
  return {
    color: color?.code || colors.find((c) => colorCodeMatches(c.code, row?.color_code))?.code || colors[0]?.code || null,
    size: requestedSize || label(row?.size || null) || null,
    price: row ? Number(row.retail_price) : null,
  };
}

export function lowestPriceColorIndex<T>(colors: T[], priceFor: (color: T) => number | undefined): number {
  const pick = (skipExcluded: boolean) => {
    let index = -1;
    let minimum = Infinity;
    colors.forEach((color, i) => {
      if (skipExcluded && isExcludedStartingColor(colorName(color))) return;
      const price = priceFor(color);
      if (price !== undefined && Number.isFinite(price) && price > 0 && price < minimum) {
        minimum = price;
        index = i;
      }
    });
    return index;
  };
  const index = pick(true);
  return index >= 0 ? index : pick(false);
}

/** Avoti, kuru cena ir vienota visam modelim (rindas bez krāsas). */
export const MODEL_WIDE_CATALOG_SOURCES = new Set(["ru", "etx"]);

/** Malfini katalogs: stils + 2 zīmju krāsa + izmērs (1742112 -> 21, S30B539 -> B5). */
const malfiniColorKey = (styleId: string, code: string) => {
  const c = code.trim().toLowerCase();
  const s = styleId.trim().toLowerCase();
  return s && c.startsWith(s) && c.length >= s.length + 2 ? c.slice(s.length, s.length + 2) : null;
};

/**
 * Krāsas cena no kartītes cenu kartes (atslēga `${source}:${id}:${color}`).
 * Precīza krāsa; bezkrāsas modeļa cena tikai MODEL_WIDE avotiem; citas krāsas nekad.
 */
export function catalogColorPrice<T>(
  prices: Map<string, T>, source: string, id: string,
  color: { c?: string | null; n?: string | null } | null | undefined,
): T | undefined {
  const base = `${source}:${id}:`;
  const code = color ? (source === "pf" ? color.n : color.c || color.n) : null;
  if (code) {
    const keys = [...colorCodeCandidates(code)];
    if (source === "mf") { const k = malfiniColorKey(id, code); if (k) keys.unshift(k); }
    for (const k of keys) { const hit = prices.get(base + k); if (hit) return hit; }
  }
  return MODEL_WIDE_CATALOG_SOURCES.has(source) ? prices.get(base) : undefined;
}
