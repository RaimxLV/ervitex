import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";
import { SOURCE_META, type CatalogSource } from "./unifiedCatalogMeta";
import { Link } from "react-router-dom";

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
    supabase
      .from("ss_styles")
      .select("style_code,name,short_description,long_description,category,type,gender,segment,style_main_segment,fit,weight_gsm,neckline,sleeve,wash_instructions,specifications,composition,brand,main_picture_url,over_picture_url,raw")
      .eq("style_code", styleCode)
      .maybeSingle(),
    supabase.from("ss_variants").select("color_code,color_name,hex_color_code,size_code,color_sequence,size_sequence").eq("style_code", styleCode),
    supabase.from("ss_images").select("color_code,image_type,fname,public_url,source_url,sort_order,is_main").eq("style_code", styleCode).order("sort_order", { ascending: true }),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];
  const raw = ((style as any).raw || {}) as Record<string, unknown>;

  // Colors (ordered by color_sequence)
  const colorMap = new Map<string, { code: string; name: string; hex: string | null; seq: number }>();
  const sizeMap = new Map<string, number>();
  const sizesByColor = new Map<string, Set<string>>();
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
    if (v.color_code && v.size_code) {
      if (!sizesByColor.has(v.color_code)) sizesByColor.set(v.color_code, new Set());
      sizesByColor.get(v.color_code)!.add(v.size_code);
    }
  }
  const sortedColors = [...colorMap.values()].sort((a, b) => a.seq - b.seq);
  const sortedSizes = [...sizeMap.entries()].sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0])).map((x) => x[0]);

  // Group images by color
  const imgByColor = new Map<string, string[]>();
  const fallbackImages: string[] = [];
  for (const im of images) {
    const url = ssUrl((im as any).public_url) || ssUrl((im as any).source_url);
    if (!url) continue;
    const key = (im as any).color_code || "";
    if (!imgByColor.has(key)) imgByColor.set(key, []);
    imgByColor.get(key)!.push(url);
    if ((im as any).is_main || !key) fallbackImages.push(url);
  }
  const mainPicture = ssUrl((style as any).main_picture_url);
  const overPicture = ssUrl((style as any).over_picture_url);
  if (mainPicture) fallbackImages.unshift(mainPicture);
  if (overPicture) fallbackImages.push(overPicture);

  const dedupe = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

  const colors: ColorDetail[] = sortedColors.map((c) => ({
    code: c.code,
    name: c.name,
    hex: c.hex,
    images: dedupe(imgByColor.get(c.code) || fallbackImages),
    sizes: uniqueSortedSizes(sizesByColor.get(c.code) || []),
  }));

  const specs: { label: string; value: string }[] = [];
  addSpec(specs, "Fit", (style as any).fit || raw.Fit);
  addSpec(specs, "Weight", (style as any).weight_gsm || raw.Weight, (style as any).weight_gsm || raw.Weight ? " GSM" : "");
  addSpec(specs, "Neckline", (style as any).neckline || raw.Neckline);
  addSpec(specs, "Sleeve", (style as any).sleeve || raw.Sleeve);
  addSpec(specs, "Category", (style as any).category || raw.Category);
  addSpec(specs, "Type", (style as any).type || raw.Type);
  addSpec(specs, "Gender", (style as any).gender || raw.Gender);
  addSpec(specs, "Segment", (style as any).style_main_segment || (style as any).segment || raw.StyleMainsSegments || raw.Segment);
  const features = lines((style as any).long_description || raw.LongDescription || (style as any).specifications || raw.Specifications);

  return {
    title: style.name,
    code: style.style_code,
    brand: (style as any).brand || "Stanley/Stella",
    category: style.category || style.type,
    gender: style.gender,
    shortDescription: cleanText((style as any).short_description || raw.ShortDescription),
    description: cleanText((style as any).long_description || raw.LongDescription || (style as any).short_description || raw.ShortDescription),
    features,
    material: (style as any).composition || null,
    care: cleanText((style as any).wash_instructions || raw.WashInstructions),
    specs,
    notice: cleanText(raw.StyleNotice || raw.Notice),
    sizes: sortedSizes,
    colors,
  };
}

