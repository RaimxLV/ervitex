import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import CatalogFiltersSidebar, {
  type FilterSection,
} from "@/components/catalog/CatalogFiltersSidebar";
import CatalogModelCard from "@/components/catalog/CatalogModelCard";
import CatalogItemDialog from "@/components/catalog/CatalogItemDialog";
import { SOURCE_META, type CatalogSource } from "@/components/catalog/unifiedCatalogMeta";
import {
  COLOR_BUCKETS,
  bucketOf,
  getBucket,
  type ColorBucketKey,
} from "@/lib/colorBuckets";

/* -------------------- helpers -------------------- */

const VALID_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
// Placeholder hexes that partner feeds use as "unknown" fillers. Whenever we
// see one of these AND the name gives us a real bucket, prefer the canonical
// palette hex so swatches don't collapse into a wall of grey/black dots.
const PLACEHOLDER_HEX = new Set([
  "#000000", "#8a8a8a", "#888888", "#808080", "#999999",
  "#cccccc", "#c8c8c8", "#b3b3b3", "#3f3f42",
]);
const sanitizeHex = (
  hex: string | null | undefined,
  bucket: ColorBucketKey | null,
  name?: string | null,
): string | null => {
  const raw = (hex ?? "").trim().toLowerCase();
  const valid = raw && VALID_HEX.test(raw) ? raw : null;
  // If the stored hex is a known placeholder OR its color family disagrees
  // with the name-derived bucket, fall back to the palette hex.
  if (bucket && bucket !== "multi") {
    if (!valid) return getBucket(bucket).hex;
    if (PLACEHOLDER_HEX.has(valid)) {
      // For combo names like "Black/Lime Green" keep the raw hex so the card's
      // split-swatch renderer can build a two-tone circle from the name parts.
      const isCombo = /[\/&+]| - /.test(name || "");
      if (!isCombo) return getBucket(bucket).hex;
    }
  }
  return valid;
};

interface ColorEntry { h: string | null; n: string | null; u: string | null; c?: string | null }



interface CatalogItem {
  source: CatalogSource;
  id: string;
  name: string | null;
  description: string | null;
  brand: string | null;
  category: string | null;
  group_name: string | null;
  gender: string | null;
  image_url: string | null;
  hover_image_url: string | null;
  colors: ColorEntry[] | null;
}

interface EnrichedColor extends ColorEntry { bucket: ColorBucketKey | null }
interface EnrichedItem extends Omit<CatalogItem, "colors"> {
  colors: EnrichedColor[];
  buckets: Set<ColorBucketKey>;
  manufacturer: string;
}

/**
 * Virtual "Ražotājs" (manufacturer) taxonomy. It unifies:
 *  - Stanley/Stella (its own source)
 *  - Selected partner brands from the NWG feed (Craft / Clique / ProJob / Cutter & Buck).
 *    The feed owner name itself is never shown as a manufacturer, and all other
 *    brands from that feed are hidden from the public catalog.
 *  - PF Concept split: Elevate + Roly become standalone manufacturers, the
 *    remaining PF items live under "Prezentmateriāli".
 *  - Beechfield Brands, Malfini.
 */
const MANUFACTURERS: { key: string; label: string }[] = [
  { key: "ss", label: "Stanley/Stella" },
  { key: "nwg-craft", label: "Craft" },
  { key: "nwg-clique", label: "Clique" },
  { key: "nwg-projob", label: "ProJob" },
  { key: "nwg-cutter", label: "Cutter & Buck" },
  { key: "pf-elevate", label: "Elevate" },
  { key: "pf-roly", label: "Roly" },
  { key: "ru", label: "Russell" },
  { key: "pf", label: "Prezentmateriāli" },
  { key: "bb", label: "Beechfield Brands" },
  { key: "mf", label: "Malfini" },
];
const MANUFACTURER_ORDER: Record<string, number> = Object.fromEntries(
  MANUFACTURERS.map((m, i) => [m.key, i]),
);
const MANUFACTURER_LABEL: Record<string, string> = Object.fromEntries(
  MANUFACTURERS.map((m) => [m.key, m.label]),
);
const parseManufacturerFilter = (rawValue: string | null): Set<string> => {
  const parsed = new Set<string>();
  for (const raw of (rawValue || "").split(",")) {
    const token = raw.trim().toLowerCase();
    if (!token) continue;
    if (token === "stanley-stella" || token === "stanley/stella") parsed.add("ss");
    else if (token === "pf-concept" || token === "pf concept") parsed.add("pf");
    else if (token === "beechfield-brands" || token === "beechfield brands") parsed.add("bb");
    else if (MANUFACTURER_LABEL[token]) parsed.add(token);
  }
  return parsed;
};
const manufacturerOf = (source: CatalogSource, brand: string | null): string | null => {
  const b = (brand || "").toLowerCase();
  if (source === "ss") return "ss";
  if (source === "nwg") {
    if (b.includes("craft")) return "nwg-craft";
    if (b.includes("clique")) return "nwg-clique";
    if (b.replace(/\s+/g, "").includes("projob")) return "nwg-projob";
    if (b.includes("cutter")) return "nwg-cutter";
    return null;
  }
  if (source === "pf") {
    if (b.includes("elevate")) return "pf-elevate";
    if (b === "roly" || b.startsWith("roly ") || b.includes(" roly")) return "pf-roly";
    return "pf";
  }
  if (source === "bb") return "bb";
  if (source === "mf") return "mf";
  if ((source as string) === "ru") return "ru";
  return source;
};

