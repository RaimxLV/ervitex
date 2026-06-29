import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

interface SummaryRow {
  style_code: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  category: string | null;
  gender: string | null;
  segment: string | null;
  composition: string | null;
  type: string | null;
  brand: string | null;
  fit: string | null;
  weight_gsm: number | null;
  neckline: string | null;
  sleeve: string | null;
  raw: any;
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

// Canonical size ordering used by Stanley/Stella
const SIZE_ORDER = ["XXXS","XXS","XS","S","M","L","XL","XXL","2XL","3XL","XXXL","4XL","XXXXL","5XL","XXXXXL","6XL"];
const sizeIndex = (s: string | null | undefined) => {
  if (!s) return 999;
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 500 : i;
};

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [signedImages, setSignedImages] = useState<Map<string, string>>(new Map());
  const [colorMap, setColorMap] = useState<Map<string, { name: string; hex: string | null }>>(new Map());

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
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showVariants, setShowVariants] = useState(false);

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

    (async () => {
      const { data } = await supabase.from("ss_colors").select("code,name,hex");
      const m = new Map<string, { name: string; hex: string | null }>();
      for (const c of (data || []) as { code: string; name: string; hex: string | null }[]) {
        m.set(c.code, { name: c.name, hex: c.hex });
      }
      setColorMap(m);
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
    setGalleryIdx(0);
    setShowVariants(false);
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

  const t = lang === "lv"
    ? { search: "Meklēt modeli vai kodu", category: "Kategorija", gender: "Dzimums", inStock: "Tikai noliktavā", all: "Visas", results: "rezultāti", colors: "krāsas", sizes: "izmēri", stock: "noliktavā", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla", colour: "Krāsa", description: "APRAKSTS", composition: "SASTĀVS", care: "KOPŠANAS INSTRUKCIJAS", fit: "Piegriezums", size: "Izmēri", weight: "Svars", askPrice: "Pieprasīt cenu šim modelim", showVariants: "Rādīt SKU un noliktavu", hideVariants: "Slēpt SKU tabulu", allColours: "Visas krāsas" }
    : { search: "Search model or code", category: "Category", gender: "Gender", inStock: "In stock only", all: "All", results: "results", colors: "colours", sizes: "sizes", stock: "in stock", contact: "Request a Quote", noResults: "No results", noImage: "No image", colour: "Colour", description: "DESCRIPTION", composition: "COMPOSITION", care: "CARE INSTRUCTIONS", fit: "Fit", size: "Size", weight: "Weight", askPrice: "Request a quote for this model", showVariants: "Show SKU & stock", hideVariants: "Hide SKU table", allColours: "All colours" };

  // Color list for current style with hex from palette
  const colorList = useMemo(() => {
    if (!openStyle) return [] as { code: string; name: string; hex: string | null }[];
    const seen = new Map<string, { code: string; name: string; hex: string | null }>();
    for (const v of detailVariants) {
      if (!v.color_code || seen.has(v.color_code)) continue;
      const pal = colorMap.get(v.color_code);
      seen.set(v.color_code, {
        code: v.color_code,
        name: pal?.name || v.color_name || v.color_code,
        hex: pal?.hex || null,
      });
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [detailVariants, openStyle, colorMap]);

  // Sizes for active color (or all)
  const sizesForColor = useMemo(() => {
    const filtered = detailVariants.filter((v) => !activeColor || v.color_code === activeColor);
    return filtered.sort((a, b) => sizeIndex(a.size_code) - sizeIndex(b.size_code) || (a.color_name || "").localeCompare(b.color_name || ""));
  }, [detailVariants, activeColor]);

  // Size range string (XXS - 5XL)
  const sizeRange = useMemo(() => {
    if (!detailVariants.length) return "";
    const codes = Array.from(new Set(detailVariants.map((v) => v.size_code).filter(Boolean) as string[]));
    if (!codes.length) return "";
    codes.sort((a, b) => sizeIndex(a) - sizeIndex(b));
    return codes.length === 1 ? codes[0] : `${codes[0]} - ${codes[codes.length - 1]}`;
  }, [detailVariants]);

  // Gallery images (filter by color if selected)
  const galleryImages = useMemo(() => {
    if (!activeColor) return detailImages;
    const f = detailImages.filter((i) => i.color === activeColor);
    return f.length ? f : detailImages;
  }, [detailImages, activeColor]);

  useEffect(() => { setGalleryIdx(0); }, [activeColor, openStyle?.style_code]);

  // Extract composition & care from raw
  const shellComposition = useMemo(() => {
    const layers = openStyle?.raw?.Layers as any[] | undefined;
    if (!Array.isArray(layers)) return openStyle?.composition || null;
    const shell = layers.find((l) => l && l.Shell)?.Shell;
    if (!shell) return openStyle?.composition || null;
    const parts: string[] = [];
    if (shell.ShellConstruction) parts.push(shell.ShellConstruction);
    if (shell.ShellComposition) parts.push(shell.ShellComposition);
    if (shell.ShellFinishing) parts.push(shell.ShellFinishing);
    return parts.length ? parts.join(", ") : openStyle?.composition || null;
  }, [openStyle]);

  const careText = useMemo(() => {
    const w = openStyle?.raw?.WashInstructions;
    return typeof w === "string" && w.trim() ? w : null;
  }, [openStyle]);

  const weight = openStyle?.weight_gsm || openStyle?.raw?.Layers?.[0]?.Shell?.ShellWeight || null;

  const activeColorObj = activeColor ? colorList.find((c) => c.code === activeColor) : null;

  // Description bullets from long_description
  const descBullets = useMemo(() => {
    const txt = openStyle?.long_description || "";
    return txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }, [openStyle]);

  return (
    <Layout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={stellaLogo} alt="Stanley/Stella" className="h-8 w-auto md:h-10" />
            <span className="font-heading text-xl font-black uppercase tracking-wide">Stanley/Stella</span>
          </div>
          <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <Link to="/contact">{t.contact}</Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container grid gap-3 px-4 py-4 md:grid-cols-[1fr_180px_180px_auto_auto]">
          <Input placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder={t.category} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.category}: {t.all}</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger><SelectValue placeholder={t.gender} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.gender}: {t.all}</SelectItem>
              {genders.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(!!v)} />
            {t.inStock}
          </label>
          <span className="self-center text-xs text-muted-foreground">{filtered.length} {t.results}</span>
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
            <div className="rounded-sm border border-dashed border-border p-10 text-center text-sm text-muted-foreground">{t.noResults}</div>
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
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                        )}
                        <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.style_code}</span>
                        {s.total_stock > 0 && <span className="absolute right-2 top-2 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">{s.total_stock.toLocaleString("lv-LV")} {t.stock}</span>}
                      </div>
                      <div className="space-y-1 p-3">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.name}</h3>
                        {s.short_description && <p className="line-clamp-2 text-xs text-muted-foreground">{s.short_description}</p>}
                        <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {s.color_count} {t.colors} · {s.size_count} {t.sizes}
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
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-background p-0">
          {openStyle && (
            <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
              {/* LEFT — Gallery */}
              <div className="space-y-3">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {galleryImages[galleryIdx] ? (
                    <img src={galleryImages[galleryIdx].url} alt={openStyle.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                  )}
                </div>
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {galleryImages.slice(0, 10).map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGalleryIdx(i)}
                        className={`aspect-square overflow-hidden border-2 ${i === galleryIdx ? "border-accent" : "border-transparent hover:border-border"}`}
                      >
                        <img src={g.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Info */}
              <div className="space-y-6">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="flex flex-wrap items-baseline gap-3 font-heading text-3xl font-black uppercase tracking-tight">
                    {openStyle.name}
                    <span className="font-mono text-sm font-normal text-muted-foreground">{openStyle.style_code}</span>
                  </DialogTitle>
                  {openStyle.short_description && (
                    <p className="text-base text-muted-foreground">{openStyle.short_description}</p>
                  )}
                </DialogHeader>

                {/* Fit / Size / Weight row */}
                <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3 text-sm">
                  {openStyle.fit && <div><span className="font-semibold">{t.fit}: </span><span className="text-muted-foreground">{openStyle.fit}</span></div>}
                  {sizeRange && <div><span className="font-semibold">{t.size}: </span><span className="text-muted-foreground">{sizeRange}</span></div>}
                  {weight && <div><span className="font-semibold">{t.weight}: </span><span className="text-muted-foreground">{weight} GSM</span></div>}
                </div>

                {/* Colour swatches */}
                {detailLoading ? (
                  <Skeleton className="h-16 w-full" />
                ) : colorList.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm">
                      <span className="font-semibold">{t.colour}: </span>
                      <span className="text-muted-foreground">
                        {activeColorObj ? `${activeColorObj.name} - ${activeColorObj.code}` : t.allColours}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {colorList.map((c) => {
                        const selected = activeColor === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setActiveColor(selected ? null : c.code)}
                            title={`${c.name} – ${c.code}`}
                            aria-label={c.name}
                            className={`h-7 w-7 rounded-full border-2 transition-transform ${selected ? "border-foreground ring-2 ring-foreground/30 scale-110" : "border-border hover:scale-105"}`}
                            style={{ backgroundColor: c.hex || "#ccc" }}
                          >
                            {!c.hex && <span className="block text-[8px] leading-[1.6rem]">{c.code}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to={`/contact?style=${encodeURIComponent(openStyle.style_code)}${activeColor ? `&color=${encodeURIComponent(activeColor)}` : ""}`}>
                    {t.askPrice}
                  </Link>
                </Button>

                {/* Description */}
                {descBullets.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.description}</h4>
                    <ul className="space-y-1.5 text-sm">
                      {descBullets.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-0.5 text-accent">✓</span>
                          <span className="text-foreground/90">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Composition */}
                {shellComposition && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.composition}</h4>
                    <p className="text-sm text-foreground/90">{shellComposition}</p>
                  </div>
                )}

                {/* Care */}
                {careText && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.care}</h4>
                    <p className="text-sm text-foreground/90">{careText}</p>
                  </div>
                )}

                {/* Stock summary + optional SKU table */}
                <div className="border-t border-border pt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span><span className="font-semibold">{t.stock}: </span><span className="text-muted-foreground">{openStyle.total_stock.toLocaleString("lv-LV")}</span></span>
                    {sizesForColor.length > 0 && (
                      <button
                        type="button"
                        className="text-xs uppercase tracking-wider text-muted-foreground underline-offset-4 hover:underline"
                        onClick={() => setShowVariants((s) => !s)}
                      >
                        {showVariants ? t.hideVariants : t.showVariants}
                      </button>
                    )}
                  </div>

                  {showVariants && (
                    <div className="max-h-72 overflow-y-auto border border-border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1.5 text-left">SKU</th>
                            {!activeColor && <th className="px-2 py-1.5 text-left">{t.colour}</th>}
                            <th className="px-2 py-1.5 text-left">{t.size}</th>
                            <th className="px-2 py-1.5 text-right">{t.stock}</th>
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
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default StanleyStellaPage;
