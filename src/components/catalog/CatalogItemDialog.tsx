import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import QuoteRequestForm from "@/components/QuoteRequestForm";
import { useLanguage } from "@/i18n/LanguageContext";
import { SOURCE_META, type CatalogSource } from "./unifiedCatalogMeta";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: CatalogSource;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  image: string | null;
  swatches?: { hex: string | null; name: string }[]; // fallback while loading
  descriptionFallback?: string | null;
}

interface ColorDetail {
  code: string;
  name: string;
  hex: string | null;
  images: string[];
  sizes: string[];
}

interface ProductDetail {
  title: string;
  code: string;
  brand: string | null;
  category: string | null;
  gender: string | null;
  shortDescription: string | null;
  description: string | null;
  features: string[];
  material: string | null;
  care: string | null;
  specs: { label: string; value: string }[];
  notice: string | null;
  sizes: string[];
  colors: ColorDetail[];
}

/* ---------- SS Cloudinary transform ---------- */
const SS_CDN_BASE = "https://res.cloudinary.com/www-stanleystella-com/image/upload/";
const SS_XFORM = "f_auto,q_auto,w_1200,c_limit";
const ssUrl = (raw?: string | null): string | null => {
  if (!raw || raw === "[object Object]") return null;
  if (/^https?:\/\//i.test(raw)) {
    if (raw.includes("res.cloudinary.com")) {
      // rewrite any /image/upload/.../ transformation to our sizing
      const m = raw.match(/\/image\/upload\/(?:[^/]+\/)?(.+)$/);
      if (m) return `${SS_CDN_BASE}${SS_XFORM}/${m[1]}`;
      // t_pim style
      const m2 = raw.match(/\/t_pim\/(.+)$/);
      if (m2) return `${SS_CDN_BASE}${SS_XFORM}/${m2[1]}`;
    }
    return raw;
  }
  return `${SS_CDN_BASE}${SS_XFORM}/${raw.replace(/^\/+/, "")}`;
};

/* ---------- Loaders ---------- */
const HEX_VALID = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const cleanHex = (h?: string | null) => (h && HEX_VALID.test(h.trim()) ? h.trim() : null);

const SIZE_ORDER = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "XXXL", "4XL", "XXXXL", "5XL", "XXXXXL", "6XL"];
const sizeIndex = (s?: string | null) => {
  if (!s) return 999;
  const i = SIZE_ORDER.indexOf(s.toUpperCase());
  return i === -1 ? 500 : i;
};

const lines = (txt?: string | null) =>
  (txt || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

const cleanText = (v?: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === "false" || s === "[object Object]") return null;
  return s;
};

const addSpec = (arr: { label: string; value: string }[], label: string, value?: unknown, suffix = "") => {
  const v = cleanText(value);
  if (v) arr.push({ label, value: `${v}${suffix}` });
};

const uniqueSortedSizes = (sizes: Iterable<string>) =>
  Array.from(new Set(Array.from(sizes).filter(Boolean))).sort((a, b) => sizeIndex(a) - sizeIndex(b) || a.localeCompare(b));

const isLightHex = (hex?: string | null) => {
  const bg = cleanHex(hex) || "#e5e5e5";
  const hx = bg.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(hx)) return false;
  const r = parseInt(hx.slice(0, 2), 16);
  const g = parseInt(hx.slice(2, 4), 16);
  const b = parseInt(hx.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 225;
};

