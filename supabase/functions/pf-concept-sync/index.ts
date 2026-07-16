// PF Concept — Data Feeds v3 sync with Storage-cached, chunked architecture
//
// Two-phase design to stay well under edge-function memory/CPU limits and
// avoid re-downloading the 188 MB feed on every invocation.
//
// Phase 1 — CACHE (run once per full sync):
//   ?mode=cache&lang=en&chunkSize=150
//   Streams the public PF feed, splits models into small JSON chunk files,
//   uploads each chunk to Storage bucket `pf-feeds/chunks/<lang>/chunk_XXXX.json`,
//   and writes a `manifest.json` with total chunks + model count.
//
// Phase 2 — PROCESS (run many times, cheap):
//   ?mode=process&lang=en&from=0&to=9        process chunks 0..9 inclusive
//   ?mode=process&lang=en&chunk=42            process a single chunk
//   Each chunk is a few MB, parses instantly, upserts to pf_styles/variants/images.
//
// Helpers:
//   ?mode=manifest&lang=en                    read manifest
//   ?mode=probe                                sanity fetch first bytes of feed
//
// Storage bucket `pf-feeds` is PRIVATE. Only the service role (this function)
// reads/writes it. No public exposure.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { JSONParser } from "https://esm.sh/@streamparser/json@0.0.21";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const BUCKET = "pf-feeds";
const IMG_BASE_500 = "https://images.pfconcept.com/ProductImages_All/JPG/500x500/";
const IMG_BASE_1600 = "https://images.pfconcept.com/ProductImages_All/JPG/1600x1600/";

// ---------------------------------------------------------------- utils
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

// -------------------------------------------------------- mapping (model → rows)

interface Batches { styles: any[]; variants: any[]; images: any[]; }

