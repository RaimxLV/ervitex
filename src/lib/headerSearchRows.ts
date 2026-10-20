import { categoryFromName, isCoarseCategory } from "@/lib/catalogCategory";

export interface HeaderSearchRow {
  source: string; id: string; name: string | null; brand: string | null;
  category: string | null; group_name: string | null; image_url?: string | null;
}
type Page = { data: unknown[] | null; error: unknown; count?: number | null };
export interface RowsLoaderDeps {
  readCache: () => Promise<{ items: unknown[]; prices: unknown[] } | null>;
  /** One page [from, to]; `withCount` asks for the total on the first page. */
  fetchPage: (table: string, cols: string, order: string, from: number, to: number, withCount: boolean) => Promise<Page>;
  fetchRemnants: () => Promise<Page>;
}

const STEP = 1000;
const must = (page: Page): unknown[] => {
  if (page.error) throw page.error instanceof Error ? page.error : new Error("Catalog read failed");
  return page.data || [];
};

/** Shared, deduplicated menu-search rows: success is cached, any failed page rejects and clears the cache. */
export function createRowsLoader(deps: RowsLoaderDeps) {
  let promise: Promise<HeaderSearchRow[]> | null = null;
  const fetchAll = async (table: string, cols: string, order: string) => {
    const first = await deps.fetchPage(table, cols, order, 0, STEP - 1, true);
    let rows = must(first);
    const total = first.count ?? rows.length;
    const offs: number[] = [];
    for (let f = STEP; f < total; f += STEP) offs.push(f);
    const rest = await Promise.all(offs.map((f) => deps.fetchPage(table, cols, order, f, f + STEP - 1, false)));
    for (const r of rest) rows = rows.concat(must(r));
    return rows as any[];
  };
  const run = async (): Promise<HeaderSearchRow[]> => {
    let items: any[]; let prices: any[];
    const cached = await deps.readCache().catch(() => null);
    if (cached) { items = cached.items as any[]; prices = cached.prices as any[]; }
    else {
      [items, prices] = await Promise.all([
        fetchAll("catalog_items", "source,id,name,brand,category,group_name,image_url", "id"),
        fetchAll("catalog_price_ranges", "source,style_code,min_price", "style_code"),
      ]);
    }
    const priced = new Set(prices.filter((p) => Number(p.min_price) > 0).map((p) => `${p.source}:${p.style_code}`));
    // Remnants must load too, otherwise hidden items could appear in results.
    const remnants = new Set((must(await deps.fetchRemnants()) as any[]).map((r) => `${r.source}:${r.style_code}`));
    return items
      .filter((it) => it?.id && it.name && !remnants.has(`${it.source}:${it.id}`) && (it.source === "etx" || priced.has(`${it.source}:${it.id}`)))
      .map((it) => ({
        ...it,
        category: !it.category || isCoarseCategory(it.category) ? categoryFromName(it.name) || it.category : it.category,
      }));
  };
  return {
    load(): Promise<HeaderSearchRow[]> {
      if (promise) return promise;
      const p = run();
      promise = p;
      p.catch(() => { if (promise === p) promise = null; });
      return p;
    },
  };
}