const GENDER_MAP: Record<string, string | null> = {
  male: "Men", men: "Men", mens: "Men", man: "Men", gents: "Men", gentlemen: "Men",
  female: "Women", women: "Women", womens: "Women", woman: "Women", ladies: "Women", lady: "Women",
  junior: "Kids", juniors: "Kids", kid: "Kids", kids: "Kids",
  children: "Kids", child: "Kids", youth: "Kids", boys: "Kids", girls: "Kids",
  "menskids": "Kids", "womenskids": "Kids",
  baby: "Baby", babies: "Baby", infant: "Baby", infants: "Baby", toddler: "Baby",
  unisex: "Unisex", adult: "Unisex", adults: "Unisex", uni: "Unisex",
  "unisexkids": "Unisex",
  none: "", "-": "", "": "", accessories: "",
  nezadano: "", neznamo: "", unknown: "",
};
const normalizeGender = (raw?: string | null): string | null => {
  if (!raw) return null;
  // Strip apostrophes/punctuation/spaces so "Men's", "Men´s", "Men's/Kids" all collapse.
  const key = raw
    .trim()
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[\s._\-\/&+]+/g, "");
  if (key in GENDER_MAP) {
    const v = GENDER_MAP[key];
    return v === "" ? null : v;
  }
  return null; // drop unknown values instead of leaking raw feed labels
};

const CATEGORY_MAP: Record<string, string> = {
  // T-shirts family
  "t-shirt": "T-shirts", "tshirt": "T-shirts", "tshirts": "T-shirts", "t-shirts": "T-shirts",
  "tees": "T-shirts", "tank tops": "T-shirts",
  // Polos
  "polo": "Polos", "polos": "Polos", "polo shirts": "Polos", "polo shirt": "Polos",
  // Hoodies
  "hoodie": "Hoodies", "hoodies": "Hoodies", "hoodie sweatshirts": "Hoodies",
  // Sweaters / sweatshirts / fleece
  "sweater": "Sweaters", "sweaters": "Sweaters",
  "sweatshirt": "Sweaters", "sweatshirts": "Sweaters",
  "crew neck sweatshirts": "Sweaters", "zip-thru sweatshirts": "Sweaters",
  "fleece": "Sweaters", "terry": "Sweaters",
  // Jackets
  "jacket": "Jackets", "jackets": "Jackets", "jackets-vests": "Jackets",
  "non padded jacket": "Jackets", "light padded jacket": "Jackets", "padded jacket": "Jackets",
  // Vests
  "vest": "Vests", "vests": "Vests", "bodywarmers": "Vests", "safety vests": "Vests",
  // Caps / hats / beanies
  "cap": "Caps & Hats", "caps": "Caps & Hats", "hat": "Caps & Hats", "hats": "Caps & Hats",
  "caps & hats": "Caps & Hats", "headwear": "Caps & Hats",
  "beanie": "Caps & Hats", "beanies": "Caps & Hats",
  // Bags
  "bag": "Bags", "bags": "Bags",
  "shopping & tote bags": "Tote Bags", "tote bags": "Tote Bags", "cotton bags": "Tote Bags",
  "backpack": "Backpacks", "backpacks": "Backpacks", "laptop backpacks": "Backpacks",
  // Shorts / trousers
  "short": "Shorts", "shorts": "Shorts",
  "trouser": "Trousers", "trousers": "Trousers", "pant": "Trousers", "pants": "Trousers",
  "trousers-shorts": "Trousers", "shorts & trousers": "Trousers", "training pants": "Trousers",
  // Bottles / mugs
  "bottle": "Bottles", "bottles": "Bottles",
  "water bottles": "Bottles", "insulated bottles": "Bottles",
  "sports bottles": "Bottles", "infuser bottles": "Bottles",
  "mug": "Mugs", "mugs": "Mugs", "standard mugs": "Mugs",
  "insulated mugs": "Mugs", "travel mugs": "Mugs", "cups": "Mugs",
  // Notebooks
  "notebook": "Notebooks", "notebooks": "Notebooks", "notepad": "Notebooks", "notepads": "Notebooks",
  "hard cover notebooks": "Notebooks", "soft cover notebooks": "Notebooks", "sketchbooks": "Notebooks",
  // Keychains
  "keychain": "Keychains & Keyrings", "keychains": "Keychains & Keyrings",
  "keychains & keyrings": "Keychains & Keyrings",
  // Umbrellas
  "umbrella": "Umbrellas", "umbrellas": "Umbrellas",
  "standard umbrellas": "Umbrellas", "folding umbrellas": "Umbrellas",
  "golf umbrellas": "Umbrellas", "storm umbrellas": "Umbrellas",
  // Audio
  "headphones": "Headphones", "earbuds": "Headphones",
  // Bottoms / Tops passthroughs
  "bottom": "Bottoms", "bottoms": "Bottoms",
  "top": "Tops", "tops": "Tops",
};
const normalizeCategory = (raw?: string | null): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed.toLowerCase() === "none") return null;
  return CATEGORY_MAP[trimmed.toLowerCase()] || trimmed;
};
const normalizeText = (raw?: string | null): string | null => {
  if (!raw) return null;
  const t = raw.trim();
  if (!t || t === "-" || t.toLowerCase() === "none") return null;
  return t;
};
const isIncompleteNwgShell = (it: CatalogItem): boolean => {
  if (it.source !== "nwg") return false;
  const name = normalizeText(it.name);
  const hasRealName = !!name && name.toLowerCase() !== it.id.toLowerCase();
  const hasDescription = !!normalizeText(it.description);
  const hasCategory = !!normalizeText(it.category);
  const hasColors = Array.isArray(it.colors) && it.colors.length > 0;
  // NWG sometimes returns placeholder model rows (only code + brand + image).
  // Those open a dialog with no supplier content, so keep only real product rows.
  return !hasRealName && !hasDescription && !hasCategory && !hasColors;
};

