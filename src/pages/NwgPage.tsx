import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import CatalogFiltersSidebar from "@/components/catalog/CatalogFiltersSidebar";
import { COLOR_BUCKETS, bucketOf, type ColorBucketKey } from "@/lib/colorBuckets";

interface SummaryRow {
  product_number: string;
  name: string;
  brand: string | null;
  category: string | null;
  gender: string | null;
  fit: string | null;
  fabrics: string | null;
  commerce_text: string | null;
  catalog_text: string | null;
  usp: string | null;
  weight: string | null;
  country_of_origin: string | null;
  retail_price: number | null;
  currency: string | null;
  main_picture_url: string | null;
  hover_picture_url: string | null;
  color_count: number;
  size_count: number;
  total_stock: number;
}

interface VariantRow {
  item_number: string;
  product_number: string;
  color_name: string | null;
  color_code: string | null;
  web_color: string[] | null;
  filter_color: string | null;
  shade_color: string | null;
  main_picture_url: string | null;
}

interface ImageRow {
  item_number: string | null;
  picture_type: string | null;
  picture_angle: string | null;
  image_url: string | null;
  large_thumbnail_url: string | null;
  standard_url: string | null;
  high_res_url: string | null;
  sort_order: number | null;
}

interface SkuRow {
  sku: string;
  item_number: string;
  size: string | null;
  size_sequence: string | null;
  availability: number | null;
}

const PAGE_SIZE = 24;
// Only these brands are visible on the NWG page. Value = retail markup multiplier.
const BRAND_MARKUPS: Record<string, number> = {
  "Clique": 1.0167,
  "Craft": 1.0155,
  "Craft Teamwear": 1.0155,
  "Cutter & Buck": 1.0155,
  "ProJob": 1.0155,
  "Sagaform": 1.0155,
  "Untagged Movement": 1.0155,
};
const ALLOWED_BRANDS = Object.keys(BRAND_MARKUPS);
const normBrand = (b: string | null | undefined) => (b || "").trim().toLowerCase();
const BRAND_LOOKUP = new Map(ALLOWED_BRANDS.map((b) => [normBrand(b), b]));
const markupFor = (brand: string | null | undefined) => {
  const key = BRAND_LOOKUP.get(normBrand(brand));
  return key ? BRAND_MARKUPS[key] : null;
};
const PRIORITY_BRANDS = ALLOWED_BRANDS;
const SIZE_ORDER = ["XXXS","XXS","XS","S","M","L","XL","XXL","2XL","3XL","XXXL","4XL","XXXXL","5XL","XXXXXL","6XL"];
const sizeIndex = (s: string | null | undefined) => {
  if (!s) return 999;
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 500 : i;
};
const hexOf = (v: VariantRow) => {
  const w = v.web_color?.[0];
  if (w) return w.startsWith("#") ? w : `#${w}`;
  if (v.shade_color?.startsWith("#")) return v.shade_color;
  return null;
};

