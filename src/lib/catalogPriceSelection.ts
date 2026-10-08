import { colorCodeMatches } from "@/lib/colorCodeMatch";

interface PriceRow { color_code: string | null; size: string | null; retail_price: number }
interface Color { code: string; name: string }
const norm = (value?: string | null) => (value || "").trim().toLowerCase();

/** White is priced below other colours, so it never sets the default starting price. */
export const isWhiteColor = (name?: string | null) => /^(white|balt[sa]?)$/.test(norm(name));
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
  const pick = (skipWhite: boolean) => {
    let index = -1;
    let minimum = Infinity;
    colors.forEach((color, i) => {
      if (skipWhite && isWhiteColor(colorName(color))) return;
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
