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
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const TOKEN_URL = "https://id.gateway.nwg.se/connect/token";
const CLIENT_ID = "ReactJs";
const PRICE_URL = "https://commerce.gateway.nwg.se/assortment/fi/customerprice";
const WEBSITE_CATALOG_URL = "https://commerce.gateway.nwg.se/assortment/en/products";
const CONTEXT_ID = "C58B7BDF-CCA1-4655-8BD2-438E91964DB0";
const BRANDS = ["Craft", "Clique", "ProJob", "Cutter & Buck"];
const BLOCKED_PRODUCT_NUMBERS = new Set(["1903482", "1904160"]);

type WebsiteProduct = {
  productNumber?: string | null;
  productBrandName?: string | null;
};

async function getPartnerProductNumbers(sb: SupabaseClient): Promise<string[]> {
  const productNumbers: string[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await sb
      .from("nwg_styles")
      .select("product_number")
      .in("brand", BRANDS)
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(`NWG style validation read: ${error.message}`);
    for (const row of data ?? []) {
      if (typeof row.product_number === "string" && row.product_number.trim()) {
        productNumbers.push(row.product_number.trim());
      }
    }
    if ((data ?? []).length < pageSize) break;
  }
  return [...new Set(productNumbers)];
}

async function fetchWebsiteProducts(productNumbers: string[]): Promise<WebsiteProduct[]> {
  const url = new URL(WEBSITE_CATALOG_URL);
  for (const productNumber of productNumbers) url.searchParams.append("products", productNumber);
  const res = await fetch(url, {
    headers: {
      "contextid": CONTEXT_ID,
      "Origin": "https://www.newwaveprofile.com",
      "Referer": "https://www.newwaveprofile.com/",
      "Accept": "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`NWG website catalog failed [${res.status}]: ${text.slice(0, 300)}`);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("NWG website catalog returned an invalid response");
  return parsed as WebsiteProduct[];
}

async function validateWebsiteCatalog(sb: SupabaseClient) {
  const productNumbers = await getPartnerProductNumbers(sb);
  const batches: string[][] = [];
  for (let i = 0; i < productNumbers.length; i += 80) batches.push(productNumbers.slice(i, i + 80));

  const found = new Set<string>();
  const concurrency = 8;
  for (let i = 0; i < batches.length; i += concurrency) {
    const results = await Promise.all(batches.slice(i, i + concurrency).map(fetchWebsiteProducts));
    for (const products of results) {
      for (const product of products) {
        const productNumber = typeof product.productNumber === "string" ? product.productNumber.trim() : "";
        if (productNumber && !BLOCKED_PRODUCT_NUMBERS.has(productNumber)) found.add(productNumber);
      }
    }
  }

  const missing = productNumbers.filter((productNumber) => !found.has(productNumber));
  const now = new Date().toISOString();

  // The website catalog is authoritative in both directions. Restore products
  // confirmed there in case an earlier broad catalog cleanup archived them.
  const confirmed = [...found];
  for (let i = 0; i < confirmed.length; i += 200) {
    const { error } = await sb
      .from("nwg_styles")
      .update({ published: true, archived: false, archived_at: null })
      .in("product_number", confirmed.slice(i, i + 200));
    if (error) throw new Error(`Restore website-confirmed NWG products: ${error.message}`);
  }

  for (let i = 0; i < missing.length; i += 200) {
    const chunk = missing.slice(i, i + 200);
    const { error: skuError } = await sb
      .from("nwg_skus")
      .update({ purchase_price: null, purchase_currency: null, purchase_updated_at: now })
      .in("product_number", chunk);
    if (skuError) throw new Error(`Clear website-missing NWG products: ${skuError.message}`);

    const { error: styleError } = await sb
      .from("nwg_styles")
      .update({ published: false, archived: true, archived_at: now })
      .in("product_number", chunk);
    if (styleError) throw new Error(`Archive website-missing NWG products: ${styleError.message}`);
  }

  return { checked: productNumbers.length, found: found.size, missing, allowed: found };
}

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ ok: false, error: "Backend configuration missing" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sb = createClient(supabaseUrl, serviceRoleKey);
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

    if (mode === "refresh") {
      const { error } = await sb.rpc("refresh_catalog_prices");
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify({ ok: true, refreshed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const limit = Math.min(Number(url.searchParams.get("limit") || 4000), 100000);
    const batchSize = Math.min(Number(url.searchParams.get("batch") || 400), 500);
    const onlyMissing = url.searchParams.get("onlyMissing") !== "0";
    const chain = url.searchParams.get("chain") !== "0";
    const background = url.searchParams.get("background") !== "0";

    const work = async () => {
      const logId = await startLog(sb, "nwg:prices");
      try {
        // The customer-facing NWG website is the source of truth for whether a
        // model belongs to our contract catalog. The global GraphQL feed and a
        // stale customer price can both contain products that cannot be found or
        // ordered on the actual NWG site, so validate exact product numbers first.
        const websiteCatalog = await validateWebsiteCatalog(sb);

        // Price every active SKU belonging to the four public NWG brands.
        // Contract prices may differ by color/item number, so a price must never
        // be copied from a representative color to its siblings.
        const skus: string[] = [];
        const pnBySku = new Map<string, string>();
        const itemBySku = new Map<string, string>();

        const page = 1000; // PostgREST caps RPC rows, so page through targets.
        for (let off = 0; skus.length < limit; off += page) {
          const { data: targets, error: targetErr } = await sb.rpc("nwg_price_targets", {
            only_missing: onlyMissing,
            lim: Math.min(page, limit - skus.length),
            off,
          });
          if (targetErr) throw new Error(`target fetch: ${targetErr.message}`);
          const rows = (targets ?? []) as any[];
          for (const r of rows) {
            if (!r?.sku) continue;
            if (!websiteCatalog.allowed.has(r.product_number)) continue;
            skus.push(r.sku);
            if (r.product_number) pnBySku.set(r.sku, r.product_number);
            if (r.item_number) itemBySku.set(r.sku, r.item_number);
          }
          if (rows.length < page) break;
        }



        let updated = 0;
        let failed = 0;
        let rejected = 0;
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
              product_number: pnBySku.get(r.sku),
              item_number: itemBySku.get(r.sku) ?? null,
              purchase_price: r.num,
              purchase_currency: "EUR",
              purchase_updated_at: now,
            }));
          const writeChunk = async (chunk: any[]): Promise<void> => {
            const { error } = await sb.from("nwg_skus").upsert(chunk, { onConflict: "sku" });
            if (!error) { updated += chunk.length; return; }
            if (chunk.length === 1) {
              console.error(`upsert ${chunk[0].sku}: ${error.message}`);
              failed += 1;
              return;
            }
            const mid = Math.ceil(chunk.length / 2);
            await writeChunk(chunk.slice(0, mid));
            await writeChunk(chunk.slice(mid));
          };
          for (let j = 0; j < updates.length; j += 500) {
            await writeChunk(updates.slice(j, j + 500));
          }

          // `valid: false` is the customer commerce API's authoritative answer
          // that this account cannot currently buy the SKU. Never leave an old
          // contract price behind, because that would keep a withdrawn model in
          // the public catalog even though it only exists in NWG's global feed.
          const offeredSkus = new Set(
            rows
              .filter((r) => r.valid && typeof r.num === "number" && r.num > 0)
              .map((r) => r.sku),
          );
          const rejectedSkus = slice.filter((sku) => pnBySku.has(sku) && !offeredSkus.has(sku));
          for (let j = 0; j < rejectedSkus.length; j += 500) {
            const chunk = rejectedSkus.slice(j, j + 500);
            const { error } = await sb
              .from("nwg_skus")
              .update({
                purchase_price: null,
                purchase_currency: null,
                purchase_updated_at: now,
              })
              .in("sku", chunk);
            if (error) {
              console.error(`clear rejected SKUs: ${error.message}`);
              failed += chunk.length;
            } else {
              rejected += chunk.length;
            }
          }

        };

        const CONCURRENCY = 12;
        for (let i = 0; i < skus.length; i += batchSize * CONCURRENCY) {
          const group: Promise<void>[] = [];
          for (let k = 0; k < CONCURRENCY; k++) {
            const slice = skus.slice(i + k * batchSize, i + (k + 1) * batchSize);
            if (slice.length) group.push(processSlice(slice));
          }
          await Promise.all(group);
        }

        const more = onlyMissing && skus.length >= limit;

        // Kept as a compatibility hook. The database function intentionally
        // performs no propagation because every SKU is priced independently.
        let propagated = 0;
        const { data: propData, error: propErr } = await sb.rpc("nwg_propagate_purchase_prices");
        if (propErr) console.error(`propagate: ${propErr.message}`);
        else propagated = Number(propData ?? 0);

        // Refresh public prices when prices changed or website-only products were
        // removed. The materialized catalog is refreshed separately below.
        // The watchdog may continue to run after completion and must not launch
        // the expensive catalog refresh repeatedly with zero updates.
        if (updated > 0 || rejected > 0 || websiteCatalog.missing.length > 0) {
          const { error: refreshErr } = await sb.rpc("refresh_catalog_prices");
          if (refreshErr) console.error(`refresh_catalog_prices: ${refreshErr.message}`);
        }

        if (websiteCatalog.missing.length > 0) {
          const { error: itemsError } = await sb.rpc("refresh_catalog_items_mv");
          if (itemsError) console.error(`refresh_catalog_items_mv: ${itemsError.message}`);
        }

        const result = {
          website_checked: websiteCatalog.checked,
          website_found: websiteCatalog.found,
          website_removed: websiteCatalog.missing.length,
          skus_requested: skus.length,
          updated,
          rejected,
          propagated,
          failed,
          more,
        };

        await finishLog(sb, logId, {
          status: "success",
          message: `NWG contract prices synced${more ? " (continuing)" : ""}`,
          details: result,
          products_updated: updated,
          products_failed: failed,
        });

        // Self-chain so the whole assortment is covered across invocations.
        if (more && chain) {
          const next = `${supabaseUrl}/functions/v1/nwg-price-sync?limit=${limit}&batch=${batchSize}&onlyMissing=${onlyMissing ? "1" : "0"}`;
          fetch(next, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${serviceRoleKey}`,
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

