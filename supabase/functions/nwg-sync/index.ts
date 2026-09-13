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
const BRAND_NAMES = new Map([
  ["craft", "Craft"],
  ["craft ap", "Craft"],
  ["clique", "Clique"],
  ["clique retail", "Clique"],
  ["projob", "ProJob"],
  ["cutter & buck", "Cutter & Buck"],
]);

// Products confirmed unavailable through NWG's ordering channel must never be
// restored by a later catalog sync, even if productById still returns metadata.
const BLOCKED_PRODUCT_NUMBERS = new Set(["1903482", "1904160"]);

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

const Q_ASSORTMENT_PAGE = `
  query($assortmentId: String!, $lang: String!, $page: Int!, $size: PageSize!) {
    assortment(assortmentId: $assortmentId, language: $lang, page: $page, pageSize: $size) {
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

const Q_DISCOVER_ASSORTMENTS = `
  query($q: String!) {
    productSearch(q: $q, language: "en", assortmentId: "", page: 1, pageSize: 5) {
      result {
        assortmentNodes { id name assortmentId parentId childNodeIds }
      }
    }
  }
`;

const PRODUCT_FIELDS = `
  productNumber productName productBrand productFabrics productWeight
  productCountryOfOrigin productCatalogText productCommerceText productUsp
  productAssortment
  assortmentNodes { id name assortmentId parentId childNodeIds }
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

const Q_PRODUCTS_BY_ASSORTMENT = `
  query($lang: String!, $assortmentId: String!, $page: Int!, $size: PageSize!) {
    productsByAssortmentId(language: $lang, assortmentId: $assortmentId, page: $page, pageSize: $size) {
      count
      result { ${PRODUCT_FIELDS} }
    }
  }
`;

const EXACT_AUDIT_BATCH_SIZE = 25;

type ExactAuditProduct = {
  productNumber?: string | null;
  productName?: string | null;
  productBrand?: string | null;
  pictures?: Array<{
    imageUrl?: string | null;
    highResUrl?: string | null;
    standardUrl?: string | null;
  }> | null;
  variations?: Array<{
    itemNumber?: string | null;
    pictures?: Array<{
      imageUrl?: string | null;
      highResUrl?: string | null;
      standardUrl?: string | null;
    }> | null;
    skus?: Array<{
      sku?: string | null;
      productNumber?: string | null;
    }> | null;
  }> | null;
};

function normalizedUrl(value: string): string {
  try {
    const url = new URL(value);
    return `${url.origin}${decodeURIComponent(url.pathname)}${url.search}`;
  } catch {
    return value;
  }
}

function exactAuditQuery(productNumbers: string[]): string {
  const fields = productNumbers.map((productNumber, index) => {
    if (!/^[A-Za-z0-9._-]+$/.test(productNumber)) {
      throw new Error(`Unsafe NWG product number in audit: ${productNumber}`);
    }
    return `p${index}: productById(productNumber: ${JSON.stringify(productNumber)}, language: "en", disableCache: true) {
      productNumber productName productBrand
      pictures { imageUrl highResUrl standardUrl }
      variations {
        itemNumber
        pictures { imageUrl highResUrl standardUrl }
        skus { sku productNumber }
      }
    }`;
  });
  return `query ExactProductAudit { ${fields.join("\n")} }`;
}

function productImageUrls(product: ExactAuditProduct): Set<string> {
  const urls = new Set<string>();
  const addPictures = (pictures: ExactAuditProduct["pictures"]) => {
    for (const picture of pictures ?? []) {
      for (const value of [picture.highResUrl, picture.standardUrl, picture.imageUrl]) {
        const url = toStr(value);
        if (url) urls.add(normalizedUrl(url));
      }
    }
  };
  addPictures(product.pictures);
  for (const variation of product.variations ?? []) addPictures(variation.pictures);
  return urls;
}

function imageFilenameMatchesProduct(value: string, productNumber: string): boolean {
  try {
    const filename = decodeURIComponent(new URL(value).pathname.split("/").pop() ?? "");
    return filename.startsWith(`${productNumber}-`) || filename.startsWith(`${productNumber}_`);
  } catch {
    return false;
  }
}