async function loadSS(styleCode: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes] = await Promise.all([
    supabase.from("ss_styles").select("style_code,name,short_description,long_description,category,type,gender,composition,brand").eq("style_code", styleCode).maybeSingle(),
    supabase.from("ss_variants").select("color_code,color_name,hex_color_code,size_code,color_sequence,size_sequence").eq("style_code", styleCode),
    supabase.from("ss_images").select("color_code,image_type,fname,public_url,source_url,sort_order,is_main").eq("style_code", styleCode).order("sort_order", { ascending: true }),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];

  // Colors (ordered by color_sequence)
  const colorMap = new Map<string, { code: string; name: string; hex: string | null; seq: number }>();
  const sizeMap = new Map<string, number>();
  for (const v of variants) {
    if (v.color_code && !colorMap.has(v.color_code)) {
      colorMap.set(v.color_code, {
        code: v.color_code,
        name: v.color_name || v.color_code,
        hex: cleanHex(v.hex_color_code as string | null),
        seq: v.color_sequence ?? 9999,
      });
    }
    if (v.size_code) sizeMap.set(v.size_code, Math.min(sizeMap.get(v.size_code) ?? 9999, v.size_sequence ?? 9999));
  }
  const sortedColors = [...colorMap.values()].sort((a, b) => a.seq - b.seq);
  const sortedSizes = [...sizeMap.entries()].sort((a, b) => a[1] - b[1]).map((x) => x[0]);

  // Group images by color
  const imgByColor = new Map<string, string[]>();
  for (const im of images) {
    const url = ssUrl((im as any).public_url) || ssUrl((im as any).source_url);
    if (!url) continue;
    const key = (im as any).color_code || "";
    if (!imgByColor.has(key)) imgByColor.set(key, []);
    imgByColor.get(key)!.push(url);
  }

  const colors: ColorDetail[] = sortedColors.map((c) => ({
    code: c.code,
    name: c.name,
    hex: c.hex,
    images: imgByColor.get(c.code) || [],
  }));

  return {
    title: style.name,
    code: style.style_code,
    brand: (style as any).brand || "Stanley/Stella",
    category: style.category || style.type,
    gender: style.gender,
    description: style.long_description || style.short_description,
    material: (style as any).composition || null,
    sizes: sortedSizes,
    colors,
  };
}

