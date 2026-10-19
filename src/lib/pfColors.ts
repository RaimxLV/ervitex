/** PF feed `colors.color` → viena varianta krāsas identitāte (divkrāsu precēm visas krāsas, nevis tikai pirmā). */
export interface PfFeedColor {
  colorCode?: string | null;
  colorDesc?: string | null;
  baseColor?: string | null;
  hexColor?: string | null;
}

export const pfVariantColor = (colors: PfFeedColor | PfFeedColor[] | null | undefined) => {
  const list = (Array.isArray(colors) ? colors : colors ? [colors] : []).filter((c) => (c?.colorCode || "").trim());
  if (!list.length) return null;
  return {
    color_code: list.map((c) => c.colorCode!.trim()).join("+"),
    color_desc: list.map((c) => (c.colorDesc || c.colorCode || "").trim()).join(" / "),
    base_color: list[0].baseColor ?? null,
    hex_color: list[0].hexColor ?? null,
  };
};

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();

/** PF krāsas atslēga sakrīt tikai pilnībā — bez sufiksu/prefiksu minēšanas (H_GREY ≠ H_GREY+ROYAL). */
export const pfColorKeyMatches = (a?: string | null, b?: string | null) => !!norm(a) && norm(a) === norm(b);

export interface PfVariantRow {
  item_code: string;
  color_key: string | null;
  color_label: string | null;
  size: string | null;
  feed_active: boolean | null;
  retail_price: number | null;
  has_image: boolean;
}

/**
 * Pēc migrācijas 005 paredzētā PF kataloga loģika vienam modelim (atspoguļo catalog_items_mv
 * un catalog_variant_prices): atvecojušas SKU izslēgtas, krāsa = pilnā atslēga, swatch attēls
 * no SKU ar foto, cena katrai krāsai+izmēram no savas SKU; atšķirīgas cenas vienā grupā → null.
 */
export function pfCatalogColors(rows: PfVariantRow[]) {
  const live = rows.filter((r) => r.feed_active !== false && r.color_key);
  const keys = [...new Set(live.map((r) => r.color_key!))];
  return keys.map((key) => {
    const own = live.filter((r) => r.color_key === key).sort((a, b) => Number(b.has_image) - Number(a.has_image) || a.item_code.localeCompare(b.item_code));
    const sizes = new Map<string, Set<number | null>>();
    for (const r of own) {
      const s = sizes.get(r.size || "") ?? new Set();
      s.add(r.retail_price && r.retail_price > 0 ? r.retail_price : null);
      sizes.set(r.size || "", s);
    }
    const prices: Record<string, number | null> = {};
    for (const [size, set] of sizes) prices[size] = set.size === 1 ? [...set][0] : null;
    return { k: key, n: own[0].color_label, c: own[0].item_code, prices };
  });
}
