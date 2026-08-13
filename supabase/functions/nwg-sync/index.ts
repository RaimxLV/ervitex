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

async function syncAssortments(sb: SupabaseClient) {
  const collected = new Map<string, any>();
  const queuedNodeIds: string[] = [];
  const visitedNodeIds = new Set<string>();
  const discoveryProducts = ["010177", "1900095", "351033", "641006"];
  for (const productNumber of discoveryProducts) {
    const data = await gql<any>(Q_DISCOVER_ASSORTMENTS, { q: productNumber });
    for (const product of data.productSearch?.result ?? []) {
      for (const a of product.assortmentNodes ?? []) {
        const id = toStr(a.id);
        if (!id) continue;
        collected.set(id, {
          id,
          name: toStr(a.name),
          parent_id: toStr(a.parentId),
          raw: a,
        });
        queuedNodeIds.push(id);
        for (const childId of Array.isArray(a.childNodeIds) ? a.childNodeIds : []) {
          const child = toStr(childId);
          if (child) queuedNodeIds.push(child);
        }
      }
    }
  }
  for (const seed of [...collected.values()]) {
    const assortmentId = toStr(seed.raw?.assortmentId);
    if (!assortmentId) continue;
    let page = 1;
    while (true) {
      const data = await gql<any>(Q_ASSORTMENT_PAGE, { assortmentId, lang: LANG, page, size: 100 });
      const res = data.assortment?.result ?? [];
      if (!res.length) break;
      for (const a of res) {
      const id = toStr(a.id) ?? toStr(a.assortmentId);
      if (!id) continue;
      collected.set(id, {
        id,
        name: toStr(a.name),
        parent_id: toStr(a.parentId),
        raw: a,
      });
      for (const childId of Array.isArray(a.childNodeIds) ? a.childNodeIds : []) {
        const child = toStr(childId);
        if (child) queuedNodeIds.push(child);
      }
      }
      if (res.length < 100) break;
      page++;
      if (page > 100) break;
    }
  }
  while (queuedNodeIds.length) {
    const nodeId = queuedNodeIds.shift();
    if (!nodeId || visitedNodeIds.has(nodeId)) continue;
    visitedNodeIds.add(nodeId);
    const data = await gql<any>(Q_ASSORTMENT_NODE, { id: nodeId, lang: LANG });
    const a = data.assortmentNodeById;
    if (!a) continue;
    const id = toStr(a.id) ?? toStr(a.assortmentId) ?? nodeId;
    collected.set(id, {
      id,
      name: toStr(a.name),
      parent_id: toStr(a.parentId),
      raw: a,
    });
    for (const childId of Array.isArray(a.childNodeIds) ? a.childNodeIds : []) {
      const child = toStr(childId);
      if (child && !visitedNodeIds.has(child)) queuedNodeIds.push(child);
    }
  }

  const rows = [...collected.values()];
  if (!rows.length) throw new Error("NWG returned no assortment nodes; catalog was left unchanged");
  await chunkUpsert(sb, "nwg_assortments", rows, "id");
  return rows;
}

async function syncStyles(
  sb: SupabaseClient,
  assortmentNodes: any[],
  opts: { only?: string[]; full?: boolean } = {},
) {
  const seen = new Set<string>();
  let styles: any[] = [];
  let variants: any[] = [];
  let skus: any[] = [];
  let images: any[] = [];

  const flush = async () => {
    if (styles.length)   await chunkUpsert(sb, "nwg_styles", styles, "product_number", 200);
    if (variants.length) await chunkUpsert(sb, "nwg_variants", variants, "item_number");
    if (skus.length)     await chunkUpsert(sb, "nwg_skus", skus, "sku");
    if (images.length)   await chunkUpsert(sb, "nwg_images", images, "product_number,item_number,resource_file_id,picture_angle");
    styles = []; variants = []; skus = []; images = [];
  };

  let pagesFetched = 0;
  const perAssortment: Record<string, { pages: number; count: number; partner_hits: number }> = {};
  let assortmentIds = Array.from(new Set(assortmentNodes
    .map((node) => toStr(node.raw?.assortmentId) ?? toStr(node.id))
    .filter((id): id is string => Boolean(id))));
  if (!assortmentIds.length) throw new Error("No usable NWG assortment IDs; catalog was left unchanged");

  // Only crawl assortments that actually contain our partner brands. The list is
  // learned on the first (full) run and cached in nwg_assortments.raw.partner_hits,
  // so later runs skip the rest of the NWG tree entirely.
  let narrowed = false;
  if (opts.only?.length) {
    const wanted = new Set(opts.only);
    assortmentIds = assortmentIds.filter((id) => wanted.has(id));
    if (!assortmentIds.length) assortmentIds = opts.only.slice();
    narrowed = true;
  } else if (!opts.full) {
    const { data } = await sb.from("nwg_assortments").select("id, raw");
    const productive = (data ?? [])
      .filter((r: any) => toInt(r.raw?.partner_hits, 0) > 0)
      .map((r: any) => toStr(r.raw?.assortmentId) ?? toStr(r.id))
      .filter((id): id is string => Boolean(id));
    if (productive.length) {
      const set = new Set(productive);
      const filtered = assortmentIds.filter((id) => set.has(id));
      if (filtered.length) { assortmentIds = filtered; narrowed = true; }
    }
  }

  for (const assortmentId of assortmentIds) {
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

  if (!seen.size) throw new Error("NWG assortments returned no supported products; catalog was left unchanged");



  let stale: string[] = [];
  if (!opts.only?.length) {
    const { data: existing, error: existingError } = await sb
      .from("nwg_styles")
      .select("product_number")
      .in("brand", ["Craft", "Craft AP", "Clique", "Clique Retail", "ProJob", "Cutter & Buck"])
      .eq("archived", false);
    if (existingError) throw new Error(`archive candidate fetch: ${existingError.message}`);
    stale = (existing ?? []).map((row: any) => toStr(row.product_number)).filter((pn): pn is string => Boolean(pn) && !seen.has(pn));
    for (let i = 0; i < stale.length; i += 200) {
      const { error } = await sb.from("nwg_styles").update({
        archived: true,
        archived_at: new Date().toISOString(),
      }).in("product_number", stale.slice(i, i + 200));
      if (error) throw new Error(`archive stale styles: ${error.message}`);
    }
  }

  return {
    pages_fetched: pagesFetched,
    narrowed,
    assortments_crawled: assortmentIds.length,
    unique_styles: seen.size,
    archived_styles: stale.length,
    assortments: perAssortment,
  };

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
  const auditOffset = toInt(url.searchParams.get("offset"), 0);
  const auditLimit = toInt(url.searchParams.get("limit"), 500);


  const logId = await startLog(sb, `nwg:${mode}`);
  const result: Record<string, unknown> = {};

  try {
    if (mode === "inspect") result.inspect = await inspectApi(q);
    if (mode === "audit") result.audit = await auditPublicCards(sb, auditOffset, auditLimit);
    let assortmentNodes: any[] | null = null;
    if (mode === "assortments" || mode === "styles" || mode === "all") {
      assortmentNodes = await syncAssortments(sb);
      result.assortments = assortmentNodes.length;
    }
    if (mode === "styles" || mode === "all") {
      if (!assortmentNodes) throw new Error("NWG assortment discovery failed");
      result.catalog = await syncStyles(sb, assortmentNodes, { only, full });
      const { error: itemsError } = await sb.rpc("refresh_catalog_items_mv");
      if (itemsError) throw new Error(`catalog refresh: ${itemsError.message}`);
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
