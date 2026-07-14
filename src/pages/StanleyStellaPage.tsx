import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";
import CatalogFiltersSidebar from "@/components/catalog/CatalogFiltersSidebar";


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
  wash_instructions: string | null;
  specifications: string | null;
  main_picture_url: string | null;
  over_picture_url: string | null;
  cover_url: string | null;
  over_url: string | null;
  raw: any;
  total_stock: number;
  color_count: number;
  size_count: number;
}

interface VariantRow {
  sku: string;
  color_code: string | null;
  color_name: string | null;
  hex_color_code: string | null;
  size_code: string | null;
  size_sequence: number | null;
}

interface StockRow { sku: string; quantity: number }
interface ImageRow {
  style_code: string;
  color_code: string | null;
  source_url: string;
  image_type: string | null;
  photo_shoot_code: string | null;
  sort_order: number | null;
  is_main: boolean | null;
  is_over: boolean | null;
}

const PAGE_SIZE = 24;
const CDN_BASE = "https://res.cloudinary.com/www-stanleystella-com/image/upload/";
const resolveUrl = (u?: string | null, transform?: string) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) {
    if (transform && u.includes("res.cloudinary.com") && u.includes("/image/upload/")) {
      return u.replace("/image/upload/", `/image/upload/${transform}/`);
    }
    return u;
  }
  const path = u.replace(/^\/+/, "");
  return CDN_BASE + (transform ? `${transform}/${path}` : path);
};
const THUMB_TRANSFORM = "f_auto,q_auto,w_600,c_fill,g_auto";

