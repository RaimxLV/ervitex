// Stanley/Stella LIVE fetch (no import).
// Calls productsV2 with In_Stock=true + Published=true and returns a slim
// normalized payload for the public S/S page. Cached in memory per instance.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SS_HOST = "https://api.stanleystella.com";
const DB_NAME = "production_api";

interface CacheEntry { at: number; data: unknown }
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 60 * 60 * 1000; // 1h

async function ssCall(endpoint: string, extra: Record<string, unknown> = {}) {
  const user = Deno.env.get("STANLEY_STELLA_USER");
  const password = Deno.env.get("STANLEY_STELLA_PASSWORD");
  if (!user || !password) throw new Error("STANLEY_STELLA credentials missing");

  const res = await fetch(`${SS_HOST}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { db_name: DB_NAME, user, password, ...extra },
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error?.data?.message || json.error?.message || "RPC error");
  const raw = json.result ?? "[]";
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

const pick = (obj: any, ...keys: string[]) => {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  return undefined;
};

// Recursively pulls Cloudinary image URLs out of nested Pictures arrays.
function collectImages(node: any, out: Set<string>) {
  if (!node) return;
  if (typeof node === "string") {
    if (/^https?:\/\//.test(node) && /\.(jpg|jpeg|png|webp)/i.test(node)) out.add(node);
    return;
  }
  if (Array.isArray(node)) { for (const item of node) collectImages(item, out); return; }
  if (typeof node === "object") {
    for (const k of ["HTMLPath", "Picture", "PictureURL", "Image", "ImageUrl", "HighResUrl"]) {
      if (typeof node[k] === "string" && /^https?:\/\//.test(node[k])) out.add(node[k]);
    }
    if (Array.isArray(node.Pictures)) collectImages(node.Pictures, out);
  }
}

function normalizeStyle(row: any) {
  const style = pick(row, "StyleCode", "Style_Code", "Style");
  if (!style) return null;

  const variants: any[] = row.Variants || row.Colors || row.SKUs || row.Skus || [];
  const colorMap = new Map<string, { hex: string | null; img: string | null }>();
  const sizes = new Set<string>();
  const images = new Set<string>();

  collectImages(row, images);

  for (const v of variants) {
    const cName = pick(v, "ColorName", "Color", "Name");
    const cHex = pick(v, "HexCode", "Hex", "ColorHex");
    const cImg = pick(v, "ColorImage");
    if (cName && !colorMap.has(cName)) colorMap.set(cName, { hex: cHex || null, img: cImg || null });
    const sz = pick(v, "SizeCode", "Size");
    if (sz) sizes.add(String(sz));
    collectImages(v, images);
  }

  // Style-level sizes array fallback
  if (Array.isArray(row.Sizes)) for (const s of row.Sizes) {
    const sz = typeof s === "string" ? s : pick(s, "SizeCode", "Size");
    if (sz) sizes.add(String(sz));
  }

  return {
    styleCode: style,
    name: pick(row, "StyleName", "Name", "Title") || style,
    shortDescription: pick(row, "ShortDescription", "Description") || "",
    category: pick(row, "Category", "Type") || "",
    gender: pick(row, "Gender") || "",
    composition: pick(row, "Composition", "Material") || "",
    segment: pick(row, "StyleMainsSegments", "StyleMainSegments") || "",
    colors: Array.from(colorMap.entries()).map(([name, v]) => ({ name, hex: v.hex, image: v.img })),
    sizes: Array.from(sizes),
    images: Array.from(images).slice(0, 8),
  };
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 100);
  const styleCode = url.searchParams.get("style") || undefined;
  const lang = url.searchParams.get("lang") || "en_GB";
  const cacheKey = `${lang}|${styleCode || "*"}`;

  try {
    const cached = CACHE.get(cacheKey);
    let rows: any[];
    if (cached && Date.now() - cached.at < TTL_MS) {
      rows = cached.data as any[];
    } else {
      const params: Record<string, unknown> = {
        LanguageCode: lang,
        Published: true,
        In_Stock: true,
      };
      if (styleCode) params.Style_Code = styleCode;
      const raw = await ssCall("/webrequest/productsV2/get_json", params);
      rows = Array.isArray(raw) ? raw : [];
      CACHE.set(cacheKey, { at: Date.now(), data: rows });
    }

    const normalized = rows
      .map(normalizeStyle)
      .filter((x): x is NonNullable<ReturnType<typeof normalizeStyle>> => !!x)
      .slice(0, limit);

    return new Response(
      JSON.stringify({ ok: true, count: normalized.length, total: rows.length, products: normalized }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
