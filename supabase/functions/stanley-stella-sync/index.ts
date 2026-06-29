// Stanley/Stella unified sync.
// Modes: catalog | colors | sizes | styles | stock | prices | combos | images | all | inspect
// Called manually from admin or by pg_cron on a schedule.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SS_HOST = "https://api.stanleystella.com";
const DB_NAME = "production_api";
const DEFAULT_LANG = "en_GB";

// ---------------------------------------------------------------- helpers ---

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

const pick = (o: any, ...keys: string[]) => {
  for (const k of keys) if (o?.[k] !== undefined && o?.[k] !== null && o?.[k] !== "") return o[k];
  return undefined;
};

const normalizeBool = (value: unknown, fallback = true) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const v = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(v);
};

const normalizeNumber = (value: unknown, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
};

const getArray = (value: unknown) => Array.isArray(value) ? value : [];

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
  const { data } = await sb.from("sync_logs")
    .insert({ source, status: "running" })
    .select("id").single();
  return data?.id as string | undefined;
}

async function finishLog(sb: SupabaseClient, id: string | undefined, patch: Record<string, unknown>) {
  if (!id) return;
  await sb.from("sync_logs").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", id);
}

// ---------------------------------------------------------------- syncers ---

async function syncColors(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/color/get_json");
  const data = (rows as any[]).map((r) => ({
    code: String(pick(r, "Code", "ColorCode", "Id") ?? ""),
    name: String(pick(r, "Name", "ColorName") ?? ""),
    hex: pick(r, "Hex", "HexCode", "Color_Hex", "HexaColorCode") ?? null,
    raw: r,
  })).filter((r) => r.code);
  return chunkUpsert(sb, "ss_colors", data, "code");
}

async function syncSizes(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/size/get_json");
  const data = (rows as any[]).map((r, idx) => ({
    code: String(pick(r, "Code", "SizeCode", "Id") ?? ""),
    name: String(pick(r, "Name", "SizeName") ?? ""),
    sort_order: Number(pick(r, "Sequence", "SortOrder") ?? idx),
    raw: r,
  })).filter((r) => r.code);
  return chunkUpsert(sb, "ss_sizes", data, "code");
}

async function syncStyles(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/productsV2/get_json", { LanguageCode: DEFAULT_LANG, Published: true });
  const styles: any[] = [];
  const variants: any[] = [];
  const colors = new Map<string, { code: string; name: string; hex: string | null; raw: any }>();

  for (const row of rows as any[]) {
    const style = pick(row, "StyleCode", "Style_Code", "Style");
    if (!style) continue;
    styles.push({
      style_code: style,
      name: pick(row, "StyleName", "Name") || style,
      short_description: pick(row, "ShortDescription") || null,
      long_description: pick(row, "LongDescription", "Description") || null,
      category: pick(row, "Category", "Type") || null,
      type: pick(row, "Type") || null,
      gender: pick(row, "Gender") || null,
      segment: pick(row, "StyleMainsSegments", "StyleMainSegments", "Segment") || null,
      composition: pick(row, "Composition", "Material") || null,
      weight_gsm: normalizeNumber(pick(row, "Weight", "GSM"), 0) || null,
      fit: pick(row, "Fit") || null,
      neckline: pick(row, "Neckline") || null,
      sleeve: pick(row, "Sleeve") || null,
      published: normalizeBool(pick(row, "Published"), true),
      raw: row,
      last_synced_at: new Date().toISOString(),
    });

    const vlist: any[] = getArray(row.Variants || row.SKUs || row.Skus);
    for (const v of vlist) {
      const sku = pick(v, "B2BSKUREF", "SKU", "Sku", "Code");
      if (!sku) continue;
      const colorCode = pick(v, "ColorCode", "Color_Code");
      if (colorCode && !colors.has(String(colorCode))) {
        colors.set(String(colorCode), {
          code: String(colorCode),
          name: String(pick(v, "ColorName", "Color") || colorCode),
          hex: pick(v, "HexaColorCode", "Hex", "HexCode") || null,
          raw: v,
        });
      }
      variants.push({
        sku: String(sku),
        style_code: style,
        color_code: colorCode || null,
        color_name: pick(v, "ColorName", "Color") || null,
        size_code: pick(v, "SizeCode", "Size") || null,
        ean: pick(v, "EAN", "Ean", "Barcode") || null,
        raw: v,
      });
    }
  }

  const s = await chunkUpsert(sb, "ss_styles", styles, "style_code");
  const v = await chunkUpsert(sb, "ss_variants", variants, "sku");
  const c = colors.size ? await chunkUpsert(sb, "ss_colors", Array.from(colors.values()), "code") : 0;
  return { styles: s, variants: v, colors_from_variants: c };
}