function mapModel(model: any, batches: Batches) {
  const modelCode = toStr(model?.modelCode);
  if (!modelCode) return;

  const rawItems = Array.isArray(model?.items) ? model.items : (model?.items ? [model.items] : []);
  const flatItems = rawItems.map((x: any) => x?.item ?? x).filter(Boolean);

  const colorMap = new Map<string, boolean>();
  const attrs: Record<string, string | null> = {};
  let brand: string | null = null;
  let categoryGroup: string | null = null;
  let category: string | null = null;
  let material: string | null = null;
  let simpleMat: string | null = null;
  let gender: string | null = null;
  let country: string | null = null;

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
    const primary = colorArr[0] ?? null;
    for (const c of colorArr) {
      const cc = toStr(c?.colorCode);
      if (cc) colorMap.set(cc, true);
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

// ------------------------------------------------------- Phase 1: CACHE + SPLIT

async function cacheAndSplit(
  sb: SupabaseClient,
  opts: { lang?: string; chunkSize?: number } = {},
) {
  const lang = (opts.lang || "en").toLowerCase();
  const chunkSize = Math.max(50, Math.min(opts.chunkSize ?? 150, 500));
  const url = `https://www.pfconcept.com/portal/datafeed/productfeed_${lang}_v3.json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  if (!res.body) throw new Error("Feed no body");

  const parser = new JSONParser({
    paths: ["$.pfcProductfeed.productfeed.models.*.model"],
    keepStack: false,
  });

  let modelCount = 0;
  let chunkIdx = 0;
  let currentBatch: any[] = [];
  const uploads: Promise<any>[] = [];

  const flushChunk = async () => {
    if (!currentBatch.length) return;
    const idx = chunkIdx++;
    const path = `chunks/${lang}/chunk_${String(idx).padStart(4, "0")}.json`;
    const body = new Blob([JSON.stringify(currentBatch)], { type: "application/json" });
    currentBatch = [];
    // Serialize uploads to avoid concurrent-memory spikes
    const { error } = await sb.storage.from(BUCKET).upload(path, body, {
      upsert: true, contentType: "application/json",
    });
    if (error) throw new Error(`upload ${path}: ${error.message}`);
  };

  const done = new Promise<void>((resolve, reject) => {
    parser.onValue = (v: any) => {
      currentBatch.push(v.value);
      modelCount++;
      if (currentBatch.length >= chunkSize) {
        // Fire-and-hold: push a promise, awaited between reads below
        uploads.push(flushChunk());
      }
    };
    parser.onEnd = () => resolve();
    parser.onError = (e: any) => reject(e);
  });

  const reader = res.body.getReader();
  try {
    while (true) {
      const { value, done: rd } = await reader.read();
      if (rd) break;
      parser.write(value);
      // Backpressure: await any pending uploads before continuing to read
      if (uploads.length) {
        await Promise.all(uploads.splice(0));
      }
    }
  } finally {
    try { reader.cancel(); } catch {}
  }
  parser.end();
  await done;
  await flushChunk();
  if (uploads.length) await Promise.all(uploads);

  // Write manifest
  const manifest = {
    lang,
    chunk_size: chunkSize,
    total_chunks: chunkIdx,
    total_models: modelCount,
    created_at: new Date().toISOString(),
    source_url: url,
  };
  const { error: mErr } = await sb.storage.from(BUCKET).upload(
    `chunks/${lang}/manifest.json`,
    new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }),
    { upsert: true, contentType: "application/json" },
  );
  if (mErr) throw new Error(`manifest upload: ${mErr.message}`);

  return manifest;
}

// ------------------------------------------------------- Phase 2: PROCESS chunk

async function readManifest(sb: SupabaseClient, lang: string) {
  const { data, error } = await sb.storage.from(BUCKET).download(`chunks/${lang}/manifest.json`);
  if (error) throw new Error(`manifest: ${error.message}`);
  return JSON.parse(await data.text());
}

async function processChunk(sb: SupabaseClient, lang: string, chunkIdx: number) {
  const path = `chunks/${lang}/chunk_${String(chunkIdx).padStart(4, "0")}.json`;
  const { data, error } = await sb.storage.from(BUCKET).download(path);
  if (error) throw new Error(`download ${path}: ${error.message}`);
  const models: any[] = JSON.parse(await data.text());
  const batches: Batches = { styles: [], variants: [], images: [] };
  for (const m of models) mapModel(m, batches);
  const s = batches.styles.length, v = batches.variants.length, i = batches.images.length;
  await flushBatches(sb, batches);
  return { chunk: chunkIdx, models: models.length, styles: s, variants: v, images: i };
}

async function processRange(sb: SupabaseClient, lang: string, from: number, to: number) {
  const results: any[] = [];
  for (let i = from; i <= to; i++) {
    try {
      results.push(await processChunk(sb, lang, i));
    } catch (e) {
      results.push({ chunk: i, error: (e as Error).message });
    }
  }
  const totals = results.reduce(
    (acc, r) => ({
      models: acc.models + (r.models ?? 0),
      styles: acc.styles + (r.styles ?? 0),
      variants: acc.variants + (r.variants ?? 0),
      images: acc.images + (r.images ?? 0),
    }),
    { models: 0, styles: 0, variants: 0, images: 0 },
  );
  return { from, to, totals, chunks_processed: results.length, results };
}

async function probe(lang = "en") {
  const url = `https://www.pfconcept.com/portal/datafeed/productfeed_${lang}_v3.json`;
  const res = await fetch(url, { headers: { Range: "bytes=0-100000" } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, sample: text.slice(0, 400) };
}

// ------------------------------------------------------------------ price feed

async function syncPrices(sb: SupabaseClient) {
  const token = Deno.env.get("PF_FEED_TOKEN");
  if (!token) throw new Error("PF_FEED_TOKEN not set");
  const url = `http://www.pfconcept.com/portal/datafeed/pricefeed_${token}_v3.json`;
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`pricefeed fetch ${res.status}`);

  const rows: any[] = [];
  let currentItem: any = null;

  const parser = new JSONParser({
    stringBufferSize: 64 * 1024,
    paths: ["$..item"],
  });
  parser.onValue = ({ value }) => {
    const v: any = value;
    if (!v || typeof v !== "object") return;
    // Some feeds nest another {item: ...}; unwrap once
    const it = (v as any).item && !(v as any).itemCode ? (v as any).item : v;
    const item_code = toStr(it.itemCode) || toStr(it.itemcode) || toStr(it.code);
    if (!item_code) return;
    const price = toNum(it.price) ?? toNum(it.netPrice) ?? toNum(it.customerPrice);
    const list_price = toNum(it.listPrice) ?? toNum(it.grossPrice) ?? null;
    const currency = toStr(it.currency) ?? toStr(it.curr) ?? "EUR";
    if (price === null && list_price === null) return;
    rows.push({ item_code, price, list_price, currency, updated_at: new Date().toISOString() });
  };

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.write(decoder.decode(value, { stream: true }));
  }
  parser.end();

  const upserted = await chunkUpsert(sb, "pf_prices", rows, "item_code", 500);
  return { parsed: rows.length, upserted };
}

async function probePrices() {
  const token = Deno.env.get("PF_FEED_TOKEN");
  if (!token) throw new Error("PF_FEED_TOKEN not set");
  const url = `http://www.pfconcept.com/portal/datafeed/pricefeed_${token}_v3.json`;
  const res = await fetch(url, { headers: { Range: "bytes=0-8000" } });
  const text = await res.text();
  return { ok: res.ok, status: res.status, sample: text.slice(0, 4000) };
}

// ------------------------------------------------------------------ handler

// -------- Phase 2b: INGEST — accept a POST batch of raw models from client
async function ingest(sb: SupabaseClient, models: any[]) {
  const batches: Batches = { styles: [], variants: [], images: [] };
  for (const m of models) mapModel(m, batches);
  const s = batches.styles.length, v = batches.variants.length, i = batches.images.length;
  await flushBatches(sb, batches);
  return { received: models.length, styles: s, variants: v, images: i };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "manifest").toLowerCase();
  const lang = url.searchParams.get("lang") || "en";

  const logId = await startLog(sb, `pf:${mode}`);
  try {
    let result: unknown;
    if (mode === "probe") {
      result = await probe(lang);
    } else if (mode === "cache") {
      const chunkSize = Number(url.searchParams.get("chunkSize") || "150");
      result = await cacheAndSplit(sb, { lang, chunkSize });
    } else if (mode === "manifest") {
      result = await readManifest(sb, lang);
    } else if (mode === "process") {
      const chunk = url.searchParams.get("chunk");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      if (chunk !== null) {
        result = await processChunk(sb, lang, Number(chunk));
      } else if (from !== null && to !== null) {
        result = await processRange(sb, lang, Number(from), Number(to));
      } else {
        throw new Error("process mode requires ?chunk=N or ?from=A&to=B");
      }
    } else if (mode === "ingest") {
      if (req.method !== "POST") throw new Error("ingest requires POST");
      const body = await req.json();
      if (!Array.isArray(body?.models)) throw new Error("body.models must be an array");
      result = await ingest(sb, body.models);
    } else {
      throw new Error(`unknown mode: ${mode}`);
    }

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
