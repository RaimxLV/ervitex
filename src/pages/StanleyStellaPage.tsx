import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

interface SummaryRow {
  style_code: string;
  name: string;
  short_description: string | null;
  category: string | null;
  gender: string | null;
  segment: string | null;
  composition: string | null;
  type: string | null;
  brand: string | null;
  total_stock: number;
  color_count: number;
  size_count: number;
  image_path: string | null;
  image_url: string | null;
}

interface VariantRow {
  sku: string;
  color_code: string | null;
  color_name: string | null;
  size_code: string | null;
}

interface StockRow { sku: string; quantity: number }
interface ImageRow { color_code: string | null; storage_path: string | null; public_url: string | null; sort_order: number }

const PAGE_SIZE = 24;

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [signedImages, setSignedImages] = useState<Map<string, string>>(new Map());

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [page, setPage] = useState(1);

  // Detail dialog
  const [openStyle, setOpenStyle] = useState<SummaryRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailVariants, setDetailVariants] = useState<VariantRow[]>([]);
  const [detailStock, setDetailStock] = useState<Map<string, number>>(new Map());
  const [detailImages, setDetailImages] = useState<{ url: string; color: string | null }[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all: SummaryRow[] = [];
      const step = 500;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("ss_style_summary" as any)
          .select("*")
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

  const categories = useMemo(() => Array.from(new Set(rows.map((s) => s.category).filter(Boolean))).sort() as string[], [rows]);
  const genders = useMemo(() => Array.from(new Set(rows.map((s) => s.gender).filter(Boolean))).sort() as string[], [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (gender !== "all" && s.gender !== gender) return false;
      if (inStockOnly && s.total_stock <= 0) return false;
      if (needle && !`${s.name} ${s.style_code} ${s.short_description ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, category, gender, inStockOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q, category, gender, inStockOnly]);

  // Sign URLs only for visible slice
  useEffect(() => {
    (async () => {
      const need = slice
        .map((r) => r.image_path)
        .filter((p): p is string => !!p && !signedImages.has(p));
      if (need.length === 0) return;
      const { data } = await supabase.storage.from("ss-images").createSignedUrls(need, 60 * 60);
      if (!data) return;
      setSignedImages((prev) => {
        const m = new Map(prev);
        for (const s of data) if (s.path && s.signedUrl) m.set(s.path, s.signedUrl);
        return m;
      });
    })();
  }, [slice]);

  const imageFor = (r: SummaryRow) => (r.image_path && signedImages.get(r.image_path)) || r.image_url || null;

  const openDetail = async (r: SummaryRow) => {
    setOpenStyle(r);
    setDetailLoading(true);
    setActiveColor(null);
    setDetailVariants([]);
    setDetailStock(new Map());
    setDetailImages([]);
    try {
      const [{ data: v }, { data: img }] = await Promise.all([
        supabase.from("ss_variants").select("sku,color_code,color_name,size_code").eq("style_code", r.style_code),
        supabase.from("ss_images").select("color_code,storage_path,public_url,sort_order").eq("style_code", r.style_code).order("sort_order", { ascending: true }),
      ]);
      const variants = (v || []) as VariantRow[];
      setDetailVariants(variants);

      const skus = variants.map((x) => x.sku).filter(Boolean);
      if (skus.length) {
        const { data: stk } = await supabase.from("ss_stock").select("sku,quantity").in("sku", skus);
        const m = new Map<string, number>();
        for (const s of (stk || []) as StockRow[]) m.set(s.sku, s.quantity || 0);
        setDetailStock(m);
      }

      const imgs = (img || []) as ImageRow[];
      const paths = imgs.map((i) => i.storage_path).filter((p): p is string => !!p);
      let signedMap = new Map<string, string>();
      if (paths.length) {
        const { data } = await supabase.storage.from("ss-images").createSignedUrls(paths, 60 * 60);
        for (const s of data || []) if (s.path && s.signedUrl) signedMap.set(s.path, s.signedUrl);
      }
      setDetailImages(
        imgs
          .map((i) => ({
            url: (i.storage_path && signedMap.get(i.storage_path)) || i.public_url || "",
            color: i.color_code,
          }))
          .filter((x) => !!x.url)
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const tLabels = lang === "lv"
    ? { search: "Meklēt", category: "Kategorija", gender: "Dzimums", inStock: "Tikai noliktavā", all: "Visas", results: "rezultāti", colors: "krāsas", sizes: "izmēri", stock: "noliktavā", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla", details: "Detaļas", composition: "Sastāvs", variants: "Varianti", allColors: "Visas krāsas", askPrice: "Pieprasīt cenu šim modelim" }
    : { search: "Search", category: "Category", gender: "Gender", inStock: "In stock only", all: "All", results: "results", colors: "colors", sizes: "sizes", stock: "in stock", contact: "Request a Quote", noResults: "No results", noImage: "No image", details: "Details", composition: "Composition", variants: "Variants", allColors: "All colors", askPrice: "Request a quote for this model" };

  // Build color list and per-color size availability for the dialog
  const colorList = useMemo(() => {
    if (!openStyle) return [] as { code: string; name: string | null }[];
    const seen = new Map<string, string | null>();
    for (const v of detailVariants) {
      if (!v.color_code) continue;
      if (!seen.has(v.color_code)) seen.set(v.color_code, v.color_name);
    }
    return Array.from(seen.entries()).map(([code, name]) => ({ code, name }));
  }, [detailVariants, openStyle]);

  const sizesForColor = useMemo(() => {
    return detailVariants.filter((v) => !activeColor || v.color_code === activeColor);
  }, [detailVariants, activeColor]);

  const galleryImages = useMemo(() => {
    if (!activeColor) return detailImages;
    const filtered = detailImages.filter((i) => i.color === activeColor);
    return filtered.length ? filtered : detailImages;
  }, [detailImages, activeColor]);

  return (
    <Layout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={stellaLogo} alt="Stanley/Stella" className="h-8 w-auto md:h-10" />
            <span className="font-heading text-xl font-black uppercase tracking-wide">Stanley/Stella</span>
          </div>
          <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/contact">{tLabels.contact}</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container grid gap-3 px-4 py-4 md:grid-cols-[1fr_180px_180px_auto_auto]">
          <Input placeholder={tLabels.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder={tLabels.category} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tLabels.category}: {tLabels.all}</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder={tLabels.gender} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tLabels.gender}: {tLabels.all}</SelectItem>
              {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
            {tLabels.inStock}
          </label>
          <span className="self-center text-xs text-muted-foreground">{filtered.length} {tLabels.results}</span>
        </div>
      </section>

      <section className="bg-background">
        <div className="container px-4 py-8">
          {!loaded ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden border border-border bg-card">
                  <Skeleton className="aspect-[3/4] w-full" />
                  <div className="space-y-2 p-3"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : slice.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              {tLabels.noResults}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
                {slice.map((s) => {
                  const img = imageFor(s);
                  return (
                    <button
                      key={s.style_code}
                      type="button"
                      onClick={() => openDetail(s)}
                      className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                        {img ? (
                          <img src={img} alt={s.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{tLabels.noImage}</div>
                        )}
                        <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.style_code}</span>
                        {s.total_stock > 0 && <span className="absolute right-2 top-2 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">{s.total_stock.toLocaleString("lv-LV")} {tLabels.stock}</span>}
                      </div>
                      <div className="space-y-1 p-3">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.name}</h3>
                        {s.short_description && <p className="line-clamp-2 text-xs text-muted-foreground">{s.short_description}</p>}
                        <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.color_count} {tLabels.colors} · {s.size_count} {tLabels.sizes}
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
      </section>

      <Dialog open={!!openStyle} onOpenChange={(o) => !o && setOpenStyle(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {openStyle && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl font-black uppercase tracking-wide">
                  {openStyle.name} <span className="ml-2 font-mono text-sm text-muted-foreground">{openStyle.style_code}</span>
                </DialogTitle>
                {openStyle.short_description && (
                  <DialogDescription>{openStyle.short_description}</DialogDescription>
                )}
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Gallery */}
                <div className="space-y-2">
                  <div className="aspect-[3/4] overflow-hidden bg-muted">
                    {galleryImages[0] ? (
                      <img src={galleryImages[0].url} alt={openStyle.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{tLabels.noImage}</div>
                    )}
                  </div>
                  {galleryImages.length > 1 && (
                    <div className="grid grid-cols-5 gap-1">
                      {galleryImages.slice(0, 10).map((g, i) => (
                        <div key={i} className="aspect-square overflow-hidden bg-muted">
                          <img src={g.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {openStyle.category && <div><span className="text-muted-foreground">{tLabels.category}: </span><span className="font-medium">{openStyle.category}</span></div>}
                    {openStyle.gender && <div><span className="text-muted-foreground">{tLabels.gender}: </span><span className="font-medium">{openStyle.gender}</span></div>}
                    {openStyle.composition && <div className="col-span-2"><span className="text-muted-foreground">{tLabels.composition}: </span><span className="font-medium">{openStyle.composition}</span></div>}
                    <div><span className="text-muted-foreground">{tLabels.stock}: </span><span className="font-medium">{openStyle.total_stock.toLocaleString("lv-LV")}</span></div>
                  </div>

                  {detailLoading ? (
                    <div className="space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-8 w-full" /></div>
                  ) : (
                    <>
                      {colorList.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{tLabels.colors} ({colorList.length})</p>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              onClick={() => setActiveColor(null)}
                              className={`border px-2 py-1 text-[11px] uppercase tracking-wider ${!activeColor ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-accent"}`}
                            >
                              {tLabels.allColors}
                            </button>
                            {colorList.map((c) => (
                              <button
                                key={c.code}
                                onClick={() => setActiveColor(c.code)}
                                className={`border px-2 py-1 text-[11px] uppercase tracking-wider ${activeColor === c.code ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:border-accent"}`}
                              >
                                {c.name || c.code}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {sizesForColor.length > 0 && (
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{tLabels.variants} ({sizesForColor.length})</p>
                          <div className="max-h-64 overflow-y-auto border border-border">
                            <table className="w-full text-xs">
                              <thead className="bg-muted text-[10px] uppercase tracking-wider text-muted-foreground">
                                <tr>
                                  <th className="px-2 py-1.5 text-left">SKU</th>
                                  {!activeColor && <th className="px-2 py-1.5 text-left">{tLabels.colors}</th>}
                                  <th className="px-2 py-1.5 text-left">{tLabels.sizes}</th>
                                  <th className="px-2 py-1.5 text-right">{tLabels.stock}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sizesForColor.map((v) => {
                                  const qty = detailStock.get(v.sku) || 0;
                                  return (
                                    <tr key={v.sku} className="border-t border-border">
                                      <td className="px-2 py-1.5 font-mono">{v.sku}</td>
                                      {!activeColor && <td className="px-2 py-1.5">{v.color_name || v.color_code}</td>}
                                      <td className="px-2 py-1.5">{v.size_code}</td>
                                      <td className={`px-2 py-1.5 text-right font-medium ${qty > 0 ? "text-foreground" : "text-muted-foreground"}`}>{qty.toLocaleString("lv-LV")}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to={`/contact?style=${encodeURIComponent(openStyle.style_code)}`}>{tLabels.askPrice}</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StanleyStellaPage;