async function auditPublicCards(sb: SupabaseClient, offset: number, limit: number) {
  const safeOffset = Math.max(0, offset);
  const safeLimit = Math.max(1, Math.min(limit, 1000));
  const { data, error, count } = await sb
    .from("catalog_items")
    .select("id,name,brand,image_url", { count: "exact" })
    .eq("source", "nwg")
    .order("id")
    .range(safeOffset, safeOffset + safeLimit - 1);
  if (error) throw new Error(`NWG public-card audit read: ${error.message}`);

  const cards = (data ?? []) as Array<{ id: string; name: string | null; brand: string | null; image_url: string | null }>;
  const mismatches: Array<{ id: string; reasons: string[]; local: unknown; api: unknown }> = [];

  for (let start = 0; start < cards.length; start += EXACT_AUDIT_BATCH_SIZE) {
    const batch = cards.slice(start, start + EXACT_AUDIT_BATCH_SIZE);
    const productNumbers = batch.map((card) => card.id);
    const [exact, localVariants, localSkus] = await Promise.all([
      gql<Record<string, ExactAuditProduct | null>>(exactAuditQuery(productNumbers)),
      sb.from("nwg_variants").select("product_number,item_number").in("product_number", productNumbers),
      sb.from("nwg_skus").select("product_number,item_number,sku").in("product_number", productNumbers),
    ]);
    if (localVariants.error) throw new Error(`NWG variant audit read: ${localVariants.error.message}`);
    if (localSkus.error) throw new Error(`NWG SKU audit read: ${localSkus.error.message}`);
    batch.forEach((card, index) => {
      const product = exact[`p${index}`];
      const reasons: string[] = [];
      if (!product) {
        reasons.push("exact_product_not_found");
      } else {
        const exactNumber = toStr(product.productNumber);
        const exactName = toStr(product.productName);
        const exactBrand = BRAND_NAMES.get((toStr(product.productBrand) ?? "").toLocaleLowerCase()) ?? toStr(product.productBrand);
        const exactItems = new Set((product.variations ?? []).map((variation) => toStr(variation.itemNumber)).filter(Boolean));
        const exactSkus = new Map<string, string | null>();
        for (const variation of product.variations ?? []) {
          for (const sku of variation.skus ?? []) {
            const skuCode = toStr(sku.sku);
            if (skuCode) exactSkus.set(skuCode, toStr(sku.productNumber));
          }
        }
        if (exactNumber !== card.id) reasons.push(`product_number:${exactNumber ?? "null"}`);
        if (exactName !== card.name) reasons.push(`name:${exactName ?? "null"}`);
        if (exactBrand !== card.brand) reasons.push(`brand:${exactBrand ?? "null"}`);
        if (
          card.image_url &&
          !productImageUrls(product).has(normalizedUrl(card.image_url)) &&
          !imageFilenameMatchesProduct(card.image_url, card.id)
        ) reasons.push("image_not_owned_by_product");
        for (const variant of localVariants.data ?? []) {
          if (variant.product_number === card.id && !exactItems.has(variant.item_number)) {
            reasons.push(`variant_not_owned:${variant.item_number}`);
          }
        }
        for (const sku of localSkus.data ?? []) {
          if (sku.product_number !== card.id) continue;
          if (!exactSkus.has(sku.sku)) reasons.push(`sku_not_owned:${sku.sku}`);
          else if (exactSkus.get(sku.sku) !== card.id) reasons.push(`sku_product_number:${sku.sku}`);
          if (sku.item_number && !exactItems.has(sku.item_number)) reasons.push(`sku_variant_not_owned:${sku.sku}`);
        }
      }
      if (reasons.length) {
        mismatches.push({
          id: card.id,
          reasons,
          local: { name: card.name, brand: card.brand, image_url: card.image_url },
          api: product ? {
            product_number: toStr(product.productNumber),
            name: toStr(product.productName),
            brand: toStr(product.productBrand),
          } : null,
        });
      }
    });
  }

  return {
    total_public_cards: count ?? cards.length,
    offset: safeOffset,
    checked: cards.length,
    next_offset: safeOffset + cards.length < (count ?? 0) ? safeOffset + cards.length : null,
    mismatch_count: mismatches.length,
    mismatches,
  };
}


