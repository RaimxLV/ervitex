export const ETX_BRAND = "ETX Latvia";
export const ETX_CATEGORY = "Sporta formas sublimācija";
export const ETX_PUBLIC_BRAND = "Ervitex";

export const isEtxCategory = (categoryName?: string | null, categorySlug?: string | null): boolean =>
  categoryName?.trim().toLocaleLowerCase("lv") === ETX_CATEGORY.toLocaleLowerCase("lv") ||
  categorySlug === "sporta-formas-sublimacija";

export const catalogBrandForCategory = (
  categoryName: string | null | undefined,
  categorySlug: string | null | undefined,
  brand: string,
): string => isEtxCategory(categoryName, categorySlug) ? ETX_BRAND : brand;

export const sublimationProducts = <T extends { source: string; brand: string | null; category: string | null }>(rows: T[]): T[] =>
  rows.filter(row => row.source === "etx" && row.brand === ETX_BRAND && row.category === ETX_CATEGORY);