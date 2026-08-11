// NWG contract (purchase) price sync.
// Uses the NWG commerce API (commerce.gateway.nwg.se) with an OAuth refresh
// token stored in public.nwg_auth. Only our four partner brands are synced.
//
// Modes:
//   ?mode=seed  (POST { refresh_token }) -> store/replace the refresh token
//   ?mode=sync  (default)                -> fetch contract prices for SKUs
// Params: limit (max SKUs per run, default 6000), batch (SKUs per API call, default 400),
//         onlyMissing=1 (default) to skip SKUs already priced.

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const TOKEN_URL = "https://id.gateway.nwg.se/connect/token";
const CLIENT_ID = "ReactJs";
const PRICE_URL = "https://commerce.gateway.nwg.se/assortment/fi/customerprice";
const CONTEXT_ID = "C58B7BDF-CCA1-4655-8BD2-438E91964DB0";
const BRANDS = ["Craft", "Craft AP", "Clique", "Clique Retail", "ProJob", "Cutter & Buck"];

async function getAccessToken(sb: SupabaseClient): Promise<string> {
  const { data, error } = await sb.from("nwg_auth").select("refresh_token").eq("id", 1).maybeSingle();
  if (error) throw new Error(`nwg_auth read: ${error.message}`);
  if (!data?.refresh_token) throw new Error("No NWG refresh token stored — run mode=seed first");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: CLIENT_ID,
      refresh_token: data.refresh_token,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NWG token refresh failed [${res.status}]: ${text.slice(0, 200)}`);
  const json = JSON.parse(text);
  if (json.refresh_token) {
    await sb.from("nwg_auth").upsert({ id: 1, refresh_token: json.refresh_token, updated_at: new Date().toISOString() });
  }
  if (!json.access_token) throw new Error("NWG token refresh returned no access_token");
  return json.access_token as string;
}

async function fetchPrices(token: string, skus: string[]) {
  const res = await fetch(PRICE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "contextid": CONTEXT_ID,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(skus.map((sku) => ({ sku, quantity: 1 }))),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NWG price request failed [${res.status}]: ${text.slice(0, 300)}`);
  return JSON.parse(text) as Array<{ sku: string; num: number | null; valid: boolean }>;
}

