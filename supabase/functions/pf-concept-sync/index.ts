// PF Concept — Data Feeds v3 sync (public feeds, no auth required)
// Docs: https://thedigitalcatalogue.com/pdf/2025/data_feed_manual.pdf
// Product feed: https://www.pfconcept.com/portal/datafeed/productfeed_en_v3.json (~188 MB)
//
// Modes:
//   ?mode=products&offset=0&limit=500   process a window of models
//   ?mode=probe                          fetch first model only (sanity test)
//   ?lang=en                             feed language (en, de, fr, ...)
//
// Because the feed is ~188 MB, we stream it with @streamparser/json and skip
// until `offset`, then process `limit` models per invocation.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { JSONParser } from "https://esm.sh/@streamparser/json@0.0.21";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const IMG_BASE_500 = "https://images.pfconcept.com/ProductImages_All/JPG/500x500/";
const IMG_BASE_1600 = "https://images.pfconcept.com/ProductImages_All/JPG/1600x1600/";

const toStr = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};
const toNum = (v: unknown): number | null => {
  const s = toStr(v);
  if (!s) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const toInt = (v: unknown): number | null => {
  const n = toNum(v);
  return n === null ? null : Math.trunc(n);
};

async function chunkUpsert(
  sb: SupabaseClient, table: string, rows: any[], conflict: string, size = 300,
) {
  if (!rows.length) return 0;
  // dedupe by conflict key
  const keys = conflict.split(",").map((s) => s.trim());
  const map = new Map<string, any>();
  for (const r of rows) map.set(keys.map((k) => String(r[k] ?? "")).join("\u0001"), r);
  const unique = [...map.values()];
  let total = 0;
  for (let i = 0; i < unique.length; i += size) {
    const slice = unique.slice(i, i + size);
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

// --------------------------------------------------------------- mapping

interface Batches {
  styles: any[]; variants: any[]; images: any[];
}

function mapModel(model: any, batches: Batches) {
  const modelCode = toStr(model?.modelCode);
  if (!modelCode) return;

  const items = Array.isArray(model?.items) ? model.items : (model?.items?.item ? [{ item: model.items.item }] : []);
  // items shape in feed is: "items": [ { "item": {...} }, ... ]
  const flatItems = items.map((x: any) => x?.item ?? x).filter(Boolean);

  // Colors are attached per item; collect distinct color palette at model level
  const colorMap = new Map<string, { code: string; desc: string | null; base: string | null; hex: string | null; pms: string | null }>();
  const attrs: Record<string, string | null> = {};
  let brand: string | null = null;
  let categoryGroup: string | null = null;
  let category: string | null = null;
  let material: string | null = null;
  let simpleMat: string | null = null;
  let gender: string | null = null;
  let country: string | null = null;

  // Attributes at model level
  const modelAttrs = model?.attributes?.attribute;
  if (Array.isArray(modelAttrs)) {
    for (const a of modelAttrs) {
      const k = toStr(a?.productAttributeCode); const v = toStr(a?.attributeSetting);
      if (k) attrs[k] = v;
    }
  }

  for (const it of flatItems) {
    const itemCode = toStr(it?.itemCode);
    if (!itemCode) continue;
    if (!brand) brand = toStr(it?.brand);
    if (!categoryGroup) categoryGroup = toStr(it?.categoryData?.groupDesc);
    if (!category) category = toStr(it?.categoryData?.catDesc);
    if (!material) material = toStr(it?.material);
    if (!simpleMat) simpleMat = toStr(it?.simpleMaterial);
    if (!gender) gender = toStr(it?.gender);
    if (!country) country = toStr(it?.countryOfOrigin);

    const colors = it?.colors?.color;
    const colorArr: any[] = Array.isArray(colors) ? colors : (colors ? [colors] : []);
    // Pick primary color for variant row (first)
    const primary = colorArr[0] ?? null;
    for (const c of colorArr) {
      const cc = toStr(c?.colorCode);
      if (cc && !colorMap.has(cc)) {
        colorMap.set(cc, {
          code: cc,
          desc: toStr(c?.colorDesc),
          base: toStr(c?.baseColor),
          hex: toStr(c?.hexColor),
          pms: toStr(c?.pmsColorReference),
        });
      }
    }

    batches.variants.push({
      item_code: itemCode,
      model_code: modelCode,
      size: toStr(it?.size),
      size_grid: toStr(it?.sizeGrid),
      gender: toStr(it?.gender),
      color_code: toStr(primary?.colorCode),
      color_desc: toStr(primary?.colorDesc),
      base_color: toStr(primary?.baseColor),
      hex_color: toStr(primary?.hexColor),
      pms_color: toStr(primary?.pmsColorReference),
      material: toStr(it?.material),
      ean_code: toStr(it?.eanCode),
      weight_gr: toNum(it?.measurements?.weightGr),
      qty_per_carton: toInt(it?.qtyPerCarton),
      raw: null,
    });

    // Images from imageData
    const imgD = it?.imageData ?? {};
    const imgFields: Array<[string, string]> = [
      ["main", "imageMain"], ["front", "imageFront"], ["back", "imageBack"],
      ["extra1", "imageExtra1"], ["extra2", "imageExtra2"], ["extra3", "imageExtra3"],
      ["detail1", "imageDetail1"], ["detail2", "imageDetail2"], ["detail3", "imageDetail3"],
      ["group", "imageGroup"], ["mood1", "imageMood1"], ["mood2", "imageMood2"], ["mood3", "imageMood3"],
      ["model", "imageModel"], ["package", "imagePackage"],
    ];
    let sort = 0;
    for (const [kind, key] of imgFields) {
      const fn = toStr(imgD?.[key]);
      if (!fn) continue;
      batches.images.push({
        model_code: modelCode,
        item_code: itemCode,
        kind,
        filename: fn,
        url_500: IMG_BASE_500 + fn,
        url_1600: IMG_BASE_1600 + fn,
        sort_order: sort++,
      });
    }
  }

  // Fallback main image if items lacked one
  const firstImgRow = batches.images.find((i) => i.model_code === modelCode && i.kind === "main");
  const mainImage = firstImgRow?.filename ?? `${modelCode}.jpg`;

  batches.styles.push({
    model_code: modelCode,
    description: toStr(model?.description),
    ext_desc: toStr(model?.extDesc),
    keywords: toStr(model?.keywords),
    product_comments: toStr(model?.productComments),
    brand,
    category_group: categoryGroup,
    category,
    material,
    simple_material: simpleMat,
    gender,
    country_of_origin: country,
    main_image: mainImage,
    color_count: colorMap.size,
    item_count: flatItems.length,
    attributes: attrs,
    raw: null,
    last_synced_at: new Date().toISOString(),
  });
}

async function flushBatches(sb: SupabaseClient, b: Batches) {
  await chunkUpsert(sb, "pf_styles", b.styles, "model_code");
  await chunkUpsert(sb, "pf_variants", b.variants, "item_code");
  await chunkUpsert(sb, "pf_images", b.images, "model_code,item_code,kind,filename");
  b.styles = []; b.variants = []; b.images = [];
}

// --------------------------------------------------------------- streaming

async function syncProducts(
  sb: SupabaseClient,
  opts: { lang?: string; offset?: number; limit?: number } = {},
) {
  const lang = (opts.lang || "en").toLowerCase();
  const offset = Math.max(0, opts.offset ?? 0);
  const limit = Math.max(1, Math.min(opts.limit ?? 500, 2000));
  const url = `https://www.pfconcept.com/portal/datafeed/productfeed_${lang}_v3.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  if (!res.body) throw new Error("Feed no body");

  const parser = new JSONParser({
    paths: ["$.pfcProductfeed.productfeed.models.*.model"],
    keepStack: false,
  });

  let seen = 0;
  let processed = 0;
  const batches: Batches = { styles: [], variants: [], images: [] };
  let stop = false;

  const done = new Promise<void>((resolve, reject) => {
    parser.onValue = (v: any) => {
      if (stop) return;
      seen++;
      if (seen <= offset) return;
      if (processed >= limit) { stop = true; return; }
      try { mapModel(v.value, batches); processed++; }
      catch (e) { console.error("mapModel:", (e as Error).message); }
    };
    parser.onEnd = () => resolve();
    parser.onError = (e: any) => reject(e);
  });

  const reader = res.body.getReader();
  try {
    while (!stop) {
      const { value, done: rd } = await reader.read();
      if (rd) break;
      try { parser.write(value); } catch (e) {
        // parser may throw on stop — treat gracefully
        if (!stop) throw e;
      }
      // Periodically flush to keep memory low
      if (batches.styles.length >= 100) {
        await flushBatches(sb, batches);
      }
    }
  } finally {
    try { reader.cancel(); } catch {}
  }
  if (!stop) { try { parser.end(); await done; } catch {} }
  await flushBatches(sb, batches);

  return { lang, offset, limit, seen_before_stop: seen, processed, next_offset: offset + processed, has_more: processed >= limit };
}

async function probe(lang = "en") {
  const url = `https://www.pfconcept.com/portal/datafeed/productfeed_${lang}_v3.json`;
  const res = await fetch(url, { headers: { Range: "bytes=0-200000" } });
  const text = await res.text();
  const idx = text.indexOf('"model"');
  return {
    ok: res.ok,
    status: res.status,
    length_hint: res.headers.get("content-length"),
    sample_head: text.slice(0, 500),
    first_model_at: idx,
  };
}

// ------------------------------------------------------------------ handler

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "products").toLowerCase();
  const lang = url.searchParams.get("lang") || "en";
  const offset = Number(url.searchParams.get("offset") || "0");
  const limit = Number(url.searchParams.get("limit") || "500");

  const logId = await startLog(sb, `pf:${mode}`);
  try {
    let result: unknown;
    if (mode === "probe") result = await probe(lang);
    else result = await syncProducts(sb, { lang, offset, limit });

    await finishLog(sb, logId, { status: "success", message: `PF sync (${mode}) ok`, details: result as any });
    return new Response(JSON.stringify({ ok: true, mode, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    await finishLog(sb, logId, { status: "error", message: msg });
    return new Response(JSON.stringify({ ok: false, mode, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