const SIZE_ORDER = ["XXXS","XXS","XS","S","M","L","XL","XXL","2XL","3XL","XXXL","4XL","XXXXL","5XL","XXXXXL","6XL"];
const sizeIndex = (s: string | null | undefined) => {
  if (!s) return 999;
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 500 : i;
};

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  // style_code -> { colors: Map<color_code, hex>, mainByColor: Map<color, url[]> }
  const [styleColorHex, setStyleColorHex] = useState<Map<string, Map<string, string | null>>>(new Map());

  // Admin: catalog mapping style_code -> { id, retail_price }
  const [catalogMap, setCatalogMap] = useState<Map<string, { id: string; retail_price: number | null }>>(new Map());
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [priceSaving, setPriceSaving] = useState(false);

  const [q, setQ] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedGenders, setSelectedGenders] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(true);
  const [page, setPage] = useState(1);

  const [openStyle, setOpenStyle] = useState<SummaryRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailVariants, setDetailVariants] = useState<VariantRow[]>([]);
  const [detailStock, setDetailStock] = useState<Map<string, number>>(new Map());
  const [detailImages, setDetailImages] = useState<ImageRow[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showVariants, setShowVariants] = useState(false);


  // Bulk load summary
  useEffect(() => {
    (async () => {
      const all: SummaryRow[] = [];
      const step = 500;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("ss_style_summary" as any)
          .select("style_code,name,short_description,long_description,category,gender,segment,composition,type,brand,fit,weight_gsm,neckline,sleeve,wash_instructions,specifications,main_picture_url,over_picture_url,cover_url,over_url,total_stock,color_count,size_count")
          .order("sequence_style", { ascending: true, nullsFirst: false })
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

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) if (r.category) counts.set(r.category, (counts.get(r.category) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [rows]);
  const genders = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) if (r.gender) counts.set(r.gender, (counts.get(r.gender) || 0) + 1);
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((s) => {
      if (selectedCategories.size && (!s.category || !selectedCategories.has(s.category))) return false;
      if (selectedGenders.size && (!s.gender || !selectedGenders.has(s.gender))) return false;
      if (inStockOnly && s.total_stock <= 0) return false;
      if (needle && !`${s.name} ${s.style_code} ${s.short_description ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, selectedCategories, selectedGenders, inStockOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q, selectedCategories, selectedGenders, inStockOnly]);

  const toggle = (set: Set<string>, setSet: (s: Set<string>) => void, v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v); else next.add(v);
    setSet(next);
  };


  // Load color swatches (code+hex) for visible styles' cards
  useEffect(() => {
    const need = slice.map((s) => s.style_code).filter((c) => !styleColorHex.has(c));
    if (!need.length) return;
    (async () => {
      const { data } = await supabase
        .from("ss_variants")
        .select("style_code,color_code,hex_color_code,color_sequence")
        .in("style_code", need);
      const map = new Map<string, Map<string, string | null>>();
      for (const row of (data || []) as any[]) {
        if (!row.color_code) continue;
        if (!map.has(row.style_code)) map.set(row.style_code, new Map());
        const m = map.get(row.style_code)!;
        if (!m.has(row.color_code)) m.set(row.color_code, row.hex_color_code || null);
      }
      setStyleColorHex((prev) => {
        const merged = new Map(prev);
        for (const [k, v] of map) merged.set(k, v);
        return merged;
      });
    })();
  }, [slice]);

  // Admin: load which Stanley/Stella styles already sit in the public catalog
  const loadCatalogMap = async () => {
    const { data } = await supabase
      .from("products")
      .select("id,retail_price,ss_style_code,name_lv")
      .eq("brand", "Stanley/Stella");
    const m = new Map<string, { id: string; retail_price: number | null }>();
    for (const p of (data || []) as any[]) {
      const key = (p.ss_style_code || p.name_lv || "").toUpperCase().trim();
      if (key) m.set(key, { id: p.id, retail_price: p.retail_price ?? null });
    }
    setCatalogMap(m);
  };
  useEffect(() => { if (isAdmin) loadCatalogMap(); }, [isAdmin]);

  const openPriceDialog = () => {
    if (!openStyle) return;
    const existing = catalogMap.get(openStyle.style_code);
    setPriceInput(existing?.retail_price ? String(existing.retail_price) : "");
    setPriceDialogOpen(true);
  };

  const savePrice = async () => {
    if (!openStyle) return;
    const price = parseFloat(priceInput.replace(",", "."));
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: lang === "lv" ? "Nederīga cena" : "Invalid price", variant: "destructive" });
      return;
    }
    setPriceSaving(true);
    try {
      const existing = catalogMap.get(openStyle.style_code);
      if (existing) {
        const { error } = await supabase
          .from("products")
          .update({ retail_price: price, active: true, hidden_manual: false })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert({
          name_lv: openStyle.style_code,
          name_en: openStyle.name || openStyle.style_code,
          description_lv: openStyle.short_description || "",
          description_en: openStyle.short_description || "",
          brand: "Stanley/Stella",
          ss_style_code: openStyle.style_code,
          retail_price: price,
          active: true,
          hidden_manual: false,
        });
        if (error) throw error;
      }
      toast({ title: lang === "lv" ? "Saglabāts katalogā" : "Saved to catalog" });
      setPriceDialogOpen(false);
      await loadCatalogMap();
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    } finally {
      setPriceSaving(false);
    }
  };

  const removeFromCatalog = async () => {
    if (!openStyle) return;
    const existing = catalogMap.get(openStyle.style_code);
    if (!existing) return;
    setPriceSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ active: false, hidden_manual: true })
        .eq("id", existing.id);
      if (error) throw error;
      toast({ title: lang === "lv" ? "Noņemts no kataloga" : "Removed from catalog" });
      setPriceDialogOpen(false);
      await loadCatalogMap();
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    } finally {
      setPriceSaving(false);
    }
  };


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
        supabase.from("ss_variants")
          .select("sku,color_code,color_name,hex_color_code,size_code,size_sequence")
          .eq("style_code", r.style_code),
        supabase.from("ss_images")
          .select("style_code,color_code,source_url,image_type,photo_shoot_code,sort_order,is_main,is_over")
          .eq("style_code", r.style_code)
          .order("is_main", { ascending: false })
          .order("sort_order", { ascending: true }),
      ]);
      const variants = (v || []) as VariantRow[];
      setDetailVariants(variants);
      setDetailImages((img || []) as ImageRow[]);

      const skus = variants.map((x) => x.sku).filter(Boolean);
      if (skus.length) {
        const { data: stk } = await supabase.from("ss_stock").select("sku,quantity").in("sku", skus);
        const m = new Map<string, number>();
        for (const s of (stk || []) as StockRow[]) m.set(s.sku, s.quantity || 0);
        setDetailStock(m);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const t = lang === "lv"
    ? { search: "Meklēt modeli vai kodu", category: "Kategorija", gender: "Dzimums", inStock: "Tikai noliktavā", all: "Visas", results: "rezultāti", colors: "krāsas", sizes: "izmēri", stock: "noliktavā", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla", colour: "Krāsa", description: "APRAKSTS", composition: "SASTĀVS", care: "KOPŠANAS INSTRUKCIJAS", fit: "Piegriezums", size: "Izmēri", weight: "Svars", askPrice: "Pieprasīt cenu šim modelim", showVariants: "Rādīt SKU un noliktavu", hideVariants: "Slēpt SKU tabulu", allColours: "Visas krāsas" }
    : { search: "Search model or code", category: "Category", gender: "Gender", inStock: "In stock only", all: "All", results: "results", colors: "colours", sizes: "sizes", stock: "in stock", contact: "Request a Quote", noResults: "No results", noImage: "No image", colour: "Colour", description: "DESCRIPTION", composition: "COMPOSITION", care: "CARE INSTRUCTIONS", fit: "Fit", size: "Size", weight: "Weight", askPrice: "Request a quote for this model", showVariants: "Show SKU & stock", hideVariants: "Hide SKU table", allColours: "All colours" };

  // Color list for opened style with hex from variants
  const colorList = useMemo(() => {
    if (!openStyle) return [] as { code: string; name: string; hex: string | null }[];
    const seen = new Map<string, { code: string; name: string; hex: string | null }>();
    for (const v of detailVariants) {
      if (!v.color_code || seen.has(v.color_code)) continue;
      seen.set(v.color_code, {
        code: v.color_code,
        name: v.color_name || v.color_code,
        hex: v.hex_color_code || null,
      });
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [detailVariants, openStyle]);

  const sizesForColor = useMemo(() => {
    const list = detailVariants.filter((v) => !activeColor || v.color_code === activeColor);
    return list.sort((a, b) =>
      (a.size_sequence ?? sizeIndex(a.size_code)) - (b.size_sequence ?? sizeIndex(b.size_code)) ||
      (a.color_name || "").localeCompare(b.color_name || "")
    );
  }, [detailVariants, activeColor]);

  const sizeRange = useMemo(() => {
    if (!detailVariants.length) return "";
    const codes = Array.from(new Set(detailVariants.map((v) => v.size_code).filter(Boolean) as string[]));
    if (!codes.length) return "";
    codes.sort((a, b) => sizeIndex(a) - sizeIndex(b));
    return codes.length === 1 ? codes[0] : `${codes[0]} - ${codes[codes.length - 1]}`;
  }, [detailVariants]);

  // Gallery: filter by selected color
  const galleryImages = useMemo(() => {
    const list = activeColor
      ? detailImages.filter((i) => i.color_code === activeColor)
      : detailImages;
    const final = list.length ? list : detailImages;
    const urls = final.map((i) => resolveUrl(i.source_url)).filter((x): x is string => !!x);
    if (urls.length) return urls;
    const fallback = resolveUrl(openStyle?.cover_url || openStyle?.main_picture_url);
    return fallback ? [fallback] : [];
  }, [detailImages, activeColor, openStyle]);

  useEffect(() => { setGalleryIdx(0); }, [activeColor, openStyle?.style_code]);

  const descBullets = useMemo(() => {
    const txt = openStyle?.long_description || "";
    return txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  }, [openStyle]);

  const activeColorObj = activeColor ? colorList.find((c) => c.code === activeColor) : null;

  return (
    <Layout>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div className="flex items-center gap-4">
            <img src={stellaLogo} alt="Stanley/Stella Official Dealer" className="h-8 w-auto md:h-10" />
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
            onClearAll={() => { setSelectedCategories(new Set()); setSelectedGenders(new Set()); }}
            sections={[
              { key: "category", title: t.category, items: categories, selected: selectedCategories, onToggle: (v) => toggle(selectedCategories, setSelectedCategories, v) },
              { key: "gender", title: t.gender, items: genders, selected: selectedGenders, onToggle: (v) => toggle(selectedGenders, setSelectedGenders, v) },
            ]}
          />
          <div>

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
                  const main = resolveUrl(s.cover_url || s.main_picture_url, THUMB_TRANSFORM);
                  const over = resolveUrl(s.over_url || s.over_picture_url, THUMB_TRANSFORM);
                  const swatches = styleColorHex.get(s.style_code);
                  return (
                    <button
                      key={s.style_code}
                      type="button"
                      onClick={() => openDetail(s)}
                      className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#EFEAE0]">
                        {main ? (
                          <>
                            <img
                              src={main}
                              alt={s.name}
                              loading="lazy"
                              className={`absolute inset-0 h-full w-full scale-[1.04] object-cover object-center transition-opacity duration-500 ${over ? "group-hover:opacity-0" : ""}`}
                            />
                            {over && (
                              <img
                                src={over}
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 h-full w-full scale-[1.04] object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              />
                            )}
                          </>
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{t.noImage}</div>
                        )}
                        <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.style_code}</span>
                        {isAdmin && catalogMap.get(s.style_code) && (
                          <span className="absolute right-2 top-2 bg-accent px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                            {catalogMap.get(s.style_code)!.retail_price
                              ? `€${Number(catalogMap.get(s.style_code)!.retail_price).toFixed(2)}`
                              : (lang === "lv" ? "Katalogā" : "In catalog")}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5 p-3">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.name}</h3>
                        {s.short_description && <p className="line-clamp-2 text-xs text-muted-foreground">{s.short_description}</p>}
                        {swatches && swatches.size > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {Array.from(swatches.entries()).slice(0, 8).map(([code, hex]) => (
                              <span key={code} title={code} className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: hex || "#ccc" }} />
                            ))}
                            {swatches.size > 8 && <span className="text-[10px] text-muted-foreground">+{swatches.size - 8}</span>}
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
      </section>

      <Dialog open={!!openStyle} onOpenChange={(o) => !o && setOpenStyle(null)}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-background p-0">
          {openStyle && (
            <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
              <div className="space-y-3">
                <div className="aspect-[3/4] overflow-hidden bg-muted">
                  {galleryImages[galleryIdx] ? (
                    <img src={galleryImages[galleryIdx]} alt={openStyle.name} className="h-full w-full object-cover" />
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
                        className={`aspect-square overflow-hidden border-2 ${i === galleryIdx ? "border-accent" : "border-transparent hover:border-border"}`}
                      >
                        <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

                <div className="flex flex-wrap gap-x-8 gap-y-2 border-y border-border py-3 text-sm">
                  {openStyle.fit && <div><span className="font-semibold">{t.fit}: </span><span className="text-muted-foreground">{openStyle.fit}</span></div>}
                  {sizeRange && <div><span className="font-semibold">{t.size}: </span><span className="text-muted-foreground">{sizeRange}</span></div>}
                  {openStyle.weight_gsm && <div><span className="font-semibold">{t.weight}: </span><span className="text-muted-foreground">{openStyle.weight_gsm} GSM</span></div>}
                </div>

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

                {isAdmin && (() => {
                  const inCatalog = catalogMap.get(openStyle.style_code);
                  return (
                    <div className="rounded-sm border border-dashed border-accent/50 bg-accent/5 p-3">
                      <p className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-accent">
                        {lang === "lv" ? "Admin: Katalogs" : "Admin: Catalog"}
                      </p>
                      {inCatalog ? (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm">
                            {lang === "lv" ? "Katalogā:" : "In catalog:"}{" "}
                            <span className="font-heading font-black text-accent">
                              {inCatalog.retail_price ? `€${Number(inCatalog.retail_price).toFixed(2)}` : "—"}
                            </span>
                          </span>
                          <Button size="sm" variant="outline" onClick={openPriceDialog}>
                            {lang === "lv" ? "Rediģēt cenu" : "Edit price"}
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" onClick={openPriceDialog}>
                          + {lang === "lv" ? "Pievienot katalogam ar cenu" : "Add to catalog with price"}
                        </Button>
                      )}
                    </div>
                  );
                })()}


                {descBullets.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.description}</h4>
                    <ul className="space-y-1.5 text-sm">
                      {descBullets.map((b, i) => (
                        <li key={i} className="flex gap-2"><span className="mt-0.5 text-accent">✓</span><span className="text-foreground/90">{b}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {openStyle.composition && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.composition}</h4>
                    <p className="text-sm text-foreground/90">{openStyle.composition}</p>
                  </div>
                )}

                {openStyle.wash_instructions && (
                  <div>
                    <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{t.care}</h4>
                    <p className="whitespace-pre-line text-sm text-foreground/90">{openStyle.wash_instructions}</p>
                  </div>
                )}

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

      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {openStyle?.style_code} — {openStyle?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label htmlFor="ss-price">
                {lang === "lv" ? "Mazumtirdzniecības cena (EUR ar PVN)" : "Retail price (EUR incl. VAT)"}
              </Label>
              <Input
                id="ss-price"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {lang === "lv"
                  ? "Modelis parādīsies sadaļā Katalogs ar īstajām Stanley/Stella bildēm un krāsām."
                  : "Model appears in Catalog with real Stanley/Stella imagery and colours."}
              </p>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {openStyle && catalogMap.get(openStyle.style_code) ? (
                <Button variant="ghost" size="sm" className="text-destructive" disabled={priceSaving} onClick={removeFromCatalog}>
                  {lang === "lv" ? "Noņemt no kataloga" : "Remove from catalog"}
                </Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPriceDialogOpen(false)} disabled={priceSaving}>
                  {lang === "lv" ? "Atcelt" : "Cancel"}
                </Button>
                <Button size="sm" onClick={savePrice} disabled={priceSaving}>
                  {priceSaving ? (lang === "lv" ? "Saglabā…" : "Saving…") : (lang === "lv" ? "Saglabāt" : "Save")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>

  );
};

export default StanleyStellaPage;