async function loadNWG(productNumber: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes, skusRes] = await Promise.all([
    supabase.from("nwg_styles").select("product_number,name,brand,category,gender,fit,fabrics,commerce_text,catalog_text,usp,weight,country_of_origin,raw").eq("product_number", productNumber).maybeSingle(),
    supabase.from("nwg_variants").select("item_number,color_name,color_code,filter_color,shade_color,main_picture_url").eq("product_number", productNumber),
    supabase.from("nwg_images").select("item_number,image_url,high_res_url,large_thumbnail_url,standard_url,sort_order").eq("product_number", productNumber).order("sort_order", { ascending: true }),
    supabase.from("nwg_skus").select("item_number,size,size_sequence").eq("product_number", productNumber),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];
  const skus = skusRes.data || [];
  const raw = ((style as any).raw || {}) as Record<string, any>;

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
    sizes: uniqueSortedSizes((sizesByItem.get(v.item_number) || []).map((s) => s.s)),
  }));

  const sizeSet = new Map<string, string>();
  for (const arr of sizesByItem.values()) for (const s of arr) sizeSet.set(s.s, s.seq);
  const sizes = [...sizeSet.entries()].sort((a, b) => a[1].localeCompare(b[1])).map((x) => x[0]);

  // Full description: commerce + catalog + USP (preserve bullets & newlines)
  const descBlocks = [style.commerce_text, style.catalog_text, style.usp].filter(Boolean) as string[];
  const seen = new Set<string>();
  const dedupedBlocks = descBlocks.filter((b) => {
    const k = b.trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const fullDesc = dedupedBlocks.join("\n\n");
  const featureLines = lines(fullDesc).filter((l) => /^[•\-\*·▪►]/.test(l));

  const specs: { label: string; value: string }[] = [];
  addSpec(specs, "Fit", style.fit);
  addSpec(specs, "Gender", style.gender);
  addSpec(specs, "Category", style.category);
  addSpec(specs, "Weight", style.weight);
  addSpec(specs, "Country of origin", style.country_of_origin || raw.productCountryOfOrigin);
  addSpec(specs, "Assortment", Array.isArray(raw.productAssortment) ? raw.productAssortment.join(", ") : raw.productAssortment);

  return {
    title: style.name || style.product_number,
    code: style.product_number,
    brand: style.brand,
    category: style.category,
    gender: style.gender,
    shortDescription: cleanText(style.commerce_text?.split(/\n/)[0]) || cleanText(style.commerce_text),
    description: fullDesc || null,
    features: featureLines,
    material: style.fabrics || null,
    care: null,
    specs,
    notice: null,
    sizes,
    colors,
  };
}


async function loadPF(modelCode: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes] = await Promise.all([
    supabase.from("pf_styles").select("model_code,description,ext_desc,brand,category,category_group,gender,material,simple_material,main_image,keywords,product_comments,country_of_origin,attributes").eq("model_code", modelCode).maybeSingle(),
    supabase.from("pf_variants").select("item_code,color_code,color_desc,hex_color,size,material,weight_gr,qty_per_carton").eq("model_code", modelCode),
    supabase.from("pf_images").select("item_code,kind,url_1600,url_500,sort_order").eq("model_code", modelCode).order("sort_order", { ascending: true }),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];
  const attrs = ((style as any).attributes || {}) as Record<string, any>;

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
  const sizesByColor = new Map<string, Set<string>>();
  const sizeSet = new Set<string>();
  let sampleVariant: any = null;
  for (const v of variants as any[]) {
    if (!sampleVariant) sampleVariant = v;
    if (v.size) sizeSet.add(v.size);
    const key = v.color_code || v.color_desc || v.item_code;
    if (v.size) {
      if (!sizesByColor.has(key)) sizesByColor.set(key, new Set());
      sizesByColor.get(key)!.add(v.size);
    }
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
    return { code: c.code, name: c.name, hex: c.hex, images: imgs.length ? imgs : modelImgs, sizes: uniqueSortedSizes(sizesByColor.get(c.code) || []) };
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

  // Build feature list: bullet-like lines in ext_desc + attribute key/values.
  const rawFeatures = lines(style.ext_desc).filter((l) => /^[•\-\*·▪►]/.test(l) || l.length < 160);
  // Human-readable attribute pairs (skip empty / boolean No / meta).
  const ATTR_LABELS: Record<string, string> = {
    pa_capacityMilliliters: "Capacity (ml)",
    pa_materialDrinkware: "Material",
    pa_insulationType: "Insulation",
    pa_lidFeatures: "Lid features",
    pa_drinkwareIntendedUse: "Intended use",
    pa_drinkwareExtraFeatures: "Extra features",
    pa_dishwasherSafe: "Dishwasher safe",
    pa_microwaveSafe: "Microwave safe",
    pa_certifications_social: "Certifications",
    pa_bsciFactory: "BSCI factory",
    pa_oekoStandard: "OEKO-TEX",
    pa_umbrellaSize: "Umbrella size",
    pa_umbrellaPersons: "Persons",
    pa_foldedSize: "Folded size",
    pa_openingType: "Opening",
    pa_windproof: "Windproof",
    pa_mainLabelType: "Label type",
    pa_removableInfuser: "Removable infuser",
    pa_removableTeaFilter: "Removable tea filter",
    pa_numberOfSheets: "Sheets",
  };
  const specs: { label: string; value: string }[] = [];
  addSpec(specs, "Category", style.category);
  addSpec(specs, "Group", style.category_group);
  addSpec(specs, "Gender", style.gender);
  addSpec(specs, "Material", style.simple_material || sampleVariant?.material);
  addSpec(specs, "Country of origin", style.country_of_origin);
  if (sampleVariant?.weight_gr) addSpec(specs, "Weight", sampleVariant.weight_gr, " g");
  if (sampleVariant?.qty_per_carton) addSpec(specs, "Qty / carton", sampleVariant.qty_per_carton);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === "" || v === "No") continue;
    const label = ATTR_LABELS[k] || k.replace(/^pa_/, "").replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
    addSpec(specs, label, v);
  }

  return {
    title: style.description || style.model_code,
    code: style.model_code,
    brand: style.brand,
    category: style.category || style.category_group,
    gender: style.gender,
    shortDescription: cleanText(style.description),
    description: style.ext_desc || style.description || null,
    features: rawFeatures,
    material: style.material || style.simple_material || null,
    care: null,
    specs,
    notice: cleanText(style.product_comments),
    sizes,
    colors,
  };
}


