// Falk&Ross (falk-ross.eu) sync — Build Your Brand + Flexfit only.
// mode=reset  : (re)builds the product queue from the brand listing pages
// mode=data   : processes pending queue items (login -> product page -> colour matrix), resumable
// mode=images : mirrors pending product images into our own storage, resumable
// Retail prices are derived in the DB (refresh_catalog_prices): partner price x 1.55.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASE = "https://www.falk-ross.eu";
const BUCKET = "falkross-images";
const BRANDS = [
  { slug: "Build-Your-Brand-", brand: "Build Your Brand" },
  { slug: "Flexfit-", brand: "Flexfit" },
];
const DATA_BUDGET_MS = 100_000;
const IMAGE_BUDGET_MS = 90_000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

/* ---------- small helpers ---------- */

const str = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};
const num = (v: unknown): number | null => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…" };
const decodeEnt = (s: string) =>
  s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d))).replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m);
const stripTags = (s: string) => s.replace(/<[^>]+>/g, "");
const htmlToText = (v: unknown): string | null => {
  if (!v) return null;
  const t = decodeEnt(String(v))
    .replace(/<\s*(br|\/p|\/li|\/div|\/P)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  return t || null;
};
const titleCase = (v: string | null) =>
  v ? v.toLowerCase().replace(/(^|[\s\-/(])([a-zà-ž])/g, (_, p, c) => p + c.toUpperCase()) : v;

const SIZE_RANK: Record<string, number> = {
  "XXS": 100, "XS": 110, "S/M": 145, "S": 150, "M": 160, "L": 170, "L/XL": 175, "XL": 180,
  "XXL": 190, "2XL": 195, "XXXL": 200, "3XL": 205, "4XL": 210, "5XL": 215, "6XL": 220,
  "ONE SIZE": 300, "OSFA": 300, "OS": 300, "UNI": 300,
};
const sizeRank = (s: string | null) => {
  if (!s) return 999;
  const u = s.toUpperCase().trim();
  if (u in SIZE_RANK) return SIZE_RANK[u];
  const n = parseFloat(u);
  return Number.isFinite(n) ? n : 500;
};
const uniqueSortedSizes = (sizes: Iterable<string>) =>
  [...new Set([...sizes].filter(Boolean))].sort((a, b) => sizeRank(a) - sizeRank(b) || a.localeCompare(b));

async function upsertChunked(sb: SupabaseClient, table: string, rows: any[], onConflict: string, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + size), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

/* ---------- JPEG colour chip -> average hex ---------- */

let jpegDecode: ((b: Uint8Array, o?: any) => { data: Uint8Array; width: number; height: number }) | null | undefined;
async function chipHex(url: string, cookieHeader: string | null): Promise<string | null> {
  try {
    if (jpegDecode === undefined) {
      try {
        const mod = await import("npm:jpeg-js@0.4.4");
        jpegDecode = (mod as any).decode ?? (mod as any).default?.decode ?? null;
      } catch {
        jpegDecode = null;
      }
    }
    if (!jpegDecode) return null;
    const res = await fetch(url, { headers: { "User-Agent": UA, ...(cookieHeader ? { Cookie: cookieHeader } : {}) } });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    const img = jpegDecode(bytes, { maxMemoryUsageInMB: 256 });
    if (!img?.data?.length) return null;
    const px = img.data;
    const n = px.length / 4;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < px.length; i += 4 * Math.max(1, Math.floor(n / 2000))) {
      // skip near-white/near-black borders so the printed label does not skew the average
      if (px[i] < 245 && (px[i] > 15 || px[i + 1] > 15 || px[i + 2] > 15)) {
        r += px[i]; g += px[i + 1]; b += px[i + 2]; count++;
      }
    }
    if (!count) return null;
    const hex = (v: number) => Math.round(v / count).toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  } catch {
    return null;
  }
}

/* ---------- Falk&Ross HTTP session ---------- */

class FrSession {
  cookies = new Map<string, string>([["anubis_bot_token", "verified_human_8832"]]);
  loggedIn = false;

  private cookieHeader(): string | null {
    const parts = [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`);
    return parts.length ? parts.join("; ") : null;
  }

  private consume(res: Response) {
    const raw = res.headers.get("set-cookie");
    if (!raw) return;
    // Deno exposes only the combined header; handle multiple cookies conservatively.
    for (const part of raw.split(/,(?=[^;]+?=)/)) {
      const seg = part.split(";")[0];
      const eq = seg.indexOf("=");
      if (eq <= 0) continue;
      const name = seg.slice(0, eq).trim();
      const value = seg.slice(eq + 1).trim();
      if (!value || value === "deleted") this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  async request(url: string, init: RequestInit = {}, referer = `${BASE}/en/`): Promise<Response> {
    const headers = new Headers(init.headers || {});
    headers.set("User-Agent", UA);
    headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    headers.set("Referer", referer);
    const ck = this.cookieHeader();
    if (ck) headers.set("Cookie", ck);
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, { ...init, headers, redirect: "follow" });
        this.consume(res);
        return res;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("F&R request failed");
  }

  async getText(url: string): Promise<string> {
    const res = await this.request(url);
    if (!res.ok) throw new Error(`F&R GET ${res.status}: ${url}`);
    return await res.text();
  }

  async postForm(url: string, fields: Record<string, string>, xhr = false, referer?: string): Promise<string> {
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };
    if (xhr) headers["X-Requested-With"] = "XMLHttpRequest";
    const res = await this.request(url, { method: "POST", headers, body: new URLSearchParams(fields).toString() }, referer);
    if (!res.ok) throw new Error(`F&R POST ${res.status}: ${url}`);
    return await res.text();
  }

  async login(): Promise<void> {
    const login_env = Deno.env.get("FALKROSS_LOGIN");
    const client_id = Deno.env.get("FALKROSS_CLIENT_ID");
    const pwd = Deno.env.get("FALKROSS_PASSWORD");
    if (!login_env || !client_id || !pwd) throw new Error("FALKROSS_* secrets missing");
    const html = await this.getText(`${BASE}/en/my-account/`);
    const stoken = /name="stoken" value="([^"]+)"/.exec(html)?.[1];
    if (!stoken) throw new Error("F&R login: stoken not found");
    const body = await this.postForm(`${BASE}/index.php?shp=1&lang=1&`, {
      stoken, lang: "1", listtype: "", actcontrol: "account",
      lgn_redirect_after: "/en/my-account/", fnc: "login_noredirect", cl: "account", pgNr: "0",
      CustomError: "loginBoxErrors", lgn_usr: login_env, lgn_kdn: client_id, lgn_pwd: pwd, lgn_cook: "1",
    });
    this.loggedIn = /logout/i.test(body);
    if (!this.loggedIn) throw new Error("F&R login failed");
  }
}

/* ---------- parsing ---------- */

interface Card { url: string; brand: string; mpn: string; title: string; }

function parseListing(html: string, brand: string): Card[] {
  const out: Card[] = [];
  const parts = html.split(/<a class="articleBoxImage/).slice(1);
  for (const part of parts) {
    const href = /href="([^"]+)"/.exec(part)?.[1];
    const mpn = /class="product_mpn"[^>]*>\s*([^<]+?)\s*</.exec(part)?.[1];
    const title = /class="product_title"[^>]*>\s*([^<]+?)\s*</.exec(part)?.[1];
    if (!href || !mpn) continue;
    const url = decodeEnt(href).split("?")[0].replace(/^http:/, "https:");
    out.push({ url, brand, mpn: mpn.trim(), title: decodeEnt(title || mpn).trim() });
  }
  return out;
}

function parseProductPage(html: string) {
  const formAction = decodeEnt(/<form class="js-oxProductForm" action="([^"]+)"/.exec(html)?.[1] ?? "") || undefined;
  const formFields: Record<string, string> = {};
  const formStart = html.indexOf("js-oxProductForm");
  if (formAction && formStart >= 0) {
    const seg = html.slice(formStart, formStart + 8000);
    for (const im of seg.matchAll(/<input[^>]*type="hidden"[^>]*>/g)) {
      const tag = im[0];
      const name = /name="([^"]+)"/.exec(tag)?.[1];
      const value = /value="([^"]*)"/.exec(tag)?.[1] ?? "";
      if (name && !(name in formFields)) formFields[name] = decodeEnt(value);
    }
  }
  const colors: { name: string; chipUrl: string; picturePath: string; zoomPath: string; sort: number }[] = [];
  const colorRe = /<a\s+data-picture-zoom="([^"]+)"\s+data-picture="([^"]+)"\s*data-seletion-name="([^"]+)"/g;
  for (const m of html.matchAll(colorRe)) {
    const name = decodeEnt(m[3]).trim();
    if (!name || colors.some((c) => c.name === name)) continue;
    const chip = html.slice(Math.max(0, m.index - 100), m.index + 900);
    const chipUrl = /<img src="(https:\/\/www\.falk-ross\.eu\/out\/pictures\/0\/[^"]+\.jpg)"/.exec(chip)?.[1]
      ?? /<img src="(\/out\/pictures\/0\/[^"]+\.jpg)"/.exec(chip)?.[1] ?? null;
    colors.push({
      name,
      chipUrl: chipUrl ?? "",
      picturePath: decodeEnt(m[2]).replace(/^https?:\/\/[^/]+/, ""),
      zoomPath: decodeEnt(m[1]).replace(/^https?:\/\/[^/]+/, ""),
      sort: colors.length,
    });
  }
  const readVar = (name: string): string | null => {
    const m = new RegExp(`var ${name} = '([\\s\\S]*?)';\\s*\\/\\/${name}`, "i").exec(html)
      ?? new RegExp(`var ${name} = '([\\s\\S]*?)';`, "i").exec(html);
    return m ? m[1].replace(/\\'/g, "'") : null;
  };
  const description = readVar("artdescription");
  const seo = readVar("seodescription");
  const featureLines = htmlToText(seo)?.split("\n") ?? [];
  const weight = featureLines.find((l) => /g\/m/i.test(l)) ?? null;
  const fabric = featureLines.find((l) => /\d+\s?%\s+\w+/i.test(l)) ?? null;
  return { formAction, formFields, colors, description, features: featureLines, weight, fabric };
}

interface MatrixLine { size: string; price: number | null; stock: number }

function parseMatrix(content: string): { sizes: string[]; lines: MatrixLine[] } {
  const rows = content.split(/<tr[\s>]/).map((r) => `<tr${r}`);
  const sizeTexts: string[] = [];
  for (const row of rows) {
    if (!row.includes("color_text first-column")) continue;
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => stripTags(decodeEnt(m[1])).replace(/\s+/g, " ").trim());
    sizeTexts.push(...tds.slice(1).filter((t) => t && !/quantity|menge/i.test(t)));
    break;
  }
  const lines: MatrixLine[] = [];
  const readNumericRow = (row: string, priceMode: boolean) => {
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    for (let i = 0; i < Math.min(sizeTexts.length, tds.length - 1); i++) {
      const cell = tds[i + 1];
      const val = priceMode ? num(/data-price="([\d.]+)"/.exec(cell)?.[1]) : num(stripTags(cell).replace(/[^\d.,]/g, "").replace(",", "."));
      lines.push({ size: sizeTexts[i], price: priceMode ? val : null, stock: priceMode ? 0 : Math.max(0, Math.trunc(val ?? 0)) });
    }
  };
  let warehouse: Record<string, number> = {};
  let supplier: Record<string, number> = {};
  for (const row of rows) {
    if (/first-column pricing/.test(row)) readNumericRow(row, true);
    else if (/onstock first-column/.test(row)) warehouse = rowStock(row);
    else if (/manufacturerstock first-column/.test(row)) supplier = rowStock(row);
  }
  function rowStock(row: string): Record<string, number> {
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
    const out: Record<string, number> = {};
    for (let i = 0; i < Math.min(sizeTexts.length, tds.length - 1); i++) {
      out[sizeTexts[i]] = Math.max(0, Math.trunc(num(stripTags(tds[i + 1]).replace(/[^\d]/g, "")) ?? 0));
    }
    return out;
  }
  const priceBySize = new Map<string, number | null>();
  for (const l of lines) if (l.price != null) priceBySize.set(l.size, l.price);
  return {
    sizes: sizeTexts,
    lines: sizeTexts.map((size) => ({ size, price: priceBySize.get(size) ?? null, stock: (warehouse[size] ?? 0) + (supplier[size] ?? 0) })),
  };
}

/* ---------- product processing ---------- */

async function processProduct(sb: SupabaseClient, fr: FrSession, card: Card): Promise<void> {
  const sep = card.url.includes("?") ? "&" : "?";
  const html = await fr.getText(`${card.url}${sep}shp=5&lang=1`);
  const page = parseProductPage(html);
  if (!page.formAction || !page.colors.length) throw new Error(`no form/colours on ${card.url}`);

  const styleRow = {
    style_code: card.mpn,
    brand: card.brand,
    name: titleCase(card.title) ?? card.mpn,
    description: htmlToText(page.description),
    details: page.features.length ? page.features.join("\n") : null,
    fabric: page.fabric,
    weight: page.weight ? page.weight.replace(/^[^0-9]*/, "").trim() || page.weight : null,
    sizes: null as string[] | null,
    published: true,
    last_synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const variantRows: any[] = [];
  const priceRows: any[] = [];
  const imageRows: any[] = [];
  const allSizes = new Set<string>();
  const freshSkus = new Set<string>();
  const chipHexCache = new Map<string, string | null>();
  const cookieHeader = fr["cookieHeader" as keyof FrSession] ? (fr as any).cookieHeader?.() ?? null : null;

  for (const color of page.colors) {
    const raw = await fr.postForm(page.formAction!, { ...page.formFields, ...colorFields(color.name) }, true, card.url);
    let parsed: { errors: unknown[]; content: string } | null = null;
    try { parsed = JSON.parse(raw); } catch { /* non-JSON */ }
    if (!parsed || (parsed.errors?.length ?? 0) > 0) continue;
    const matrix = parseMatrix(parsed.content);
    if (!matrix.lines.length) continue;
    for (const size of matrix.sizes) allSizes.add(size);
    if (!chipHexCache.has(color.chipUrl)) {
      chipHexCache.set(color.chipUrl, color.chipUrl ? await chipHex(color.chipUrl, cookieHeader) : null);
    }
    const hex = chipHexCache.get(color.chipUrl) ?? null;
    for (const line of matrix.lines) {
      if (!line.size) continue;
      const sku = `${card.mpn}::${color.name}::${line.size}`;
      freshSkus.add(sku);
      variantRows.push({
        sku, style_code: card.mpn, color_name: color.name, color_hex: hex, size: line.size,
        size_order: Math.round(sizeRank(line.size) * 10), stock: line.stock, active: true,
        updated_at: new Date().toISOString(),
      });
      if (line.price && line.price > 0) {
        priceRows.push({ sku, purchase_price: line.price, currency: "EUR", updated_at: new Date().toISOString() });
      }
    }
    if (color.zoomPath) {
      imageRows.push({
        style_code: card.mpn, color_name: color.name, source_path: color.zoomPath,
        sort_order: color.sort,
      });
    }
  }
  if (!variantRows.length) throw new Error(`no variants parsed on ${card.url}`);

  styleRow.sizes = uniqueSortedSizes(allSizes);
  await sb.from("falkross_styles").upsert(styleRow, { onConflict: "style_code" });
  await upsertChunked(sb, "falkross_variants", variantRows, "sku", 500);
  await upsertChunked(sb, "falkross_prices", priceRows, "sku", 500);
  for (let i = 0; i < imageRows.length; i += 500) {
    const { error } = await sb.from("falkross_images").upsert(imageRows.slice(i, i + 500), { onConflict: "style_code,source_path", ignoreDuplicates: true });
    if (error) throw new Error(`falkross_images: ${error.message}`);
  }
  // Retire variants of this style that no longer exist on the supplier page.
  const { data: existing } = await sb.from("falkross_variants").select("sku").eq("style_code", card.mpn).eq("active", true);
  const stale = (existing ?? []).map((v: any) => v.sku).filter((s: string) => !freshSkus.has(s));
  for (let i = 0; i < stale.length; i += 200) {
    await sb.from("falkross_variants").update({ active: false }).in("sku", stale.slice(i, i + 200));
  }
}

function colorFields(colorName: string): Record<string, string> {
  return { fnc: "", mlinesID: "1", renderPartial: "newMatrixLine", renderNewid: "1", renderColor: colorName, listtype: "search" };
}

/* ---------- modes ---------- */

async function buildQueue(sb: SupabaseClient, fr: FrSession): Promise<number> {
  let total = 0;
  for (const { slug, brand } of BRANDS) {
    const seen = new Set<string>();
    for (let page = 0; page < 40; page++) {
      const u = page === 0
        ? `${BASE}/en/Brands/${slug}/?shp=5&lang=1`
        : `${BASE}/en/Brands/${slug}/pgNr-${page}/?shp=5&lang=1`;
      const cards = parseListing(await fr.getText(u), brand).filter((c) => !seen.has(c.url));
      if (!cards.length) break;
      cards.forEach((c) => seen.add(c.url));
      const rows = cards.map((c) => ({
        url: c.url, brand: c.brand, mpn: c.mpn, title: c.title,
        done: false, attempts: 0, updated_at: new Date().toISOString(),
      }));
      const { error } = await sb.from("falkross_queue").upsert(rows, { onConflict: "url" });
      if (error) throw new Error(`falkross_queue: ${error.message}`);
      total += rows.length;
      if (cards.length < 12) break;
    }
  }
  return total;
}

async function syncData(sb: SupabaseClient): Promise<Record<string, unknown>> {
  const fr = new FrSession();
  await fr.login();
  const started = Date.now();
  let processed = 0, failed = 0;
  const failures: string[] = [];
  for (;;) {
    const { data: batch, error } = await sb
      .from("falkross_queue")
      .select("url,brand,mpn,title,attempts")
      .eq("done", false)
      .lt("attempts", 3)
      .order("url")
      .limit(4);
    if (error) throw new Error(`falkross_queue: ${error.message}`);
    if (!batch?.length) break;
    for (const item of batch as any[]) {
      const card: Card = { url: item.url, brand: item.brand, mpn: item.mpn, title: item.title ?? item.mpn };
      try {
        await processProduct(sb, fr, card);
        await sb.from("falkross_queue").update({ done: true, attempts: item.attempts + 1, updated_at: new Date().toISOString() }).eq("url", item.url);
        processed++;
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        failures.push(`${item.mpn}: ${msg.slice(0, 120)}`);
        console.warn(`[falkross-sync] ${item.mpn}: ${msg}`);
        await sb.from("falkross_queue").update({ attempts: item.attempts + 1, updated_at: new Date().toISOString() }).eq("url", item.url);
      }
      if (Date.now() - started > DATA_BUDGET_MS) break;
    }
    if (Date.now() - started > DATA_BUDGET_MS) break;
  }

  const { count: pending } = await sb.from("falkross_queue").select("url", { count: "exact", head: true }).eq("done", false).lt("attempts", 3);

  let retiredStyles = 0;
  if (!pending) {
    // Everything processed: retire styles the supplier no longer lists.
    const { data: queueRows } = await sb.from("falkross_queue").select("mpn");
    const codes = new Set((queueRows ?? []).map((r: any) => r.mpn));
    const { data: published } = await sb.from("falkross_styles").select("style_code").eq("published", true);
    const retire = (published ?? []).map((s: any) => s.style_code).filter((c: string) => !codes.has(c));
    for (let i = 0; i < retire.length; i += 200) {
      await sb.from("falkross_styles").update({ published: false }).in("style_code", retire.slice(i, i + 200));
    }
    retiredStyles = retire.length;
    const { error: refreshError } = await sb.rpc("refresh_catalog_prices");
    if (refreshError) throw new Error(`refresh_catalog_prices: ${refreshError.message}`);
    continueImages();
  }

  return { processed, failed, pending: pending ?? 0, retired_styles: retiredStyles, failures: failures.slice(0, 10) };
}

async function mirrorImages(sb: SupabaseClient): Promise<Record<string, unknown>> {
  const fr = new FrSession(); // images are public assets; still send the anti-bot cookie
  const started = Date.now();
  const publicBase = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}`;
  let done = 0, failed = 0;
  for (;;) {
    const { data: batch, error } = await sb
      .from("falkross_images")
      .select("id,style_code,color_name,source_path")
      .is("url", null)
      .is("failed_at", null)
      .order("id")
      .limit(8);
    if (error) throw new Error(`falkross_images: ${error.message}`);
    if (!batch?.length) break;
    await Promise.all((batch as any[]).map(async (img) => {
      const src = `${BASE}${img.source_path}`;
      const path = `${img.style_code}/${(img.color_name || "default").replace(/[^\w-]+/g, "_")}.jpg`;
      try {
        const res = await fetch(src, { headers: { "User-Agent": UA, Cookie: "anubis_bot_token=verified_human_8832" } });
        if (res.status === 404) {
          await sb.from("falkross_images").update({ failed_at: new Date().toISOString() }).eq("id", img.id);
          failed++;
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const type = res.headers.get("content-type") || "image/jpeg";
        const up = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: type, upsert: true, cacheControl: "31536000" });
        if (up.error) throw new Error(up.error.message);
        await sb.from("falkross_images").update({ url: `${publicBase}/${path}` }).eq("id", img.id);
        done++;
      } catch (e) {
        console.warn(`[falkross-sync] image ${path}: ${e instanceof Error ? e.message : e}`);
      }
    }));
    if (Date.now() - started > IMAGE_BUDGET_MS) break;
  }
  const { count } = await sb.from("falkross_images").select("id", { count: "exact", head: true }).is("url", null).is("failed_at", null);
  return { mirrored: done, failed, remaining: count ?? 0 };
}

function continueImages() {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/falkross-sync?mode=images`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const p = fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: "{}" })
    .then((r) => r.body?.cancel())
    .catch(() => {});
  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime?.waitUntil?.(p);
}

function continueData() {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/falkross-sync?mode=data`;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const p = fetch(url, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: "{}" })
    .then((r) => r.body?.cancel())
    .catch(() => {});
  // deno-lint-ignore no-explicit-any
  (globalThis as any).EdgeRuntime?.waitUntil?.(p);
}

async function isAllowed(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  // Scheduled calls may carry an older-format service key: verify it by an admin-only call.
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, token, { auth: { persistSession: false } });
    const { error } = await svc.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) return true;
  } catch { /* not a service key */ }
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await userClient.auth.getUser(token);
  if (!data?.user) return false;
  const { data: ok } = await userClient.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
  return ok === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!(await isAllowed(req))) return json({ ok: false, error: "Unauthorized" }, 401);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const mode = (new URL(req.url).searchParams.get("mode") || "data").toLowerCase();
  const { data: log } = await sb.from("sync_logs").insert({ source: `falkross:${mode}`, status: "running" }).select("id").single();
  const finish = (patch: Record<string, unknown>) =>
    log?.id ? sb.from("sync_logs").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", log.id) : Promise.resolve();

  try {
    if (mode === "reset") {
      const fr = new FrSession();
      await fr.login();
      const queued = await buildQueue(sb, fr);
      const { count: pending } = await sb.from("falkross_queue").select("url", { count: "exact", head: true }).eq("done", false).lt("attempts", 3);
      await finish({ status: "success", message: `Rinda: ${queued}, gaida apstrādi ${pending ?? 0}`, details: { queued, pending } });
      if ((pending ?? 0) > 0) continueData();
      return json({ ok: true, mode, queued, pending });
    }
    if (mode === "images") {
      const result = await mirrorImages(sb);
      if (result.remaining > 0) continueImages();
      await finish({ status: "success", message: `Bildes: +${result.mirrored}, atlikušas ${result.remaining}`, products_updated: result.mirrored, details: result });
      return json({ ok: true, mode, result });
    }
    const result = await syncData(sb);
    await finish({ status: "success", message: `Falk&Ross apstrādāts ${result.processed}, atlikušas ${result.pending}`, products_updated: result.processed, products_failed: result.failed, details: result });
    if (result.pending > 0) continueData();
    return json({ ok: true, mode, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finish({ status: "error", message: msg });
    return json({ ok: false, mode, error: msg }, 500);
  }
});
