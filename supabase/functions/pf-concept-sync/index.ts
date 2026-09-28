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
const PRODUCT_SLICE = 2_000_000;

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

type ProductCacheState = {
  next_start: number;
  next_chunk: number;
  total_models: number;
  carry_b64: string;
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

const base64ToBytes = (value: string) => {
  if (!value) return new Uint8Array();
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const findAscii = (bytes: Uint8Array, needle: string) => {
  const pattern = new TextEncoder().encode(needle);
  outer: for (let i = 0; i <= bytes.length - pattern.length; i++) {
    for (let j = 0; j < pattern.length; j++) if (bytes[i + j] !== pattern[j]) continue outer;
    return i;
  }
  return -1;
};

function extractModels(bytes: Uint8Array, firstSlice: boolean) {
  let cursor = 0;
  if (firstSlice) {
    const modelsAt = findAscii(bytes, '"models"');
    if (modelsAt < 0) throw new Error("PF models array not found in first slice");
    cursor = modelsAt + 8;
    while (cursor < bytes.length && bytes[cursor] !== 91) cursor++;
    if (cursor >= bytes.length) throw new Error("PF models array opening bracket not found");
    cursor++;
  }

  const models: any[] = [];
  let consumed = cursor;
  while (cursor < bytes.length) {
    while (cursor < bytes.length && (bytes[cursor] === 9 || bytes[cursor] === 10 || bytes[cursor] === 13 || bytes[cursor] === 32 || bytes[cursor] === 44)) cursor++;
    if (cursor >= bytes.length || bytes[cursor] === 93) { consumed = cursor; break; }
    if (bytes[cursor] !== 123) { cursor++; consumed = cursor; continue; }

    const objectStart = cursor;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let complete = false;
    for (; cursor < bytes.length; cursor++) {
      const value = bytes[cursor];
      if (inString) {
        if (escaped) escaped = false;
        else if (value === 92) escaped = true;
        else if (value === 34) inString = false;
        continue;
      }
      if (value === 34) inString = true;
      else if (value === 123) depth++;
      else if (value === 125) {
        depth--;
        if (depth === 0) {
          cursor++;
          const wrapper = JSON.parse(new TextDecoder().decode(bytes.slice(objectStart, cursor)));
          models.push(wrapper?.model ?? wrapper);
          consumed = cursor;
          complete = true;
          break;
        }
      }
    }
    if (!complete) return { models, carry: bytes.slice(objectStart) };
  }
  return { models, carry: bytes.slice(consumed) };
}

async function resumableProductCache(sb: SupabaseClient, lang: string, start: number) {
  const statePath = `chunks/${lang}/cache-state.json`;
  let state: ProductCacheState = { next_start: 0, next_chunk: 0, total_models: 0, carry_b64: "" };
  if (start > 0) {
    const { data, error } = await sb.storage.from(BUCKET).download(statePath);
    if (error) throw new Error(`PF cache state: ${error.message}`);
    state = JSON.parse(await data.text()) as ProductCacheState;
    if (state.next_start !== start) throw new Error(`PF cache resume mismatch: expected ${state.next_start}, received ${start}`);
  }

  const url = `https://www.pfconcept.com/portal/datafeed/productfeed_${lang}_v3.json`;
  const res = await fetch(url, {
    headers: { Range: `bytes=${start}-${start + PRODUCT_SLICE - 1}`, "Accept-Encoding": "identity" },
  });
  if (!res.ok && res.status !== 206) throw new Error(`PF product feed HTTP ${res.status}`);
  const fresh = new Uint8Array(await res.arrayBuffer());
  const previous = base64ToBytes(state.carry_b64);
  const combined = new Uint8Array(previous.length + fresh.length);
  combined.set(previous);
  combined.set(fresh, previous.length);
  const extracted = extractModels(combined, start === 0);

  if (extracted.models.length) {
    const path = `chunks/${lang}/chunk_${String(state.next_chunk).padStart(4, "0")}.json`;
    const { error } = await sb.storage.from(BUCKET).upload(
      path,
      new Blob([JSON.stringify(extracted.models)], { type: "application/json" }),
      { upsert: true, contentType: "application/json" },
    );
    if (error) throw new Error(`upload ${path}: ${error.message}`);
    state.next_chunk++;
    state.total_models += extracted.models.length;
  }

  const range = res.headers.get("content-range") || "";
  const totalBytes = Number(range.split("/")[1]) || fresh.length;
  state.next_start = start + fresh.length;
  state.carry_b64 = bytesToBase64(extracted.carry);
  const done = fresh.length === 0 || state.next_start >= totalBytes;

  if (done) {
    const manifest = {
      lang,
      chunk_size: null,
      total_chunks: state.next_chunk,
      total_models: state.total_models,
      created_at: new Date().toISOString(),
      source_url: url,
    };
    const { error } = await sb.storage.from(BUCKET).upload(
      `chunks/${lang}/manifest.json`,
      new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }),
      { upsert: true, contentType: "application/json" },
    );
    if (error) throw new Error(`manifest upload: ${error.message}`);
    await sb.storage.from(BUCKET).remove([statePath]);
    if (state.next_chunk > 0) {
      await chainSelf(sb, { mode: "process", lang, from: "0", chain: "1", span: String(CHUNK_SPAN) });
    }
    return { done: true, total_bytes: totalBytes, total_chunks: state.next_chunk, total_models: state.total_models };
  }

  const { error: stateError } = await sb.storage.from(BUCKET).upload(
    statePath,
    new Blob([JSON.stringify(state)], { type: "application/json" }),
    { upsert: true, contentType: "application/json" },
  );
  if (stateError) throw new Error(`PF cache state upload: ${stateError.message}`);
  await chainSelf(sb, { mode: "cache_slice", lang, start: String(state.next_start) });
  return { done: false, next_start: state.next_start, total_bytes: totalBytes, chunks: state.next_chunk, models: state.total_models };
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

// Resumable price sync.
// The PF price feed is ~190 MB — a single edge invocation cannot download or
// parse it within the CPU limit. We therefore read it in byte slices with HTTP
// Range requests, extract item prices with a cheap text scan, and chain the
// next slice in the background until the whole feed is processed.
// Keep each invocation comfortably below the edge CPU limit. The previous
// 12 MB slice repeatedly exhausted the worker while splitting/scanning JSON.
const PRICE_SLICE = 1_500_000;

async function syncPrices(sb: SupabaseClient, opts: { start: number; chain: boolean }) {
  const token = Deno.env.get("PF_FEED_TOKEN");
  if (!token) throw new Error("PF_FEED_TOKEN not set");
  const feedUrl = `http://www.pfconcept.com/portal/datafeed/pricefeed_${token}_v3.json`;

  const start = Math.max(0, opts.start);
  const res = await fetch(feedUrl, {
    headers: {
      Range: `bytes=${start}-${start + PRICE_SLICE - 1}`,
      "Accept-Encoding": "identity",
    },
  });
  if (!res.ok && res.status !== 206) throw new Error(`pricefeed fetch ${res.status}`);
  const text = await res.text();

  // A server/proxy that ignores Range would hand the whole ~190 MB file to a
  // single worker. Fail safely instead of hitting the CPU limit mid-write.
  if (res.status !== 206 && text.length > PRICE_SLICE * 2) {
    throw new Error("PF price feed ignored byte range");
  }

  const cr = res.headers.get("content-range") || "";
  const total = Number(cr.split("/")[1]) || 0;

  const now = new Date().toISOString();
  const marker = '{"itemcode":"';
  const parts = text.split(marker);
  // First fragment is whatever preceded the first item; last one may be cut off.
  const complete = parts.slice(1, parts.length - 1);
  const rows: any[] = [];

  for (const seg of complete) {
    const codeEnd = seg.indexOf('"');
    if (codeEnd <= 0) continue;
    const item_code = seg.slice(0, codeEnd);
    if (!/^[A-Za-z0-9-]+$/.test(item_code)) continue;
    const cur = seg.match(/"currency":"([A-Z]{3})"/);
    let price: number | null = null;
    let lowestBar = Number.MAX_SAFE_INTEGER;
    const re = /"priceBar":(\d+),"nettPrice":([\d.]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(seg)) !== null) {
      const bar = Number(m[1]);
      const val = Number(m[2]);
      if (Number.isFinite(val) && bar < lowestBar) { lowestBar = bar; price = val; }
    }
    if (price === null) continue;
    rows.push({ item_code, price, list_price: null, currency: cur?.[1] || "EUR", updated_at: now });
  }

  const upserted = await chunkUpsert(sb, "pf_prices", rows, "item_code", 500);
  const pub = rows
    .filter((r) => r.price !== null && r.price > 0)
    .map((r) => ({
      item_code: r.item_code,
      model_code: String(r.item_code).slice(0, 6),
      retail_price: Number((Number(r.price) * 1.65).toFixed(2)),
      currency: r.currency || "EUR",
      updated_at: now,
    }));
  if (pub.length) {
    const { error } = await sb.from("pf_public_retail_prices").upsert(pub, { onConflict: "item_code" });
    if (error) throw new Error(`pf_public_retail_prices upsert: ${error.message}`);
  }

  // Where does the incomplete tail begin? Resume exactly there next time.
  const consumed = parts.slice(0, parts.length - 1).join(marker).length;
  const consumedBytes = new TextEncoder().encode(text.slice(0, consumed)).length;
  const bytesRead = new TextEncoder().encode(text).length;
  const nextStart = start + (consumedBytes > 0 ? consumedBytes : bytesRead);
  const done = bytesRead === 0 || (total > 0 && nextStart >= total) || bytesRead < PRICE_SLICE - 1024;

  if (!done && opts.chain) {
    // Dispatch through pg_net. A plain fire-and-forget fetch is cancelled when
    // this worker returns and used to leave the feed only partly processed.
    await chainSelf(sb, { mode: "prices", start: String(nextStart), chain: "1" });
  }

  return { start, next_start: nextStart, total_bytes: total, items: rows.length, upserted, done };
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

/**
 * Continuation, so a full product refresh can span as many invocations as it
 * needs. Dispatched through the database (pg_net) because a plain fetch() is
 * cancelled the moment this worker shuts down.
 */
async function chainSelf(sb: SupabaseClient, params: Record<string, string>) {
  const qs = "?" + new URLSearchParams(params).toString();
  const { error } = await sb.rpc("invoke_sync_function", { fn: "pf-concept-sync", qs });
  if (error) console.error(`[pf-concept-sync] chain failed: ${error.message}`);
}

// Full product refresh: cache the feed into chunks, then walk the chunks.
const CHUNK_SPAN = 15;

async function refreshProducts(sb: SupabaseClient, lang: string, chunkSize: number) {
  void chunkSize;
  return await resumableProductCache(sb, lang, 0);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "prices").toLowerCase();
  const lang = url.searchParams.get("lang") || "en";

  const logId = await startLog(sb, `pf:${mode}`);
  try {
    let result: unknown;
    if (mode === "probe") {
      result = await probe(lang);
    } else if (mode === "cache") {
      const chunkSize = Number(url.searchParams.get("chunkSize") || "150");
      result = await cacheAndSplit(sb, { lang, chunkSize });
    } else if (mode === "refresh") {
      const chunkSize = Number(url.searchParams.get("chunkSize") || "150");
      result = await refreshProducts(sb, lang, chunkSize);
    } else if (mode === "cache_slice") {
      result = await resumableProductCache(sb, lang, Number(url.searchParams.get("start") || "0"));
    } else if (mode === "manifest") {
      result = await readManifest(sb, lang);
    } else if (mode === "process") {
      const chunk = url.searchParams.get("chunk");
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const chain = url.searchParams.get("chain") === "1";
      const span = Math.max(1, Math.min(Number(url.searchParams.get("span") || CHUNK_SPAN), 60));
      if (chunk !== null) {
        result = await processChunk(sb, lang, Number(chunk));
      } else if (from !== null && to !== null) {
        result = await processRange(sb, lang, Number(from), Number(to));
      } else if (from !== null && chain) {
        const manifest = await readManifest(sb, lang);
        const total = Number(manifest.total_chunks || 0);
        const start = Number(from);
        const end = Math.min(start + span - 1, total - 1);
        const range = await processRange(sb, lang, start, end);
        const next = end + 1;
        const done = next >= total;
        if (!done) await chainSelf(sb, { mode: "process", lang, from: String(next), chain: "1", span: String(span) });
        result = { ...range, total_chunks: total, next_from: done ? null : next, done };
      } else {
        throw new Error("process mode requires ?chunk=N or ?from=A&to=B");
      }
    } else if (mode === "prices") {
      result = await syncPrices(sb, {
        start: Number(url.searchParams.get("start") || "0"),
        chain: (url.searchParams.get("chain") || "1") !== "0",
      });

    } else if (mode === "probe_prices") {
      result = await probePrices();
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