async function loadBB(styleCode: string): Promise<ProductDetail | null> {
  const [styleRes, variantsRes, imagesRes] = await Promise.all([
    supabase.from("bb_styles").select("style_code,brand,name,description,category,gender,features").eq("style_code", styleCode).maybeSingle(),
    supabase.from("bb_variants").select("sku,color_name,color_hex,size").eq("style_code", styleCode),
    supabase.from("bb_images").select("color_name,url,is_primary,sort_order").eq("style_code", styleCode).order("sort_order", { ascending: true }),
  ]);
  const style = styleRes.data;
  if (!style) return null;
  const variants = variantsRes.data || [];
  const images = imagesRes.data || [];

  // Group images: by color_name and shared (null)
  const imgByColor = new Map<string, string[]>();
  const shared: string[] = [];
  for (const im of images as any[]) {
    if (!im.url) continue;
    const key = (im.color_name || "").toLowerCase();
    if (key) {
      if (!imgByColor.has(key)) imgByColor.set(key, []);
      imgByColor.get(key)!.push(im.url);
    } else {
      shared.push(im.url);
    }
  }

  // Unique colors + sizes per color
  const colorOrder: string[] = [];
  const colorInfo = new Map<string, { name: string; hex: string | null }>();
  const sizesByColor = new Map<string, Set<string>>();
  const allSizes = new Set<string>();
  for (const v of variants as any[]) {
    const name = v.color_name || "";
    const key = name.toLowerCase();
    if (name && !colorInfo.has(key)) {
      colorInfo.set(key, { name, hex: cleanHex(v.color_hex) });
      colorOrder.push(key);
    }
    if (v.size) {
      allSizes.add(v.size);
      if (key) {
        if (!sizesByColor.has(key)) sizesByColor.set(key, new Set());
        sizesByColor.get(key)!.add(v.size);
      }
    }
  }

  const colors: ColorDetail[] = colorOrder.map((key) => {
    const info = colorInfo.get(key)!;
    const imgs = imgByColor.get(key) || [];
    return {
      code: info.name,
      name: info.name,
      hex: info.hex,
      images: imgs.length ? imgs : shared,
      sizes: uniqueSortedSizes(sizesByColor.get(key) || allSizes),
    };
  });

  // If no colors at all, still expose one "default" color with shared imgs
  if (colors.length === 0 && shared.length) {
    colors.push({ code: "default", name: style.name, hex: null, images: shared, sizes: uniqueSortedSizes(allSizes) });
  }

  const featureArr = Array.isArray((style as any).features) ? ((style as any).features as string[]) : [];

  const specs: { label: string; value: string }[] = [];
  addSpec(specs, "Brand", style.brand);
  addSpec(specs, "Category", style.category);
  addSpec(specs, "Gender", (style as any).gender);

  return {
    title: style.name,
    code: style.style_code,
    brand: style.brand,
    category: style.category,
    gender: (style as any).gender || null,
    shortDescription: cleanText(style.description),
    description: cleanText(style.description),
    features: featureArr,
    material: null,
    care: null,
    specs,
    notice: null,
    sizes: uniqueSortedSizes(allSizes),
    colors,
  };
}


