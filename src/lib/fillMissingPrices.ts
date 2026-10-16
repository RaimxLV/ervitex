import { fetchVariantPrices, priceForVariant, type VariantPrice } from "@/components/worksheet/useVariants";

type PricedLine = {
  source?: string | null;
  productId?: string | null;
  colorCode?: string | null;
  colorName?: string | null;
  size?: string | null;
  unitPrice?: number | null;
};

/** Aizpilda trūkstošās (0/tukšās) cenas no piegādātāja kataloga cenām. */
export async function fillMissingPrices<T extends PricedLine>(
  lines: T[],
  fetcher: (source: string, id: string) => Promise<VariantPrice[]> = fetchVariantPrices,
): Promise<T[]> {
  const cache = new Map<string, VariantPrice[]>();
  const out: T[] = [];
  for (const line of lines) {
    if ((Number(line.unitPrice) || 0) > 0 || !line.source || !line.productId) {
      out.push(line);
      continue;
    }
    const key = `${line.source}|${line.productId}`;
    if (!cache.has(key)) cache.set(key, await fetcher(line.source, line.productId));
    const rows = cache.get(key)!;
    const hit =
      priceForVariant(line.source, rows, line.colorCode ?? line.colorName, line.size).price;
    out.push(hit ? { ...line, unitPrice: hit } : line);
  }
  return out;
}