const NwgPage = () => {
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  // product_number -> catalog product id (present = in shop)
  const [catalogMap, setCatalogMap] = useState<Map<string, string>>(new Map());
  const [toggling, setToggling] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedGenders, setSelectedGenders] = useState<Set<string>>(new Set());
  const [selectedBuckets, setSelectedBuckets] = useState<Set<ColorBucketKey>>(new Set());
  const [colorMap, setColorMap] = useState<Map<string, { buckets: Set<ColorBucketKey>; bucketImages: Map<ColorBucketKey, string> }>>(new Map());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Card-level color variants (product_number -> variants[])
  const [cardVariants, setCardVariants] = useState<Map<string, VariantRow[]>>(new Map());
  // Per-card active color image override
  const [cardActive, setCardActive] = useState<Map<string, string>>(new Map());

  const [open, setOpen] = useState<SummaryRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailVariants, setDetailVariants] = useState<VariantRow[]>([]);
  const [detailImages, setDetailImages] = useState<ImageRow[]>([]);
  const [detailSkus, setDetailSkus] = useState<SkuRow[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const all: SummaryRow[] = [];
      const step = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("nwg_style_summary" as any)
          .select("*")
          .order("brand", { ascending: true, nullsFirst: false })
          .order("name", { ascending: true })
          .range(from, from + step - 1);
        if (error) break;
        all.push(...((data || []) as unknown as SummaryRow[]));
        if (!data || data.length < step) break;
        from += step;
      }
      setRows(all);
      setLoaded(true);
    })();
  }, []);

  // Per-color bucket data from unified catalog for color filter + image swap.
  useEffect(() => {
    (async () => {
      const rows: any[] = [];
      const step = 1000; let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("catalog_items" as any)
          .select("id,colors")
          .eq("source", "nwg")
          .range(from, from + step - 1);
        if (error || !data) break;
        rows.push(...data);
        if (data.length < step) break;
        from += step;
      }
      const m = new Map<string, { buckets: Set<ColorBucketKey>; bucketImages: Map<ColorBucketKey, string> }>();
      for (const row of rows) {
        const buckets = new Set<ColorBucketKey>();
        const bucketImages = new Map<ColorBucketKey, string>();
        for (const c of (row.colors || []) as { h: string | null; n: string | null; u: string | null }[]) {
          const b = bucketOf(c.h, c.n);
          if (!b) continue;
          buckets.add(b);
          if (c.u && !bucketImages.has(b)) bucketImages.set(b, c.u);
        }
        m.set(row.id, { buckets, bucketImages });
      }
      setColorMap(m);
    })();
  }, []);

  // Admin: which NWG styles already sit in the public catalog
  const loadCatalogMap = async () => {
    const { data } = await supabase
      .from("products")
      .select("id,nwg_product_number")
      .not("nwg_product_number", "is", null);
    const m = new Map<string, string>();
    for (const p of (data || []) as any[]) {
      if (p.nwg_product_number) m.set(p.nwg_product_number, p.id);
    }
    setCatalogMap(m);
  };
  useEffect(() => { if (isAdmin) loadCatalogMap(); }, [isAdmin]);

  const toggleCatalog = async (s: SummaryRow) => {
    setToggling(s.product_number);
    try {
      const existing = catalogMap.get(s.product_number);
      if (existing) {
        const { error } = await supabase
          .from("products")
          .update({ active: false, hidden_manual: true })
          .eq("id", existing);
        if (error) throw error;
        toast({ title: lang === "lv" ? "Noņemts no kataloga" : "Removed from catalog" });
      } else {
        const { error } = await supabase.from("products").insert({
          name_lv: s.name || s.product_number,
          name_en: s.name || s.product_number,
          description_lv: s.commerce_text || "",
          description_en: s.commerce_text || "",
          brand: s.brand || "New Wave Group",
          nwg_product_number: s.product_number,
          retail_price: 0,
          active: true,
          hidden_manual: false,
        });
        if (error) throw error;
        toast({ title: lang === "lv" ? "Pievienots katalogam" : "Added to catalog" });
      }
      await loadCatalogMap();
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };


  // Only display rows for brands we sell publicly (with defined markup).
  const visibleRows = useMemo(() => rows.filter((r) => markupFor(r.brand) !== null), [rows]);

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of visibleRows) if (r.brand) counts.set(r.brand, (counts.get(r.brand) || 0) + 1);
    const arr = Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
    arr.sort((a, b) => {
      const ai = PRIORITY_BRANDS.indexOf(a.label);
      const bi = PRIORITY_BRANDS.indexOf(b.label);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return b.count - a.count;
    });
    return arr;
  }, [visibleRows]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of visibleRows) if (r.category) counts.set(r.category, (counts.get(r.category) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [visibleRows]);

  const genders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of visibleRows) if (r.gender) counts.set(r.gender, (counts.get(r.gender) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [visibleRows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return visibleRows.filter((s) => {
      if (selectedBrands.size && (!s.brand || !selectedBrands.has(s.brand))) return false;
      if (selectedCategories.size && (!s.category || !selectedCategories.has(s.category))) return false;
      if (selectedGenders.size && (!s.gender || !selectedGenders.has(s.gender))) return false;
      if (inStockOnly && s.total_stock <= 0) return false;
      if (needle && !`${s.name} ${s.product_number} ${s.commerce_text ?? ""}`.toLowerCase().includes(needle)) return false;
      if (selectedBuckets.size) {
        const bc = colorMap.get(s.product_number)?.buckets;
        if (!bc) return false;
        let ok = false;
        for (const b of selectedBuckets) if (bc.has(b)) { ok = true; break; }
        if (!ok) return false;
      }
      return true;
    });
  }, [visibleRows, q, selectedBrands, selectedCategories, selectedGenders, inStockOnly, selectedBuckets, colorMap]);

  const bucketItems = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const r of visibleRows) {
      const bc = colorMap.get(r.product_number)?.buckets;
      if (!bc) continue;
      for (const b of bc) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return COLOR_BUCKETS
      .map((b) => ({ key: b.key, label: lang === "lv" ? b.lv : b.en, count: counts.get(b.key) || 0 }))
      .filter((x) => x.count > 0);
  }, [visibleRows, colorMap, lang]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q, selectedBrands, selectedCategories, selectedGenders, inStockOnly, selectedBuckets]);

  // Fetch color variants for visible cards
  useEffect(() => {
    const need = slice.map((s) => s.product_number).filter((p) => !cardVariants.has(p));
    if (!need.length) return;
    (async () => {
      const { data } = await supabase
        .from("nwg_variants")
        .select("item_number,product_number,color_name,color_code,web_color,filter_color,shade_color,main_picture_url")
        .in("product_number", need);
      const map = new Map<string, VariantRow[]>();
      for (const v of (data || []) as VariantRow[]) {
        if (!map.has(v.product_number)) map.set(v.product_number, []);
        map.get(v.product_number)!.push(v);
      }
      setCardVariants((prev) => {
        const merged = new Map(prev);
        for (const [k, v] of map) merged.set(k, v);
        // ensure absent products still get an empty entry so we don't re-fetch
        for (const p of need) if (!merged.has(p)) merged.set(p, []);
        return merged;
      });
    })();
  }, [slice]);

  const openDetail = async (r: SummaryRow) => {
    setOpen(r);
    setDetailLoading(true);
    setActiveItem(null);
    setGalleryIdx(0);
    setDetailVariants([]);
    setDetailImages([]);
    setDetailSkus([]);
    try {
      const [{ data: v }, { data: img }, { data: sk }] = await Promise.all([
        supabase.from("nwg_variants")
          .select("item_number,product_number,color_name,color_code,web_color,filter_color,shade_color,main_picture_url")
          .eq("product_number", r.product_number),
        supabase.from("nwg_images")
          .select("item_number,picture_type,picture_angle,image_url,large_thumbnail_url,standard_url,high_res_url,sort_order")
          .eq("product_number", r.product_number)
          .order("sort_order", { ascending: true }),
        supabase.from("nwg_skus_public" as any)
          .select("sku,item_number,size,size_sequence,availability")
          .eq("product_number", r.product_number)
          .eq("active", true),
      ]);
      setDetailVariants((v || []) as VariantRow[]);
      setDetailImages((img || []) as ImageRow[]);
      setDetailSkus((sk || []) as unknown as SkuRow[]);
    } finally {
      setDetailLoading(false);
    }
  };

  const galleryImages = useMemo(() => {
    if (!open) return [] as string[];
    const list = activeItem
      ? detailImages.filter((i) => i.item_number === activeItem)
      : detailImages;
    const source = list.length ? list : detailImages;
    const urls = source
      .map((i) => i.standard_url || i.large_thumbnail_url || i.image_url || i.high_res_url)
      .filter((u): u is string => !!u);
    if (urls.length) return Array.from(new Set(urls));
    if (activeItem) {
      const v = detailVariants.find((x) => x.item_number === activeItem);
      if (v?.main_picture_url) return [v.main_picture_url];
    }
    return open.main_picture_url ? [open.main_picture_url] : [];
  }, [detailImages, detailVariants, activeItem, open]);

  useEffect(() => { setGalleryIdx(0); }, [activeItem, open?.product_number]);

  const activeVariant = activeItem ? detailVariants.find((v) => v.item_number === activeItem) || null : null;

  const sizesForActive = useMemo(() => {
    const items = activeItem ? [activeItem] : detailVariants.map((v) => v.item_number);
    const list = detailSkus.filter((s) => items.includes(s.item_number));
    return list.sort((a, b) => {
      const sa = Number(a.size_sequence) || sizeIndex(a.size);
      const sb = Number(b.size_sequence) || sizeIndex(b.size);
      return sa - sb;
    });
  }, [detailSkus, detailVariants, activeItem]);

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setSet(next);
  };

  const t = lang === "lv"
    ? { search: "Meklēt modeli vai kodu", brand: "Zīmols", category: "Kategorija", gender: "Dzimums", inStock: "Tikai noliktavā", results: "rezultāti", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla", colour: "Krāsa", description: "Apraksts", composition: "Sastāvs", fit: "Piegriezums", weight: "Svars", size: "Izmērs", stock: "Noliktavā", askPrice: "Pieprasīt cenu šim modelim", filters: "Filtri", clear: "Notīrīt", partner: "New Wave Group – oficiāls partneris" }
    : { search: "Search model or code", brand: "Brand", category: "Category", gender: "Gender", inStock: "In stock only", results: "results", contact: "Request a Quote", noResults: "No results", noImage: "No image", colour: "Colour", description: "Description", composition: "Composition", fit: "Fit", weight: "Weight", size: "Size", stock: "In stock", askPrice: "Request a quote for this model", filters: "Filters", clear: "Clear", partner: "New Wave Group – official partner" };

  return (
    <Layout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/60">{t.partner}</p>
            <h1 className="font-heading text-2xl font-black uppercase md:text-3xl">New Wave Group</h1>
            <p className="mt-1 text-xs text-primary-foreground/70">Craft · Clique · Cutter &amp; Buck · ProJob · James Harvest &amp; Frost</p>
          </div>
          <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/contact">{t.contact}</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container flex flex-wrap items-center gap-3 px-4 py-4">
          <Input className="max-w-md flex-1" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
            {t.inStock}
          </label>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} {t.results}</span>
        </div>
      </section>

      <section className="bg-background">
        <div className="container grid gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
          <CatalogFiltersSidebar
            onClearAll={() => { setSelectedBrands(new Set()); setSelectedCategories(new Set()); setSelectedGenders(new Set()); }}
            sections={[
              { key: "brand", title: t.brand, items: brands, selected: selectedBrands, onToggle: (v) => toggle(selectedBrands, setSelectedBrands, v) },
              { key: "gender", title: t.gender, items: genders, selected: selectedGenders, onToggle: (v) => toggle(selectedGenders, setSelectedGenders, v) },
              { key: "category", title: t.category, items: categories, selected: selectedCategories, onToggle: (v) => toggle(selectedCategories, setSelectedCategories, v) },
            ]}
          />

          <div>
            {!loaded ? (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="overflow-hidden border border-border bg-card">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="space-y-2 p-3"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : slice.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t.noResults}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
                  {slice.map((s) => {
                    const variants = cardVariants.get(s.product_number) || [];
                    const activeVariantItem = cardActive.get(s.product_number);
                    const activeV = activeVariantItem ? variants.find((v) => v.item_number === activeVariantItem) : null;
                    const main = activeV?.main_picture_url || s.main_picture_url;
                    const hover = s.hover_picture_url;
                    return (
                      <button
                        key={s.product_number}
                        type="button"
                        onClick={() => openDetail(s)}
                        className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-white">
                          {main ? (
                            <>
                              <img src={main} alt={s.name} loading="lazy" className={`absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-500 ${hover && !activeV ? "group-hover:opacity-0" : ""}`} />
                              {hover && !activeV && (
                                <img src={hover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                              )}
                            </>
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                          )}
                          <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.product_number}</span>
                          {s.brand && <span className="absolute right-2 top-2 bg-background/90 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider">{s.brand}</span>}
                        </div>
                        <div className="space-y-1.5 p-3">
                          <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.name}</h3>
                          {s.commerce_text && <p className="line-clamp-2 text-xs text-muted-foreground">{s.commerce_text}</p>}
                          {variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {variants.slice(0, 8).map((v) => {
                                const hex = hexOf(v);
                                const selected = activeVariantItem === v.item_number;
                                return (
                                  <span
                                    key={v.item_number}
                                    role="button"
                                    tabIndex={0}
                                    title={v.color_name || v.item_number}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCardActive((prev) => {
                                        const next = new Map(prev);
                                        if (next.get(s.product_number) === v.item_number) next.delete(s.product_number);
                                        else next.set(s.product_number, v.item_number);
                                        return next;
                                      });
                                    }}
                                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); } }}
                                    className={`h-4 w-4 cursor-pointer rounded-full border transition-transform ${selected ? "border-foreground scale-125 ring-1 ring-foreground/30" : "border-border hover:scale-110"}`}
                                    style={{ backgroundColor: hex || "#ccc" }}
                                  />
                                );
                              })}
                              {variants.length > 8 && <span className="text-[10px] text-muted-foreground">+{variants.length - 8}</span>}
                            </div>
                          )}
                          {(() => {
                            const mk = markupFor(s.brand);
                            const price = mk && s.retail_price ? s.retail_price * mk : null;
                            return (
                              <div className="pt-1">
                                {price ? (
                                  <>
                                    <p className="text-[10px] font-medium text-muted-foreground/80">
                                      €{(price / 1.21).toFixed(2)} <span className="uppercase tracking-wider">{lang === "lv" ? "bez PVN" : "excl. VAT"}</span>
                                    </p>
                                    <p className="font-heading text-sm font-black text-accent">
                                      €{price.toFixed(2)}
                                      <span className="ml-1 text-[9px] font-normal uppercase tracking-wider text-muted-foreground">
                                        {lang === "lv" ? "ar PVN" : "incl. VAT"}
                                      </span>
                                    </p>
                                  </>
                                ) : (
                                  <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote"}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                          {isAdmin && (
                            <div className="pt-2">
                              <button
                                type="button"
                                disabled={toggling === s.product_number}
                                onClick={(e) => { e.stopPropagation(); toggleCatalog(s); }}
                                className={`w-full border px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-wider transition-colors ${catalogMap.has(s.product_number) ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20" : "border-accent bg-accent text-accent-foreground hover:bg-accent/90"} disabled:opacity-50`}
                              >
                                {toggling === s.product_number
                                  ? "…"
                                  : catalogMap.has(s.product_number)
                                    ? (lang === "lv" ? "✓ Katalogā — noņemt" : "✓ In catalog — remove")
                                    : (lang === "lv" ? "+ Pievienot katalogam" : "+ Add to catalog")}
                              </button>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>


                {pageCount > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</Button>
                    <span className="text-xs text-muted-foreground">{page} / {pageCount}</span>
                    <Button variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>›</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-background p-0">
          {open && (
            <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
              <div className="space-y-3">
                <div className="aspect-[3/4] overflow-hidden bg-white">
                  {galleryImages[galleryIdx] ? (
                    <img src={galleryImages[galleryIdx]} alt={open.name} className="h-full w-full object-contain p-4" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {galleryImages.slice(0, 10).map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGalleryIdx(i)}
                        className={`aspect-square overflow-hidden border-2 bg-white ${i === galleryIdx ? "border-accent" : "border-transparent hover:border-border"}`}
                      >
                        <img src={url} alt="" loading="lazy" className="h-full w-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <DialogHeader className="space-y-1 text-left">
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{open.brand}</p>
                  <DialogTitle className="flex flex-wrap items-baseline gap-3 font-heading text-3xl font-black uppercase tracking-tight">
                    {open.name}
                    <span className="font-mono text-sm font-normal text-muted-foreground">{open.product_number}</span>
                  </DialogTitle>
                  {open.commerce_text && <p className="text-base text-muted-foreground">{open.commerce_text}</p>}
                </DialogHeader>

                <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3 text-sm">
                  {open.fit && <div><span className="font-semibold">{t.fit}: </span><span className="text-muted-foreground">{open.fit}</span></div>}
                  {open.weight && <div><span className="font-semibold">{t.weight}: </span><span className="text-muted-foreground">{open.weight}</span></div>}
                  {open.gender && <div><span className="font-semibold">{t.gender}: </span><span className="text-muted-foreground">{open.gender}</span></div>}
                </div>

                {(() => {
                  const mk = markupFor(open.brand);
                  const price = mk && open.retail_price ? open.retail_price * mk : null;
                  if (!price) return null;
                  return (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground/80">
                        €{(price / 1.21).toFixed(2)} <span className="uppercase tracking-wider">{lang === "lv" ? "bez PVN" : "excl. VAT"}</span>
                      </p>
                      <p className="font-heading text-2xl font-black text-accent">
                        €{price.toFixed(2)}
                        <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                          {lang === "lv" ? "ar PVN" : "incl. VAT"}
                        </span>
                      </p>
                    </div>
                  );
                })()}

                {detailLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : detailVariants.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm">
                      <span className="font-semibold">{t.colour}: </span>
                      <span className="text-muted-foreground">{activeVariant ? (activeVariant.color_name || activeVariant.item_number) : (lang === "lv" ? "Visas krāsas" : "All colours")}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {detailVariants.map((v) => {
                        const hex = hexOf(v);
                        const selected = activeItem === v.item_number;
                        return (
                          <button
                            key={v.item_number}
                            type="button"
                            onClick={() => setActiveItem(selected ? null : v.item_number)}
                            title={`${v.color_name || ""} – ${v.item_number}`}
                            aria-label={v.color_name || v.item_number}
                            className={`h-7 w-7 rounded-full border-2 transition-transform ${selected ? "border-foreground ring-2 ring-foreground/30 scale-110" : "border-border hover:scale-105"}`}
                            style={{ backgroundColor: hex || "#ccc" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?product=${encodeURIComponent(open.product_number)}${activeItem ? `&color=${encodeURIComponent(activeItem)}` : ""}`}>
                    {t.askPrice}
                  </Link>
                </Button>

                {open.catalog_text && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.description}</h4>
                    <p className="whitespace-pre-line text-sm text-foreground/90">{open.catalog_text}</p>
                  </div>
                )}
                {open.fabrics && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.composition}</h4>
                    <p className="text-sm text-foreground/90">{open.fabrics}</p>
                  </div>
                )}

                {sizesForActive.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="max-h-72 overflow-y-auto border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1.5 text-left">SKU</th>
                            <th className="px-2 py-1.5 text-left">{t.size}</th>
                            <th className="px-2 py-1.5 text-right">{t.stock}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sizesForActive.map((s) => (
                            <tr key={s.sku} className="border-t border-border">
                              <td className="px-2 py-1.5 font-mono">{s.sku}</td>
                              <td className="px-2 py-1.5">{s.size}</td>
                              <td className={`px-2 py-1.5 text-right font-medium ${(s.availability ?? 0) > 0 ? "text-foreground" : "text-muted-foreground"}`}>{(s.availability ?? 0).toLocaleString("lv-LV")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default NwgPage;
