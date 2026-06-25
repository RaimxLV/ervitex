// Stanley/Stella sync edge function
// Pulls stock + prices and updates matching products by ss_style_code.
// Manually-overridden prices (price_override) are preserved.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SS_HOST = "https://api.stanleystella.com";
const DB_NAME = "production_api";

interface RpcResult {
  result?: string;
  error?: { message?: string; data?: { message?: string } };
}

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
  const json = (await res.json()) as RpcResult;
  if (json.error) {
    throw new Error(json.error.data?.message || json.error.message || "RPC error");
  }
  // Result is a JSON-encoded string per docs.
  const raw = json.result ?? "[]";
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: logRow } = await supabase
    .from("sync_logs")
    .insert({ source: "stanley-stella", status: "running" })
    .select("id")
    .single();
  const logId = logRow?.id as string | undefined;

  let updated = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // 1) Load products that have an SS style code mapped.
    const { data: products, error: pErr } = await supabase
      .from("products")
      .select("id, ss_style_code, price_override")
      .not("ss_style_code", "is", null);
    if (pErr) throw pErr;
    if (!products?.length) {
      await supabase.from("sync_logs").update({
        status: "success",
        message: "No products mapped to ss_style_code yet",
        finished_at: new Date().toISOString(),
      }).eq("id", logId!);
      return new Response(
        JSON.stringify({ ok: true, updated: 0, message: "No mapped products" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2) Fetch full stock (one call per docs recommendation).
    const stock = await ssCall("/webrequest/v2/stock/get_json", { Is_Inventory: true });
    const stockByStyle = new Map<string, { qty: number; inStock: boolean }>();
    for (const row of stock as any[]) {
      const style = row.StyleCode || row.Style_Code;
      if (!style) continue;
      const qty = Number(row.Quantity || row.Stock || 0);
      const cur = stockByStyle.get(style) || { qty: 0, inStock: false };
      cur.qty += qty;
      cur.inStock = cur.inStock || qty > 0;
      stockByStyle.set(style, cur);
    }

    // 3) Fetch prices.
    const prices = await ssCall("/webrequest/products/get_prices");
    const priceByStyle = new Map<string, number>();
    for (const row of prices as any[]) {
      const style = row.StyleCode || row.Style_Code;
      const price = Number(row.PurchasePrice || row.Price || row.SalesPrice || 0);
      if (!style || !price) continue;
      // Keep minimum across SKUs of that style as the "from" wholesale.
      const cur = priceByStyle.get(style);
      if (cur === undefined || price < cur) priceByStyle.set(style, price);
    }

    // 4) Update each product.
    const now = new Date().toISOString();
    for (const p of products) {
      try {
        const style = p.ss_style_code as string;
        const s = stockByStyle.get(style);
        const wholesale = priceByStyle.get(style);
        const patch: Record<string, unknown> = { last_synced_at: now };
        if (s) {
          patch.ss_stock_qty = s.qty;
          patch.ss_in_stock = s.inStock;
        }
        if (wholesale !== undefined) {
          patch.ss_wholesale_price = wholesale;
          // Only refresh wholesale_price if admin hasn't set a manual override.
          if (p.price_override === null || p.price_override === undefined) {
            patch.wholesale_price = wholesale;
          }
        }
        const { error: uErr } = await supabase.from("products").update(patch).eq("id", p.id);
        if (uErr) throw uErr;
        updated++;
      } catch (e) {
        failed++;
        errors.push(`${p.id}: ${(e as Error).message}`);
      }
    }

    await supabase.from("sync_logs").update({
      status: failed ? "partial" : "success",
      products_updated: updated,
      products_failed: failed,
      message: `Synced ${updated} products (${failed} failed)`,
      details: errors.length ? { errors: errors.slice(0, 50) } : null,
      finished_at: new Date().toISOString(),
    }).eq("id", logId!);

    return new Response(
      JSON.stringify({ ok: true, updated, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = (e as Error).message;
    await supabase.from("sync_logs").update({
      status: "error",
      message: msg,
      finished_at: new Date().toISOString(),
    }).eq("id", logId!);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
