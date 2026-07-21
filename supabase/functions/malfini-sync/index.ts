// Malfini B2B API sync — imports styles, variants, images, prices and stock.
// Retail price = wholesale × 1.65 (same formula as Beechfield / PF Concept).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const API = "https://api.malfini.com/api/v4";
const MARKUP = 1.65;

async function login(): Promise<string> {
  const res = await fetch(`${API}/api-auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: Deno.env.get("MALFINI_USERNAME"),
      password: Deno.env.get("MALFINI_PASSWORD"),
    }),
  });
  if (!res.ok) throw new Error(`Login failed HTTP ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return j.access_token as string;
}

async function api<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const started = new Date().toISOString();
  const log = (msg: string) => console.log(`[malfini-sync] ${msg}`);

  try {
    log("Logging in…");
    const token = await login();

    log("Fetching product catalogue…");
    const products = await api<any[]>(token, "/product");
    log(`Got ${products.length} products`);

    log("Fetching wholesale prices…");
    const wholesale = await api<any[]>(token, "/product/prices");
    const wMap = new Map<string, { price: number; currency: string }>();
    for (const p of wholesale) {
      const cur = wMap.get(p.productSizeCode);
      if (!cur || Number(p.price) < cur.price) {
        wMap.set(p.productSizeCode, { price: Number(p.price), currency: p.currency || "EUR" });
      }
    }
    log(`Wholesale prices: ${wMap.size}`);

    log("Fetching recommended prices…");
    const recommended = await api<any[]>(token, "/product/recommended-prices").catch(() => []);
    const rMap = new Map<string, { price: number; currency: string }>();
    for (const p of recommended) {
      rMap.set(p.productSizeCode, { price: Number(p.price), currency: p.currency || "EUR" });
    }

    log("Fetching stock availabilities…");
    const stock = await api<any[]>(token, "/product/availabilities").catch(() => []);
    log(`Stock rows: ${stock.length}`);

    // Build rows
    const styleRows: any[] = [];
    const variantRows: any[] = [];
    const imageRows: any[] = [];
    const priceRows: any[] = [];
    const stockRows: any[] = [];

    for (const p of products) {
      styleRows.push({
        style_code: String(p.code),
        name: p.name || null,
        category_code: p.categoryCode || null,
        category_name: p.categoryName || null,
        gender: p.gender || null,
        gender_code: p.genderCode || null,
        trademark: p.trademark || null,
        type: p.type || null,
        subtitle: p.subtitle || null,
        specification: p.specification || null,
        description: p.description || null,
        product_card_pdf: p.productCardPdf || null,
        size_chart_pdf: p.sizeChartPdf || null,
        alternatives: p.alternatives || null,
        raw: p,
      });
      for (const v of p.variants || []) {
        const colorCode = v.colorCode ?? null;
        // Images: attached to color, not size
        for (const [idx, im] of (v.images || []).entries()) {
          if (!im?.link) continue;
          imageRows.push({
            style_code: String(p.code),
            color_code: colorCode,
            view_code: im.viewCode || null,
            url: im.link,
            sort_order: idx,
          });
        }
        for (const n of v.nomenclatures || []) {
          const sku = String(n.productSizeCode);
          variantRows.push({
            sku,
            style_code: String(p.code),
            color_code: colorCode,
            color_name: v.name || null,
            color_icon_link: v.colorIconLink || null,
            size: n.size || null,
            size_code: n.sizeCode || null,
            size_name: n.sizeName || null,
            ean: n.ean || null,
            attributes: v.attributes || null,
          });
          const w = wMap.get(sku);
          const r = rMap.get(sku);
          if (w || r) {
            const retail = w ? Number((w.price * MARKUP).toFixed(4)) : null;
            priceRows.push({
              sku,
              wholesale_price: w?.price ?? null,
              retail_price: retail,
              suggested_retail_price: r?.price ?? null,
              currency: w?.currency || r?.currency || "EUR",
            });
          }
        }
      }
    }
    for (const s of stock) {
      stockRows.push({
        sku: String(s.productSizeCode),
        quantity: Number(s.quantity) || 0,
        as_of_date: s.date ? s.date.slice(0, 10) : null,
      });
    }

    log(`Prepared: styles=${styleRows.length} variants=${variantRows.length} images=${imageRows.length} prices=${priceRows.length} stock=${stockRows.length}`);

    const upsertChunked = async (table: string, rows: any[], onConflict: string) => {
      const CHUNK = 500;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        const { error } = await admin.from(table).upsert(slice, { onConflict });
        if (error) throw new Error(`${table} upsert: ${error.message}`);
      }
    };

    await upsertChunked("mf_styles", styleRows, "style_code");
    await upsertChunked("mf_variants", variantRows, "sku");
    // For images we don't have a stable id — clear per-style then insert
    // Simpler: delete all then reinsert in batches
    const styleCodes = styleRows.map((s) => s.style_code);
    for (let i = 0; i < styleCodes.length; i += 200) {
      const slice = styleCodes.slice(i, i + 200);
      await admin.from("mf_images").delete().in("style_code", slice);
    }
    for (let i = 0; i < imageRows.length; i += 1000) {
      const slice = imageRows.slice(i, i + 1000);
      const { error } = await admin.from("mf_images").insert(slice);
      if (error) throw new Error(`mf_images insert: ${error.message}`);
    }
    await upsertChunked("mf_prices", priceRows, "sku");
    if (stockRows.length) await upsertChunked("mf_stock", stockRows, "sku");

    log("Refreshing public retail prices…");
    await admin.rpc("refresh_mf_public_retail_prices");

    log("Refreshing catalog materialized view…");
    await admin.rpc("refresh_catalog_items_mv").catch((e) => log(`mv refresh warning: ${e.message}`));

    const summary = {
      ok: true,
      styles: styleRows.length,
      variants: variantRows.length,
      images: imageRows.length,
      prices: priceRows.length,
      stock: stockRows.length,
      started,
      finished: new Date().toISOString(),
    };
    await admin.from("sync_logs").insert({
      source: "malfini",
      status: "success",
      details: summary,
    }).catch(() => {});
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[malfini-sync] ERROR", msg);
    await admin.from("sync_logs").insert({
      source: "malfini",
      status: "error",
      details: { error: msg },
    }).catch(() => {});
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
