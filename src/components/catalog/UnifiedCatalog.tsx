import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
const sanitizeHex = (hex: string | null | undefined, bucket: ColorBucketKey | null): string | null => {
  if (hex && VALID_HEX.test(hex.trim())) return hex.trim();
  if (bucket && bucket !== "multi") return getBucket(bucket).hex;
  return null;
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
}

const GENDER_MAP: Record<string, string | null> = {
  male: "Men", men: "Men", mens: "Men", "men's": "Men",
  female: "Women", women: "Women", womens: "Women", "women's": "Women", ladies: "Women",
  junior: "Kids", juniors: "Kids", kid: "Kids", kids: "Kids",
  children: "Kids", child: "Kids", youth: "Kids",
  baby: "Baby", babies: "Baby", infant: "Baby",
  unisex: "Unisex", adult: "Unisex",
  none: "", "-": "", accessories: "",
};
const normalizeGender = (raw?: string | null): string | null => {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  if (key in GENDER_MAP) {
    const v = GENDER_MAP[key];
    return v === "" ? null : v;
  }
  return raw.trim();
};

const CATEGORY_MAP: Record<string, string> = {
  "t-shirt": "T-shirts", "tshirt": "T-shirts", "tshirts": "T-shirts", "t-shirts": "T-shirts",
  "polo": "Polos", "polos": "Polos",
  "hoodie": "Hoodies", "hoodies": "Hoodies",
  "sweater": "Sweaters", "sweaters": "Sweaters",
  "sweatshirt": "Sweaters", "sweatshirts": "Sweaters",
  "jacket": "Jackets", "jackets": "Jackets",
  "cap": "Caps & Hats", "caps": "Caps & Hats", "hat": "Caps & Hats", "hats": "Caps & Hats",
  "caps & hats": "Caps & Hats", "headwear": "Caps & Hats",
  "beanie": "Beanies", "beanies": "Beanies",
  "bag": "Bags", "bags": "Bags",
  "backpack": "Backpacks", "backpacks": "Backpacks",
  "short": "Shorts", "shorts": "Shorts",
  "trouser": "Trousers", "trousers": "Trousers", "pant": "Trousers", "pants": "Trousers",
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
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<EnrichedItem | null>(null);
  const [pfPrices, setPfPrices] = useState<Map<string, { price: number; currency: string }>>(new Map());

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sources, setSources] = useState<Set<string>>(
    new Set((searchParams.get("source") || "").split(",").filter(Boolean))
  );
  const [brands, setBrands] = useState<Set<string>>(
    new Set((searchParams.get("brand") || "").split(",").filter(Boolean))
  );
  const [categories, setCategories] = useState<Set<string>>(
    new Set((searchParams.get("category") || "").split(",").filter(Boolean))
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
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (!lockedSource && sources.size) p.set("source", [...sources].join(","));
    if (brands.size) p.set("brand", [...brands].join(","));
    if (categories.size) p.set("category", [...categories].join(","));
    if (groups.size) p.set("group", [...groups].join(","));
    if (genders.size) p.set("gender", [...genders].join(","));
    if (colors.size) p.set("color", [...colors].join(","));
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [q, sources, brands, categories, groups, genders, colors, page, setSearchParams, lockedSource]);

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
      const enriched: EnrichedItem[] = all.map((it) => {
        const buckets = new Set<ColorBucketKey>();
        const raw = (it.colors || []) as ColorEntry[];
        const colorList: EnrichedColor[] = raw.map((c) => {
          const bucket = bucketOf(c.h, c.n);
          if (bucket) buckets.add(bucket);
          return { ...c, bucket };
        });
        return {
          ...it,
          brand: normalizeText(it.brand),
          category: normalizeCategory(it.category),
          group_name: normalizeText(it.group_name),
          gender: normalizeGender(it.gender),
          colors: colorList,
          buckets,
        };
      });
      setItems(enriched);
      setLoaded(true);

      // Load PF retail prices → min per model_code
      if (!lockedSource || lockedSource === "pf") {
        const priceMap = new Map<string, { price: number; currency: string }>();
        let pfrom = 0;
        while (true) {
          const { data, error } = await supabase
            .from("pf_retail_prices" as any)
            .select("model_code,retail_price,currency")
            .range(pfrom, pfrom + 999);
          if (error || !data) break;
          for (const r of data as any[]) {
            const mc = r.model_code as string;
            const p = Number(r.retail_price);
            if (!mc || !Number.isFinite(p) || p <= 0) continue;
            const cur = priceMap.get(mc);
            if (!cur || p < cur.price) priceMap.set(mc, { price: p, currency: r.currency || "EUR" });
          }
          if (data.length < 1000) break;
          pfrom += 1000;
        }
        setPfPrices(priceMap);
      }
    })();
  }, [lockedSource]);

  useEffect(() => {
    setPage(1);
  }, [q, sources, brands, categories, groups, genders, colors]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const t = useMemo(
    () => ({
      title: title ?? (lang === "lv" ? "Katalogs" : "Catalog"),
      subtitle:
        subtitle ??
        (lang === "lv"
          ? "Meklējiet visos mūsu piegādātāju katalogos vienuviet"
          : "Search across all our supplier catalogs at once"),
      search: lang === "lv" ? "Meklēt modeli, kodu vai zīmolu…" : "Search model, code or brand…",
      results: lang === "lv" ? "rezultāti" : "results",
      clearAll: lang === "lv" ? "Notīrīt filtrus" : "Clear filters",
      source: lang === "lv" ? "Piegādātājs" : "Supplier",
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
    if (!lockedSource && except !== "source" && sources.size && !sources.has(it.source)) return false;
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

  const sourceItems = useMemo(() => {
    if (lockedSource) return [];
    const order: CatalogSource[] = ["ss", "nwg", "pf", "bb"];
    return order
      .map((s) => ({
        label: SOURCE_META[s].label,
        count: items.filter((it) => it.source === s && passesExcept(it, "source")).length,
      }))
      .filter((x) => x.count > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, lang, q, sources, brands, categories, groups, genders, colors, lockedSource]);

  // ── LV translations for facet values ──
  const CATEGORY_LV: Record<string, string> = {
    "T-shirts": "T-krekli", "Polos": "Polo krekli", "Hoodies": "Jakas ar kapuci",
    "Sweaters": "Džemperi", "Jackets": "Virsjakas", "Caps & Hats": "Cepures",
    "Beanies": "Adītas cepures", "Bags": "Somas", "Backpacks": "Mugursomas",
    "Shorts": "Šorti", "Trousers": "Bikses", "Bottoms": "Apakšdaļas", "Tops": "Augšdaļas",
    "Ballpoint Pens": "Pildspalvas", "Water Bottles": "Ūdens pudeles",
    "Hard Cover Notebooks": "Cietvāku bloknoti", "Notebooks": "Bloknoti",
    "Insulated Mugs": "Termokrūzes", "Mugs": "Krūzes",
    "Shopping & Tote Bags": "Iepirkumu somas", "Tote Bags": "Iepirkumu somas",
    "Home Accessories": "Mājas aksesuāri", "Sports Bottles": "Sporta pudeles",
    "Cables": "Kabeļi", "Power Banks": "Ārējie akumulatori",
    "Umbrellas": "Lietussargi", "Keychains": "Atslēgu piekariņi",
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
  };
  const GENDER_LV: Record<string, string> = {
    "Men": "Vīriešu", "Women": "Sieviešu", "Kids": "Bērnu", "Baby": "Zīdaiņu", "Unisex": "Unisex",
  };
  const GROUP_LV: Record<string, string> = {
    "Apparel": "Apģērbi", "Bags": "Somas", "Drinkware": "Trauki",
    "Writing Instruments": "Rakstāmpiederumi", "Technology": "Tehnoloģijas",
    "Office": "Birojs", "Travel": "Ceļojumi", "Outdoor & Sports": "Āra & sports",
    "Home & Living": "Mājai", "Tools": "Instrumenti", "Headwear": "Galvassegas",
    "Accessories": "Aksesuāri", "Gifts": "Dāvanas",
  };
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

  const filtered = useMemo(
    () => items.filter((it) => passesExcept(it, "__none__")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, q, sources, brands, categories, groups, genders, colors]
  );

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

  if (!lockedSource && sourceItems.length > 0) {
    filterSections.push({
      key: "source",
      title: t.source,
      items: sourceItems,
      selected: new Set(
        [...sources].map((k) => SOURCE_META[k as CatalogSource]?.label || k)
      ),
      onToggle: (label) => {
        const key = (Object.keys(SOURCE_META) as CatalogSource[]).find(
          (k) => SOURCE_META[k].label === label
        );
        if (key) toggle(sources, setSources)(key);
      },
    });
  }

  filterSections.push(
    {
      key: "color",
      title: t.color,
      items: colorItems.map((c) => ({ label: c.label, count: c.count })),
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
      key: "category",
      title: t.category,
      items: categoryItems,
      selected: categories,
      onToggle: toggle(categories, setCategories),
    },
    {
      key: "gender",
      title: t.gender,
      items: genderItems,
      selected: genders,
      onToggle: toggle(genders, setGenders),
    },
    {
      key: "brand",
      title: t.brand,
      items: brandItems,
      selected: brands,
      onToggle: toggle(brands, setBrands),
    },
    {
      key: "group",
      title: t.group,
      items: groupItems,
      selected: groups,
      onToggle: toggle(groups, setGroups),
    }
  );

  return (
    <Layout>
      <div className="container px-4 py-8 md:py-14">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xl">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.search}
              className="h-11"
            />
          </div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {filtered.length.toLocaleString(lang === "lv" ? "lv-LV" : "en-US")} {t.results}
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-72 md:shrink-0">
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
                      priceInfo={it.source === "pf" ? pfPrices.get(it.id) : undefined}
                      fromLabel={lang === "lv" ? "no" : "from"}
                      onNavigate={() => setSelected(it)}
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
      {selected && (
        <CatalogItemDialog
          open={!!selected}
          onOpenChange={(o) => !o && setSelected(null)}
          source={selected.source}
          id={selected.id}
          name={selected.name}
          brand={selected.brand}
          category={selected.category}
          image={selected.image_url}
          swatches={selected.colors
            .map((c) => ({ hex: sanitizeHex(c.h, c.bucket), name: c.n || "" }))
            .filter((s) => !!s.hex) as { hex: string; name: string }[]}
        />
      )}
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
  let matchedImg: string | null = null;
  if (selectedBuckets.size > 0) {
    for (const c of item.colors) {
      if (c.bucket && selectedBuckets.has(c.bucket) && c.u) {
        matchedImg = c.u;
        break;
      }
    }
  }
  const img = resolveImgUrl(item.source, matchedImg ?? item.image_url);
  const hover = matchedImg ? null : resolveImgUrl(item.source, item.hover_image_url);

  const withHex = item.colors
    .map((c) => ({ ...c, hex: sanitizeHex(c.h, c.bucket) }))
    .filter((c) => !!c.hex);
  const swatches = withHex.slice(0, 8).map((c) => ({
    hex: c.hex!,
    name: c.n || "",
    active: !!(selectedBuckets.size > 0 && c.bucket && selectedBuckets.has(c.bucket)),
  }));
  const extra = Math.max(0, withHex.length - 8);

  return (
    <CatalogModelCard
      onClick={onNavigate}
      image={img}
      hoverImage={hover}
      imageAlt={item.name || item.id}
      code={item.id}
      brandBadge={SOURCE_META[item.source].label}
      title={item.name || item.id}
      subtitle={item.description}
      swatches={swatches}
      extraSwatches={extra}
      noImageLabel={noImageLabel}
      price={
        priceInfo ? (
          <p className="font-heading text-sm font-bold text-foreground">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {fromLabel}
            </span>
            {priceInfo.price.toFixed(2)} {priceInfo.currency}
          </p>
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