/* ---------- i18n for spec labels & values ---------- */

const SPEC_LABEL_I18N: Record<string, { lv: string; en: string }> = {
  Fit: { lv: "Piegriezums", en: "Fit" },
  Weight: { lv: "Svars", en: "Weight" },
  Neckline: { lv: "Apkakle", en: "Neckline" },
  Sleeve: { lv: "Piedurknes", en: "Sleeve" },
  Category: { lv: "Kategorija", en: "Category" },
  Group: { lv: "Grupa", en: "Group" },
  Type: { lv: "Tips", en: "Type" },
  Gender: { lv: "Dzimums", en: "Gender" },
  Segment: { lv: "Segments", en: "Segment" },
  Brand: { lv: "Zīmols", en: "Brand" },
  Material: { lv: "Materiāls", en: "Material" },
  "Country of origin": { lv: "Izcelsmes valsts", en: "Country of origin" },
  Assortment: { lv: "Sortiments", en: "Assortment" },
  "Qty / carton": { lv: "Skaits kastē", en: "Qty / carton" },
  "Capacity (ml)": { lv: "Tilpums (ml)", en: "Capacity (ml)" },
  Insulation: { lv: "Izolācija", en: "Insulation" },
  "Lid features": { lv: "Vāciņa īpašības", en: "Lid features" },
  "Intended use": { lv: "Pielietojums", en: "Intended use" },
  "Extra features": { lv: "Papildu īpašības", en: "Extra features" },
  "Dishwasher safe": { lv: "Trauku mazgājamā", en: "Dishwasher safe" },
  "Microwave safe": { lv: "Mikroviļņu drošs", en: "Microwave safe" },
  Certifications: { lv: "Sertifikāti", en: "Certifications" },
  "BSCI factory": { lv: "BSCI rūpnīca", en: "BSCI factory" },
  "OEKO-TEX": { lv: "OEKO-TEX", en: "OEKO-TEX" },
  "Umbrella size": { lv: "Lietussarga izmērs", en: "Umbrella size" },
  Persons: { lv: "Personas", en: "Persons" },
  "Folded size": { lv: "Salocīts izmērs", en: "Folded size" },
  Opening: { lv: "Atvēršana", en: "Opening" },
  Windproof: { lv: "Vējdrošs", en: "Windproof" },
  "Label type": { lv: "Etiķetes tips", en: "Label type" },
  "Removable infuser": { lv: "Noņemams sietiņš", en: "Removable infuser" },
  "Removable tea filter": { lv: "Noņemams tējas filtrs", en: "Removable tea filter" },
  Sheets: { lv: "Lapas", en: "Sheets" },
};

