// NWG Gateway (New Wave Group) sync — GraphQL.
// Docs: token+guide provided by NWG. Endpoint: https://api.gateway.nwg.se/graphql
// Auth header: Authorization: Bearer <NWG_ACCESS_TOKEN>
//
// Modes: assortments | styles | images | all | inspect
// Strategy: crawl leaf assortments -> productsByAssortmentId (paged) -> map to
// nwg_styles / nwg_variants / nwg_skus / nwg_images in one pass.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const NWG_ENDPOINT = "https://api.gateway.nwg.se/graphql";
const LANG = "en";
const PAGE_SIZE = 100;

// ------------------------------------------------------------------- helpers

async function gql<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = Deno.env.get("NWG_ACCESS_TOKEN");
  if (!token) throw new Error("NWG_ACCESS_TOKEN missing");
  const res = await fetch(NWG_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NWG HTTP ${res.status}: ${text.slice(0, 300)}`);
  let json: any;
  try { json = JSON.parse(text); } catch { throw new Error(`NWG non-JSON: ${text.slice(0, 200)}`); }
  if (json.errors?.length) {
    const msg = json.errors.map((e: any) => e.message).join("; ");
    throw new Error(`NWG GraphQL error: ${msg}`);
  }
  return json.data as T;
}

const toStr = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};
const toNum = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const toInt = (v: unknown, d = 0): number => {
  const n = toNum(v);
  return n === null ? d : Math.trunc(n);
};
const kvpFirst = (arr: any): string | null => {
  if (!Array.isArray(arr) || !arr.length) return null;
  return toStr(arr[0]?.value ?? arr[0]?.key);
};

function dedupe<T extends Record<string, any>>(rows: T[], keyCols: string[]): T[] {
  const map = new Map<string, T>();
  for (const r of rows) {
    const k = keyCols.map((c) => String(r[c] ?? "")).join("\u0001");
    map.set(k, r); // last write wins
  }
  return [...map.values()];
}

async function chunkUpsert(
  sb: SupabaseClient, table: string, rows: any[], conflict: string, size = 300,
) {
  const keyCols = conflict.split(",").map((s) => s.trim());
  const unique = dedupe(rows, keyCols);
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

// ------------------------------------------------------------------- GraphQL

const Q_ASSORTMENT_ROOTS = `
  query($lang: String!, $page: Int!, $size: PageSize!) {
    assortment(assortmentId: "", language: $lang, page: $page, pageSize: $size) {
      count
      result { id name assortmentId parentId childNodeIds }
    }
  }
`;

const Q_ASSORTMENT_NODE = `
  query($id: String!, $lang: String!) {
    assortmentNodeById(id: $id, language: $lang) {
      id name assortmentId parentId childNodeIds
    }
  }
`;

const PRODUCT_FIELDS = `
  productNumber productName productBrand productFabrics productWeight
  productCountryOfOrigin productCatalogText productCommerceText productUsp
  productAssortment
  productCategory { key value }
  productGender   { key value }
  productFit      { key value }
  retailPrice { price currency }
  pictures {
    resourceFileId resourceFileName resourcePictureType resourcePictureAngle
    imageUrl thumbnailUrl largeThumbnailUrl highResUrl standardUrl
  }
  variations {
    itemNumber itemColorName itemColorCode itemWebColor outlet
    filterColor { key value }
    shadeColor  { key value }
    pictures {
      resourceFileId resourceFileName resourcePictureType resourcePictureAngle
      imageUrl thumbnailUrl largeThumbnailUrl highResUrl standardUrl
    }
    skus {
      sku productNumber active discontinued availability
      eanCode sizeSequence
      skuSize { size }
      prices { currency salesPrice retailPrice priceList }
      retailPrice { price currency }
    }
  }
`;

const Q_PRODUCT_SEARCH = `
  query($lang: String!, $q: String!, $page: Int!, $size: PageSize!) {
    productSearch(language: $lang, q: $q, assortmentId: "", page: $page, pageSize: $size) {
      count
      result { ${PRODUCT_FIELDS} }
    }
  }
`;


// -------------------------------------------------------------- mapping ----

function mapProduct(row: any, seenProductNumbers: Set<string>): {
  style?: any; variants: any[]; skus: any[]; images: any[];
} {
  const pn = toStr(row.productNumber);
  if (!pn) return { variants: [], skus: [], images: [] };
  if (seenProductNumbers.has(pn)) return { variants: [], skus: [], images: [] };
  seenProductNumbers.add(pn);

  const style = {
    product_number: pn,
    name: toStr(row.productName) ?? pn,
    brand: toStr(row.productBrand),
    category: kvpFirst(row.productCategory),
    gender: kvpFirst(row.productGender),
    fit: kvpFirst(row.productFit),
    fabrics: toStr(row.productFabrics),
    commerce_text: toStr(row.productCommerceText),
    catalog_text: toStr(row.productCatalogText),
    usp: toStr(row.productUsp),
    weight: toStr(row.productWeight),
    country_of_origin: toStr(row.productCountryOfOrigin),
    retail_price: toNum(row.retailPrice?.price),
    currency: toStr(row.retailPrice?.currency) ?? "EUR",
    main_picture_url: toStr(row.pictures?.[0]?.highResUrl ?? row.pictures?.[0]?.standardUrl ?? row.pictures?.[0]?.imageUrl),
    assortment_ids: Array.isArray(row.productAssortment) ? row.productAssortment : null,
    published: true,
    archived: false,
    raw: (() => { const { variations, pictures, ...rest } = row; return rest; })(),
    last_synced_at: new Date().toISOString(),
  };

  const variants: any[] = [];
  const skus: any[] = [];
  const images: any[] = [];

  // Style-level pictures
  (row.pictures ?? []).forEach((p: any, idx: number) => {
    images.push({
      product_number: pn,
      item_number: null,
      resource_file_id: toStr(p.resourceFileId) ?? `${pn}-${idx}`,
      file_name: toStr(p.resourceFileName),
      picture_type: toStr(p.resourcePictureType),
      picture_angle: toStr(p.resourcePictureAngle) ?? `main-${idx}`,
      image_url: toStr(p.imageUrl),
      thumbnail_url: toStr(p.thumbnailUrl),
      large_thumbnail_url: toStr(p.largeThumbnailUrl),
      high_res_url: toStr(p.highResUrl),
      standard_url: toStr(p.standardUrl),
      sort_order: idx,
    });
  });

  (row.variations ?? []).forEach((v: any) => {
    const itemNumber = toStr(v.itemNumber);
    if (!itemNumber) return;
    variants.push({
      item_number: itemNumber,
      product_number: pn,
      color_name: toStr(v.itemColorName),
      color_code: toStr(v.itemColorCode),
      web_color: Array.isArray(v.itemWebColor) ? v.itemWebColor : null,
      filter_color: kvpFirst(v.filterColor),
      shade_color: kvpFirst(v.shadeColor),
      outlet: !!v.outlet,
      main_picture_url: toStr(v.pictures?.[0]?.highResUrl ?? v.pictures?.[0]?.standardUrl ?? v.pictures?.[0]?.imageUrl),
      raw: null,
    });

    (v.pictures ?? []).forEach((p: any, idx: number) => {
      images.push({
        product_number: pn,
        item_number: itemNumber,
        resource_file_id: toStr(p.resourceFileId) ?? `${itemNumber}-${idx}`,
        file_name: toStr(p.resourceFileName),
        picture_type: toStr(p.resourcePictureType),
        picture_angle: toStr(p.resourcePictureAngle) ?? `${itemNumber}-${idx}`,
        image_url: toStr(p.imageUrl),
        thumbnail_url: toStr(p.thumbnailUrl),
        large_thumbnail_url: toStr(p.largeThumbnailUrl),
        high_res_url: toStr(p.highResUrl),
        standard_url: toStr(p.standardUrl),
        sort_order: idx,
      });
    });

    (v.skus ?? []).forEach((s: any) => {
      const sku = toStr(s.sku);
      if (!sku) return;
      const price = Array.isArray(s.prices) && s.prices.length ? s.prices[0] : null;
      skus.push({
        sku,
        product_number: pn,
        item_number: itemNumber,
        size: toStr(s.skuSize?.size),
        size_sequence: toStr(s.sizeSequence),
        ean: toStr(s.eanCode),
        availability: toInt(s.availability, 0),
        sales_price: toNum(price?.salesPrice),
        retail_price: toNum(s.retailPrice?.price) ?? toNum(price?.retailPrice),
        currency: toStr(price?.currency) ?? toStr(s.retailPrice?.currency) ?? "EUR",
        discontinued: !!s.discontinued,
        active: s.active !== false,
      });
    });
  });

  return { style, variants, skus, images };
}

// ------------------------------------------------------------------ syncers

async function syncAssortments(sb: SupabaseClient) {
  const collected: any[] = [];
  let page = 1;
  while (true) {
    const data = await gql<any>(Q_ASSORTMENT_ROOTS, { lang: LANG, page, size: 100 });
    const res = data.assortment?.result ?? [];
    if (!res.length) break;
    for (const a of res) {
      collected.push({
        id: toStr(a.id) ?? toStr(a.assortmentId),
        name: toStr(a.name),
        parent_id: toStr(a.parentId),
        raw: a,
      });
    }
    if (res.length < 100) break;
    page++;
    if (page > 100) break;
  }
  if (collected.length) await chunkUpsert(sb, "nwg_assortments", collected, "id");
  return collected.length;
}

async function syncStyles(
  sb: SupabaseClient,
  opts: { maxPages?: number; startPage?: number; query?: string } = {},
) {
  const seen = new Set<string>();
  let styles: any[] = [];
  let variants: any[] = [];
  let skus: any[] = [];
  let images: any[] = [];

  const q = opts.query ?? "*";
  const startPage = Math.max(1, opts.startPage ?? 1);
  const maxPages = opts.maxPages ?? 30; // conservative per-invocation cap
  let page = startPage;
  const endPage = startPage + maxPages - 1;
  let totalCount = 0;
  let pagesFetched = 0;

  while (page <= endPage) {
    let data: any;
    try {
      data = await gql<any>(Q_PRODUCT_SEARCH, { lang: LANG, q, page, size: PAGE_SIZE });
    } catch (e) {
      if (page === 1) throw e;
      console.error(`productSearch page ${page} failed: ${(e as Error).message}`);
      break;
    }
    const rows = data.productSearch?.result ?? [];
    totalCount = data.productSearch?.count ?? totalCount;
    if (!rows.length) break;
    for (const r of rows) {
      const m = mapProduct(r, seen);
      if (m.style) styles.push(m.style);
      variants.push(...m.variants);
      skus.push(...m.skus);
      images.push(...m.images);
    }
    pagesFetched++;

    if (styles.length >= 300 || variants.length >= 1500 || images.length >= 4000) {
      if (styles.length)  await chunkUpsert(sb, "nwg_styles", styles, "product_number", 200);
      if (variants.length) await chunkUpsert(sb, "nwg_variants", variants, "item_number");
      if (skus.length)     await chunkUpsert(sb, "nwg_skus", skus, "sku");
      if (images.length)   await chunkUpsert(sb, "nwg_images", images, "product_number,item_number,resource_file_id,picture_angle");
      styles = []; variants = []; skus = []; images = [];
    }

    if (rows.length < PAGE_SIZE) break;
    page++;
  }

  if (styles.length)   await chunkUpsert(sb, "nwg_styles", styles, "product_number", 200);
  if (variants.length) await chunkUpsert(sb, "nwg_variants", variants, "item_number");
  if (skus.length)     await chunkUpsert(sb, "nwg_skus", skus, "sku");
  if (images.length)   await chunkUpsert(sb, "nwg_images", images, "product_number,item_number,resource_file_id,picture_angle");

  return { pages_fetched: pagesFetched, start_page: startPage, end_page: page - 1, total_count: totalCount, unique_styles: seen.size };
}


async function inspectApi(q?: string) {
  const schema = await gql<any>(`{ __schema { queryType { name } } }`);
  const query = q || "*";
  let sample: any = null;
  try {
    sample = await gql<any>(
      `query($q:String!){ productSearch(q:$q, language:"en", assortmentId:"", page:1, pageSize:2){ count result{ productNumber productName productBrand retailPrice{ price currency } variations{ itemNumber skus{ sku prices{ currency salesPrice retailPrice priceList } retailPrice{ price currency } } } } } }`,
      { q: query },
    );
  } catch (e) {
    sample = { error: (e as Error).message };
  }
  return { schemaOk: !!schema?.__schema, sample };
}

// ------------------------------------------------------------------ handler

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "all").toLowerCase();
  const maxPages = url.searchParams.get("maxPages");
  const startPage = url.searchParams.get("startPage");
  const q = url.searchParams.get("q") || undefined;

  const logId = await startLog(sb, `nwg:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "inspect") result.inspect = await inspectApi();
    if (mode === "assortments" || mode === "all") result.assortments = await syncAssortments(sb);
    if (mode === "styles" || mode === "all") {
      result.catalog = await syncStyles(sb, {
        maxPages: maxPages ? Number(maxPages) : undefined,
        startPage: startPage ? Number(startPage) : undefined,
        query: q,
      });
    }

    await finishLog(sb, logId, { status: "success", message: `NWG sync (${mode}) ok`, details: result });
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
