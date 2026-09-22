// NWG size names. The GraphQL catalog returns numeric size codes ("5"), while
// the human size label lives in skuSize.webtext ("M"). This function fills
// nwg_skus.size_name for products that are still missing it and refreshes the
// catalog prices once everything is filled.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const NWG_ENDPOINT = "https://api.gateway.nwg.se/graphql";
const Q = `query($pn: String!) {
  allSkusByProductNumber(productNumber: $pn) { sku skuSize { size webtext } }
}`;

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = Deno.env.get("NWG_ACCESS_TOKEN");
  if (!token) throw new Error("NWG_ACCESS_TOKEN missing");
  const res = await fetch(NWG_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NWG HTTP ${res.status}: ${text.slice(0, 200)}`);
  const json = JSON.parse(text);
  if (json.errors?.length) throw new Error(json.errors.map((e: any) => e.message).join("; "));
  return json.data as T;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const started = Date.now();
  const budgetMs = 50_000;

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: pendingRows, error } = await sb
      .from("nwg_skus")
      .select("product_number")
      .is("size_name", null)
      .limit(20000);
    if (error) throw error;

    const pending = [...new Set((pendingRows ?? []).map((r: any) => r.product_number))];
    let done = 0;
    let updated = 0;
    const failed: string[] = [];

    for (const pn of pending) {
      if (Date.now() - started > budgetMs) break;
      try {
        const data = await gql<{ allSkusByProductNumber: any[] }>(Q, { pn });
        const rows = (data.allSkusByProductNumber ?? [])
          .map((s) => ({
            sku: String(s.sku ?? "").trim(),
            size_name: s.skuSize?.webtext ? String(s.skuSize.webtext).trim() : null,
          }))
          .filter((r) => r.sku && r.size_name);
        const byName = new Map<string, string[]>();
        for (const r of rows) {
          if (!byName.has(r.size_name!)) byName.set(r.size_name!, []);
          byName.get(r.size_name!)!.push(r.sku);
        }
        for (const [name, skus] of byName) {
          for (let i = 0; i < skus.length; i += 200) {
            const { error: upErr } = await sb
              .from("nwg_skus")
              .update({ size_name: name })
              .in("sku", skus.slice(i, i + 200));
            if (!upErr) updated += Math.min(200, skus.length - i);
          }
        }
        done++;
      } catch (e) {
        failed.push(`${pn}: ${String((e as Error).message).slice(0, 120)}`);
      }
    }

    const left = pending.length - done;
    if (left <= 0) await sb.rpc("refresh_catalog_prices");

    return new Response(
      JSON.stringify({ products_done: done, skus_updated: updated, pending_left: left, failed: failed.slice(0, 5) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
