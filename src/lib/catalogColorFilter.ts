import { COLOR_BUCKETS, bucketOf, type ColorBucketKey } from "@/lib/colorBuckets";

export interface ModelColorInput {
  hex?: string | null;
  name?: string | null;
}

/** Build the set of color buckets present on a model given its (hex,name) pairs. */
export function bucketsForModel(colors: ModelColorInput[] | undefined | null): Set<ColorBucketKey> {
  const set = new Set<ColorBucketKey>();
  for (const c of colors || []) {
    const b = bucketOf(c.hex ?? null, c.name ?? null);
    if (b) set.add(b);
  }
  return set;
}

/** Build the sidebar color section items with counts across the given model list. */
export function colorSectionItems(
  models: { buckets: Set<ColorBucketKey> }[],
  lang: "lv" | "en"
) {
  const counts = new Map<ColorBucketKey, number>();
  for (const m of models) for (const b of m.buckets) counts.set(b, (counts.get(b) || 0) + 1);
  return COLOR_BUCKETS.map((b) => ({
    key: b.key,
    label: lang === "lv" ? b.lv : b.en,
    count: counts.get(b.key) || 0,
  })).filter((x) => x.count > 0);
}

export function labelToBucketKey(label: string, lang: "lv" | "en"): ColorBucketKey | null {
  const b = COLOR_BUCKETS.find((x) => (lang === "lv" ? x.lv : x.en) === label);
  return b ? b.key : null;
}

export function bucketKeyToLabel(key: ColorBucketKey, lang: "lv" | "en"): string {
  const b = COLOR_BUCKETS.find((x) => x.key === key);
  return b ? (lang === "lv" ? b.lv : b.en) : key;
}

/** Pick the first color entry that matches any of the selected buckets. */
export function pickMatchingColor<T extends ModelColorInput>(
  colors: T[] | undefined | null,
  selected: Set<ColorBucketKey>
): T | null {
  if (!colors || !selected.size) return null;
  for (const c of colors) {
    const b = bucketOf(c.hex ?? null, c.name ?? null);
    if (b && selected.has(b)) return c;
  }
  return null;
}
