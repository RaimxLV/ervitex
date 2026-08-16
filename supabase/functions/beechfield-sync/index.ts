// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BRANDS: Record<string, { host: string; brand: string }> = {
  beechfield: { host: "beechfield.com", brand: "Beechfield" },
  bagbase: { host: "bagbase.com", brand: "Bagbase" },
  quadra: { host: "quadrabags.com", brand: "Quadra" },
  westfordmill: { host: "westfordmill.com", brand: "Westford Mill" },
};

// Basic color name -> hex fallback (used when hex isn't present in HTML)
const COLOR_HEX: Record<string, string> = {
  black: "#000000", white: "#ffffff", "off white": "#f5f0e6", natural: "#e8dcc4",
  navy: "#0a1a3f", "french navy": "#0a1a3f", "bright royal": "#1e3ea8", royal: "#1e3ea8",
  "sky blue": "#8ec5e8", "surf blue": "#4ca9d6", turquoise: "#30c2c0", teal: "#0a7a7a",
  red: "#c81f2a", "bright red": "#e11a2a", "classic red": "#c81f2a", burgundy: "#5b1024",
  pink: "#f3a6c6", "classic pink": "#f3a6c6", fuchsia: "#c8117a", purple: "#5b2a86",
  emerald: "#08865b", "kelly green": "#2fa14a", "lime green": "#a8d63a", "bottle green": "#0a3a2a",
  "olive green": "#556b2f", olive: "#556b2f", khaki: "#8f8a6a",
  yellow: "#f4c81a", mustard: "#c9a02a", orange: "#e77b1f",
  grey: "#8a8a8a", gray: "#8a8a8a", "light grey": "#c8c8c8", "heather grey": "#b3b3b3",
  charcoal: "#3f3f42", graphite: "#525154", silver: "#c0c0c0",
  brown: "#5c3a1e", chocolate: "#3d2410", tan: "#c69a6b", stone: "#a89b7c", sand: "#d9c9a3",
  beige: "#e2d3b5", ivory: "#f5eede", cream: "#f0e6cf",
};

function guessHex(name: string): string | null {
  const n = name.toLowerCase().trim();
  if (COLOR_HEX[n]) return COLOR_HEX[n];
  for (const k of Object.keys(COLOR_HEX)) if (n.includes(k)) return COLOR_HEX[k];
  return null;
}

function stripTags(s: string) { return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(); }
function decode(s: string) {
  return s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&trade;/g, "™").replace(/&reg;/g, "®");
}

async function fetchSitemap(host: string): Promise<string[]> {
  const res = await fetch(`https://${host}/sitemap.xml`, { headers: { "User-Agent": "Mozilla/5.0" } });
  const xml = await res.text();
  const langPrefix = /\/(fr|de|it|es|pl)\//;
  const locs = [...xml.matchAll(/<loc>(https:\/\/[^<]*\/products\/[^<]+)<\/loc>/g)]
    .map((m) => m[1])
    .filter((u) => !langPrefix.test(u));
  // dedupe
  return [...new Set(locs)];
}

interface Parsed {
  style_code: string;
  name: string;
  description: string | null;
  features: string[];
  colors: { name: string; image: string | null }[];
  images: string[];
  category: string | null;
}