async function syncStock(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/v2/stock/get_json", { LanguageCode: DEFAULT_LANG, Is_Inventory: true });
  const data = (rows as any[]).map((r) => ({
    sku: String(pick(r, "B2BSKUREF", "SKU", "Sku") ?? ""),
    style_code: String(pick(r, "StyleCode", "Style_Code", "Style") ?? ""),
    quantity: normalizeNumber(pick(r, "Available_Quantity", "Quantity", "Qty", "QTY", "Stock", "StockQuantity", "AvailableQuantity"), 0),
    incoming_quantity: normalizeNumber(pick(r, "IncomingQuantity", "Incoming", "InboundQuantity"), 0),
    next_arrival_date: pick(r, "NextArrivalDate") || null,
  })).filter((r) => r.sku);
  return chunkUpsert(sb, "ss_stock", data, "sku");
}

async function syncPrices(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/products/get_prices");
  const data = (rows as any[]).map((r) => ({
    sku: String(pick(r, "B2BSKUREF", "SKU", "Sku") ?? ""),
    style_code: String(pick(r, "StyleCode", "Style_Code", "Style") ?? ""),
    purchase_price: normalizeNumber(pick(r, "PurchasePrice", "Price", "UnitPrice", "YourPrice"), 0) || null,
    suggested_retail_price: normalizeNumber(pick(r, "SuggestedRetailPrice", "SRP", "RecommendedRetailPrice", "RecommendedSalesPriceGT10pcs", "RecommendedSalesSmallBrand"), 0) || null,
    currency: pick(r, "Currency") || "EUR",
  })).filter((r) => r.sku);
  return chunkUpsert(sb, "ss_prices", data, "sku");
}

async function syncCombos(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/combostyles/get_json").catch(() => []);
  const data: any[] = [];
  for (const r of rows as any[]) {
    const style = pick(r, "StyleCode", "Style_Code");
    const combos: any[] = getArray(r.Combo || r.Combos);
    if (!style || !combos.length) continue;
    for (const c of combos) {
      const ccode = pick(c, "StyleCode", "Style_Code", "Code");
      if (!ccode) continue;
      data.push({
        style_code: style,
        combo_style_code: ccode,
        combo_type: pick(c, "Type") || null,
        raw: c,
      });
    }
  }
  if (!data.length) return 0;
  // Replace combos for involved styles
  const styles = Array.from(new Set(data.map((d) => d.style_code)));
  for (let i = 0; i < styles.length; i += 200) {
    await sb.from("ss_combos").delete().in("style_code", styles.slice(i, i + 200));
  }
  return chunkUpsert(sb, "ss_combos", data, "id");
}