const PAGE_SIZE = 24;

const SS_CDN_BASE = "https://res.cloudinary.com/www-stanleystella-com/image/upload/";
const SS_THUMB = "f_auto,q_auto,w_600,c_fill,g_auto";
const resolveSsUrl = (u?: string | null): string | null => {
  if (!u || u === "[object Object]") return null;
  if (/^https?:\/\//i.test(u)) {
    if (u.includes("res.cloudinary.com") && u.includes("/image/upload/")) {
      return u.replace("/image/upload/", `/image/upload/${SS_THUMB}/`);
    }
    return u;
  }
  return SS_CDN_BASE + SS_THUMB + "/" + u.replace(/^\/+/, "");
};

const resolveImgUrl = (source: CatalogSource, u: string | null): string | null => {
  if (!u || u === "[object Object]") return null;
  return source === "ss" ? resolveSsUrl(u) : u;
};

/* -------------------- component -------------------- */

/* -------------------- component -------------------- */

interface Props {
  /** When set, forces a supplier and hides the supplier filter. */
  lockedSource?: CatalogSource;
  title?: string;
  subtitle?: string;
}

const UnifiedCatalog = ({ lockedSource, title, subtitle }: Props) => {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pfPrices, setPfPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());
  const [ssPrices, setSsPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());
  const [bbPrices, setBbPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());
  const [mfPrices, setMfPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());
  const [ruPrices, setRuPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sources, setSources] = useState<Set<string>>(() => {
    // lockedSource already restricts the database query by supplier. Do not
    // also seed the virtual "Ražotājs" filter with the raw supplier key:
    // NWG products are mapped to Craft/Clique/ProJob/Cutter & Buck, so
    // `source=nwg` filters every NWG card out and leaves the page empty.
    if (lockedSource) return new Set();
    const fromUrl = parseManufacturerFilter(searchParams.get("source"));
    if (fromUrl.size) return fromUrl;
    return new Set();
  });
  const [brands, setBrands] = useState<Set<string>>(
    new Set((searchParams.get("brand") || "").split(",").filter(Boolean))
  );
  const [categories, setCategories] = useState<Set<string>>(
    new Set(
      (searchParams.get("category") || "")
        .split(",")
        .map((v) => normalizeCategory(v))
        .filter((v): v is string => !!v),
    ),
  );
  const [groups, setGroups] = useState<Set<string>>(
    new Set((searchParams.get("group") || "").split(",").filter(Boolean))
  );
  const [genders, setGenders] = useState<Set<string>>(
    new Set((searchParams.get("gender") || "").split(",").filter(Boolean))
  );
  const [colors, setColors] = useState<Set<string>>(
    new Set((searchParams.get("color") || "").split(",").filter(Boolean))
  );
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "featured");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (sources.size) p.set("source", [...sources].join(","));
    if (brands.size) p.set("brand", [...brands].join(","));
    if (categories.size) p.set("category", [...categories].join(","));
    if (groups.size) p.set("group", [...groups].join(","));
    if (genders.size) p.set("gender", [...genders].join(","));
    if (colors.size) p.set("color", [...colors].join(","));
    if (sort && sort !== "featured") p.set("sort", sort);
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [q, sources, brands, categories, groups, genders, colors, sort, page, setSearchParams]);

  useEffect(() => {
    (async () => {
      const all: CatalogItem[] = [];
      const step = 1000;
      let from = 0;
      while (true) {
        let query = supabase
          .from("catalog_items" as any)
          .select(
            "source,id,name,brand,category,group_name,gender,image_url,hover_image_url,colors"
          );
        if (lockedSource) query = query.eq("source", lockedSource);
        const { data, error } = await query.range(from, from + step - 1);
        if (error) break;
        all.push(...((data || []) as unknown as CatalogItem[]));
        if (!data || data.length < step) break;
        from += step;
      }
      const enriched: EnrichedItem[] = all
        .map((it) => {
          if (isIncompleteNwgShell(it)) return null;
          const buckets = new Set<ColorBucketKey>();
          const raw = (it.colors || []) as ColorEntry[];
          const colorList: EnrichedColor[] = raw.map((c) => {
            const bucket = bucketOf(c.h, c.n);
            if (bucket) buckets.add(bucket);
            return { ...c, bucket };
          });
          const brand = (() => {
            const b = normalizeText(it.brand);
            return b && b.toLowerCase() !== "unbranded" ? b : null;
          })();
          const manufacturer = manufacturerOf(it.source, brand);
          if (!manufacturer) return null;
          return {
            ...it,
            brand,
            category: normalizeCategory(it.category),
            group_name: normalizeText(it.group_name),
            gender: normalizeGender(it.gender),
            colors: colorList,
            buckets,
            manufacturer,
          } as EnrichedItem;
        })
        .filter((x): x is EnrichedItem => x !== null);
      setItems(enriched);
      setLoaded(true);

      // Load unified catalog price ranges (min/max per style, all sources).
      // Prices are stored excl. VAT and already include our markup.
      {
        const ranges = new Map<string, { price: number; max: number; currency: string }>();
        let from = 0;
        while (true) {
          let query = supabase
            .from("catalog_price_ranges" as any)
            .select("source,style_code,min_price,max_price,currency")
            .range(from, from + 999);
          if (lockedSource) query = query.eq("source", lockedSource);
          const { data, error } = await query;
          if (error || !data) break;
          for (const r of data as any[]) {
            const key = `${r.source}:${r.style_code}`;
            const min = Number(r.min_price);
            const max = Number(r.max_price);
            if (!Number.isFinite(min) || min <= 0) continue;
            ranges.set(key, {
              price: min,
              max: Number.isFinite(max) && max > min ? max : min,
              currency: r.currency || "EUR",
            });
          }
          if (data.length < 1000) break;
          from += 1000;
        }
        setPriceRanges(ranges);
      }

    })();
  }, [lockedSource]);

  useEffect(() => {
    setPage(1);
  }, [q, sources, brands, categories, groups, genders, colors, sort]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const t = useMemo(
    () => ({
      title: title ?? (lang === "lv" ? "Katalogs" : "Catalog"),
      subtitle: subtitle ?? "",
      search: lang === "lv" ? "Meklēt modeli, kodu vai zīmolu…" : "Search model, code or brand…",
      results: lang === "lv" ? "rezultāti" : "results",
      clearAll: lang === "lv" ? "Notīrīt filtrus" : "Clear filters",
      source: lang === "lv" ? "Ražotājs" : "Manufacturer",
      brand: lang === "lv" ? "Zīmols" : "Brand",
      category: lang === "lv" ? "Kategorija" : "Category",
      group: lang === "lv" ? "Grupa" : "Group",
      gender: lang === "lv" ? "Dzimums" : "Gender",
      color: lang === "lv" ? "Krāsa" : "Color",
      empty: lang === "lv" ? "Nav atrasts neviens produkts" : "No products found",
      prev: lang === "lv" ? "Iepriekšējā" : "Previous",
      next: lang === "lv" ? "Nākamā" : "Next",
      request: lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote",
    }),
    [lang, title, subtitle]
  );

  const passesExcept = (it: EnrichedItem, except: string, extraQ = q) => {
    if (extraQ) {
      const needle = extraQ.toLowerCase();
      const hay = `${it.name || ""} ${it.id} ${it.brand || ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (except !== "source" && sources.size && !sources.has(it.manufacturer)) return false;
    if (except !== "brand" && brands.size && (!it.brand || !brands.has(it.brand))) return false;
    if (except !== "category" && categories.size && (!it.category || !categories.has(it.category))) return false;
    if (except !== "group" && groups.size && (!it.group_name || !groups.has(it.group_name))) return false;
    if (except !== "gender" && genders.size && (!it.gender || !genders.has(it.gender))) return false;
    if (except !== "color" && colors.size) {
      let ok = false;
      for (const c of colors) if (it.buckets.has(c as ColorBucketKey)) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  };

  const facet = useCallback(
    (key: string, pick: (it: EnrichedItem) => string | null | undefined) => {
      const counts = new Map<string, number>();
      for (const it of items) {
        if (!passesExcept(it, key)) continue;
        const v = pick(it);
        if (!v) continue;
        counts.set(v, (counts.get(v) || 0) + 1);
      }
      return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, q, sources, brands, categories, groups, genders, colors]
  );

  // "Ražotājs" facet — virtual manufacturer taxonomy (see MANUFACTURERS above).
  const sourceItems = useMemo(() => {
    return MANUFACTURERS
      .map((m) => ({
        label: m.label,
        value: m.key,
        count: items.filter((it) => it.manufacturer === m.key && passesExcept(it, "source")).length,
      }))
      .filter((x) => x.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, q, sources, brands, categories, groups, genders, colors]);

  // ── LV translations for facet values ──
  const CATEGORY_LV: Record<string, string> = {
    "T-shirts": "T-krekli", "Polos": "Polo krekli", "Hoodies": "Jakas ar kapuci",
    "Sweaters": "Džemperi", "Jackets": "Virsjakas", "Caps & Hats": "Cepures",
    "Beanies": "Adītas cepures", "Bags": "Somas", "Backpacks": "Mugursomas",
    "Shorts": "Šorti", "Trousers": "Bikses", "Bottoms": "Apakšdaļas", "Tops": "Augšdaļas",
    "Ballpoint Pens": "Lodīšu pildspalvas", "Water Bottles": "Ūdens pudeles",
    "Hard Cover Notebooks": "Cietvāku bloknoti", "Soft Cover Notebooks": "Mīkstvāku bloknoti",
    "Notebooks": "Bloknoti", "Notepads": "Bloknoti",
    "Insulated Mugs": "Termokrūzes", "Mugs": "Krūzes", "Standard Mugs": "Standarta krūzes",
    "Travel Mugs": "Ceļojumu krūzes",
    "Shopping & Tote Bags": "Iepirkumu somas", "Tote Bags": "Iepirkumu somas",
    "Home Accessories": "Mājas aksesuāri", "Sports Bottles": "Sporta pudeles",
    "Cables": "Kabeļi", "Power Banks": "Ārējie akumulatori",
    "Umbrellas": "Lietussargi", "Keychains": "Atslēgu piekariņi",
    "Keychains & Keyrings": "Atslēgu piekariņi",
    "Wireless Chargers": "Bezvadu lādētāji", "Chargers": "Lādētāji",
    "Speakers": "Skaļruņi", "Headphones": "Austiņas", "Earbuds": "Austiņas",
    "Pens": "Pildspalvas", "Pencils": "Zīmuļi", "Lanyards": "Kakla lentes",
    "Raincoats": "Lietusmēteļi", "Vests": "Vestes", "Aprons": "Priekšauti",
    "Socks": "Zeķes", "Gloves": "Cimdi", "Scarves": "Šalles",
    "Tumblers": "Termokrūzes", "Bottles": "Pudeles", "Coasters": "Paliktņi",
    "Cutlery": "Galda piederumi", "Lunch Boxes": "Pusdienu kastes",
    "Tools": "Instrumenti", "Torches": "Lukturi", "Flashlights": "Lukturi",
    "Wallets": "Maki", "Cardholders": "Karšu turētāji",
    "Office": "Birojs", "Travel": "Ceļojumi", "Outdoor": "Āra aktivitātes",
    "Tech": "Tehnoloģijas", "Electronics": "Elektronika",
    "Drinkware": "Trauki", "Writing": "Rakstāmpiederumi",
    // extended
    "Interior": "Interjers", "Glassware": "Stikla trauki", "Kitchen": "Virtuve",
    "Kitchenware": "Virtuves piederumi", "Headwear": "Galvassegas",
    "Accessories": "Aksesuāri", "Shoes": "Apavi", "Sets": "Komplekti",
    "Gift Sets": "Dāvanu komplekti", "Vases": "Vāzes", "Travel Bags": "Ceļojumu somas",
    "Cooler Bags": "Termosomas", "Insulated Bottles": "Termopudeles",
    "Travel Accessories": "Ceļojumu aksesuāri", "Laptop Backpacks": "Datora mugursomas",
    "Sticky Notes": "Līmlapiņas", "Bedroom": "Guļamistaba",
    "Drawstring Bags": "Auklas somas", "Sports Bags": "Sporta somas",
    "Towels": "Dvieļi", "Shirts": "Krekli",
    "Crew neck sweatshirts": "Džemperi ar apaļu izgriezumu",
    "Hoodie sweatshirts": "Jakas ar kapuci",
    "Personal Care": "Personīgā aprūpe", "Fitness & Sport": "Fitness & sports",
    "Sunglasses": "Saulesbrilles", "Computer Accessories": "Datoru aksesuāri",
    "Serving Boards & Sets": "Servēšanas dēļi", "Bodywarmers": "Vestes",
    "Toiletry Bags": "Kosmētikas somas", "Stands & Holders": "Statīvi & turētāji",
    "Non Padded Jacket": "Vieglas virsjakas", "Bar glass": "Bāra glāzes",
    "Blankets": "Segas", "Rollerball Pens": "Rollera pildspalvas",
    "Car Accessories": "Auto aksesuāri", "Portfolios": "Mapes",
    "Laptop & Tablet Bags": "Datoru & planšetu somas",
    "Display": "Displeji", "Wine Accessories": "Vīna aksesuāri",
    "Colouring Sets": "Krāsošanas komplekti", "Gadgets": "Gadžeti",
    "Other Pens & Writing Accessories": "Citi rakstāmpiederumi",
    "Business Bags": "Biznesa somas", "Shorts & Trousers": "Šorti & bikses",
    "Workwear": "Darba apģērbs", "Textiles": "Tekstils",
    "Safety": "Drošība", "Catalogues": "Katalogi", "Bathroom": "Vannasistaba",
    "Pants": "Bikses", "Serving platter": "Servēšanas šķīvji",
    "Health & Personal Care": "Veselība & aprūpe",
    "Tools & Car Accessories": "Instrumenti & auto",
    "Sports & Leisure": "Sports & atpūta", "Giveaways": "Reklāmas dāvanas",
    "Toys & Games": "Rotaļlietas & spēles", "Games & Play": "Spēles",
    "Serving tool": "Servēšanas piederumi", "Coverall": "Kombinezoni",
    "Body": "Ķermenim", "Sweater": "Džemperis", "Sweatshirts": "Džemperi",
    "Tees": "T-krekli", "Training Set": "Treniņu komplekti",
    "Training pants": "Treniņu bikses", "Gift Cards": "Dāvanu kartes",
    "Health & Hygiene": "Veselība & higiēna", "Home & Kitchen": "Mājai & virtuvei",
    "Pens & Writing": "Pildspalvas & rakstāmpiederumi",
    "Notebooks & Paper Products": "Bloknoti & papīra izstrādājumi",
    "Clothing": "Apģērbs",
    // Extra consolidations & missing English leftovers
    "Sweets": "Saldumi", "Safety Footwear": "Darba apavi",
    "Food & Beverages": "Pārtika & dzērieni",
    "Promotional materials": "Reklāmas materiāli",
    "Lip Balms": "Lūpu balzāmi", "Glasses & Carafes": "Glāzes & karafes",
    "Lamps": "Lampas", "Bottle Openers & Accessories": "Pudeļu atverēji",
    "USB Flash Drives": "USB atmiņas", "Indoor Games": "Iekštelpu spēles",
    "Multitools": "Multi-instrumenti", "Fountain Pens": "Tintes pildspalvas",
    "Planners": "Plānotāji", "First Aid Kits": "Pirmās palīdzības komplekti",
    "Tool Sets": "Instrumentu komplekti",
    "Telephone & Tablet Accessories": "Telefonu & planšetu aksesuāri",
    "Conference Bags": "Konferenču somas", "Wireless Charging": "Bezvadu lādēšana",
    "Smartwatches": "Viedpulksteņi", "Reflective Items": "Atstarojoši priekšmeti",
    "Badge Holders": "Kartes turētāji", "Cycling Accessories": "Riteņbraukšanas aksesuāri",
    "Beach Items": "Pludmales priekšmeti",
    "Outdoor Items": "Āra priekšmeti", "USB Hubs": "USB centrmezgli",
    "Stress Balls": "Stresa bumbiņas", "Outdoor Games": "Āra spēles",
    "Trolleys & Suitcases": "Koferi & čemodāni", "BBQ Accessories": "Grila aksesuāri",
    "Markers": "Marķieri", "Sport & Gym Bags": "Sporta somas",
    "Sailor Bags": "Jūrnieku somas", "Kitchen & Home": "Virtuve & mājas",
    "Additional assortment": "Papildu sortiments",
    "Pocket Knives": "Kabatas naži", "Greeting Cards": "Apsveikuma kartītes",
    "Wallets & Card Wallets": "Maki", "Measuring Tapes": "Mērlentes",
    "Wellness & Manicure Sets": "Wellness komplekti",
    "Glasses": "Glāzes", "Desk Pads": "Galda paliktņi",
    "Kitchen Linen": "Virtuves lini", "Rain Ponchos": "Lietus ponči",
    "Cameras": "Kameras", "Picnic Accessories": "Piknika aksesuāri",
    "Cases": "Futrāļi", "Bodies": "Bodiji", "Bib": "Priekšauti bērniem",
    "Wristbands": "Aproces", "Chef's Knives": "Šefpavāra naži",
    "Foldable Bags": "Salokāmas somas", "Messenger & Shoulder Bags": "Plecu somas",
  };
  const GENDER_LV: Record<string, string> = {
    "Men": "Vīriešu", "Women": "Sieviešu", "Kids": "Bērnu", "Baby": "Zīdaiņu", "Unisex": "Unisex",
  };
  const GROUP_LV: Record<string, string> = CATEGORY_LV; // reuse same map, keys overlap
  const looksLatvian = (s: string) => /[āčēģīķļņōŗšūž]/i.test(s);
  const localize = (map: Record<string, string>) => (raw: string): string => {
    if (lang !== "lv") return raw;
    return map[raw] || raw;
  };
  const catLoc = localize(CATEGORY_LV);
  const genLoc = localize(GENDER_LV);
  const grpLoc = localize(GROUP_LV);

  const brandItems = useMemo(() => facet("brand", (it) => it.brand), [facet]);
  const categoryItems = useMemo(
    () => facet("category", (it) => it.category).map((x) => ({ value: x.label, label: catLoc(x.label), count: x.count })),
    [facet, lang]
  );
  const groupItems = useMemo(
    () => facet("group", (it) => it.group_name).map((x) => ({ value: x.label, label: grpLoc(x.label), count: x.count })),
    [facet, lang]
  );
  const genderItems = useMemo(
    () => facet("gender", (it) => it.gender).map((x) => ({ value: x.label, label: genLoc(x.label), count: x.count })),
    [facet, lang]
  );

  const colorItems = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const it of items) {
      if (!passesExcept(it, "color")) continue;
      for (const b of it.buckets) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return COLOR_BUCKETS.map((b) => ({
      key: b.key,
      label: lang === "lv" ? b.lv : b.en,
      count: counts.get(b.key) || 0,
    })).filter((x) => x.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, q, sources, brands, categories, groups, genders, colors]);

  const priceOf = useCallback(
    (it: EnrichedItem): number | null => {
      const p =
        it.source === "pf" ? pfPrices.get(it.id) :
        it.source === "ss" ? ssPrices.get(it.id) :
        it.source === "bb" ? bbPrices.get(it.id) :
        it.source === "mf" ? mfPrices.get(it.id) :
        it.source === "ru" ? ruPrices.get(it.id) :
        undefined;
      return p ? p.price : null;
    },
    [pfPrices, ssPrices, bbPrices, mfPrices, ruPrices]
  );

  const filtered = useMemo(() => {
    const base = items.filter((it) => passesExcept(it, "__none__"));
    const cmpName = (a: EnrichedItem, b: EnrichedItem) =>
      (a.name || a.id).localeCompare(b.name || b.id, lang === "lv" ? "lv" : "en", { sensitivity: "base" });
    if (sort === "az") return [...base].sort(cmpName);
    if (sort === "za") return [...base].sort((a, b) => cmpName(b, a));
    if (sort === "newest") {
      return [...base].sort((a, b) =>
        (b.id || "").localeCompare(a.id || "", "en", { numeric: true, sensitivity: "base" })
      );
    }
    if (sort === "price_asc" || sort === "price_desc") {
      const dir = sort === "price_asc" ? 1 : -1;
      return [...base].sort((a, b) => {
        const pa = priceOf(a);
        const pb = priceOf(b);
        // items without price go to the end regardless of direction
        if (pa == null && pb == null) return cmpName(a, b);
        if (pa == null) return 1;
        if (pb == null) return -1;
        return (pa - pb) * dir || cmpName(a, b);
      });
    }
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, q, sources, brands, categories, groups, genders, colors, sort, priceOf, lang]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const clearAll = () => {
    setQ("");
    setSources(new Set());
    setBrands(new Set());
    setCategories(new Set());
    setGroups(new Set());
    setGenders(new Set());
    setColors(new Set());
  };

  const filterSections: FilterSection[] = [];

  if (sourceItems.length > 0) {
    filterSections.push({
      key: "source",
      title: t.source,
      items: sourceItems,
      selected: sources,
      onToggle: toggle(sources, setSources),
    });
  }

  filterSections.push(
    {
      key: "category",
      title: t.category,
      items: categoryItems,
      selected: categories,
      onToggle: toggle(categories, setCategories),
    },
    {
      key: "color",
      title: t.color,
      items: colorItems.map((c) => {
        const b = COLOR_BUCKETS.find((x) => x.key === c.key);
        return { label: c.label, count: c.count, swatch: b?.hex ?? null };
      }),
      selected: new Set(
        [...colors]
          .map((k) => {
            const b = COLOR_BUCKETS.find((x) => x.key === k);
            return b ? (lang === "lv" ? b.lv : b.en) : null;
          })
          .filter(Boolean) as string[]
      ),
      onToggle: (label) => {
        const b = COLOR_BUCKETS.find((x) => (lang === "lv" ? x.lv : x.en) === label);
        if (b) toggle(colors, setColors)(b.key);
      },
    },
    {
      key: "brand",
      title: t.brand,
      items: brandItems,
      selected: brands,
      onToggle: toggle(brands, setBrands),
    },
    {
      key: "gender",
      title: t.gender,
      items: genderItems,
      selected: genders,
      onToggle: toggle(genders, setGenders),
    }
  );

  const totalSelectedFilters =
    sources.size + brands.size + categories.size + groups.size + genders.size + colors.size;


  return (
    <Layout>
      <div className="container px-4 py-8 md:py-14">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t.title}
          </h1>
          {t.subtitle ? <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p> : null}
        </div>

        <div className="mb-6 space-y-3">
          <div className="relative w-full md:max-w-xl">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="h-11"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile filter trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="md:hidden h-9 gap-2 font-heading text-xs font-bold uppercase tracking-wider"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                  {lang === "lv" ? "Filtri" : "Filters"}
                  {totalSelectedFilters > 0 && (
                    <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                      {totalSelectedFilters}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto p-4">
                <SheetHeader className="mb-3 text-left">
                  <SheetTitle className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
                    {lang === "lv" ? "Filtri" : "Filters"}
                    {totalSelectedFilters > 0 && (
                      <span className="rounded-full bg-accent px-2 py-[1px] text-[10px] font-bold text-accent-foreground">
                        {totalSelectedFilters}
                      </span>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div>
                  <CatalogFiltersSidebar
                    sections={filterSections}
                    onClearAll={clearAll}
                    hideHeader
                  />
                </div>
              </SheetContent>

            </Sheet>
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {lang === "lv" ? "Kārtot" : "Sort"}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 flex-1 min-w-0 rounded-md border border-border bg-background px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent sm:flex-none"
            >
              <option value="featured">{lang === "lv" ? "Ieteiktie" : "Featured"}</option>
              <option value="newest">{lang === "lv" ? "Pēc jaunākā" : "Newest"}</option>
              <option value="az">{lang === "lv" ? "Nosaukums A–Z" : "Name A–Z"}</option>
              <option value="za">{lang === "lv" ? "Nosaukums Z–A" : "Name Z–A"}</option>
              <option value="price_asc">{lang === "lv" ? "Cena: zemākā vispirms" : "Price: low to high"}</option>
              <option value="price_desc">{lang === "lv" ? "Cena: augstākā vispirms" : "Price: high to low"}</option>
            </select>
            <div className="ml-auto text-xs uppercase tracking-wider text-muted-foreground">
              {filtered.length.toLocaleString(lang === "lv" ? "lv-LV" : "en-US")} {t.results}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="hidden md:block md:w-72 md:shrink-0">
            <CatalogFiltersSidebar
              sections={filterSections}
              onClearAll={clearAll}
              heading={lang === "lv" ? "Filtri" : "Filters"}
            />
          </div>

          <div className="min-w-0 flex-1">
            {!loaded ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="overflow-hidden border border-border bg-card">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="space-y-2 p-3">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-muted-foreground">{t.empty}</p>
                <Button variant="outline" className="mt-4" onClick={clearAll}>
                  {t.clearAll}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((it) => (
                    <CatalogCard
                      key={`${it.source}-${it.id}`}
                      item={it}
                      lang={lang}
                      selectedBuckets={colors as Set<ColorBucketKey>}
                      requestLabel={t.request}
                      noImageLabel={lang === "lv" ? "Bez attēla" : "No image"}
                      priceInfo={
                        it.source === "pf"
                          ? pfPrices.get(it.id)
                          : it.source === "ss"
                          ? ssPrices.get(it.id)
                          : it.source === "bb"
                          ? bbPrices.get(it.id)
                          : it.source === "mf"
                          ? mfPrices.get(it.id)
                           : it.source === "ru"
                           ? ruPrices.get(it.id)
                          : undefined
                      }
                      fromLabel={lang === "lv" ? "no" : "from"}
                      onNavigate={() => navigate(`/catalog/item/${it.source}/${encodeURIComponent(it.id)}`)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage <= 1}
                      onClick={() => {
                        setPage(safePage - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="font-heading text-xs uppercase tracking-wider"
                    >
                      ← {t.prev}
                    </Button>
                    <span className="px-3 text-sm text-muted-foreground">
                      {safePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={safePage >= totalPages}
                      onClick={() => {
                        setPage(safePage + 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="font-heading text-xs uppercase tracking-wider"
                    >
                      {t.next} →
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

/* -------------------- card -------------------- */

interface CardProps {
  item: EnrichedItem;
  lang: "lv" | "en";
  selectedBuckets: Set<ColorBucketKey>;
  requestLabel: string;
  noImageLabel: string;
  onNavigate: () => void;
  priceInfo?: { price: number; currency: string };
  fromLabel?: string;
}

const CatalogCard = ({ item, lang, selectedBuckets, requestLabel, noImageLabel, onNavigate, priceInfo, fromLabel }: CardProps) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  // Filter-driven initial match
  let filterMatchIdx = -1;
  if (selectedBuckets.size > 0) {
    filterMatchIdx = item.colors.findIndex((c) => c.bucket && selectedBuckets.has(c.bucket));
  }
  const effectiveIdx = activeIdx ?? (filterMatchIdx >= 0 ? filterMatchIdx : null);
  const active = effectiveIdx !== null ? item.colors[effectiveIdx] : null;

  const matchedImg = active?.u || null;
  const img = resolveImgUrl(item.source, matchedImg ?? item.image_url);
  const hover = matchedImg ? null : resolveImgUrl(item.source, item.hover_image_url);

  const withHex = item.colors
    .map((c, idx) => ({ ...c, idx, hex: sanitizeHex(c.h, c.bucket, c.n) }))
    .filter((c) => !!c.hex);
  const swatches = withHex.slice(0, 8).map((c) => ({
    hex: c.hex!,
    name: c.n || "",
    active: effectiveIdx !== null && c.idx === effectiveIdx,
    onSelect: () => setActiveIdx(c.idx === activeIdx ? null : c.idx),
  }));
  const extra = Math.max(0, withHex.length - 8);

  // Strip trailing size code from Stanley/Stella per-color SKU
  // (e.g. STBU274C0021L → STBU274-C002)
  const formatCode = (raw: string): string => {
    if (item.source !== "ss") return raw;
    const m = raw.match(/^([A-Z]+\d+)C(\d{3,4})/i);
    return m ? `${m[1]}-C${m[2]}` : raw;
  };
  const displayCode = formatCode(active?.c || item.id);

  return (
    <CatalogModelCard
      onClick={onNavigate}
      image={img}
      hoverImage={hover}
      imageAlt={item.name || item.id}
      code={displayCode}
      brandBadge={item.brand && item.brand.toLowerCase() !== "unbranded" ? item.brand : SOURCE_META[item.source].label}
      title={item.name || item.id}
      subtitle={active?.n || item.description}
      swatches={swatches}
      extraSwatches={extra}
      noImageLabel={noImageLabel}
      price={
        priceInfo ? (
          <div className="flex flex-col gap-0.5 leading-tight">
            <p className="font-heading text-sm font-semibold text-muted-foreground">
              €{priceInfo.price.toFixed(2)}
              <span className="ml-1 text-[10px] font-medium uppercase tracking-wider">
                {lang === "lv" ? "bez PVN" : "excl. VAT"}
              </span>
            </p>
            <p className="font-heading text-base font-black text-foreground">
              €{(priceInfo.price * 1.21).toFixed(2)}
              <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">
                {lang === "lv" ? "ar PVN" : "incl. VAT"}
              </span>
            </p>
          </div>
        ) : (
          <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {requestLabel}
          </p>
        )
      }
    />
  );
};

export default UnifiedCatalog;
