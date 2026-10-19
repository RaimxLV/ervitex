import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { colorCodeMatches } from "@/lib/colorCodeMatch";

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
  return a === b || b.endsWith(`-${a}`) || a.endsWith(`-${b}`) || colorCodeMatches(a, b);
};

/** Size label mapper for one model's price rows. */
export const sizeLabeller = (source: string | null | undefined, rows: VariantPrice[]) => {
  const all = [...new Set(rows.map((r) => (r.size || "").trim()).filter(Boolean))];
  const coded =
    source === "nwg" && all.length > 0 && all.every((s) => /^\d{1,2}$/.test(s) && +s >= 1 && +s <= 12);
  return (s: string) => (coded ? NWG_SIZE_CODES[s] || s : s);
};

/** Avoti, kuru cena patiesi ir vienota visam modelim (rindas bez krāsas). */
export const MODEL_WIDE_PRICE_SOURCES = new Set(["ru", "etx"]);

const positive = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Rindas, kas attiecas uz konkrēto krāsu; bez krāsas — tikai vienotas cenas avotiem. */
export const rowsForColor = (source: string | null | undefined, rows: VariantPrice[], colorCode: string | null | undefined) => {
  const modelWide = MODEL_WIDE_PRICE_SOURCES.has(source || "");
  const colorless = rows.filter((r) => !(r.color_code || "").trim());
  if (!colorCode) {
    // Bez krāsas izvēles der tikai patiesi bezkrāsas rindas; krāsainās nekad nejauc.
    return colorless.length === rows.length || modelWide ? colorless : [];
  }
  const exact = rows.filter((r) => colorMatches(r.color_code, colorCode));
  if (exact.length) return exact;
  return modelWide ? colorless : [];
};

/** Viena cena vai null, ja rindām ir atšķirīgas cenas (nekāda min/mediāna). */
const singlePrice = (rows: VariantPrice[]) => {
  const values = [...new Set(rows.map((r) => positive(r.retail_price)).filter((n): n is number => n !== null))];
  return values.length === 1 ? values[0] : null;
};

/** Cena precīzam izmēram un krāsai; atgriež arī izmēra nosaukumu. */
export const priceForVariant = (
  source: string,
  rows: VariantPrice[],
  colorCode: string | null | undefined,
  size: string | null | undefined,
) => {
  const label = sizeLabeller(source, rows);
  const pool = rowsForColor(source, rows, colorCode);
  const want = norm(size) || "-";
  const bySize = pool.filter((r) => {
    const raw = (r.size || "-").trim() || "-";
    return norm(raw) === want || norm(label(raw)) === want;
  });
  // Modelim bez izmēriem (somas, cepures) der jebkura šīs krāsas rinda.
  const sizeless = pool.length > 0 && pool.every((r) => !(r.size || "").trim() || r.size?.trim() === "-");
  const chosen = bySize.length ? bySize : sizeless ? pool : [];
  const raw = chosen[0]?.size || null;
  return {
    price: singlePrice(chosen),
    size: raw ? label((raw || "").trim()) : size ?? null,
  };
};

/** Izmēri un cenas tikai izvēlētajai krāsai; bez citu krāsu rezerves. */
export const sizesForColor = (
  source: string | null | undefined,
  prices: VariantPrice[],
  colorCode?: string | null,
  declaredSizes?: string[] | null,
) => {
  // Russell: cena vienota visam modelim un bez izmēra; izmēri nāk no ru_styles.sizes.
  const declared = [...new Set((declaredSizes || []).map((x) => (x || "").trim()).filter(Boolean))];
  if (source === "ru" && declared.length) {
    const pool = rowsForColor(source, prices, colorCode ?? null);
    const sizeless = pool.every((r) => !(r.size || "").trim() || r.size?.trim() === "-");
    const price = sizeless ? singlePrice(pool) : null;
    return declared
      .map((size) => ({ size, raw: size, price }))
      .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
  }
  const label = sizeLabeller(source, prices);
  const pool = colorCode ? rowsForColor(source, prices, colorCode) : prices;
  const map = new Map<string, { raw: string; rows: VariantPrice[] }>();
  for (const p of pool) {
    const raw = (p.size || "-").trim() || "-";
    const key = label(raw);
    const cur = map.get(key);
    if (cur) cur.rows.push(p);
    else map.set(key, { raw, rows: [p] });
  }
  return [...map.entries()]
    .map(([size, v]) => ({
      size,
      raw: v.raw,
      price: colorCode || rowsForColor(source, v.rows, null).length ? singlePrice(v.rows) : null,
    }))
    .sort((a, b) => sizeIdx(a.size) - sizeIdx(b.size) || a.size.localeCompare(b.size));
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
  const [declaredSizes, setDeclaredSizes] = useState<string[] | null>(null);

  useEffect(() => {
    if (!source || !styleCode) {
      setItem(null);
      setPrices([]);
      setDeclaredSizes(null);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      const [{ data }, rows, ru] = await Promise.all([
        supabase
          .from("catalog_items" as never)
          .select("source,id,name,brand,image_url,colors")
          .eq("source", source)
          .eq("id", styleCode)
          .maybeSingle(),
        fetchVariantPrices(source, styleCode),
        source === "ru"
          ? supabase.from("ru_styles").select("sizes").eq("style_code", styleCode).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (!alive) return;
      setDeclaredSizes(((ru as { data: { sizes: string[] | null } | null }).data?.sizes) || null);
      setItem((data as unknown as CatalogHit) || null);
      setPrices(rows);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [source, styleCode]);

  const colors = useMemo(() => (item?.colors || []).filter((c) => c?.n || c?.c), [item]);

  const sizesFor = (colorCode?: string | null) => sizesForColor(source, prices, colorCode, declaredSizes);

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