// Images: pulls V2 image list, then downloads NEW ones into the ss-images bucket
// and stores public URL. Skips ones already mirrored.
async function syncImages(sb: SupabaseClient, maxDownloads = 200) {
  const rows = await ssCall("/webrequest/products_imagesV2/get_json", { LanguageCode: DEFAULT_LANG });
  const wanted: { style: string; color: string | null; type: string; sort: number; url: string; primary: boolean }[] = [];

  for (const r of rows as any[]) {
    const style = pick(r, "StyleCode", "Style_Code");
    if (!style) continue;
    const pics: any[] = getArray(r.Pictures || r.Images);
    const sourceRows = pics.length ? pics : [r];
    sourceRows.forEach((p, idx) => {
      const url = pick(p, "HTMLPath", "HighResUrl", "Picture", "PictureURL", "Image", "ImageUrl", "URL", "Url");
      if (!url) return;
      wanted.push({
        style,
        color: pick(p, "ColorCode", "Color_Code") || null,
        type: pick(p, "PhotoTypeCode", "PictureType", "Type", "PhotoStyle") || "main",
        sort: normalizeNumber(pick(p, "PhotoSequenceCode", "Sequence", "Sort"), idx),
        url,
        primary: normalizeBool(pick(p, "MainPicture", "Main", "IsMain"), false),
      });
    });
  }

  const primaryByStyle = new Map<string, typeof wanted[number]>();
  for (const img of wanted) {
    const current = primaryByStyle.get(img.style);
    if (!current || (img.primary && !current.primary) || (img.primary === current.primary && img.sort < current.sort)) {
      primaryByStyle.set(img.style, img);
    }
  }
  const primaryUrls = new Set(Array.from(primaryByStyle.values()).map((img) => img.url));
  const orderedWanted = [
    ...Array.from(primaryByStyle.values()),
    ...wanted.filter((img) => !primaryUrls.has(img.url)),
  ];

  // Diff against existing
  const { data: existing } = await sb.from("ss_images").select("source_url");
  const have = new Set((existing || []).map((e: any) => e.source_url));
  const todo = orderedWanted.filter((w) => !have.has(w.url));

  let downloaded = 0;
  const inserts: any[] = [];
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

  for (const w of todo.slice(0, maxDownloads)) {
    try {
      const r = await fetch(w.url);
      if (!r.ok) continue;
      const buf = new Uint8Array(await r.arrayBuffer());
      const ext = (w.url.match(/\.(jpe?g|png|webp)/i)?.[1] || "jpg").toLowerCase();
      const safeColor = (w.color || "x").replace(/[^a-z0-9]/gi, "");
      const path = `${w.style}/${safeColor}/${w.type}-${w.sort}-${Date.now()}.${ext}`;
      const up = await sb.storage.from("ss-images").upload(path, buf, {
        contentType: r.headers.get("content-type") || `image/${ext}`,
        upsert: false,
      });
      if (up.error) continue;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/ss-images/${path}`;
      inserts.push({
        style_code: w.style,
        color_code: w.color,
        image_type: w.type,
        sort_order: w.sort,
        source_url: w.url,
        storage_path: path,
        public_url: publicUrl,
      });
      downloaded++;
    } catch (_) { /* skip */ }
  }
  if (inserts.length) await chunkUpsert(sb, "ss_images", inserts, "style_code,color_code,image_type,sort_order");
  return { wanted: wanted.length, new: todo.length, downloaded, remaining: Math.max(0, todo.length - downloaded) };
}

async function inspectApi() {
  const sample = (rows: any[]) => rows.slice(0, 2).map((row) => ({
    keys: Object.keys(row),
    style: pick(row, "StyleCode", "Style_Code", "Style"),
    sku: pick(row, "B2BSKUREF", "SKU", "Sku"),
    quantity: pick(row, "Quantity", "Qty", "QTY", "Stock", "StockQuantity", "AvailableQuantity"),
    url: pick(row, "HTMLPath", "HighResUrl", "Picture", "PictureURL", "Image", "ImageUrl", "URL", "Url"),
    variants: Array.isArray(row.Variants) ? row.Variants.length : undefined,
    firstVariantKeys: Array.isArray(row.Variants) && row.Variants[0] ? Object.keys(row.Variants[0]) : undefined,
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

// ---------------------------------------------------------------- handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "catalog").toLowerCase();
  const maxImg = Number(url.searchParams.get("maxImages") || 200);

  const logId = await startLog(sb, `stanley-stella:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "inspect") result.inspect = await inspectApi();
    if (mode === "colors" || mode === "catalog" || mode === "all") result.colors = await syncColors(sb);
    if (mode === "sizes"  || mode === "catalog" || mode === "all") result.sizes  = await syncSizes(sb);
    if (mode === "styles" || mode === "catalog" || mode === "all") result.styles = await syncStyles(sb);
    if (mode === "stock"  || mode === "catalog" || mode === "all") result.stock  = await syncStock(sb);
    if (mode === "prices" || mode === "catalog" || mode === "all") result.prices = await syncPrices(sb);
    if (mode === "combos" || mode === "all") result.combos = await syncCombos(sb);
    if (mode === "images" || mode === "all") result.images = await syncImages(sb, maxImg);

    await finishLog(sb, logId, {
      status: "success",
      message: `Sync (${mode}) ok`,
      details: result,
    });
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