function parseProduct(url: string, html: string): Parsed | null {
  const h1m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const name = h1m ? decode(stripTags(h1m[1])) : "";
  if (!name) return null;

  const slug = url.split("/").pop() || "";
  // Style code = first token of slug in uppercase (e.g. b10, b10b, cr01)
  const code = (slug.split("-")[0] || slug).toUpperCase();

  // Meta description
  const md = html.match(/<meta name="description"\s+content="([^"]+)"/);
  const description = md ? decode(md[1]) : null;

  // Features list: first UL with 3-15 short items after the images
  const features: string[] = [];
  const uls = [...html.matchAll(/<div class="content"><ul>([\s\S]*?)<\/ul>/g)];
  for (const u of uls) {
    const items = [...u[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => decode(stripTags(m[1])));
    if (items.length >= 2 && items.length <= 20 && items.every((i) => i.length < 200)) {
      features.push(...items);
      break;
    }
  }

  // Available Colours block
  const colors: { name: string; image: string | null }[] = [];
  const cbm = html.match(/Available Colours[\s\S]*?<\/section>/);
  if (cbm) {
    const block = cbm[0];
    const segs = block.split(/paragraph--product-variant/).slice(1);
    for (const seg of segs) {
      const img = seg.match(/<img[^>]+src="(https?:[^"]+)"/);
      const nameM = seg.match(/<span[^>]*>([^<]{2,60})<\/span>/);
      if (nameM) {
        const cname = decode(nameM[1].trim());
        if (cname && !colors.find((c) => c.name.toLowerCase() === cname.toLowerCase())) {
          colors.push({ name: cname, image: img ? img[1] : null });
        }
      }
    }
  }

  // Gallery images: mediahub/cloudfront urls, WITH or WITHOUT file extension
  // (Beechfield group serves most gallery shots as /asset/<uuid>/thumbnail/<name>).
  const rawUrls = [...html.matchAll(/https:\/\/(?:d2csxpduxe849s\.cloudfront\.net|mediahub\.beechfieldbrands\.com)\/[^\s"'<>)\\]+/g)]
    .map((m) => m[0].replace(/[.,;]+$/, ""));
  const images: string[] = [];
  for (const u of rawUrls) {
    if (/\/mp4\/|\.mp4$|\/original\//i.test(u)) continue;
    const fname = u.split("/").pop() || "";
    // Only keep media that belongs to THIS style (pages also link related products)
    if (!fname.toLowerCase().includes(code.toLowerCase())) continue;
    if (!images.includes(u)) images.push(u);
  }
  // Prefer the "Product-Shot-01" / primary shot first
  images.sort((a, b) => {
    const rank = (u: string) => (/product-shot-0?1/i.test(u) ? 0 : /front|ecommerce/i.test(u) ? 1 : 2);
    return rank(a) - rank(b);
  });
  images.splice(40);


  // Category heuristic from slug words
  const s = slug.toLowerCase();
  let category: string | null = null;
  if (/(cap|hat|beanie|visor|bucket|snapback|trucker|headband|bandana)/.test(s)) category = "Headwear";
  else if (/(backpack|rucksack)/.test(s)) category = "Backpacks";
  else if (/(tote|shopper|shopping)/.test(s)) category = "Tote Bags";
  else if (/(cooler|cool-bag)/.test(s)) category = "Cooler Bags";
  else if (/(duffle|holdall|weekender|kitbag|barrel|travel)/.test(s)) category = "Travel Bags";
  else if (/(laptop|briefcase|messenger|document)/.test(s)) category = "Business Bags";
  else if (/(gym|sport|drawstring|gymsac)/.test(s)) category = "Sports Bags";
  else if (/(apron|tea-towel|napkin|kitchen|chef)/.test(s)) category = "Kitchen & Home";
  else if (/(scarf|glove|snood|neckwarmer)/.test(s)) category = "Accessories";
  else if (/(bag|pouch|wallet|purse|clutch)/.test(s)) category = "Bags";

  return { style_code: code, name, description, features, colors, images, category };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const brandKey = String(body.brand || "");
    const offset = Math.max(0, parseInt(String(body.offset ?? 0), 10));
    const limit = Math.min(30, Math.max(1, parseInt(String(body.limit ?? 15), 10)));

    const bcfg = BRANDS[brandKey];
    if (!bcfg) {
      return new Response(JSON.stringify({ error: "Invalid brand" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const urls = await fetchSitemap(bcfg.host);
    const slice = urls.slice(offset, offset + limit);

    let processed = 0;
    const errors: string[] = [];

    for (const url of slice) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
        if (!res.ok) { errors.push(`${url}: HTTP ${res.status}`); continue; }
        const html = await res.text();
        const p = parseProduct(url, html);
        if (!p) { errors.push(`${url}: parse failed`); continue; }

        // Upsert style
        const { error: se } = await supabase.from("bb_styles").upsert({
          style_code: p.style_code,
          brand: bcfg.brand,
          name: p.name,
          description: p.description,
          category: p.category,
          features: p.features,
          active: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: "style_code" });
        if (se) { errors.push(`${p.style_code} style: ${se.message}`); continue; }

        // Variants (one per color, size null for now)
        if (p.colors.length) {
          const rows = p.colors.map((c) => ({
            sku: `${p.style_code}-${c.name.replace(/\s+/g, "").toUpperCase()}`,
            style_code: p.style_code,
            color_name: c.name,
            color_hex: guessHex(c.name),
            size: null,
            active: true,
          }));
          await supabase.from("bb_variants").upsert(rows, { onConflict: "sku" });
        }

        // Images: wipe & reinsert
        await supabase.from("bb_images").delete().eq("style_code", p.style_code);
        const imgRows: any[] = [];
        p.images.forEach((u, i) => imgRows.push({ style_code: p.style_code, color_name: null, url: u, sort_order: i, is_primary: i === 0 }));
        p.colors.forEach((c, i) => { if (c.image) imgRows.push({ style_code: p.style_code, color_name: c.name, url: c.image, sort_order: 100 + i, is_primary: false }); });
        if (imgRows.length) await supabase.from("bb_images").insert(imgRows);

        processed++;
      } catch (e: any) {
        errors.push(`${url}: ${e.message}`);
      }
    }

    const nextOffset = offset + slice.length;
    const done = nextOffset >= urls.length;

    return new Response(JSON.stringify({
      brand: brandKey,
      total: urls.length,
      offset,
      processed,
      next_offset: nextOffset,
      done,
      errors: errors.slice(0, 5),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
