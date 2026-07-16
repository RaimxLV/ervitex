import { useState } from "react";
import * as XLSX from "xlsx";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Globe, Loader2 } from "lucide-react";

/**
 * Excel import for Beechfield Brands (Beechfield, Bagbase, Quadra, Westford Mill).
 *
 * Column headers detected case-insensitively (aliases supported):
 *  - style_code | code | model | style
 *  - sku | ean | variant_code           (optional; if missing, uses style_code + color + size)
 *  - brand                              (required)
 *  - name | title
 *  - description
 *  - category | type
 *  - gender
 *  - material
 *  - color | colour | color_name
 *  - color_hex | hex
 *  - size
 *  - price | retail_price               (already includes markup)
 *  - image | image_url | photo          (one URL, or comma-separated list)
 *  - image_1 .. image_9                 (numbered columns supported)
 */

const H = (s: string) => s.toString().trim().toLowerCase().replace(/\s+/g, "_");

const pick = (row: Record<string, any>, keys: string[]): any => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
  }
  return null;
};

const asStr = (v: any) => (v === null || v === undefined ? null : String(v).trim() || null);
const asNum = (v: any) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

interface ParsedRow {
  style_code: string;
  sku: string;
  brand: string;
  name: string;
  description: string | null;
  category: string | null;
  gender: string | null;
  material: string | null;
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
  price: number | null;
  images: string[];
}

const parseWorkbook = (wb: XLSX.WorkBook): ParsedRow[] => {
  const out: ParsedRow[] = [];
  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
    for (const raw of rows) {
      const row: Record<string, any> = {};
      for (const [k, v] of Object.entries(raw)) row[H(k)] = v;

      const style = asStr(pick(row, ["style_code", "code", "model", "style", "product_code"]));
      const brand = asStr(pick(row, ["brand"]));
      if (!style || !brand) continue;

      const color = asStr(pick(row, ["color", "colour", "color_name", "colourname"]));
      const size = asStr(pick(row, ["size"]));
      const sku = asStr(pick(row, ["sku", "ean", "variant_code", "barcode"])) ||
        [style, color, size].filter(Boolean).join("-");

      // images
      const images: string[] = [];
      const single = asStr(pick(row, ["image", "image_url", "photo", "picture"]));
      if (single) {
        for (const u of single.split(/[,;\n]+/)) {
          const t = u.trim();
          if (t) images.push(t);
        }
      }
      for (let i = 1; i <= 12; i++) {
        const u = asStr(row[`image_${i}`] ?? row[`image${i}`] ?? row[`photo_${i}`]);
        if (u) images.push(u);
      }

      out.push({
        style_code: style.toUpperCase(),
        sku: sku!,
        brand,
        name: asStr(pick(row, ["name", "title", "product_name"])) || style,
        description: asStr(pick(row, ["description", "desc"])),
        category: asStr(pick(row, ["category", "type"])),
        gender: asStr(pick(row, ["gender", "sex"])),
        material: asStr(pick(row, ["material", "fabric"])),
        color_name: color,
        color_hex: asStr(pick(row, ["color_hex", "hex", "colour_hex"])),
        size,
        price: asNum(pick(row, ["price", "retail_price", "eur", "eur_price"])),
        images,
      });
    }
  }
  return out;
};

interface Summary {
  styles: number;
  variants: number;
  images: number;
  prices: number;
  rows: number;
}

