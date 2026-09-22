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
    const forColor = prices.filter((p) => !colorCode || !p.color_code || p.color_code === colorCode);
    const map = new Map<string, number | null>();
    for (const p of forColor.length ? forColor : prices) {
      const s = p.size || "-";
      const price = Number(p.retail_price);
      if (!map.has(s) || (map.get(s) ?? 0) < price) map.set(s, Number.isFinite(price) && price > 0 ? price : null);
    }
    return [...map.entries()]
      .map(([size, price]) => ({ size, price }))
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
