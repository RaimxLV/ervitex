import { supabase } from "@/integrations/supabase/client";

export interface NwgVariantIdentity {
  product_number: string;
  item_number: string;
  color_code: string | null;
  color_name: string | null;
  shade_color: string | null;
  main_picture_url: string | null;
}
interface SkuIdentity { product_number: string; item_number: string | null; sku: string }

/** Exact relational identity, not suffix aliases, price minima or stock availability. */
export function nwgSkuVariants<T extends NwgVariantIdentity>(variants: T[], skus: SkuIdentity[]): T[] {
  const keys = new Set(skus.map(s => JSON.stringify([s.product_number, s.item_number])));
  return variants.filter(v => keys.has(JSON.stringify([v.product_number, v.item_number])));
}

export const nwgColorLabel = (v: Pick<NwgVariantIdentity, "color_name" | "color_code" | "item_number">) =>
  v.color_name?.trim() || v.color_code || v.item_number;

/** Build catalogue colours from the real item/SKU relation; never inherit orphan labels/images. */
export async function loadNwgCatalogIdentities(ids: string[]) {
  const result = new Map<string, { c: string; n: string; h: string | null; u: string | null }[]>();
  if (!ids.length) return result;
  const fetchAll = async (table: "nwg_variants" | "nwg_skus", columns: string) => {
    const rows: unknown[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase.from(table).select(columns).in("product_number", ids)
        .range(from, from + 999).abortSignal(AbortSignal.timeout(20000));
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < 1000) return rows;
    }
  };
  const [variants, skus] = await Promise.all([
    fetchAll("nwg_variants", "product_number,item_number,color_code,color_name,shade_color,main_picture_url"),
    fetchAll("nwg_skus", "product_number,item_number,sku"),
  ]);
  for (const id of ids) result.set(id, []);
  for (const v of nwgSkuVariants(variants as NwgVariantIdentity[], skus as SkuIdentity[])) {
    result.get(v.product_number)?.push({ c: v.item_number, n: nwgColorLabel(v),
      h: v.shade_color && /^#?[a-f\d]{6}$/i.test(v.shade_color) ? `#${v.shade_color.replace(/^#/, "")}` : null,
      u: v.main_picture_url });
  }
  return result;
}