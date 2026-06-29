import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

interface StyleRow {
  style_code: string;
  name: string;
  short_description: string | null;
  category: string | null;
  gender: string | null;
  segment: string | null;
  composition: string | null;
}

interface ImageRow { style_code: string; color_code: string | null; public_url: string | null; storage_path: string | null; sort_order: number }
interface VariantRow { style_code: string; color_code: string | null; color_name: string | null; size_code: string | null }
interface StockRow { style_code: string; quantity: number }

const PAGE_SIZE = 48;

const StanleyStellaPage = () => {
  const { lang } = useLanguage();
  const [styles, setStyles] = useState<StyleRow[]>([]);
  const [images, setImages] = useState<Map<string, string>>(new Map());
  const [variants, setVariants] = useState<Map<string, VariantRow[]>>(new Map());
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());
  const [loaded, setLoaded] = useState(false);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [gender, setGender] = useState<string>("all");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      // Batch fetch all styles
      const all: StyleRow[] = [];
      const step = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("ss_styles")
          .select("style_code,name,short_description,category,gender,segment,composition")
          .order("name", { ascending: true })
          .range(from, from + step - 1);
        if (error) break;
        all.push(...((data || []) as StyleRow[]));
        if (!data || data.length < step) break;
        from += step;
      }
      setStyles(all);

      // images (one per style — first by sort_order). Storage bucket is private, so use signed URLs.
      const imgMap = new Map<string, string>();
      const pathToStyle = new Map<string, string>();
      let ifrom = 0;
      while (true) {
        const { data } = await supabase
          .from("ss_images")
          .select("style_code,public_url,storage_path,sort_order")
          .order("sort_order", { ascending: true })
          .range(ifrom, ifrom + step - 1);
        if (!data?.length) break;
        for (const r of data as ImageRow[]) {
          if (imgMap.has(r.style_code)) continue;
          if (r.storage_path) pathToStyle.set(r.storage_path, r.style_code);
          else if (r.public_url) imgMap.set(r.style_code, r.public_url);
        }
        if (data.length < step) break;
        ifrom += step;
      }
      const paths = Array.from(pathToStyle.keys());
      for (let i = 0; i < paths.length; i += 100) {
        const batch = paths.slice(i, i + 100);
        const { data } = await supabase.storage.from("ss-images").createSignedUrls(batch, 60 * 60);
        for (const signed of data || []) {
          if (!signed.path || !signed.signedUrl) continue;
          const styleCode = pathToStyle.get(signed.path);
          if (styleCode && !imgMap.has(styleCode)) imgMap.set(styleCode, signed.signedUrl);
        }
      }
      setImages(imgMap);

      // variants
      const vMap = new Map<string, VariantRow[]>();
      let vfrom = 0;
      while (true) {
        const { data } = await supabase
          .from("ss_variants")
          .select("style_code,color_code,color_name,size_code")
          .range(vfrom, vfrom + step - 1);
        if (!data?.length) break;
        for (const v of data as VariantRow[]) {
          const arr = vMap.get(v.style_code) || [];
          arr.push(v);
          vMap.set(v.style_code, arr);
        }
        if (data.length < step) break;
        vfrom += step;
      }
      setVariants(vMap);

      // stock totals per style
      const sMap = new Map<string, number>();
      let sfrom = 0;
      while (true) {
        const { data } = await supabase
          .from("ss_stock")
          .select("style_code,quantity")
          .range(sfrom, sfrom + step - 1);
        if (!data?.length) break;
        for (const s of data as StockRow[]) sMap.set(s.style_code, (sMap.get(s.style_code) || 0) + (s.quantity || 0));
        if (data.length < step) break;
        sfrom += step;
      }
      setStockMap(sMap);

      setLoaded(true);
    })();
  }, []);

  const categories = useMemo(() => Array.from(new Set(styles.map((s) => s.category).filter(Boolean))).sort() as string[], [styles]);
  const genders = useMemo(() => Array.from(new Set(styles.map((s) => s.gender).filter(Boolean))).sort() as string[], [styles]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return styles.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (gender !== "all" && s.gender !== gender) return false;
      if (inStockOnly && (stockMap.get(s.style_code) || 0) <= 0) return false;
      if (needle && !`${s.name} ${s.style_code} ${s.short_description ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [styles, q, category, gender, inStockOnly, stockMap]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [q, category, gender, inStockOnly]);

  const tLabels = lang === "lv"
    ? { search: "Meklēt", category: "Kategorija", gender: "Dzimums", inStock: "Tikai noliktavā", all: "Visas", results: "rezultāti", colors: "krāsas", sizes: "izmēri", stock: "noliktavā", contact: "Pieprasīt cenu", noResults: "Nav rezultātu", noImage: "Bez attēla" }
    : { search: "Search", category: "Category", gender: "Gender", inStock: "In stock only", all: "All", results: "results", colors: "colors", sizes: "sizes", stock: "in stock", contact: "Request a Quote", noResults: "No results", noImage: "No image" };

  return (
    <Layout>
      {/* Header strip — no marketing fluff */}
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

      {/* Filters */}
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

      {/* Grid */}
      <section className="bg-background">
        <div className="container px-4 py-8">
          {!loaded ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-5 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden border border-border bg-card">
                  <Skeleton className="aspect-square w-full" />
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
                  const img = images.get(s.style_code);
                  const v = variants.get(s.style_code) || [];
                  const colorCount = new Set(v.map((x) => x.color_code).filter(Boolean)).size;
                  const sizeCount = new Set(v.map((x) => x.size_code).filter(Boolean)).size;
                  const stock = stockMap.get(s.style_code) || 0;
                  return (
                    <article key={s.style_code} className="group overflow-hidden border border-border bg-card transition-colors hover:border-accent">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {img ? (
                          <img src={img} alt={s.name} loading="lazy" className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{tLabels.noImage}</div>
                        )}
                        <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">{s.style_code}</span>
                        {stock > 0 && <span className="absolute right-2 top-2 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">{stock} {tLabels.stock}</span>}
                      </div>
                      <div className="space-y-1 p-3">
                        <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1">{s.name}</h3>
                        {s.short_description && <p className="line-clamp-2 text-xs text-muted-foreground">{s.short_description}</p>}
                        <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {colorCount} {tLabels.colors} · {sizeCount} {tLabels.sizes}
                        </p>
                      </div>
                    </article>
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
    </Layout>
  );
};

export default StanleyStellaPage;
