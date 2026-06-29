// Stanley/Stella unified sync — strict mapping per official API (productsV2,
// v2/stock, products/get_prices, products_imagesV2, color, size, combostyles).
// Field names match the live API response exactly (verified via /inspect).
//
// Modes: catalog | colors | sizes | styles | stock | prices | combos | images | all | inspect

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const SS_HOST = "https://api.stanleystella.com";
const DB_NAME = "production_api";
const DEFAULT_LANG = "en_GB";

// ----------------------------------------------------------------- helpers ---

async function ssCall(endpoint: string, extra: Record<string, unknown> = {}) {
  const user = Deno.env.get("STANLEY_STELLA_USER");
  const password = Deno.env.get("STANLEY_STELLA_PASSWORD");
  if (!user || !password) throw new Error("STANLEY_STELLA credentials missing");

  const res = await fetch(`${SS_HOST}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { db_name: DB_NAME, user, password, ...extra },
      id: 0,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${endpoint}: ${text.slice(0, 200)}`);
  let json: any;
  try { json = JSON.parse(text); }
  catch { throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 200)}`); }
  if (json.error) throw new Error(json.error?.data?.message || json.error?.message || "RPC error");
  const raw = json.result ?? "[]";
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

const toBool = (v: unknown, fallback = false): boolean => {
  if (v === true || v === false) return v;
  if (v === null || v === undefined || v === "") return fallback;
  if (typeof v === "number") return v !== 0;
  const s = String(v).trim().toLowerCase();
  return ["true", "1", "yes", "y", "t"].includes(s);
};

const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const toInt = (v: unknown, fallback = 0): number => {
  const n = toNum(v);
  return n === null ? fallback : Math.trunc(n);
};

const toStr = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

async function chunkUpsert(
  sb: SupabaseClient,
  table: string,
  rows: any[],
  conflict: string,
  size = 500,
) {
  let total = 0;
  for (let i = 0; i < rows.length; i += size) {
    const slice = rows.slice(i, i + size);
    const { error } = await sb.from(table).upsert(slice, { onConflict: conflict });
    if (error) throw new Error(`${table} upsert: ${error.message}`);
    total += slice.length;
  }
  return total;
}

async function startLog(sb: SupabaseClient, source: string) {
  const { data } = await sb.from("sync_logs").insert({ source, status: "running" }).select("id").single();
  return data?.id as string | undefined;
}
async function finishLog(sb: SupabaseClient, id: string | undefined, patch: Record<string, unknown>) {
  if (!id) return;
  await sb.from("sync_logs").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", id);
}

// ----------------------------------------------------------------- syncers ---
// COLORS: /webrequest/color/get_json — rarely used; ss_styles sync re-populates hex too
async function syncColors(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/color/get_json") as any[];
  // The dedicated colors endpoint returns Code+Name only on most accounts.
  // Hex is reliable via Variants.HexaColorCode (done in syncStyles).
  const data = rows.map((r) => ({
    code: toStr(r.Code) ?? "",
    name: toStr(r.Name) ?? toStr(r.Code) ?? "",
    hex: toStr(r.HexaColorCode) ?? toStr(r.Hex),
    raw: r,
  })).filter((r) => r.code);
  return chunkUpsert(sb, "ss_colors", data, "code");
}

// SIZES: /webrequest/size/get_json
async function syncSizes(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/size/get_json") as any[];
  const data = rows.map((r, idx) => ({
    code: toStr(r.Code) ?? "",
    name: toStr(r.Name) ?? toStr(r.Code) ?? "",
    sort_order: toInt(r.Sequence ?? r.SizeSequence ?? idx, idx),
    raw: r,
  })).filter((r) => r.code);
  return chunkUpsert(sb, "ss_sizes", data, "code");
}

// STYLES + VARIANTS + COLORS: /webrequest/productsV2/get_json
async function syncStyles(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/productsV2/get_json", {
    LanguageCode: DEFAULT_LANG,
    Published: true,
  }) as any[];

  const styles: any[] = [];
  const variants: any[] = [];
  const colors = new Map<string, { code: string; name: string; hex: string | null; raw: any }>();

  for (const row of rows) {
    const styleCode = toStr(row.StyleCode);
    if (!styleCode) continue;

    styles.push({
      style_code: styleCode,
      name: toStr(row.StyleName) ?? styleCode,
      short_description: toStr(row.ShortDescription),
      long_description: toStr(row.LongDescription),
      category: toStr(row.Category),
      category_code: toStr(row.CategoryCode),
      type: toStr(row.Type),
      type_code: toStr(row.TypeCode),
      gender: toStr(row.Gender),
      segment: toStr(row.StyleMainsSegments) ?? toStr(row.Segment) ?? toStr(row.StyleSegment),
      fit: toStr(row.Fit),
      neckline: toStr(row.Neckline),
      sleeve: toStr(row.Sleeve),
      wash_instructions: toStr(row.WashInstructions),
      specifications: toStr(row.Specifications),
      main_picture_url: toStr(row.MainPicture),
      over_picture_url: toStr(row.OverPicture),
      published: toBool(row.StylePublished, true),
      brand: "Stanley/Stella",
      // Strip giant Variants/Layers arrays from raw to keep row size sane
      raw: (() => { const { Variants, Layers, ...rest } = row; return rest; })(),
      last_synced_at: new Date().toISOString(),
    });

    const vList = Array.isArray(row.Variants) ? row.Variants : [];
    // Compute style-level composition + GSM from the first variant (uniform across SKUs)
    if (vList.length) {
      const v0 = vList[0];
      const composition = toStr(v0.CompositionList);
      const weightGsm = toNum(v0.Weight);
      if (composition || weightGsm) {
        const last = styles[styles.length - 1];
        last.composition = composition;
        last.weight_gsm = weightGsm;
      }
    }

    for (const v of vList) {
      const sku = toStr(v.B2BSKUREF);
      if (!sku) continue;
      const colorCode = toStr(v.ColorCode);
      const colorName = toStr(v.Color);
      const hex = toStr(v.HexaColorCode);
      if (colorCode && !colors.has(colorCode)) {
        colors.set(colorCode, { code: colorCode, name: colorName ?? colorCode, hex, raw: v });
      }
      variants.push({
        sku,
        style_code: styleCode,
        color_code: colorCode,
        color_name: colorName,
        hex_color_code: hex,
        color_group: toStr(v.ColorGroup),
        color_sequence: toInt(v.ColorSequence, 0),
        size_code: toStr(v.SizeCode),
        size_sequence: toInt(v.SizeSequence, 0),
        ean: toStr(v.EAN),
        weight_grams: toNum(v.WeightPerUnit),
        published: toBool(v.Published, true),
        raw: null,
      });
    }
  }

  // Smaller chunks for ss_styles (rows can be large with long descriptions) — avoids Postgres statement timeout.
  const s = await chunkUpsert(sb, "ss_styles", styles, "style_code", 50);
  const v = await chunkUpsert(sb, "ss_variants", variants, "sku");
  const c = colors.size
    ? await chunkUpsert(sb, "ss_colors", Array.from(colors.values()), "code")
    : 0;
  return { styles: s, variants: v, colors_from_variants: c };
}

// STOCK V2: /webrequest/v2/stock/get_json
async function syncStock(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/v2/stock/get_json", {
    LanguageCode: DEFAULT_LANG,
    Is_Inventory: true,
  }) as any[];

  // Aggregate by SKU across all locations (sum available qty)
  const bySku = new Map<string, any>();
  for (const r of rows) {
    const sku = toStr(r.SKU);
    if (!sku) continue;
    const cur = bySku.get(sku);
    const qty = toInt(r.Available_Quantity, 0);
    const styleCode = toStr(r.Style_Code) ?? cur?.style_code ?? "";
    if (cur) {
      cur.quantity += qty;
    } else {
      bySku.set(sku, {
        sku,
        style_code: styleCode,
        quantity: qty,
        incoming_quantity: 0,
        variant_code: toStr(r.Variant_Code),
        location_code: toStr(r.Location_Code),
        receipt_date: toStr(r.Receipt_Date),
      });
    }
  }
  return chunkUpsert(sb, "ss_stock", Array.from(bySku.values()), "sku");
}

// PRICES: /webrequest/products/get_prices — returns variant-level brackets
async function syncPrices(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/products/get_prices") as any[];
  const data = rows.map((r) => {
    const sku = toStr(r.B2BSKUREF);
    if (!sku) return null;
    return {
      sku,
      style_code: sku.slice(0, 7), // STxxx### (style prefix); we keep raw for safety
      purchase_price: toNum(r.PurchasePrice),
      suggested_retail_price: toNum(r.RecommendedSalesPriceGT10pcs) ?? toNum(r.RecommendedSalesSmallBrand),
      currency: "EUR",
    };
  }).filter(Boolean) as any[];
  return chunkUpsert(sb, "ss_prices", data, "sku");
}

// COMBOS: /webrequest/combostyles/get_json
async function syncCombos(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/combostyles/get_json").catch(() => []) as any[];
  const data: any[] = [];
  for (const r of rows) {
    const style = toStr(r.StyleCode);
    const combos = Array.isArray(r.Combos) ? r.Combos : Array.isArray(r.Combo) ? r.Combo : [];
    if (!style || !combos.length) continue;
    for (const c of combos) {
      const cc = toStr(c.StyleCode);
      if (cc) data.push({ style_code: style, combo_style_code: cc, combo_type: toStr(c.Type), raw: c });
    }
  }
  if (!data.length) return 0;
  const styles = Array.from(new Set(data.map((d) => d.style_code)));
  for (let i = 0; i < styles.length; i += 200) {
    await sb.from("ss_combos").delete().in("style_code", styles.slice(i, i + 200));
  }
  return chunkUpsert(sb, "ss_combos", data, "id");
}

// IMAGES: /webrequest/products_imagesV2/get_json — metadata only.
// We HOTLINK from Stanley/Stella's Cloudinary CDN (HTMLPath). No download, no
// bucket dependency — instant full coverage of all photo types per color.
async function syncImages(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/products_imagesV2/get_json", {
    LanguageCode: DEFAULT_LANG,
  }) as any[];

  const seen = new Set<string>();
  const data: any[] = [];

  for (const r of rows) {
    const style = toStr(r.StyleCode);
    const url = toStr(r.HTMLPath);
    if (!style || !url) continue;
    const colorCode = toStr(r.ColorCode);
    const photoType = toStr(r.PhotoTypeCode) ?? "MAIN";
    const sortOrder = toInt(r.PhotoSequenceCode, 0);
    const fname = toStr(r.FName) ?? url;
    // Dedup on the same key the DB unique index uses (incl. FName) so every
    // distinct photo file survives the upsert.
    const key = `${style}|${colorCode ?? ""}|${photoType}|${fname}`;
    if (seen.has(key)) continue;
    seen.add(key);
    data.push({
      style_code: style,
      color_code: colorCode,
      image_type: photoType,
      photo_style: toStr(r.PhotoStyle),
      photo_shoot_code: toStr(r.PhotoShootCode),
      fname: toStr(r.FName),
      sort_order: sortOrder,
      source_url: url,
      is_main: toBool(r.MainPicture, false),
      is_over: toBool(r.OverPicture, false),
    });
  }

  return chunkUpsert(sb, "ss_images", data, "style_code,color_code,image_type,fname");
}

// INSPECT: introspect raw responses (used during development)
async function inspectApi() {
  const sample = (rows: any[]) => rows.slice(0, 1).map((row) => ({
    keys: Object.keys(row),
    style: row.StyleCode, sku: row.B2BSKUREF ?? row.SKU,
    variants: Array.isArray(row.Variants) ? row.Variants.length : undefined,
    firstVariantKeys: Array.isArray(row.Variants) && row.Variants[0] ? Object.keys(row.Variants[0]) : undefined,
    url: row.HTMLPath,
  }));
  const [styles, stock, prices, images] = await Promise.all([
    ssCall("/webrequest/productsV2/get_json", { LanguageCode: DEFAULT_LANG, Published: true, StyleCode: "STTU169" }),
    ssCall("/webrequest/v2/stock/get_json", { LanguageCode: DEFAULT_LANG, Is_Inventory: true, SKU: "STTU169C0012S" }),
    ssCall("/webrequest/products/get_prices", { B2BSKUREF: "STTU169C0012S" }),
    ssCall("/webrequest/products_imagesV2/get_json", { LanguageCode: DEFAULT_LANG, StyleCode: "STTU169" }),
  ]);
  return {
    styles: { count: styles.length, sample: sample(styles) },
    stock: { count: stock.length, sample: sample(stock) },
    prices: { count: prices.length, sample: sample(prices) },
    images: { count: images.length, sample: sample(images) },
  };
}

// ----------------------------------------------------------------- handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "all").toLowerCase();

  const logId = await startLog(sb, `stanley-stella:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "inspect") result.inspect = await inspectApi();
    if (mode === "sizes"  || mode === "catalog" || mode === "all") result.sizes  = await syncSizes(sb);
    if (mode === "colors" || mode === "catalog" || mode === "all") result.colors = await syncColors(sb);
    if (mode === "styles" || mode === "catalog" || mode === "all") result.styles = await syncStyles(sb);
    if (mode === "stock"  || mode === "catalog" || mode === "all") result.stock  = await syncStock(sb);
    if (mode === "prices" || mode === "catalog" || mode === "all") result.prices = await syncPrices(sb);
    if (mode === "images" || mode === "catalog" || mode === "all") result.images = await syncImages(sb);
    if (mode === "combos" || mode === "all") result.combos = await syncCombos(sb);

    await finishLog(sb, logId, { status: "success", message: `Sync (${mode}) ok`, details: result });
    return new Response(JSON.stringify({ ok: true, mode, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    await finishLog(sb, logId, { status: "error", message: msg, details: result });
    return new Response(JSON.stringify({ ok: false, mode, error: msg, partial: result }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