async function loadNWG(productNumber: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes, skusRes] = await Promise.all([
    supabase.from("nwg_styles").select("product_number,name,brand,category,gender,fit,fabrics,commerce_text,catalog_text,usp").eq("product_number", productNumber).maybeSingle(),
    supabase.from("nwg_variants").select("item_number,color_name,color_code,filter_color,shade_color,main_picture_url").eq("product_number", productNumber),
    supabase.from("nwg_images").select("item_number,image_url,high_res_url,large_thumbnail_url,standard_url,sort_order").eq("product_number", productNumber).order("sort_order", { ascending: true }),
    supabase.from("nwg_skus").select("item_number,size,size_sequence").eq("product_number", productNumber),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];
  const skus = skusRes.data || [];

  const NAMED_HEX: Record<string, string> = {
    black: "#000000", white: "#ffffff", grey: "#808080", gray: "#808080", red: "#e11d48",
    blue: "#2563eb", navy: "#1e3a8a", green: "#16a34a", yellow: "#eab308",
    orange: "#f97316", pink: "#ec4899", purple: "#7c3aed", brown: "#78350f",
    beige: "#d6c9a8",
  };
  const hexFromNwg = (v: any): string | null => {
    const raw = (v.shade_color || (v.filter_color as string) || "").toString().trim();
    const stripped = raw.replace(/^#/, "");
    if (HEX_VALID.test(`#${stripped}`)) return `#${stripped}`;
    const named = NAMED_HEX[raw.toLowerCase()];
    return named || null;
  };

  const imgByItem = new Map<string, string[]>();
  for (const im of images) {
    const url = (im as any).high_res_url || (im as any).standard_url || (im as any).large_thumbnail_url || (im as any).image_url;
    if (!url) continue;
    const key = (im as any).item_number || "";
    if (!imgByItem.has(key)) imgByItem.set(key, []);
    imgByItem.get(key)!.push(url as string);
  }

  const sizesByItem = new Map<string, { s: string; seq: string }[]>();
  for (const sk of skus) {
    const it = (sk as any).item_number || "";
    if (!sizesByItem.has(it)) sizesByItem.set(it, []);
    if ((sk as any).size) sizesByItem.get(it)!.push({ s: (sk as any).size, seq: (sk as any).size_sequence || "" });
  }

  const colors: ColorDetail[] = variants.map((v: any) => ({
    code: v.item_number,
    name: v.color_name || v.color_code || v.item_number,
    hex: hexFromNwg(v),
    images: imgByItem.get(v.item_number) || (v.main_picture_url ? [v.main_picture_url] : []),
  }));

  const sizeSet = new Map<string, string>();
  for (const arr of sizesByItem.values()) for (const s of arr) sizeSet.set(s.s, s.seq);
  const sizes = [...sizeSet.entries()].sort((a, b) => a[1].localeCompare(b[1])).map((x) => x[0]);

  return {
    title: style.name || style.product_number,
    code: style.product_number,
    brand: style.brand,
    category: style.category,
    gender: style.gender,
    description: [style.commerce_text, style.catalog_text, style.usp].filter(Boolean).join("\n\n") || null,
    material: style.fabrics || style.fit || null,
    sizes,
    colors,
  };
}

async function loadPF(modelCode: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes] = await Promise.all([
    supabase.from("pf_styles").select("model_code,description,ext_desc,brand,category,category_group,gender,material,main_image").eq("model_code", modelCode).maybeSingle(),
    supabase.from("pf_variants").select("item_code,color_code,color_desc,hex_color,size").eq("model_code", modelCode),
    supabase.from("pf_images").select("item_code,kind,url_1600,url_500,sort_order").eq("model_code", modelCode).order("sort_order", { ascending: true }),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];

  const imgByItem = new Map<string, string[]>();
  const modelImgs: string[] = [];
  for (const im of images) {
    const url = (im as any).url_1600 || (im as any).url_500;
    if (!url) continue;
    const key = (im as any).item_code || "";
    if (key) {
      if (!imgByItem.has(key)) imgByItem.set(key, []);
      imgByItem.get(key)!.push(url as string);
    } else {
      modelImgs.push(url as string);
    }
  }

  const colorMap = new Map<string, { code: string; name: string; hex: string | null; itemCodes: Set<string> }>();
  const sizeSet = new Set<string>();
  for (const v of variants as any[]) {
    if (v.size) sizeSet.add(v.size);
    const key = v.color_code || v.color_desc || v.item_code;
    if (!colorMap.has(key)) {
      colorMap.set(key, {
        code: key,
        name: v.color_desc || v.color_code || key,
        hex: cleanHex(v.hex_color),
        itemCodes: new Set<string>(),
      });
    }
    colorMap.get(key)!.itemCodes.add(v.item_code);
  }

  const colors: ColorDetail[] = [...colorMap.values()].map((c) => {
    const imgs: string[] = [];
    for (const ic of c.itemCodes) for (const u of imgByItem.get(ic) || []) if (!imgs.includes(u)) imgs.push(u);
    return { code: c.code, name: c.name, hex: c.hex, images: imgs.length ? imgs : modelImgs };
  });

  const sizeOrder = ["XXS","XS","S","M","L","XL","XXL","XXXL","3XL","4XL","5XL"];
  const sizes = [...sizeSet].sort((a, b) => {
    const ai = sizeOrder.indexOf(a.toUpperCase());
    const bi = sizeOrder.indexOf(b.toUpperCase());
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });

  return {
    title: style.description || style.model_code,
    code: style.model_code,
    brand: style.brand,
    category: style.category || style.category_group,
    gender: style.gender,
    description: style.ext_desc || style.description || null,
    material: style.material || null,
    sizes,
    colors,
  };
}

/* ---------- Component ---------- */

const CatalogItemDialog = ({
  open, onOpenChange, source, id, name, brand, category, image, swatches, descriptionFallback,
}: Props) => {
  const { lang } = useLanguage();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setDetail(null);
    setActiveColor(null);
    setImgIndex(0);
    (async () => {
      const loader = source === "ss" ? loadSS : source === "nwg" ? loadNWG : loadPF;
      const d = await loader(id).catch(() => null);
      if (cancelled) return;
      setDetail(d);
      setActiveColor(d?.colors[0]?.code ?? null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, source, id]);

  const currentColor = useMemo(
    () => detail?.colors.find((c) => c.code === activeColor) || detail?.colors[0] || null,
    [detail, activeColor]
  );

  const gallery = useMemo(() => {
    if (!currentColor) return image ? [image] : [];
    if (currentColor.images.length) return currentColor.images;
    // pull from any other color if empty
    for (const c of detail?.colors || []) if (c.images.length) return c.images.slice(0, 1);
    return image ? [image] : [];
  }, [currentColor, detail, image]);

  const mainImg = gallery[imgIndex] || gallery[0] || image;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0">
        <div className="p-6">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {detail?.code || id}
              </Badge>
              <Badge className="text-[10px] uppercase">{SOURCE_META[source].label}</Badge>
              {(detail?.brand || brand) && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {detail?.brand || brand}
                </Badge>
              )}
              {(detail?.category || category) && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {detail?.category || category}
                </Badge>
              )}
              {detail?.gender && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  {detail.gender}
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-1 font-heading text-2xl uppercase tracking-wide">
              {detail?.title || name || id}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="aspect-[3/4] w-full overflow-hidden bg-white border border-border">
                {mainImg ? (
                  <img
                    src={mainImg}
                    alt={currentColor?.name || detail?.title || id}
                    className="h-full w-full object-contain p-2"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                ) : loading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {lang === "lv" ? "Bez attēla" : "No image"}
                  </div>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="mt-2 grid grid-cols-6 gap-1">
                  {gallery.slice(0, 12).map((u, i) => (
                    <button
                      key={u + i}
                      type="button"
                      onClick={() => setImgIndex(i)}
                      className={`aspect-square overflow-hidden border ${i === imgIndex ? "border-accent ring-1 ring-accent" : "border-border"} bg-white`}
                    >
                      <img src={u} alt="" className="h-full w-full object-contain p-0.5" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-5">
              {loading && !detail && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}

              {(detail?.description || descriptionFallback) && (
                <div>
                  <h4 className="mb-1 font-heading text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "lv" ? "Apraksts" : "Description"}
                  </h4>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                    {detail?.description || descriptionFallback}
                  </p>
                </div>
              )}

              {detail?.material && (
                <div>
                  <h4 className="mb-1 font-heading text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "lv" ? "Materiāls" : "Material"}
                  </h4>
                  <p className="text-sm text-foreground/85">{detail.material}</p>
                </div>
              )}

              {/* Colors */}
              {(detail?.colors.length ?? 0) > 0 && (
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <h4 className="font-heading text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "lv" ? "Krāsas" : "Colors"} ({detail!.colors.length})
                    </h4>
                    {currentColor && (
                      <span className="text-xs text-foreground">{currentColor.name}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detail!.colors.map((c) => {
                      const isActive = c.code === activeColor;
                      const hex = c.hex || "#e5e5e5";
                      const light = /^#(f|e)/i.test(hex);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setActiveColor(c.code); setImgIndex(0); }}
                          title={c.name}
                          className={`h-7 w-7 rounded-full transition ${isActive ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""} ${light ? "border border-black/25" : "border border-black/10"}`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {(detail?.sizes.length ?? 0) > 0 && (
                <div>
                  <h4 className="mb-2 font-heading text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "lv" ? "Izmēri" : "Sizes"}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detail!.sizes.map((s) => (
                      <span
                        key={s}
                        className="min-w-[2.25rem] rounded-sm border border-border px-2 py-1 text-center text-xs font-medium text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading fallback swatches */}
              {!detail && !loading && swatches && swatches.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {swatches.map((s, i) => (
                    <span key={i} title={s.name} className="inline-block h-6 w-6 rounded-full border border-black/20" style={{ backgroundColor: s.hex || "#ccc" }} />
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-4">
                <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">
                  {lang === "lv" ? "Pieprasīt cenu" : "Request a Quote"}
                </h3>
                <QuoteRequestForm
                  productId={`${source}-${id}${currentColor ? `-${currentColor.code}` : ""}`}
                  productName={`${detail?.title || name || id}${currentColor ? ` — ${currentColor.name}` : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogItemDialog;