// -------------------------------------------------------------- mapping ----

function mapProduct(row: any, assortmentId: string, seenProductNumbers: Set<string>): {
  style?: any; variants: any[]; skus: any[]; images: any[];
} {
  const pn = toStr(row.productNumber);
  if (!pn) return { variants: [], skus: [], images: [] };
  if (BLOCKED_PRODUCT_NUMBERS.has(pn)) return { variants: [], skus: [], images: [] };
  const brand = BRAND_NAMES.get((toStr(row.productBrand) ?? "").toLocaleLowerCase());
  if (!brand) return { variants: [], skus: [], images: [] };
  if (seenProductNumbers.has(pn)) return { variants: [], skus: [], images: [] };
  seenProductNumbers.add(pn);

  const style = {
    product_number: pn,
    name: toStr(row.productName) ?? pn,
    brand,
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
    assortment_ids: Array.from(new Set([
      assortmentId,
      ...(Array.isArray(row.productAssortment) ? row.productAssortment.map(toStr).filter(Boolean) : []),
    ])),
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

  (Array.isArray(row.variations) ? row.variations : []).forEach((v: any) => {
    const itemNumber = toStr(v.itemNumber);
    if (!itemNumber) return;
    const validSkus = (Array.isArray(v.skus) ? v.skus : []).filter((s: any) => {
      const skuProductNumber = toStr(s.productNumber);
      return !skuProductNumber || skuProductNumber === pn;
    });
    if (!validSkus.length) return;
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

    validSkus.forEach((s: any) => {
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
//
// Both phases are resumable. An edge function has a hard wall-clock limit, so
// every phase works inside a time budget, persists what it managed to do, and
// (with ?chain=1) re-invokes itself to continue where it stopped. That is why
// the nightly job no longer dies half way and leaves a "running" log behind.

const DEFAULT_BUDGET_MS = 50_000;
const overBudget = (startedAt: number, budgetMs: number) => Date.now() - startedAt > budgetMs;

const DISCOVERY_PRODUCTS = ["010177", "1900095", "351033", "641006"];

async function loadStoredAssortments(sb: SupabaseClient) {
  const rows: any[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await sb
      .from("nwg_assortments")
      .select("id, name, parent_id, raw")
      .order("id")
      .range(from, from + size - 1);
    if (error) throw new Error(`nwg_assortments read: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < size) break;
  }
  return rows;
}

async function seedAssortments(sb: SupabaseClient, startedAt: number, budgetMs: number) {
  const collected = new Map<string, any>();
  for (const productNumber of DISCOVERY_PRODUCTS) {
    const data = await gql<any>(Q_DISCOVER_ASSORTMENTS, { q: productNumber });
    for (const product of data.productSearch?.result ?? []) {
      for (const a of product.assortmentNodes ?? []) {
        const id = toStr(a.id);
        if (!id) continue;
        collected.set(id, { id, name: toStr(a.name), parent_id: toStr(a.parentId), raw: a });
      }
    }
    if (overBudget(startedAt, budgetMs)) break;
  }
  if (!collected.size) throw new Error("NWG returned no assortment nodes; catalog was left unchanged");
  await chunkUpsert(sb, "nwg_assortments", [...collected.values()], "id");

  // Expand the seeds page by page (also persisted incrementally).
  for (const seed of [...collected.values()]) {
    const assortmentId = toStr(seed.raw?.assortmentId);
    if (!assortmentId) continue;
    let page = 1;
    while (!overBudget(startedAt, budgetMs)) {
      const data = await gql<any>(Q_ASSORTMENT_PAGE, { assortmentId, lang: LANG, page, size: 100 });
      const res = data.assortment?.result ?? [];
      if (!res.length) break;
      const rows = res
        .map((a: any) => {
          const id = toStr(a.id) ?? toStr(a.assortmentId);
          return id ? { id, name: toStr(a.name), parent_id: toStr(a.parentId), raw: a } : null;
        })
        .filter(Boolean);
      if (rows.length) await chunkUpsert(sb, "nwg_assortments", rows as any[], "id");
      if (res.length < 100) break;
      page++;
      if (page > 100) break;
    }
    if (overBudget(startedAt, budgetMs)) break;
  }
  return collected.size;
}

async function discoverAssortmentsStep(sb: SupabaseClient, startedAt: number, budgetMs: number) {
  let stored = await loadStoredAssortments(sb);
  let seeded = 0;
  if (!stored.length) {
    seeded = await seedAssortments(sb, startedAt, budgetMs);
    stored = await loadStoredAssortments(sb);
  }

  const known = new Set(stored.map((r) => String(r.id)));
  const queued = new Set<string>();
  const pending: string[] = [];
  const enqueue = (raw: any) => {
    for (const child of Array.isArray(raw?.childNodeIds) ? raw.childNodeIds : []) {
      const id = toStr(child);
      if (id && !known.has(id) && !queued.has(id)) {
        queued.add(id);
        pending.push(id);
      }
    }
  };
  for (const row of stored) enqueue(row.raw);

  let fetched = 0;
  const batch: any[] = [];
  while (pending.length && !overBudget(startedAt, budgetMs)) {
    const id = pending.shift()!;
    if (known.has(id)) continue;
    known.add(id);
    let node: any = null;
    try {
      node = (await gql<any>(Q_ASSORTMENT_NODE, { id, lang: LANG })).assortmentNodeById;
    } catch (_) {
      node = null; // a single unreachable node must not kill the whole crawl
    }
    batch.push({
      id,
      name: toStr(node?.name),
      parent_id: toStr(node?.parentId),
      raw: node ?? { assortmentId: id },
    });
    fetched++;
    enqueue(node);
    if (batch.length >= 200) await chunkUpsert(sb, "nwg_assortments", batch.splice(0), "id");
  }
  if (batch.length) await chunkUpsert(sb, "nwg_assortments", batch, "id");

  return { seeded, fetched, total: known.size, pending_left: pending.length };
}

async function assortmentIdsForCrawl(sb: SupabaseClient, opts: { only?: string[]; full?: boolean }) {
  const stored = await loadStoredAssortments(sb);
  const all = Array.from(
    new Set(
      stored
        .map((node) => toStr(node.raw?.assortmentId) ?? toStr(node.id))
        .filter((id): id is string => Boolean(id)),
    ),
  ).sort();
  if (opts.only?.length) {
    const wanted = new Set(opts.only);
    const filtered = all.filter((id) => wanted.has(id));
    return { ids: filtered.length ? filtered : opts.only.slice(), narrowed: true };
  }
  if (!opts.full) {
    const productive = new Set(
      stored
        .filter((r: any) => toInt(r.raw?.partner_hits, 0) > 0)
        .map((r: any) => toStr(r.raw?.assortmentId) ?? toStr(r.id))
        .filter((id): id is string => Boolean(id)),
    );
    const filtered = all.filter((id) => productive.has(id));
    if (filtered.length) return { ids: filtered, narrowed: true };
  }
  return { ids: all, narrowed: false };
}

async function syncStyles(
  sb: SupabaseClient,
  assortmentIds: string[],
  opts: { startedAt: number; budgetMs: number },
) {
  const seen = new Set<string>();
  let styles: any[] = [];
  let variants: any[] = [];
  let skus: any[] = [];
  let images: any[] = [];

  const flush = async () => {
    if (styles.length) {
      // A metadata sync must not undo the website/contract audit. Preserve an
      // existing archived state; the price sync alone may restore a model after
      // the authoritative NWG website confirms it again.
      const productNumbers = styles.map((style) => style.product_number);
      const { data: existing, error } = await sb
        .from("nwg_styles")
        .select("product_number, published, archived, archived_at")
        .in("product_number", productNumbers);
      if (error) throw new Error(`nwg_styles visibility read: ${error.message}`);
      const visibility = new Map((existing ?? []).map((row: any) => [row.product_number, row]));
      styles = styles.map((style) => {
        const current = visibility.get(style.product_number);
        if (!current?.archived) return style;
        return {
          ...style,
          published: false,
          archived: true,
          archived_at: current.archived_at ?? new Date().toISOString(),
        };
      });
      await chunkUpsert(sb, "nwg_styles", styles, "product_number", 200);
    }
    if (variants.length) await chunkUpsert(sb, "nwg_variants", variants, "item_number");
    if (skus.length)     await chunkUpsert(sb, "nwg_skus", skus, "sku");
    if (images.length)   await chunkUpsert(sb, "nwg_images", images, "product_number,item_number,resource_file_id,picture_angle");
    styles = []; variants = []; skus = []; images = [];
  };

  let pagesFetched = 0;
  let processed = 0;
  const perAssortment: Record<string, { pages: number; count: number; partner_hits: number }> = {};

  for (const assortmentId of assortmentIds) {
    if (overBudget(opts.startedAt, opts.budgetMs)) break;
    let page = 1;
    let assortmentCount = 0;
    let assortmentPages = 0;
    let hits = 0;
    while (true) {
      const data = await gql<any>(Q_PRODUCTS_BY_ASSORTMENT, {
        lang: LANG, assortmentId, page, size: PAGE_SIZE,
      });
      const rows = data.productsByAssortmentId?.result ?? [];
      assortmentCount = data.productsByAssortmentId?.count ?? assortmentCount;
      if (!rows.length) break;
      for (const r of rows) {
        const m = mapProduct(r, assortmentId, seen);
        if (m.style) { styles.push(m.style); hits++; }
        variants.push(...m.variants);
        skus.push(...m.skus);
        images.push(...m.images);
      }
      pagesFetched++;
      assortmentPages++;

      if (styles.length >= 300 || variants.length >= 1500 || images.length >= 4000) {
        await flush();
      }
      if (rows.length < PAGE_SIZE) break;
      page++;
      if (page > 1000) throw new Error(`Pagination safety limit reached for assortment ${assortmentId}`);
    }
    perAssortment[assortmentId] = { pages: assortmentPages, count: assortmentCount, partner_hits: hits };
    processed++;
    await flush();
  }

  // Remember which assortments carried partner products.
  const memo = Object.entries(perAssortment).map(([id, s]) => ({
    id,
    raw: { assortmentId: id, partner_hits: s.partner_hits },
  }));
  if (memo.length) {
    const { data: existing } = await sb.from("nwg_assortments").select("id, name, parent_id, raw").in("id", memo.map((m) => m.id));
    const byId = new Map((existing ?? []).map((r: any) => [r.id, r]));
    const rows = memo.map((m) => {
      const prev = byId.get(m.id);
      return {
        id: m.id,
        name: prev?.name ?? null,
        parent_id: prev?.parent_id ?? null,
        raw: { ...(prev?.raw ?? {}), ...m.raw },
      };
    });
    await chunkUpsert(sb, "nwg_assortments", rows, "id");
  }

  return {
    pages_fetched: pagesFetched,
    assortments_processed: processed,
    unique_styles: seen.size,
    assortments: perAssortment,
  };
}

// Anything our brands still have locally but the full pass no longer returned
// is archived. Runs only after the last chunk of a full pass.
async function archiveStaleStyles(sb: SupabaseClient, sinceIso: string) {
  const { data: existing, error } = await sb
    .from("nwg_styles")
    .select("product_number, last_synced_at")
    .in("brand", ["Craft", "Craft AP", "Clique", "Clique Retail", "ProJob", "Cutter & Buck"])
    .eq("archived", false);
  if (error) throw new Error(`archive candidate fetch: ${error.message}`);
  const stale = (existing ?? [])
    .filter((row: any) => !row.last_synced_at || row.last_synced_at < sinceIso)
    .map((row: any) => toStr(row.product_number))
    .filter((pn): pn is string => Boolean(pn));
  for (let i = 0; i < stale.length; i += 200) {
    const { error: upErr } = await sb.from("nwg_styles").update({
      archived: true,
      archived_at: new Date().toISOString(),
    }).in("product_number", stale.slice(i, i + 200));
    if (upErr) throw new Error(`archive stale styles: ${upErr.message}`);
  }
  return stale.length;
}

/**
 * Continue the run in a fresh invocation. A plain fetch() is cancelled when this
 * worker shuts down, so the next step is dispatched from the database (pg_net),
 * which is independent of this function's lifetime.
 */
async function chainSelf(sb: any, params: Record<string, string>) {
  const qs = "?" + new URLSearchParams(params).toString();
  const { error } = await sb.rpc("invoke_sync_function", { fn: "nwg-sync", qs });
  if (error) console.error(`[nwg-sync] chain failed: ${error.message}`);
}

async function inspectApi(q?: string) {
  const schema = await gql<any>(`{
    __schema {
      queryType {
        name
        fields {
          name
          args { name type { kind name ofType { kind name } } }
          type { kind name ofType { kind name } }
        }
      }
    }
  }`);
  const query = q || "*";
  let sample: any = null;
  try {
    sample = await gql<any>(
      `query($q:String!){ productSearch(q:$q, language:"en", assortmentId:"", page:1, pageSize:2){ count result{ productNumber productName productBrand assortmentNodes { id name assortmentId parentId childNodeIds } retailPrice{ price currency } variations{ itemNumber skus{ sku productNumber prices{ currency salesPrice retailPrice priceList } retailPrice{ price currency } } } } } }`,
      { q: query },
    );
  } catch (e) {
    sample = { error: (e as Error).message };
  }
  let assortmentSample: any = null;
  if (q) {
    try {
      assortmentSample = await gql<any>(Q_PRODUCTS_BY_ASSORTMENT, {
        lang: LANG, assortmentId: q, page: 1, size: 2,
      });
    } catch (e) {
      assortmentSample = { error: (e as Error).message };
    }
  }
  const relevantFields = (schema?.__schema?.queryType?.fields ?? []).filter((field: any) =>
    /assort|product/i.test(field.name)
  );
  return { schemaOk: !!schema?.__schema, relevantFields, sample, assortmentSample };
}

// ------------------------------------------------------------------ handler

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ ok: false, error: "Backend configuration missing" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sb = createClient(supabaseUrl, serviceRoleKey);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "all").toLowerCase();
  const q = url.searchParams.get("q") || undefined;
  const only = (url.searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const full = url.searchParams.get("full") === "1";
  const chain = url.searchParams.get("chain") === "1";
  const offset = toInt(url.searchParams.get("offset"), 0);
  const auditLimit = toInt(url.searchParams.get("limit"), 500);
  const budgetMs = Math.max(10_000, Math.min(toInt(url.searchParams.get("budget"), DEFAULT_BUDGET_MS), 110_000));
  const since = url.searchParams.get("since");
  const startedAt = Date.now();

  const logId = await startLog(sb, `nwg:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "inspect") result.inspect = await inspectApi(q);
    if (mode === "audit") result.audit = await auditPublicCards(sb, offset, auditLimit);

    if (mode === "assortments" || mode === "all") {
      const step = await discoverAssortmentsStep(sb, startedAt, budgetMs);
      result.assortments = step;
      if (step.pending_left > 0) {
        // Discovery unfinished — continue it before touching products.
        if (chain) await chainSelf(sb, { mode: "assortments", chain: "1" });
        await finishLog(sb, logId, {
          status: "success",
          message: `NWG assortment discovery daļa pabeigta (atlicis ${step.pending_left})`,
          details: result,
        });
        return new Response(JSON.stringify({ ok: true, mode, result, continued: chain }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (mode === "styles" || mode === "all") {
      const { ids, narrowed } = await assortmentIdsForCrawl(sb, { only, full });
      if (!ids.length) throw new Error("No usable NWG assortment IDs; catalog was left unchanged");
      const passSince = since ?? new Date(startedAt).toISOString();
      const slice = ids.slice(offset);
      const crawl = await syncStyles(sb, slice, { startedAt, budgetMs });
      const nextOffset = offset + crawl.assortments_processed;
      const done = nextOffset >= ids.length;
      result.catalog = { ...crawl, narrowed, total_assortments: ids.length, offset, next_offset: done ? null : nextOffset };

      if (done) {
        if (!only.length) result.archived_styles = await archiveStaleStyles(sb, passSince);
        const { error: itemsError } = await sb.rpc("refresh_catalog_items_mv");
        if (itemsError) throw new Error(`catalog refresh: ${itemsError.message}`);
      } else if (chain) {
        await chainSelf(sb, { mode: "styles", chain: "1", offset: String(nextOffset), since: passSince });
      }
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
