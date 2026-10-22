export const ETX_BRAND = "ETX Latvia";
export const ETX_CATEGORY = "Sporta formas sublimācija";
export const ETX_PUBLIC_BRAND = "Ervitex";

/** Secondary membership only: never duplicate catalog rows or replace their source category. */
export function catalogCategories(row: { source: string; category: string | null; name?: string | null }): string[] {
  const categories = row.category ? [row.category] : [];
  const facet = row.source === "etx" ? etxAdminCategoryFacet(row.category) : null;
  if (facet) categories.push(facet);
  if (row.source === "etx" && isEtxSublimationCategory(row.category)) {
    const text = `${row.category || ""} ${row.name || ""}`;
    if (/\b(?:dvielis|dvieļi|towels?)\b/i.test(text)) categories.push("Towels");
    if (/\bkr[uū]z(?:e|es)\b|\bmugs?\b/i.test(text)) categories.push("Mugs");
  }
  return [...new Set(categories)];
}

/** Admin (LV) category names → existing public canonical facets; ETX only, supplier taxonomy untouched. */
const ETX_ADMIN_FACETS: Record<string, string> = {
  "t-krekli": "T-shirts", "polo krekli": "Polos", "džemperi": "Sweaters", "flīša jakas": "Sweaters",
  "virsjakas": "Jackets", "vestes": "Vests", "bikses": "Trousers", "cepures": "Caps & Hats",
  "somas": "Bags", "audumu maisiņi": "Tote Bags", "lietussargi": "Umbrellas", "krūzes": "Mugs",
};
export const etxAdminCategoryFacet = (category?: string | null): string | null => {
  const key = (category || "").replace(/\(\s*sublim[^)]*\)/i, "").trim().toLocaleLowerCase("lv");
  return ETX_ADMIN_FACETS[key] ?? null;
};

/** Legacy supplier keys stay internal; manufacturer labels use the public brand. */
export const publicCatalogBrand = (brand: string | null | undefined, source?: string): string | null =>
  source === "etx" || brand === ETX_BRAND ? ETX_PUBLIC_BRAND : brand ?? null;

/** Admin-created ETX sublimation categories (e.g. "Krūzes (sublimācija)") belong to the sublimation section too. */
export const isEtxSublimationCategory = (category?: string | null): boolean =>
  !!category && (category === ETX_CATEGORY || /sublim/i.test(category));

/** The admin form shows the public brand; storage keeps the internal ETX key the catalogue view requires. */
export const storedProductBrand = (brand: string): string =>
  brand.trim() === ETX_PUBLIC_BRAND ? ETX_BRAND : brand;

export const isEtxCategory = (categoryName?: string | null, categorySlug?: string | null): boolean =>
  categoryName?.trim().toLocaleLowerCase("lv") === ETX_CATEGORY.toLocaleLowerCase("lv") ||
  categorySlug === "sporta-formas-sublimacija";

export const catalogBrandForCategory = (
  categoryName: string | null | undefined,
  categorySlug: string | null | undefined,
  brand: string,
): string => isEtxCategory(categoryName, categorySlug) ? ETX_BRAND : brand;

export const sublimationProducts = <T extends { source: string; brand: string | null; category: string | null }>(rows: T[]): T[] =>
  rows.filter(row => row.source === "etx" && row.brand === ETX_BRAND && isEtxSublimationCategory(row.category));