// Stanley/Stella product import (sample).
// Pulls a small set of products from S/S API and inserts them into our DB
// with brand="Stanley/Stella" and ss_style_code set so sync works after.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SS_HOST = "https://api.stanleystella.com";
const DB_NAME = "production_api";

async function ssCall(endpoint: string, extra: Record<string, unknown> = {}) {
  const user = Deno.env.get("STANLEY_STELLA_USER");
  const password = Deno.env.get("STANLEY_STELLA_PASSWORD");
  if (!user || !password) throw new Error("STANLEY_STELLA credentials missing");

  const body = {
    jsonrpc: "2.0",
    method: "call",
    params: { db_name: DB_NAME, user, password, ...extra },
  };
  const res = await fetch(`${SS_HOST}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${endpoint}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error?.data?.message || json.error?.message || "RPC error");
  const raw = json.result ?? "[]";
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

const pick = (obj: any, ...keys: string[]) => {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  return undefined;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let limit = 5;
  let testOnly = false;
  let styleFilter: string | undefined;
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      if (typeof body.limit === "number") limit = Math.min(Math.max(body.limit, 1), 50);
      if (body.test === true) testOnly = true;
      if (typeof body.style === "string") styleFilter = body.style;
    }
  } catch (_) { /* noop */ }

  // Auth check only — uses tiny payload (filter by future date returns 0 rows)
  if (testOnly) {
    try {
      const rows = await ssCall("/webrequest/products/get_json", { LastUpdate: "2099-01-01 00:00:00" });
      return new Response(JSON.stringify({ ok: true, auth: "valid", rows: Array.isArray(rows) ? rows.length : 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
  }

  const { data: logRow } = await supabase
    .from("sync_logs")
    .insert({ source: "stanley-stella-import", status: "running" })
    .select("id").single();
  const logId = logRow?.id as string | undefined;

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    // Fetch products. Use Style filter when possible to stay under memory limit.
    const params: Record<string, unknown> = {};
    if (styleFilter) params.Style = styleFilter;
    const products = await ssCall("/webrequest/products/get_json", params);
    if (!Array.isArray(products)) throw new Error("Unexpected products payload");

    // Group rows by StyleCode so we collect colors/sizes/images per style.
    const byStyle = new Map<string, any[]>();
    for (const row of products) {
      const style = pick(row, "StyleCode", "Style_Code", "Style");
      if (!style) continue;
      if (!byStyle.has(style)) byStyle.set(style, []);
      byStyle.get(style)!.push(row);
    }

    const styles = Array.from(byStyle.keys()).slice(0, limit);

    for (const style of styles) {
      try {
        // Skip if already imported
        const { data: existing } = await supabase
          .from("products").select("id").eq("ss_style_code", style).maybeSingle();
        if (existing) { skipped++; continue; }

        const rows = byStyle.get(style)!;
        const first = rows[0];
        const name = pick(first, "StyleName", "Name", "Title") || style;
        const desc = pick(first, "ShortDescription", "Description") || "";
        const longDesc = pick(first, "LongDescription", "Description") || "";
        const material = pick(first, "Composition", "Material") || "";
        const category = pick(first, "Category", "Type") || "";

        const colorsMap = new Map<string, { hex: string | null; img: string | null }>();
        const sizesSet = new Set<string>();
        const imagesSet = new Set<string>();

        for (const r of rows) {
          const cName = pick(r, "ColorName", "Color");
          const cHex = pick(r, "HexCode", "Hex", "ColorHex");
          const cImg = pick(r, "ColorImage", "Picture", "Image", "ImageUrl");
          if (cName && !colorsMap.has(cName)) colorsMap.set(cName, { hex: cHex || null, img: cImg || null });
          const sz = pick(r, "SizeCode", "Size");
          if (sz) sizesSet.add(String(sz));
          for (const k of ["Picture", "PictureURL", "Image", "ImageUrl", "HighResUrl"]) {
            if (r[k]) imagesSet.add(r[k]);
          }
        }

        const { data: inserted_product, error: insErr } = await supabase
          .from("products").insert({
            name_lv: name,
            name_en: name,
            description_lv: desc,
            description_en: desc,
            long_description_lv: longDesc,
            long_description_en: longDesc,
            material,
            brand: "Stanley/Stella",
            ss_style_code: style,
            active: true,
            hidden_manual: false,
            hide_when_oos: false,
            min_order: 1,
          }).select("id").single();
        if (insErr) throw insErr;

        const productId = inserted_product.id;

        // Colors
        const colorRows = Array.from(colorsMap.entries()).map(([name, v]) => ({
          product_id: productId, name, hex_code: v.hex, image_url: v.img,
        }));
        if (colorRows.length) await supabase.from("product_colors").insert(colorRows);

        // Sizes
        const sizeRows = Array.from(sizesSet).map((s, i) => ({
          product_id: productId, size: s, sort_order: i,
        }));
        if (sizeRows.length) await supabase.from("product_sizes").insert(sizeRows);

        // Images
        const imgRows = Array.from(imagesSet).slice(0, 8).map((url, i) => ({
          product_id: productId, url, sort_order: i,
        }));
        if (imgRows.length) await supabase.from("product_images").insert(imgRows);

        inserted++;
      } catch (e) {
        errors.push(`${style}: ${(e as Error).message}`);
      }
    }

    await supabase.from("sync_logs").update({
      status: errors.length ? "partial" : "success",
      products_updated: inserted,
      products_failed: errors.length,
      message: `Imported ${inserted} new (${skipped} already existed)`,
      details: errors.length ? { errors: errors.slice(0, 50) } : null,
      finished_at: new Date().toISOString(),
    }).eq("id", logId!);

    return new Response(
      JSON.stringify({ ok: true, inserted, skipped, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = (e as Error).message;
    await supabase.from("sync_logs").update({
      status: "error", message: msg, finished_at: new Date().toISOString(),
    }).eq("id", logId!);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
