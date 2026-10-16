import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import { colorCodeCandidates } from "@/lib/colorCodeMatch";
import { thumbUrl } from "@/lib/imageProxy";
import { russellImagesForColor } from "@/lib/russellImages";

type ImageRow = { color?: string | null; url?: string | null; alternate?: string | null; view?: string | null };

// Only public image columns are read; no product, stock or price requests.
async function fetchImages(source: string, id: string): Promise<ImageRow[]> {
  switch (source) {
    case "ss": {
      const { data, error } = await supabase.from("ss_images").select("color_code,public_url,source_url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.color_code, url: r.public_url, alternate: r.source_url }));
    }
    case "nwg": {
      const { data, error } = await supabase.from("nwg_images").select("item_number,image_url,standard_url,large_thumbnail_url").eq("product_number", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.item_number, url: r.standard_url || r.large_thumbnail_url || r.image_url }));
    }
    case "pf": {
      const { data, error } = await supabase.from("pf_images").select("item_code,url_500,url_1600").eq("model_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.item_code, url: r.url_500 || r.url_1600 }));
    }
    case "mf": {
      const { data, error } = await supabase.from("mf_images").select("color_code,url,view_code").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).filter(r => r.view_code?.toLowerCase() !== "d").map(r => ({ color: r.color_code, url: r.url }));
    }
    case "bb": {
      const { data, error } = await supabase.from("bb_images").select("color_name,url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.color_name, url: r.url }));
    }
    case "ru": {
      const { data, error } = await supabase.from("ru_images").select("color_name,url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.color_name || (russellImagesForColor(id, "Black", [r]).length ? "Black" : "unclassified"), url: r.url }));
    }
    case "utt": {
      const { data, error } = await supabase.from("utt_images").select("color_name,url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.color_name, url: r.url }));
    }
    case "fr": {
      const { data, error } = await supabase.from("falkross_images").select("color_name,url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ color: r.color_name, url: r.url }));
    }
    case "etx": {
      const { data, error } = await supabase.from("product_images").select("url").eq("product_id", id).order("sort_order");
      if (error) throw error;
      return (data || []).map(r => ({ url: r.url }));
    }
    default: return [];
  }
}

const requests = new Map<string, Promise<ImageRow[]>>();
export function useCatalogCardImages(ref: RefObject<HTMLElement | null>, source: string, id: string, color: string | null, first: string | null) {
  const [near, setNear] = useState(false);
  const [rows, setRows] = useState<ImageRow[]>([]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && media.matches) setNear(true);
    }, { rootMargin: "150px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  useEffect(() => {
    if (!near) return;
    let alive = true;
    const key = `${source}:${id}`;
    let pending = requests.get(key);
    if (!pending) {
      pending = fetchImages(source, id);
      requests.set(key, pending);
      if (requests.size > 96) {
        const oldest = requests.keys().next().value;
        if (oldest) requests.delete(oldest);
      }
    }
    pending.then(data => { if (alive) setRows(data); }).catch(() => { requests.delete(key); });
    return () => { alive = false; };
  }, [near, source, id]);
  const ssColor = source === "ss" ? color?.match(/C\d{3}/i)?.[0] : null;
  const candidates = colorCodeCandidates(ssColor || color).map(value => value.toLowerCase());
  const own = rows.filter(row => row.color && colorCodeCandidates(row.color).some(value => candidates.includes(value.toLowerCase())));
  const selected = own.length ? own : rows.filter(row => !row.color);
  return [...new Set([first, ...selected.map(row => thumbUrl(row.url || row.alternate || null))].filter((url): url is string => Boolean(url)))];
}