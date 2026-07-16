import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import CatalogFiltersSidebar, { type FilterSection } from "@/components/catalog/CatalogFiltersSidebar";
import CatalogModelCard from "@/components/catalog/CatalogModelCard";
import CatalogItemDialog from "@/components/catalog/CatalogItemDialog";
import { COLOR_BUCKETS, bucketOf, type ColorBucketKey } from "@/lib/colorBuckets";

interface StyleRow {
  style_code: string;
  brand: string;
  name: string;
  description: string | null;
  category: string | null;
  gender: string | null;
}
interface VariantRow {
  sku: string;
  style_code: string;
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
}
interface ImageRow {
  style_code: string;
  color_name: string | null;
  url: string;
  is_primary: boolean;
  sort_order: number;
}
interface PriceRow {
  sku: string;
  retail_price: number;
  currency: string;
}

interface ModelCard {
  style_code: string;
  brand: string;
  name: string;
  description: string | null;
  category: string | null;
  gender: string | null;
  image: string | null;
  hover: string | null;
  colors: { name: string | null; hex: string | null; bucket: ColorBucketKey | null; image: string | null }[];
  sizes: string[];
  minPrice: number | null;
  currency: string;
  buckets: Set<ColorBucketKey>;
}

const PAGE_SIZE = 24;

