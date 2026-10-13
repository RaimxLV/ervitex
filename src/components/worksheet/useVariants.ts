import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CatalogHit {
  source: string;
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  colors: { c?: string; n?: string; h?: string; u?: string }[] | null;
}

export interface VariantPrice {
  color_code: string | null;
  size: string | null;
  retail_price: number;
}

const SIZE_ORDER = ["3XS","2XS","XXS","XS","S","M","L","XL","XL/2XL","2XL","XXL","3XL","XXXL","4XL","5XL","6XL"];
export const sizeIdx = (s: string) => {
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  if (i >= 0) return i;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? 100 + n : 900;
};

const norm = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();

/** NWG numeric size codes -> labels. */
const NWG_SIZE_CODES: Record<string, string> = {
  "1": "3XS", "2": "XXS", "3": "XS", "4": "S", "5": "M", "6": "L",
  "7": "XL", "8": "XXL", "9": "3XL", "10": "4XL", "11": "5XL", "12": "6XL",
};

/** Catalog colour codes carry the style prefix (0200910-55), price rows only the suffix (55). */
export const colorMatches = (priceColor?: string | null, pickColor?: string | null) => {
  const a = norm(priceColor);
  const b = norm(pickColor);
  if (!a || !b) return false;
  return a === b || b.endsWith(`-${a}`) || a.endsWith(`-${b}`);
};

/** Size label mapper for one model's price rows. */
export const sizeLabeller = (source: string | null | undefined, rows: VariantPrice[]) => {
  const all = [...new Set(rows.map((r) => (r.size || "").trim()).filter(Boolean))];
  const coded =
    source === "nwg" && all.length > 0 && all.every((s) => /^\d{1,2}$/.test(s) && +s >= 1 && +s <= 12);
  return (s: string) => (coded ? NWG_SIZE_CODES[s] || s : s);
};

/** Cena precīzam izmēram un krāsai; atgriež arī izmēra nosaukumu. */
export const priceForVariant = (
  source: string,
  rows: VariantPrice[],
  colorCode: string | null | undefined,
  size: string | null | undefined,
) => {
  const label = sizeLabeller(source, rows);
  const want = norm(size) || "-";
  const bySize = rows.filter((r) => {
    const raw = (r.size || "-").trim() || "-";
    return norm(raw) === want || norm(label(raw)) === want;
  });
  const pool = bySize.length ? bySize : [];
  const byColor = colorCode ? pool.filter((r) => colorMatches(r.color_code, colorCode)) : [];
  const chosen = byColor.length ? byColor : pool;
  const values = chosen.map((r) => Number(r.retail_price)).filter((n) => Number.isFinite(n) && n > 0);
  const raw = chosen[0]?.size || null;
  return {
    price: values.length ? Math.min(...values) : null,
    size: raw ? label((raw || "").trim()) : size ?? null,
  };
};


export const fetchVariantPrices = async (source: string, styleCode: string) => {
  const rows: VariantPrice[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("catalog_variant_prices" as never)
      .select("color_code,size,retail_price")
      .eq("source", source)
      .eq("style_code", styleCode)
      .range(from, from + 999);
    if (error || !data) break;
    rows.push(...(data as unknown as VariantPrice[]));
    if (data.length < 1000) break;
    from += 1000;
  }
  return rows;
};

/** Modeļa krāsas un izmēru cenas (vienam modelim). */
export const useVariants = (source?: string | null, styleCode?: string | null) => {
  const [item, setItem] = useState<CatalogHit | null>(null);
  const [prices, setPrices] = useState<VariantPrice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source || !styleCode) {
      setItem(null);
      setPrices([]);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      const [{ data }, rows] = await Promise.all([
        supabase
          .from("catalog_items" as never)
          .select("source,id,name,brand,image_url,colors")
          .eq("source", source)
          .eq("id", styleCode)
          .maybeSingle(),
        fetchVariantPrices(source, styleCode),
      ]);
      if (!alive) return;
      setItem((data as unknown as CatalogHit) || null);
      setPrices(rows);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [source, styleCode]);

  const colors = useMemo(() => (item?.colors || []).filter((c) => c?.n || c?.c), [item]);

  const sizesFor = (colorCode?: string | null) => {
    const label = sizeLabeller(source, prices);
    const forColor = prices.filter(
      (p) => !colorCode || !p.color_code || colorMatches(p.color_code, colorCode),
    );
    const map = new Map<string, { raw: string; price: number | null }>();
    for (const p of forColor.length ? forColor : prices) {
      const raw = (p.size || "-").trim() || "-";
      const key = label(raw);
      const n = Number(p.retail_price);
      const price = Number.isFinite(n) && n > 0 ? n : null;
      const cur = map.get(key);
      if (!cur) map.set(key, { raw, price });
      else if (price !== null && (cur.price === null || price < cur.price)) map.set(key, { raw, price });
    }
    return [...map.entries()]
      .map(([size, v]) => ({ size, raw: v.raw, price: v.price }))
      .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
  };


  return { item, prices, colors, sizesFor, loading };
};

/** Latviešu vārdi -> kataloga angļu nosaukumi. */
const SYNONYMS: Record<string, string[]> = {
  krekls: ["t-shirt", "tee", "shirt"],
  krekli: ["t-shirt", "tee", "shirt"],
  tkrekls: ["t-shirt"],
  polo: ["polo"],
  jaka: ["jacket"],
  jakas: ["jacket"],
  cepure: ["cap", "beanie", "hat"],
  cepures: ["cap", "beanie", "hat"],
  bikses: ["trousers", "pants"],
  šorti: ["shorts"],
  veste: ["vest", "bodywarmer"],
  džemperis: ["sweat", "sweater", "hoodie"],
  jaciņa: ["jacket"],
  kapučjaka: ["hoodie"],
  hūdijs: ["hoodie"],
  soma: ["bag"],
  somas: ["bag"],
  mugursoma: ["backpack"],
  krūze: ["mug"],
  pudele: ["bottle"],
  dvielis: ["towel"],
  zeķes: ["socks"],
  priekšauts: ["apron"],
  lietussargs: ["umbrella"],
  cimdi: ["gloves"],
};

/** Kataloga meklēšana ar aizturi. */
export const useCatalogSearch = (q: string) => {
  const [hits, setHits] = useState<CatalogHit[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = window.setTimeout(async () => {
      const words = SYNONYMS[term.toLowerCase()] || [term];
      const filter = [
        ...words.map((w) => `name.ilike.%${w}%`),
        `id.ilike.%${term}%`,
        `brand.ilike.%${term}%`,
      ].join(",");
      const { data } = await supabase
        .from("catalog_items" as never)
        .select("source,id,name,brand,image_url,colors")
        .or(filter)
        .limit(25);
      setHits((data || []) as unknown as CatalogHit[]);
      setSearching(false);
    }, 300);
    return () => window.clearTimeout(t);
  }, [q]);

  return { hits, searching };
};
