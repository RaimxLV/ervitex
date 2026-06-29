// Stanley/Stella unified sync.
// Modes: styles | stock | prices | images | colors | sizes | combos | all
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
    hex: pick(r, "Hex", "HexCode", "Color_Hex") ?? null,
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
  const rows = await ssCall("/webrequest/productsV2/get_json", { LanguageCode: DEFAULT_LANG });
  const styles: any[] = [];
  const variants: any[] = [];

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
      segment: pick(row, "StyleMainsSegments", "StyleMainSegments") || null,
      composition: pick(row, "Composition", "Material") || null,
      weight_gsm: Number(pick(row, "Weight", "GSM") ?? 0) || null,
      fit: pick(row, "Fit") || null,
      neckline: pick(row, "Neckline") || null,
      sleeve: pick(row, "Sleeve") || null,
      published: pick(row, "Published") !== false,
      raw: row,
      last_synced_at: new Date().toISOString(),
    });

    const vlist: any[] = row.Variants || row.SKUs || row.Skus || [];
    for (const v of vlist) {
      const sku = pick(v, "SKU", "Sku", "Code");
      if (!sku) continue;
      variants.push({
        sku: String(sku),
        style_code: style,
        color_code: pick(v, "ColorCode", "Color_Code") || null,
        color_name: pick(v, "ColorName", "Color") || null,
        size_code: pick(v, "SizeCode", "Size") || null,
        ean: pick(v, "EAN", "Ean", "Barcode") || null,
        raw: v,
      });
    }
  }

  const s = await chunkUpsert(sb, "ss_styles", styles, "style_code");
  const v = await chunkUpsert(sb, "ss_variants", variants, "sku");
  return { styles: s, variants: v };
}

async function syncStock(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/v2/stock/get_json", { Is_Inventory: true });
  const data = (rows as any[]).map((r) => ({
    sku: String(pick(r, "SKU", "Sku") ?? ""),
    style_code: String(pick(r, "StyleCode", "Style_Code") ?? ""),
    quantity: Number(pick(r, "Quantity", "Stock") ?? 0),
    incoming_quantity: Number(pick(r, "IncomingQuantity", "Incoming") ?? 0),
    next_arrival_date: pick(r, "NextArrivalDate") || null,
  })).filter((r) => r.sku);
  return chunkUpsert(sb, "ss_stock", data, "sku");
}

async function syncPrices(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/products/get_prices");
  const data = (rows as any[]).map((r) => ({
    sku: String(pick(r, "SKU", "Sku") ?? ""),
    style_code: String(pick(r, "StyleCode", "Style_Code") ?? ""),
    purchase_price: Number(pick(r, "PurchasePrice", "Price") ?? 0) || null,
    suggested_retail_price: Number(pick(r, "SuggestedRetailPrice", "SRP") ?? 0) || null,
    currency: pick(r, "Currency") || "EUR",
  })).filter((r) => r.sku);
  return chunkUpsert(sb, "ss_prices", data, "sku");
}

async function syncCombos(sb: SupabaseClient) {
  const rows = await ssCall("/webrequest/combostyles/get_json").catch(() => []);
  const data: any[] = [];
  for (const r of rows as any[]) {
    const style = pick(r, "StyleCode", "Style_Code");
    const combos: any[] = r.Combo || r.Combos || [];
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
  const wanted: { style: string; color: string | null; type: string; sort: number; url: string }[] = [];

  for (const r of rows as any[]) {
    const style = pick(r, "StyleCode", "Style_Code");
    if (!style) continue;
    const pics: any[] = r.Pictures || r.Images || [];
    pics.forEach((p, idx) => {
      const url = pick(p, "HTMLPath", "HighResUrl", "Picture", "PictureURL", "Image", "ImageUrl");
      if (!url) return;
      wanted.push({
        style,
        color: pick(p, "ColorCode", "Color_Code") || null,
        type: pick(p, "PictureType", "Type") || "main",
        sort: Number(pick(p, "Sequence", "Sort") ?? idx),
        url,
      });
    });
  }

  // Diff against existing
  const { data: existing } = await sb.from("ss_images").select("source_url");
  const have = new Set((existing || []).map((e: any) => e.source_url));
  const todo = wanted.filter((w) => !have.has(w.url));

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

// ---------------------------------------------------------------- handler ---

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "all").toLowerCase();
  const maxImg = Number(url.searchParams.get("maxImages") || 200);

  const logId = await startLog(sb, `stanley-stella:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "colors" || mode === "all") result.colors = await syncColors(sb);
    if (mode === "sizes"  || mode === "all") result.sizes  = await syncSizes(sb);
    if (mode === "styles" || mode === "all") result.styles = await syncStyles(sb);
    if (mode === "stock"  || mode === "all") result.stock  = await syncStock(sb);
    if (mode === "prices" || mode === "all") result.prices = await syncPrices(sb);
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