async function startLog(sb: SupabaseClient, source: string) {
  const { data } = await sb.from("sync_logs").insert({ source, status: "running" }).select("id").single();
  return data?.id as string | undefined;
}
async function finishLog(sb: SupabaseClient, id: string | undefined, patch: Record<string, unknown>) {
  if (!id) return;
  await sb.from("sync_logs").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", id);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") || "sync").toLowerCase();

  try {
    if (mode === "seed") {
      const body = await req.json().catch(() => ({}));
      const rt = typeof body?.refresh_token === "string" ? body.refresh_token.trim() : "";
      if (rt.length < 20) {
        return new Response(JSON.stringify({ ok: false, error: "refresh_token required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await sb.from("nwg_auth").upsert({ id: 1, refresh_token: rt, updated_at: new Date().toISOString() });
      if (error) throw new Error(error.message);
      // Validate immediately.
      const token = await getAccessToken(sb);
      return new Response(JSON.stringify({ ok: true, seeded: true, token_ok: !!token }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const limit = Math.min(Number(url.searchParams.get("limit") || 4000), 40000);
    const batchSize = Math.min(Number(url.searchParams.get("batch") || 400), 500);
    const onlyMissing = url.searchParams.get("onlyMissing") !== "0";
    const chain = url.searchParams.get("chain") !== "0";
    const background = url.searchParams.get("background") !== "0";

    const work = async () => {
      const logId = await startLog(sb, "nwg:prices");
      try {
        // Collect target SKUs for our partner brands.
        const skus: string[] = [];
        const pnBySku = new Map<string, string>();
        const pageSize = 1000;

        const productNumbers: string[] = [];
        for (let from = 0; ; from += pageSize) {
          const { data, error } = await sb
            .from("nwg_styles")
            .select("product_number")
            .in("brand", BRANDS)
            .order("product_number")
            .range(from, from + pageSize - 1);
          if (error) throw new Error(`style fetch: ${error.message}`);
          if (!data?.length) break;
          for (const r of data as any[]) if (r.product_number) productNumbers.push(r.product_number);
          if (data.length < pageSize) break;
        }

        outer:
        for (let pi = 0; pi < productNumbers.length; pi += 200) {
          const pnChunk = productNumbers.slice(pi, pi + 200);
          for (let from = 0; ; from += pageSize) {
            let q = sb
              .from("nwg_skus")
              .select("sku, product_number")
              .in("product_number", pnChunk)
              .order("sku")
              .range(from, from + pageSize - 1);
            if (onlyMissing) q = q.is("purchase_price", null);
            const { data, error } = await q;
            if (error) throw new Error(`sku fetch: ${error.message}`);
            if (!data?.length) break;
            for (const r of data as any[]) {
              if (!r.sku) continue;
              skus.push(r.sku);
              if (r.product_number) pnBySku.set(r.sku, r.product_number);
            }
            if (skus.length >= limit) break outer;
            if (data.length < pageSize) break;
          }
        }

        let updated = 0;
        let failed = 0;
        const now = new Date().toISOString();
        let token = await getAccessToken(sb);

        const processSlice = async (slice: string[]) => {
          let rows: Array<{ sku: string; num: number | null; valid: boolean }>;
          try {
            rows = await fetchPrices(token, slice);
          } catch (e) {
            const msg = (e as Error).message;
            if (msg.includes("[401]")) {
              token = await getAccessToken(sb);
              rows = await fetchPrices(token, slice);
            } else {
              console.error(msg);
              failed += slice.length;
              return;
            }
          }
          const updates = rows
            .filter((r) => r.valid && typeof r.num === "number" && (r.num as number) > 0 && pnBySku.has(r.sku))
            .map((r) => ({
              sku: r.sku,
              product_number: pnBySku.get(r.sku)!,
              purchase_price: r.num,
              purchase_currency: "EUR",
              purchase_updated_at: now,
            }));
          for (let j = 0; j < updates.length; j += 500) {
            const chunk = updates.slice(j, j + 500);
            const { error } = await sb.from("nwg_skus").upsert(chunk, { onConflict: "sku" });
            if (error) { console.error(`upsert: ${error.message}`); failed += chunk.length; }
            else updated += chunk.length;
          }
        };

        const CONCURRENCY = 4;
        for (let i = 0; i < skus.length; i += batchSize * CONCURRENCY) {
          const group: Promise<void>[] = [];
          for (let k = 0; k < CONCURRENCY; k++) {
            const slice = skus.slice(i + k * batchSize, i + (k + 1) * batchSize);
            if (slice.length) group.push(processSlice(slice));
          }
          await Promise.all(group);
        }

        const more = onlyMissing && skus.length >= limit;
        if (!more) {
          const { error: refreshErr } = await sb.rpc("refresh_catalog_prices");
          if (refreshErr) console.error(`refresh_catalog_prices: ${refreshErr.message}`);
        }

        const result = { skus_requested: skus.length, updated, failed, more };
        await finishLog(sb, logId, {
          status: "success",
          message: `NWG contract prices synced${more ? " (continuing)" : ""}`,
          details: result,
          products_updated: updated,
          products_failed: failed,
        });

        // Self-chain so the whole assortment is covered across invocations.
        if (more && chain) {
          const next = `${Deno.env.get("SUPABASE_URL")}/functions/v1/nwg-price-sync?limit=${limit}&batch=${batchSize}`;
          fetch(next, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
          }).catch((e) => console.error(`chain: ${(e as Error).message}`));
        }
        return result;
      } catch (e) {
        const msg = (e as Error).message;
        console.error(msg);
        await finishLog(sb, logId, { status: "error", message: msg });
        throw e;
      }
    };

    if (background) {
      // @ts-ignore Supabase edge runtime background task API
      EdgeRuntime.waitUntil(work());
      return new Response(JSON.stringify({ ok: true, started: true, limit, batch: batchSize }), {
        status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await work();
    return new Response(JSON.stringify({ ok: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = (e as Error).message;
    console.error(msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

