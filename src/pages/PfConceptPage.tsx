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
import CatalogFiltersSidebar from "@/components/catalog/CatalogFiltersSidebar";
import { COLOR_BUCKETS, bucketOf, type ColorBucketKey } from "@/lib/colorBuckets";

interface SummaryRow {
  model_code: string;
  description: string | null;
  ext_desc: string | null;
  brand: string | null;
  category_group: string | null;
  category: string | null;
  material: string | null;
  gender: string | null;
  main_image: string | null;
  color_count: number;
  item_count: number;
  main_image_url: string | null;
}

interface VariantRow {
  item_code: string;
  model_code: string;
  size: string | null;
  color_code: string | null;
  color_desc: string | null;
  hex_color: string | null;
}

interface ImageRow {
  model_code: string;
  item_code: string | null;
  kind: string;
  filename: string;
  url_500: string | null;
  url_1600: string | null;
  sort_order: number | null;
}

const PAGE_SIZE = 24;

const PfConceptPage = () => {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [q, setQ] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedGenders, setSelectedGenders] = useState<Set<string>>(new Set());
  const [selectedBuckets, setSelectedBuckets] = useState<Set<ColorBucketKey>>(new Set());
  const [colorMap, setColorMap] = useState<Map<string, { buckets: Set<ColorBucketKey>; bucketImages: Map<ColorBucketKey, string> }>>(new Map());
  const [page, setPage] = useState(1);

  const [cardVariants, setCardVariants] = useState<Map<string, VariantRow[]>>(new Map());
  const [cardActive, setCardActive] = useState<Map<string, string>>(new Map());

  const [open, setOpen] = useState<SummaryRow | null>(null);
  const [detailVariants, setDetailVariants] = useState<VariantRow[]>([]);
  const [detailImages, setDetailImages] = useState<ImageRow[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    (async () => {
      const all: SummaryRow[] = [];
      const step = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("pf_style_summary" as any)
          .select("*")
          .order("brand", { ascending: true, nullsFirst: false })
          .order("description", { ascending: true })
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
          .eq("source", "pf")
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

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) if (r.brand) counts.set(r.brand, (counts.get(r.brand) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [rows]);

  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) if (r.category_group) counts.set(r.category_group, (counts.get(r.category_group) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [rows]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (!r.category) continue;
      if (selectedGroups.size && (!r.category_group || !selectedGroups.has(r.category_group))) continue;
      counts.set(r.category, (counts.get(r.category) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [rows, selectedGroups]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((s) => {
      if (selectedBrands.size && (!s.brand || !selectedBrands.has(s.brand))) return false;
      if (selectedGroups.size && (!s.category_group || !selectedGroups.has(s.category_group))) return false;
      if (selectedCategories.size && (!s.category || !selectedCategories.has(s.category))) return false;
      if (needle && !`${s.description ?? ""} ${s.model_code} ${s.ext_desc ?? ""}`.toLowerCase().includes(needle)) return false;
      if (selectedBuckets.size) {
        const bc = colorMap.get(s.model_code)?.buckets;
        if (!bc) return false;
        let ok = false;
        for (const b of selectedBuckets) if (bc.has(b)) { ok = true; break; }
        if (!ok) return false;
      }
      return true;
    });
  }, [rows, q, selectedBrands, selectedGroups, selectedCategories, selectedBuckets, colorMap]);

  const bucketItems = useMemo(() => {
    const counts = new Map<ColorBucketKey, number>();
    for (const r of rows) {
      const bc = colorMap.get(r.model_code)?.buckets;
      if (!bc) continue;
      for (const b of bc) counts.set(b, (counts.get(b) || 0) + 1);
    }
    return COLOR_BUCKETS
      .map((b) => ({ key: b.key, label: lang === "lv" ? b.lv : b.en, count: counts.get(b.key) || 0 }))
      .filter((x) => x.count > 0);
  }, [rows, colorMap, lang]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [q, selectedBrands, selectedGroups, selectedCategories, selectedBuckets]);

  // Fetch color variants for visible cards
  useEffect(() => {
    const need = slice.map((s) => s.model_code).filter((p) => !cardVariants.has(p));
    if (!need.length) return;
    (async () => {
      const { data } = await supabase
        .from("pf_variants")
        .select("item_code,model_code,size,color_code,color_desc,hex_color")
        .in("model_code", need);
      const map = new Map<string, VariantRow[]>();
      for (const v of (data || []) as VariantRow[]) {
        if (!map.has(v.model_code)) map.set(v.model_code, []);
        map.get(v.model_code)!.push(v);
      }
      setCardVariants((prev) => {
        const merged = new Map(prev);
        for (const [k, v] of map) merged.set(k, v);
        for (const p of need) if (!merged.has(p)) merged.set(p, []);
        return merged;
      });
    })();
  }, [slice]);

  const openDetail = async (r: SummaryRow) => {
    setOpen(r);
    setActiveItem(null);
    setGalleryIdx(0);
    setDetailVariants([]);
    setDetailImages([]);
    const [{ data: v }, { data: img }] = await Promise.all([
      supabase.from("pf_variants").select("item_code,model_code,size,color_code,color_desc,hex_color").eq("model_code", r.model_code),
      supabase.from("pf_images").select("model_code,item_code,kind,filename,url_500,url_1600,sort_order").eq("model_code", r.model_code).order("sort_order", { ascending: true }),
    ]);
    setDetailVariants((v || []) as VariantRow[]);
    setDetailImages((img || []) as ImageRow[]);
  };

  const galleryImages = useMemo(() => {
    if (!open) return [] as string[];
    const list = activeItem ? detailImages.filter((i) => i.item_code === activeItem) : detailImages;
    const source = list.length ? list : detailImages;
    const urls = source.map((i) => i.url_1600 || i.url_500).filter((u): u is string => !!u);
    if (urls.length) return Array.from(new Set(urls));
    return open.main_image_url ? [open.main_image_url] : [];
  }, [detailImages, activeItem, open]);

  useEffect(() => { setGalleryIdx(0); }, [activeItem, open?.model_code]);

  // Distinct colors from variants (dedupe by color_code)
  const colorSwatches = (variants: VariantRow[]) => {
    const seen = new Map<string, VariantRow>();
    for (const v of variants) {
      const k = v.color_code || v.item_code;
      if (!seen.has(k)) seen.set(k, v);
    }
    return [...seen.values()];
  };

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setSet(next);
  };

  const t = lang === "lv"
    ? { search: "Meklēt modeli vai kodu", brand: "Zīmols", group: "Grupa", category: "Kategorija", results: "rezultāti", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla", colour: "Krāsa", description: "Apraksts", material: "Materiāls", size: "Izmērs", askPrice: "Pieprasīt cenu šim modelim", filters: "Filtri", clear: "Notīrīt", partner: "PF Concept – oficiāls partneris" }
    : { search: "Search model or code", brand: "Brand", group: "Group", category: "Category", results: "results", contact: "Request a Quote", noResults: "No results", noImage: "No image", colour: "Colour", description: "Description", material: "Material", size: "Size", askPrice: "Request a quote for this model", filters: "Filters", clear: "Clear", partner: "PF Concept – official partner" };

  return (
    <Layout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/60">{t.partner}</p>
            <h1 className="font-heading text-2xl font-black uppercase md:text-3xl">PF Concept</h1>
            <p className="mt-1 text-xs text-primary-foreground/70">{lang === "lv" ? "Reklāmas priekšmeti, aksesuāri, biroja preces" : "Promotional products, accessories, office"}</p>
          </div>
          <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/contact">{t.contact}</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container flex flex-wrap items-center gap-3 px-4 py-4">
          <Input className="max-w-md flex-1" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} {t.results}</span>
        </div>
      </section>

      <section className="bg-background">
        <div className="container grid gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
          <CatalogFiltersSidebar
            onClearAll={() => { setSelectedBrands(new Set()); setSelectedGroups(new Set()); setSelectedCategories(new Set()); setSelectedBuckets(new Set()); }}
            sections={[
              {
                key: "color",
                title: lang === "lv" ? "Krāsa" : "Color",
                items: bucketItems.map((b) => ({ label: b.label, count: b.count })),
                selected: new Set(
                  [...selectedBuckets]
                    .map((k) => COLOR_BUCKETS.find((x) => x.key === k))
                    .filter(Boolean)
                    .map((b) => (lang === "lv" ? b!.lv : b!.en))
                ),
                onToggle: (label) => {
                  const b = COLOR_BUCKETS.find((x) => (lang === "lv" ? x.lv : x.en) === label);
                  if (!b) return;
                  const next = new Set(selectedBuckets);
                  next.has(b.key) ? next.delete(b.key) : next.add(b.key);
                  setSelectedBuckets(next);
                },
              },
              { key: "group", title: t.group, items: groups, selected: selectedGroups, onToggle: (v) => toggle(selectedGroups, setSelectedGroups, v) },
              { key: "category", title: t.category, items: categories, selected: selectedCategories, onToggle: (v) => toggle(selectedCategories, setSelectedCategories, v) },
              { key: "brand", title: t.brand, items: brands, selected: selectedBrands, onToggle: (v) => toggle(selectedBrands, setSelectedBrands, v) },
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
                    const variants = colorSwatches(cardVariants.get(s.model_code) || []);
                    const activeItem = cardActive.get(s.model_code);
                    const activeV = activeItem ? variants.find((v) => v.item_code === activeItem) : null;
                    const activeImgSrc = activeV
                      ? undefined // will be fetched only in detail; for card, fall back to main
                      : undefined;
                    const main = activeImgSrc || s.main_image_url;
                    return (
                      <button
                        key={s.model_code}
                        type="button"
                        onClick={() => openDetail(s)}
                        className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-white">
                          {main ? (
                            <img src={main} alt={s.description ?? s.model_code} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-2" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                          )}
                          <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.model_code}</span>
                          {s.brand && s.brand !== "Unbranded" && <span className="absolute right-2 top-2 bg-background/90 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider">{s.brand}</span>}
                        </div>
                        <div className="space-y-1.5 p-3">
                          <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.description ?? s.model_code}</h3>
                          {s.ext_desc && <p className="line-clamp-2 text-xs text-muted-foreground">{s.ext_desc}</p>}
                          {variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {variants.slice(0, 8).map((v) => {
                                const hex = v.hex_color ? (v.hex_color.startsWith("#") ? v.hex_color : `#${v.hex_color}`) : null;
                                const selected = activeItem === v.item_code;
                                return (
                                  <span
                                    key={v.item_code}
                                    role="button"
                                    tabIndex={0}
                                    title={v.color_desc || v.item_code}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCardActive((prev) => {
                                        const next = new Map(prev);
                                        if (next.get(s.model_code) === v.item_code) next.delete(s.model_code);
                                        else next.set(s.model_code, v.item_code);
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
                          <p className="pt-1 font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote"}
                          </p>
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
                    <img src={galleryImages[galleryIdx]} alt={open.description ?? open.model_code} className="h-full w-full object-contain p-4" />
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
                  {open.brand && <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{open.brand}</p>}
                  <DialogTitle className="flex flex-wrap items-baseline gap-3 font-heading text-3xl font-black uppercase tracking-tight">
                    {open.description ?? open.model_code}
                    <span className="font-mono text-sm font-normal text-muted-foreground">{open.model_code}</span>
                  </DialogTitle>
                  {open.ext_desc && <p className="text-base text-muted-foreground">{open.ext_desc}</p>}
                </DialogHeader>

                <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3 text-sm">
                  {open.category_group && <div><span className="font-semibold">{t.group}: </span><span className="text-muted-foreground">{open.category_group}</span></div>}
                  {open.category && <div><span className="font-semibold">{t.category}: </span><span className="text-muted-foreground">{open.category}</span></div>}
                  {open.material && <div><span className="font-semibold">{t.material}: </span><span className="text-muted-foreground">{open.material}</span></div>}
                </div>

                {colorSwatches(detailVariants).length > 0 && (
                  <div>
                    <p className="mb-2 text-sm">
                      <span className="font-semibold">{t.colour}: </span>
                      <span className="text-muted-foreground">
                        {activeItem
                          ? (detailVariants.find((v) => v.item_code === activeItem)?.color_desc || activeItem)
                          : (lang === "lv" ? "Visas krāsas" : "All colours")}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {colorSwatches(detailVariants).map((v) => {
                        const hex = v.hex_color ? (v.hex_color.startsWith("#") ? v.hex_color : `#${v.hex_color}`) : null;
                        const selected = activeItem === v.item_code;
                        return (
                          <button
                            key={v.item_code}
                            type="button"
                            onClick={() => setActiveItem(selected ? null : v.item_code)}
                            title={`${v.color_desc || ""} – ${v.item_code}`}
                            aria-label={v.color_desc || v.item_code}
                            className={`h-7 w-7 rounded-full border-2 transition-transform ${selected ? "border-foreground ring-2 ring-foreground/30 scale-110" : "border-border hover:scale-105"}`}
                            style={{ backgroundColor: hex || "#ccc" }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?product=${encodeURIComponent(open.model_code)}${activeItem ? `&color=${encodeURIComponent(activeItem)}` : ""}`}>
                    {t.askPrice}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default PfConceptPage;