const BeechfieldBrandsPage = () => {
  const { lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const [models, setModels] = useState<ModelCard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<ModelCard | null>(null);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [brands, setBrands] = useState<Set<string>>(new Set((searchParams.get("brand") || "").split(",").filter(Boolean)));
  const [categories, setCategories] = useState<Set<string>>(new Set((searchParams.get("category") || "").split(",").filter(Boolean)));
  const [genders, setGenders] = useState<Set<string>>(new Set((searchParams.get("gender") || "").split(",").filter(Boolean)));
  const [colors, setColors] = useState<Set<string>>(new Set((searchParams.get("color") || "").split(",").filter(Boolean)));
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (brands.size) p.set("brand", [...brands].join(","));
    if (categories.size) p.set("category", [...categories].join(","));
    if (genders.size) p.set("gender", [...genders].join(","));
    if (colors.size) p.set("color", [...colors].join(","));
    if (page > 1) p.set("page", String(page));
    setSearchParams(p, { replace: true });
  }, [q, brands, categories, genders, colors, page, setSearchParams]);

  useEffect(() => { setPage(1); }, [q, brands, categories, genders, colors]);

  useEffect(() => {
    (async () => {
      // batch fetch all
      const fetchAll = async <T,>(table: string, cols: string): Promise<T[]> => {
        const out: T[] = [];
        let from = 0;
        while (true) {
          const { data, error } = await supabase.from(table as any).select(cols).range(from, from + 999);
          if (error || !data) break;
          out.push(...(data as any));
          if (data.length < 1000) break;
          from += 1000;
        }
        return out;
      };

      const [styles, variants, images, prices] = await Promise.all([
        fetchAll<StyleRow>("bb_styles", "style_code,brand,name,description,category,gender"),
        fetchAll<VariantRow>("bb_variants", "sku,style_code,color_name,color_hex,size"),
        fetchAll<ImageRow>("bb_images", "style_code,color_name,url,is_primary,sort_order"),
        fetchAll<PriceRow>("bb_prices", "sku,retail_price,currency"),
      ]);

      const priceBySku = new Map(prices.map((p) => [p.sku, p]));
      const variantsByStyle = new Map<string, VariantRow[]>();
      for (const v of variants) {
        const arr = variantsByStyle.get(v.style_code) || [];
        arr.push(v);
        variantsByStyle.set(v.style_code, arr);
      }
      const imagesByStyle = new Map<string, ImageRow[]>();
      for (const im of images) {
        const arr = imagesByStyle.get(im.style_code) || [];
        arr.push(im);
        imagesByStyle.set(im.style_code, arr);
      }

      const cards: ModelCard[] = styles.map((s) => {
        const vs = variantsByStyle.get(s.style_code) || [];
        const ims = (imagesByStyle.get(s.style_code) || []).sort(
          (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order
        );
        // Unique colors
        const seen = new Set<string>();
        const colorList: ModelCard["colors"] = [];
        for (const v of vs) {
          const key = (v.color_name || "").toLowerCase();
          if (!v.color_name || seen.has(key)) continue;
          seen.add(key);
          const b = bucketOf(v.color_hex, v.color_name);
          const colImg = ims.find((i) => (i.color_name || "").toLowerCase() === key)?.url || null;
          colorList.push({ name: v.color_name, hex: v.color_hex, bucket: b, image: colImg });
        }
        const buckets = new Set<ColorBucketKey>();
        for (const c of colorList) if (c.bucket) buckets.add(c.bucket);

        const sizes = Array.from(new Set(vs.map((v) => v.size).filter(Boolean) as string[]));

        let minPrice: number | null = null;
        let currency = "EUR";
        for (const v of vs) {
          const p = priceBySku.get(v.sku);
          if (p && (minPrice === null || p.retail_price < minPrice)) {
            minPrice = p.retail_price;
            currency = p.currency;
          }
        }

        const primary = ims[0]?.url || null;
        const hover = ims[1]?.url || null;

        return {
          style_code: s.style_code,
          brand: s.brand,
          name: s.name,
          description: s.description,
          category: s.category,
          gender: s.gender,
          image: primary,
          hover,
          colors: colorList,
          sizes,
          minPrice,
          currency,
          buckets,
        };
      });
      setModels(cards);
      setLoaded(true);
    })();
  }, []);

  const t = {
    title: lang === "lv" ? "Beechfield Brands" : "Beechfield Brands",
    subtitle: lang === "lv"
      ? "Beechfield · Bagbase · Quadra · Westford Mill"
      : "Beechfield · Bagbase · Quadra · Westford Mill",
    search: lang === "lv" ? "Meklēt modeli, kodu vai zīmolu…" : "Search model, code or brand…",
    results: lang === "lv" ? "rezultāti" : "results",
    clearAll: lang === "lv" ? "Notīrīt filtrus" : "Clear filters",
    brand: lang === "lv" ? "Zīmols" : "Brand",
    category: lang === "lv" ? "Kategorija" : "Category",
    gender: lang === "lv" ? "Dzimums" : "Gender",
    color: lang === "lv" ? "Krāsa" : "Color",
    empty: lang === "lv" ? "Katalogs vēl ir tukšs. Augšupielādē Excel /admin/beechfield-import" : "Catalog is empty. Upload Excel at /admin/beechfield-import",
    prev: lang === "lv" ? "Iepriekšējā" : "Previous",
    next: lang === "lv" ? "Nākamā" : "Next",
    request: lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote",
    from: lang === "lv" ? "no" : "from",
  };

  const passesExcept = (m: ModelCard, except: string) => {
    if (q) {
      const n = q.toLowerCase();
      const hay = `${m.name} ${m.style_code} ${m.brand}`.toLowerCase();
      if (!hay.includes(n)) return false;
    }
    if (except !== "brand" && brands.size && !brands.has(m.brand)) return false;
    if (except !== "category" && categories.size && (!m.category || !categories.has(m.category))) return false;
    if (except !== "gender" && genders.size && (!m.gender || !genders.has(m.gender))) return false;
    if (except !== "color" && colors.size) {
      let ok = false;
      for (const c of colors) if (m.buckets.has(c as ColorBucketKey)) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  };

  const facet = (except: string, pick: (m: ModelCard) => string | null) => {
    const counts = new Map<string, number>();
    for (const m of models) {
      if (!passesExcept(m, except)) continue;
      const v = pick(m);
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  };

  const brandItems = useMemo(() => facet("brand", (m) => m.brand), [models, q, brands, categories, genders, colors]);
  const categoryItems = useMemo(() => facet("category", (m) => m.category), [models, q, brands, categories, genders, colors]);
  const genderItems = useMemo(() => facet("gender", (m) => m.gender), [models, q, brands, categories, genders, colors]);
  const colorItems = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const m of models) {
      if (!passesExcept(m, "color")) continue;
      for (const b of m.buckets) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return COLOR_BUCKETS
      .map((b) => ({ key: b.key, label: lang === "lv" ? b.lv : b.en, count: counts.get(b.key) || 0 }))
      .filter((x) => x.count > 0);
  }, [models, q, brands, categories, genders, colors, lang]);

  const filtered = useMemo(
    () => models.filter((m) => passesExcept(m, "__none__")),
    [models, q, brands, categories, genders, colors]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };
  const clearAll = () => { setQ(""); setBrands(new Set()); setCategories(new Set()); setGenders(new Set()); setColors(new Set()); };

  const sections: FilterSection[] = [
    {
      key: "color",
      title: t.color,
      items: colorItems.map((c) => ({ label: c.label, count: c.count })),
      selected: new Set(
        [...colors].map((k) => {
          const b = COLOR_BUCKETS.find((x) => x.key === k);
          return b ? (lang === "lv" ? b.lv : b.en) : null;
        }).filter(Boolean) as string[]
      ),
      onToggle: (label) => {
        const b = COLOR_BUCKETS.find((x) => (lang === "lv" ? x.lv : x.en) === label);
        if (b) toggle(colors, setColors)(b.key);
      },
    },
    { key: "brand", title: t.brand, items: brandItems, selected: brands, onToggle: toggle(brands, setBrands) },
    { key: "category", title: t.category, items: categoryItems, selected: categories, onToggle: toggle(categories, setCategories) },
    { key: "gender", title: t.gender, items: genderItems, selected: genders, onToggle: toggle(genders, setGenders) },
  ];

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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="h-11 md:max-w-xl" />
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {filtered.length.toLocaleString(lang === "lv" ? "lv-LV" : "en-US")} {t.results}
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-72 md:shrink-0">
            <CatalogFiltersSidebar sections={sections} onClearAll={clearAll} />
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
                {(q || brands.size || categories.size || genders.size || colors.size) && (
                  <Button variant="outline" className="mt-4" onClick={clearAll}>{t.clearAll}</Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((m) => {
                    let img = m.image;
                    if (colors.size > 0) {
                      const match = m.colors.find((c) => c.bucket && colors.has(c.bucket) && c.image);
                      if (match?.image) img = match.image;
                    }
                    const swatches = m.colors.slice(0, 8).filter((c) => c.hex).map((c) => ({
                      hex: c.hex!, name: c.name || "",
                      active: !!(colors.size > 0 && c.bucket && colors.has(c.bucket)),
                    }));
                    return (
                      <CatalogModelCard
                        key={m.style_code}
                        onClick={() => setSelected(m)}
                        image={img}
                        hoverImage={m.hover}
                        imageAlt={m.name}
                        code={m.style_code}
                        brandBadge={m.brand}
                        title={m.name}
                        subtitle={m.description}
                        swatches={swatches}
                        extraSwatches={Math.max(0, m.colors.filter((c) => c.hex).length - 8)}
                        noImageLabel={lang === "lv" ? "Bez attēla" : "No image"}
                        price={
                          m.minPrice !== null ? (
                            <p className="font-heading text-sm font-bold text-foreground">
                              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.from}</span>
                              {m.minPrice.toFixed(2)} {m.currency}
                            </p>
                          ) : (
                            <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.request}</p>
                          )
                        }
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <Button variant="outline" size="sm" disabled={safePage <= 1}
                      onClick={() => { setPage(safePage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="font-heading text-xs uppercase tracking-wider">← {t.prev}</Button>
                    <span className="px-3 text-sm text-muted-foreground">{safePage} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={safePage >= totalPages}
                      onClick={() => { setPage(safePage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="font-heading text-xs uppercase tracking-wider">{t.next} →</Button>
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

export default BeechfieldBrandsPage;