const VALUE_I18N_LV: Record<string, string> = {
  // gender
  men: "Vīriešiem", man: "Vīriešiem", male: "Vīriešiem", mens: "Vīriešiem",
  women: "Sievietēm", woman: "Sievietēm", female: "Sievietēm", womens: "Sievietēm", ladies: "Sievietēm",
  unisex: "Unisex", kids: "Bērniem", children: "Bērniem", junior: "Bērniem", juniors: "Bērniem", baby: "Zīdaiņiem",
  // fit
  "regular fit": "Klasisks piegriezums", "slim fit": "Pieguļošs piegriezums", "oversized fit": "Brīvs piegriezums",
  "relaxed fit": "Brīvs piegriezums", straight: "Taisns", loose: "Brīvs",
  // yes/no
  yes: "Jā", no: "Nē", true: "Jā", false: "Nē",
};

const translateValue = (value: string, lang: "lv" | "en") => {
  if (lang !== "lv") return value;
  const key = value.toLowerCase().trim();
  return VALUE_I18N_LV[key] || value;
};

const translateLabel = (label: string, lang: "lv" | "en") => {
  const entry = SPEC_LABEL_I18N[label];
  if (entry) return entry[lang];
  return label;
};

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
      const loader = source === "ss" ? loadSS : source === "nwg" ? loadNWG : source === "bb" ? loadBB : loadPF;
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
    for (const c of detail?.colors || []) if (c.images.length) return c.images.slice(0, 1);
    return image ? [image] : [];
  }, [currentColor, detail, image]);

  const mainImg = gallery[imgIndex] || gallery[0] || image;
  const visibleSizes = currentColor?.sizes.length ? currentColor.sizes : detail?.sizes || [];
  const descriptionLines = detail?.features.length ? detail.features : lines(detail?.description || descriptionFallback);
  const label = {
    lv: {
      description: "Apraksts",
      composition: "Sastāvs",
      care: "Kopšanas instrukcijas",
      specifications: "Specifikācija",
      colors: "Krāsas",
      sizes: "Izmēri",
      request: "Pieprasīt cenu šim modelim",
      noImage: "Bez attēla",
      allColors: "Visas krāsas",
      code: "Kods",
      supplier: "Piegādātājs",
    },
    en: {
      description: "Description",
      composition: "Composition",
      care: "Care instructions",
      specifications: "Specifications",
      colors: "Colors",
      sizes: "Sizes",
      request: "Request a quote for this model",
      noImage: "No image",
      allColors: "All colours",
      code: "Code",
      supplier: "Supplier",
    },
  }[lang];

  // Resolve brand for display: hide "Unbranded" / empty
  const rawBrand = (detail?.brand || brand || "").trim();
  const displayBrand = rawBrand && rawBrand.toLowerCase() !== "unbranded" ? rawBrand : null;
  const displayCode = detail?.code || id;
  const displayCategory = detail?.category || category;

  // Filter out redundant specs (already shown as top pills) and translate them
  const filteredSpecs = (detail?.specs || []).filter((s) => {
    const l = s.label.toLowerCase();
    return l !== "brand"; // brand is shown as a pill
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-background p-0">
        <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
          <div className="space-y-3">
            <div className="aspect-square md:aspect-[4/5] max-h-[70vh] w-full overflow-hidden bg-white flex items-center justify-center">
              {mainImg ? (
                <img
                  src={mainImg}
                  alt={currentColor?.name || detail?.title || id}
                  className="h-full w-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                />
              ) : loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {label.noImage}
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {gallery.slice(0, 15).map((u, i) => (
                  <button
                    key={u + i}
                    type="button"
                    onClick={() => setImgIndex(i)}
                    className={`aspect-square overflow-hidden border-2 ${i === imgIndex ? "border-accent" : "border-transparent hover:border-border"} bg-white flex items-center justify-center`}
                  >
                    <img src={u} alt="" className="h-full w-full object-contain" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <DialogHeader className="space-y-4">
              {/* Meta row: code + supplier on left, brand on right */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">
                    {label.code}: <span className="text-accent">{displayCode}</span>
                  </span>
                  <span className="text-border">|</span>
                  <span>
                    {label.supplier}:{" "}
                    <Link
                      to={SOURCE_META[source].href}
                      className="font-semibold text-foreground hover:text-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {SOURCE_META[source].label}
                    </Link>
                  </span>
                </div>
                {displayBrand && (
                  <span className="rounded-full bg-foreground px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-background">
                    {displayBrand}
                  </span>
                )}
              </div>

              <DialogTitle className="font-heading text-3xl font-black uppercase tracking-wide">
                {detail?.title || name || id}
              </DialogTitle>

              {/* Contextual tags */}
              {(displayCategory || detail?.gender) && (
                <div className="flex flex-wrap gap-1.5">
                  {displayCategory && (
                    <Badge variant="secondary" className="rounded-sm text-[10px] font-medium uppercase tracking-wider">
                      {displayCategory}
                    </Badge>
                  )}
                  {detail?.gender && (
                    <Badge variant="outline" className="rounded-sm text-[10px] font-medium uppercase tracking-wider">
                      {translateValue(detail.gender, lang)}
                    </Badge>
                  )}
                </div>
              )}

              {(detail?.shortDescription || descriptionFallback) && (
                <p className="text-base text-muted-foreground">{detail?.shortDescription || descriptionFallback}</p>
              )}
            </DialogHeader>

              {loading && !detail && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}

              {filteredSpecs.length > 0 && (
                <div>
                  <h4 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider">
                    {label.specifications}
                  </h4>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-md border border-border bg-muted/30 p-4 sm:grid-cols-2">
                    {filteredSpecs.map((s) => (
                      <div key={`${s.label}-${s.value}`} className="flex flex-col">
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {translateLabel(s.label, lang)}
                        </dt>
                        <dd className="mt-0.5 text-sm text-foreground">
                          {translateValue(s.value, lang)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {(detail?.colors.length ?? 0) > 0 && (
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <h4 className="font-heading text-sm font-bold uppercase tracking-wider">
                      {label.colors} ({detail!.colors.length})
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {currentColor ? `${currentColor.name} - ${currentColor.code}` : label.allColors}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {detail!.colors.map((c) => {
                      const isActive = c.code === activeColor;
                      const hex = c.hex || "#e5e5e5";
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => { setActiveColor(c.code); setImgIndex(0); }}
                          title={`${c.name} – ${c.code}`}
                          aria-label={c.name}
                          className={`h-7 w-7 rounded-full border-2 transition-transform ${isActive ? "border-foreground ring-2 ring-foreground/30 scale-110" : isLightHex(hex) ? "border-neutral-500 hover:scale-105" : "border-border hover:scale-105"}`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to={`/contact?style=${encodeURIComponent(detail?.code || id)}${currentColor ? `&color=${encodeURIComponent(currentColor.code)}` : ""}`}>
                  {label.request}
                </Link>
              </Button>

              {descriptionLines.length > 0 && (
                <div>
                  <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{label.description}</h4>
                  <ul className="space-y-1.5 text-sm">
                    {descriptionLines.map((b, i) => (
                      <li key={`${b}-${i}`} className="flex gap-2">
                        <span className="mt-0.5 text-accent">✓</span>
                        <span className="text-foreground/90">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {detail?.material && (
                <div>
                  <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">
                    {label.composition}
                  </h4>
                  <p className="text-sm text-foreground/85">{detail.material}</p>
                </div>
              )}

              {detail?.care && (
                <div>
                  <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{label.care}</h4>
                  <p className="whitespace-pre-line text-sm text-foreground/90">{detail.care}</p>
                </div>
              )}

              {visibleSizes.length > 0 && (
                <div>
                  <h4 className="mb-2 font-heading text-sm font-bold uppercase tracking-wider">{label.sizes}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {visibleSizes.map((s) => (
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

              {detail?.notice && (
                <p className="border-t border-border pt-4 text-sm text-muted-foreground">{detail.notice}</p>
              )}

              {!detail && !loading && swatches && swatches.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {swatches.map((s, i) => (
                    <span key={i} title={s.name} className="inline-block h-6 w-6 rounded-full border border-black/20" style={{ backgroundColor: s.hex || "#ccc" }} />
                  ))}
                </div>
              )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogItemDialog;

