// UTT Europe Data Export API sync — Gildan, Kariban, Regatta only.
// mode=data   : styles, variants, stock, buying prices → refresh catalog prices, then starts image mirroring
// mode=images : mirrors pending product images into our own storage (UTT forbids hotlinking), resumable
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BRANDS = ["Gildan", "Kariban", "Regatta"];
const IMG_BASE = "https://utteam.com/utt_img/product_images/1280";
const BUCKET = "utt-images";
const IMAGE_BUDGET_MS = 100_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

async function uttExport(action: string, fields: string[]): Promise<any[]> {
  const key = Deno.env.get("UTT_API_KEY");
  if (!key) throw new Error("UTT_API_KEY missing");
  const body = new URLSearchParams({
    action,
    format: "json",
    variables: `brand:${BRANDS.join(",")}`,
    fields: fields.join(","),
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://utteam.com/api/dataexport/${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get("Retry-After") || "35");
      await new Promise((r) => setTimeout(r, Math.min(wait, 40) * 1000));
      continue;
    }
    const text = await res.text();
    if (!res.ok) throw new Error(`UTT ${action} HTTP ${res.status}: ${text.slice(0, 200)}`);
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error(`UTT ${action}: unexpected response`);
    return data;
  }
  throw new Error(`UTT ${action}: rate limited`);
}