const chunk = <T,>(arr: T[], n: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

const BRAND_KEYS = [
  { key: "beechfield", label: "Beechfield" },
  { key: "bagbase", label: "Bagbase" },
  { key: "quadra", label: "Quadra" },
  { key: "westfordmill", label: "Westford Mill" },
] as const;

const AdminBeechfieldImport = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scraping, setScraping] = useState<string | null>(null);
  const [scrapeStatus, setScrapeStatus] = useState<Record<string, string>>({});

  const scrapeBrand = async (brand: string, label: string) => {
    setScraping(brand);
    setScrapeStatus((s) => ({ ...s, [brand]: "Sāk…" }));
    try {
      let offset = 0;
      let total = 0;
      let processedTotal = 0;
      // Loop until done — each call handles ~15 URLs
      // Safeguard: max 200 iterations (~3000 URLs)
      for (let i = 0; i < 200; i++) {
        const { data, error } = await supabase.functions.invoke("beechfield-sync", {
          body: { brand, offset, limit: 15 },
        });
        if (error) throw new Error(error.message);
        if (!data || data.error) throw new Error(data?.error || "Sync failed");
        total = data.total;
        processedTotal += data.processed;
        offset = data.next_offset;
        setScrapeStatus((s) => ({
          ...s,
          [brand]: `${offset} / ${total} URL · saglabāti ${processedTotal}`,
        }));
        if (data.done) break;
      }
      setScrapeStatus((s) => ({ ...s, [brand]: `✓ Pabeigts · ${processedTotal} produkti no ${total} URL` }));
      toast({ title: `${label} imports pabeigts`, description: `${processedTotal} produkti saglabāti.` });
    } catch (e: any) {
      setScrapeStatus((s) => ({ ...s, [brand]: `✗ ${e.message}` }));
      toast({ title: `Kļūda: ${label}`, description: e.message, variant: "destructive" });
    } finally {
      setScraping(null);
    }
  };

  const handleFile = async (f: File) => {
    setFile(f);
    setSummary(null);
    setError(null);
    setPreview([]);
    setParsing(true);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const rows = parseWorkbook(wb);
      if (rows.length === 0) throw new Error("Excel failā nav neviena derīga rinda (nepieciešami style_code un brand).");
      setPreview(rows.slice(0, 5));
      const styleCodes = new Set(rows.map((r) => r.style_code));
      const skus = new Set(rows.map((r) => r.sku));
      const imgCount = rows.reduce((s, r) => s + r.images.length, 0);
      const priceCount = rows.filter((r) => r.price !== null).length;
      setSummary({ styles: styleCodes.size, variants: skus.size, images: imgCount, prices: priceCount, rows: rows.length });
      (window as any).__bbParsed = rows;
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setParsing(false);
    }
  };

  const doUpload = async () => {
    const rows: ParsedRow[] = (window as any).__bbParsed || [];
    if (rows.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      // 1. Styles — dedupe, take first-seen values
      const stylesMap = new Map<string, any>();
      for (const r of rows) {
        if (!stylesMap.has(r.style_code)) {
          stylesMap.set(r.style_code, {
            style_code: r.style_code,
            brand: r.brand,
            name: r.name,
            description: r.description,
            category: r.category,
            gender: r.gender,
            material: r.material,
            active: true,
          });
        }
      }
      // Aggregate sizes
      const sizesByStyle = new Map<string, Set<string>>();
      for (const r of rows) {
        if (!r.size) continue;
        const s = sizesByStyle.get(r.style_code) || new Set<string>();
        s.add(r.size);
        sizesByStyle.set(r.style_code, s);
      }
      const styles = [...stylesMap.values()].map((s) => ({
        ...s,
        sizes: sizesByStyle.get(s.style_code) ? [...sizesByStyle.get(s.style_code)!] : null,
      }));

      setProgress(`Modeļi: 0 / ${styles.length}`);
      let done = 0;
      for (const batch of chunk(styles, 200)) {
        const { error } = await supabase.from("bb_styles" as any).upsert(batch as any, { onConflict: "style_code" });
        if (error) throw new Error(`bb_styles: ${error.message}`);
        done += batch.length;
        setProgress(`Modeļi: ${done} / ${styles.length}`);
      }

      // 2. Variants — dedupe by sku
      const variantMap = new Map<string, any>();
      for (const r of rows) {
        if (variantMap.has(r.sku)) continue;
        variantMap.set(r.sku, {
          sku: r.sku,
          style_code: r.style_code,
          color_name: r.color_name,
          color_hex: r.color_hex,
          size: r.size,
          active: true,
        });
      }
      const variants = [...variantMap.values()];
      done = 0;
      for (const batch of chunk(variants, 500)) {
        const { error } = await supabase.from("bb_variants" as any).upsert(batch as any, { onConflict: "sku" });
        if (error) throw new Error(`bb_variants: ${error.message}`);
        done += batch.length;
        setProgress(`Varianti: ${done} / ${variants.length}`);
      }

      // 3. Images — dedupe by (style, color, url). Delete existing per style first? Instead, insert with ON CONFLICT DO NOTHING via distinct set.
      // Since bb_images has no unique constraint, we clear per style, then insert.
      const imagesByStyle = new Map<string, { color_name: string | null; url: string; sort_order: number; is_primary: boolean }[]>();
      for (const r of rows) {
        const arr = imagesByStyle.get(r.style_code) || [];
        r.images.forEach((u, i) => {
          if (!arr.some((x) => x.url === u && x.color_name === r.color_name)) {
            arr.push({
              color_name: r.color_name,
              url: u,
              sort_order: arr.length,
              is_primary: arr.length === 0,
            });
          }
        });
        imagesByStyle.set(r.style_code, arr);
      }
      const styleCodesWithImages = [...imagesByStyle.keys()];
      if (styleCodesWithImages.length > 0) {
        // Clear old
        for (const batch of chunk(styleCodesWithImages, 200)) {
          const { error } = await supabase.from("bb_images" as any).delete().in("style_code", batch);
          if (error) throw new Error(`bb_images clear: ${error.message}`);
        }
      }
      const allImages: any[] = [];
      for (const [style_code, imgs] of imagesByStyle) {
        for (const im of imgs) allImages.push({ style_code, ...im });
      }
      done = 0;
      for (const batch of chunk(allImages, 500)) {
        const { error } = await supabase.from("bb_images" as any).insert(batch as any);
        if (error) throw new Error(`bb_images: ${error.message}`);
        done += batch.length;
        setProgress(`Bildes: ${done} / ${allImages.length}`);
      }

      // 4. Prices
      const priceMap = new Map<string, any>();
      for (const r of rows) {
        if (r.price === null) continue;
        priceMap.set(r.sku, { sku: r.sku, retail_price: r.price, currency: "EUR" });
      }
      const prices = [...priceMap.values()];
      done = 0;
      for (const batch of chunk(prices, 500)) {
        const { error } = await supabase.from("bb_prices" as any).upsert(batch as any, { onConflict: "sku" });
        if (error) throw new Error(`bb_prices: ${error.message}`);
        done += batch.length;
        setProgress(`Cenas: ${done} / ${prices.length}`);
      }

      setProgress("Pabeigts!");
      toast({
        title: "Imports veiksmīgs",
        description: `${styles.length} modeļi, ${variants.length} varianti, ${allImages.length} bildes, ${prices.length} cenas.`,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
      toast({ title: "Kļūda importā", description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase tracking-wide">Beechfield Brands imports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Augšupielādē Excel/CSV failu ar produktiem un cenām. Katalogs — Beechfield, Bagbase, Quadra, Westford Mill.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Excel kolonnu formāts</h2>
          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p><b className="text-foreground">style_code</b> — modeļa kods (obligāts)</p>
            <p><b className="text-foreground">brand</b> — zīmols (obligāts)</p>
            <p><b className="text-foreground">sku</b> — variants (ja nav, ģenerē automātiski)</p>
            <p><b className="text-foreground">name</b> — produkta nosaukums</p>
            <p><b className="text-foreground">description</b> — apraksts</p>
            <p><b className="text-foreground">category</b> — kategorija</p>
            <p><b className="text-foreground">gender</b> — dzimums (Men/Women/Unisex/Kids)</p>
            <p><b className="text-foreground">material</b> — materiāls</p>
            <p><b className="text-foreground">color</b> — krāsas nosaukums</p>
            <p><b className="text-foreground">color_hex</b> — HEX (piem. #FF0000)</p>
            <p><b className="text-foreground">size</b> — izmērs (S, M, L, XL...)</p>
            <p><b className="text-foreground">price</b> — mazumtirdz. cena EUR (ar uzcenojumu)</p>
            <p className="sm:col-span-2"><b className="text-foreground">image</b> — URL (vairākas atdala ar , vai lieto image_1, image_2, ...)</p>
          </div>
        </Card>

        <Card className="p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-border p-8 hover:bg-muted/50">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Izvēlies Excel (.xlsx) vai CSV failu"}
            </p>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </Card>

        {parsing && <p className="text-sm text-muted-foreground">Analizē failu…</p>}

        {error && (
          <Card className="border-destructive bg-destructive/5 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </Card>
        )}

        {summary && (
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider">Kopsavilkums</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                ["Rindas", summary.rows],
                ["Modeļi", summary.styles],
                ["Varianti", summary.variants],
                ["Bildes", summary.images],
                ["Cenas", summary.prices],
              ].map(([label, n]) => (
                <div key={label as string} className="rounded-sm border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
                  <p className="mt-1 font-heading text-xl font-black">{Number(n).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {preview.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">Priekšskatījums (pirmās 5 rindas)</p>
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-2">SKU</th>
                      <th className="p-2">Brand</th>
                      <th className="p-2">Model</th>
                      <th className="p-2">Color</th>
                      <th className="p-2">Size</th>
                      <th className="p-2">€</th>
                      <th className="p-2">Img</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="p-2 font-mono">{r.sku}</td>
                        <td className="p-2">{r.brand}</td>
                        <td className="p-2">{r.style_code}</td>
                        <td className="p-2">{r.color_name}</td>
                        <td className="p-2">{r.size}</td>
                        <td className="p-2">{r.price ?? "—"}</td>
                        <td className="p-2">{r.images.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={doUpload} disabled={uploading}>
                {uploading ? "Augšupielādē…" : "Sākt importu"}
              </Button>
              {progress && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {progress === "Pabeigts!" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {progress}
                </span>
              )}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBeechfieldImport;
