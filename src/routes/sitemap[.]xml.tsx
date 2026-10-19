import { createFileRoute } from "@tanstack/react-router";
import { SITE, TECH_NAMES } from "@/lib/seo";

const STATIC_PATHS = ["/", "/catalog", "/about", "/contact", "/services", "/stanley-stella", "/nwg", "/pf-concept", "/beechfield-brands", "/malfini", "/privacy", "/terms"];
const FOOTWEAR = /apav|footwear|shoe|boot|sandal|slipper/i;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { createClient } = await import("@supabase/supabase-js");
        const sb = createClient(process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
        const urls = [...STATIC_PATHS, ...Object.keys(TECH_NAMES).map((s) => `/tehnologijas/${s}`)];
        try {
          const hidden = new Set<string>();
          for (let from = 0; ; from += 1000) {
            const { data } = await sb.from("catalog_remnants").select("source,style_code").range(from, from + 999);
            (data ?? []).forEach((r) => hidden.add(`${r.source}::${r.style_code}`));
            if (!data || data.length < 1000) break;
          }
          for (let from = 0; ; from += 1000) {
            const { data } = await sb.from("catalog_items").select("source,id,category").range(from, from + 999);
            for (const r of data ?? []) {
              if (!r.source || !r.id || hidden.has(`${r.source}::${r.id}`) || FOOTWEAR.test(r.category ?? "")) continue;
              urls.push(`/catalog/item/${r.source}/${encodeURIComponent(r.id)}`);
            }
            if (!data || data.length < 1000) break;
          }
        } catch (e) {
          console.error("sitemap catalog read failed", e);
        }
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map((u) => `  <url><loc>${esc(SITE + u)}</loc></url>`).join("\n")}\n</urlset>\n`;
        return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