const str = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" || s.toLowerCase() === "none" ? null : s;
};
const num = (v: unknown): number | null => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", reg: "®", trade: "™", deg: "°" };
const htmlToText = (v: unknown): string | null => {
  const s = str(v);
  if (!s) return null;
  const t = s
    .replace(/<\s*(br|\/li|\/p|\/div)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&([a-z]+);/gi, (m, e) => ENT[e.toLowerCase()] ?? m)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
  return t || null;
};
const titleCase = (v: string | null) =>
  v ? v.toLowerCase().replace(/(^|[\s\-/(])([a-zà-ž])/g, (_, p, c) => p + c.toUpperCase()) : v;

const SIZE_RANK = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL"];
const sizeRank = (s: string | null) => {
  if (!s) return 999;
  const u = s.toUpperCase();
  const i = SIZE_RANK.indexOf(u);
  if (i >= 0) return 100 + i;
  const n = parseFloat(u);
  return Number.isFinite(n) ? n : 500;
};

async function upsertChunked(sb: SupabaseClient, table: string, rows: any[], onConflict: string, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await sb.from(table).upsert(rows.slice(i, i + size), { onConflict });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}

async function selectAll(sb: SupabaseClient, table: string, columns: string, filter?: (q: any) => any) {
  const out: any[] = [];
  for (let from = 0; ; from += 1000) {
    let q = sb.from(table).select(columns).range(from, from + 999);
    if (filter) q = filter(q);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function syncData(sb: SupabaseClient) {
  const [styles, products, stock] = await Promise.all([
    uttExport("style", ["style", "brand", "shortdesc_en", "longdesc_en", "gsmweight", "gender_en", "category_en", "fabric_en", "cut_en", "details_en", "carelabels_en", "sizes", "isnew"]),
    uttExport("product", ["sku", "style", "brand", "colorname", "colorhex", "size", "modelimageurl", "colorimageurl", "packshotimageurl"]),
    uttExport("stock", ["sku", "style", "price", "specialprice", "currency", "uttstock", "suppstock"]),
  ]);
  const now = new Date().toISOString();

  const styleRows = new Map<string, any>();
  for (const s of styles) {
    const code = str(s.style);
    const brand = str(s.brand);
    if (!code || !brand || !BRANDS.includes(brand)) continue;
    styleRows.set(code, {
      style_code: code,
      brand,
      name: titleCase(str(s.shortdesc_en)) ?? code,
      description: htmlToText(s.longdesc_en),
      category: str(s.category_en),
      gender: str(s.gender_en),
      fabric: htmlToText(s.fabric_en),
      weight: str(s.gsmweight) ? `${str(s.gsmweight)} g/m²` : null,
      cut: str(s.cut_en),
      details: htmlToText(s.details_en),
      care: htmlToText(s.carelabels_en),
      sizes: str(s.sizes) ? String(s.sizes).split(/[,;]/).map((x) => x.trim()).filter(Boolean) : null,
      is_new: String(s.isnew) === "1",
      published: true,
      last_synced_at: now,
    });
  }

  const stockBySku = new Map<string, any>();
  for (const s of stock) if (str(s.sku)) stockBySku.set(String(s.sku), s);

  const variantRows: any[] = [];
  const priceRows: any[] = [];
  const imageRows = new Map<string, any>();
  for (const p of products) {
    const sku = str(p.sku);
    const code = str(p.style);
    if (!sku || !code || !styleRows.has(code)) continue;
    const st = stockBySku.get(sku);
    const color = str(p.colorname);
    variantRows.push({
      sku,
      style_code: code,
      color_name: color,
      color_hex: str(p.colorhex),
      size: str(p.size),
      size_order: Math.round(sizeRank(str(p.size)) * 10),
      stock: Math.max(0, Math.trunc(num(st?.uttstock) ?? 0)) + Math.max(0, Math.trunc(num(st?.suppstock) ?? 0)),
      active: true,
      updated_at: now,
    });
    const price = num(st?.price);
    if (price && price > 0) {
      priceRows.push({ sku, purchase_price: price, special_price: num(st?.specialprice), currency: str(st?.currency) ?? "EUR", updated_at: now });
    }
    const model = str(p.modelimageurl);
    if (model) {
      const k = `${code}|${model}`;
      if (!imageRows.has(k)) imageRows.set(k, { style_code: code, color_name: null, source_path: model, sort_order: 0 });
    }
    for (const [path, order] of [[str(p.packshotimageurl), 10], [str(p.colorimageurl), 11]] as const) {
      if (!path) continue;
      const k = `${code}|${path}`;
      if (!imageRows.has(k)) imageRows.set(k, { style_code: code, color_name: color, source_path: path, sort_order: order });
    }
  }

  await upsertChunked(sb, "utt_styles", [...styleRows.values()], "style_code", 200);
  await upsertChunked(sb, "utt_variants", variantRows, "sku");
  await upsertChunked(sb, "utt_prices", priceRows, "sku");
  // Only new image paths are inserted; already mirrored ones keep their URL.
  const imgs = [...imageRows.values()];
  for (let i = 0; i < imgs.length; i += 500) {
    const { error } = await sb.from("utt_images").upsert(imgs.slice(i, i + 500), { onConflict: "style_code,source_path", ignoreDuplicates: true });
    if (error) throw new Error(`utt_images: ${error.message}`);
  }

  // Retire what UTT no longer sells.
  const seenSkus = new Set(variantRows.map((v) => v.sku));
  const oldVariants = await selectAll(sb, "utt_variants", "sku", (q) => q.eq("active", true));
  const retire = oldVariants.map((v) => v.sku).filter((s) => !seenSkus.has(s));
  for (let i = 0; i < retire.length; i += 200) {
    await sb.from("utt_variants").update({ active: false }).in("sku", retire.slice(i, i + 200));
  }
  const oldStyles = await selectAll(sb, "utt_styles", "style_code", (q) => q.eq("published", true));
  const retireStyles = oldStyles.map((s) => s.style_code).filter((c) => !styleRows.has(c));
  for (let i = 0; i < retireStyles.length; i += 200) {
    await sb.from("utt_styles").update({ published: false }).in("style_code", retireStyles.slice(i, i + 200));
  }

  const { error: refreshError } = await sb.rpc("refresh_catalog_prices");
  if (refreshError) throw new Error(`refresh_catalog_prices: ${refreshError.message}`);

  return {
    styles: styleRows.size,
    variants: variantRows.length,
    prices: priceRows.length,
    images: imgs.length,
    retired_variants: retire.length,
    retired_styles: retireStyles.length,
  };
}

async function mirrorImages(sb: SupabaseClient) {
  const started = Date.now();
  const publicBase = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}`;
  let done = 0, failed = 0;
  while (Date.now() - started < IMAGE_BUDGET_MS) {
    const { data: batch, error } = await sb
      .from("utt_images")
      .select("id,source_path")
      .is("url", null)
      .is("failed_at", null)
      .order("id")
      .limit(24);
    if (error) throw new Error(`utt_images: ${error.message}`);
    if (!batch?.length) break;
    await Promise.all(batch.map(async (img: any) => {
      const path = String(img.source_path).replace(/^\/+/, "");
      try {
        const res = await fetch(`${IMG_BASE}/${path}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const type = res.headers.get("content-type") || "image/jpeg";
        const up = await sb.storage.from(BUCKET).upload(path, bytes, { contentType: type, upsert: true, cacheControl: "31536000" });
        if (up.error) throw new Error(up.error.message);
        await sb.from("utt_images").update({ url: `${publicBase}/${path}` }).eq("id", img.id);
        done++;
      } catch (_) {
        await sb.from("utt_images").update({ failed_at: new Date().toISOString() }).eq("id", img.id);
        failed++;
      }
    }));
  }
  const { count } = await sb.from("utt_images").select("id", { count: "exact", head: true }).is("url", null).is("failed_at", null);
  return { mirrored: done, failed, remaining: count ?? 0 };
}

function continueImages() {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/utt-sync?mode=images`;
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
  const { data: log } = await sb.from("sync_logs").insert({ source: `utt:${mode}`, status: "running" }).select("id").single();
  const finish = (patch: Record<string, unknown>) =>
    log?.id ? sb.from("sync_logs").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", log.id) : Promise.resolve();

  try {
    if (mode === "images") {
      const result = await mirrorImages(sb);
      if (result.remaining > 0 && result.mirrored + result.failed > 0) continueImages();
      else await sb.rpc("refresh_catalog_prices");
      await finish({ status: "success", message: `Bildes: +${result.mirrored}, atlikušas ${result.remaining}`, products_updated: result.mirrored, products_failed: result.failed, details: result });
      return json({ ok: true, mode, result });
    }
    const result = await syncData(sb);
    await finish({ status: "success", message: "UTT sync ok", products_updated: result.variants, details: result });
    continueImages();
    return json({ ok: true, mode, result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finish({ status: "error", message: msg });
    return json({ ok: false, mode, error: msg }, 500);
  }
});
