import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { supabase } from "@/integrations/supabase/client";
import { colorCodeCandidates } from "@/lib/colorCodeMatch";
import { thumbUrl } from "@/lib/imageProxy";
import { russellImageColor } from "@/lib/russellImages";
import { bbImageBelongsToStyle, bbAssignImageColor } from "@/lib/bbImageOwnership";

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
      const [{ data, error }, vars] = await Promise.all([
        supabase.from("bb_images").select("color_name,url").eq("style_code", id).order("sort_order"),
        supabase.from("bb_variants").select("color_name").eq("style_code", id).eq("active", true),
      ]);
      if (error) throw error;
      if (vars.error) throw vars.error;
      const colours = [...new Set((vars.data || []).map(v => v.color_name).filter((c): c is string => !!c))];
      // Same proven mapping as the product dialog: model shots get a colour only by exact full colour after the code.
      return (data || []).filter(r => r.color_name || bbImageBelongsToStyle(r.url, id))
        .map(r => ({ color: r.color_name || bbAssignImageColor(r.url, id, colours), url: r.url }));
    }
    case "ru": {
      const { data, error } = await supabase.from("ru_images").select("color_name,url").eq("style_code", id).order("sort_order");
      if (error) throw error;
      return (data || []).flatMap(r => {
        const color = russellImageColor(id, r);
        return color ? [{ color, url: r.url }] : [];
      });
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
export function useCatalogCardImages(ref: RefObject<HTMLElement | null>, source: string, id: string, color: string | null, first: string | null, firstIsColor = true) {
  const [near, setNear] = useState(false);
  // Krāsa bez savas kataloga bildes (Russell): ielādē tās foto arī datorā pēc krāsas maiņas.
  useEffect(() => {
    if (!firstIsColor) setNear(true);
  }, [firstIsColor]);
  const [rows, setRows] = useState<ImageRow[]>([]);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const media = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const image = element.querySelector("img");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let visible = false;
    const schedule = () => {
      if (!visible || !media.matches || timer !== undefined) return;
      // Main photos take priority over gallery metadata during page changes.
      timer = setTimeout(() => { setNear(true); observer.disconnect(); }, 200);
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (!visible && timer !== undefined) { clearTimeout(timer); timer = undefined; }
      if (!image || image.complete) schedule();
    }, { rootMargin: "50px" });
    image?.addEventListener("load", schedule);
    image?.addEventListener("error", schedule);
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timer !== undefined) clearTimeout(timer);
      image?.removeEventListener("load", schedule);
      image?.removeEventListener("error", schedule);
    };
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
  return cardImageFrames(rows, color, first, firstIsColor, source);
}

/** Kartītes kadri: krāsas foto; modeļa vispārīgā bilde nekad nepārraksta citas krāsas foto. */
export function cardImageFrames(rows: ImageRow[], color: string | null, first: string | null, firstIsColor: boolean, source = "") {
  const ssColor = source === "ss" ? color?.match(/C\d{3}/i)?.[0] : null;
  const candidates = colorCodeCandidates(ssColor || color).map(value => value.toLowerCase());
  // PF attēli ir piesaistīti konkrētai SKU (10650504); citu formātu atvasinājumi (MF "50") sajauktu krāsas.
  // Name-keyed sources compare whole colour names; suffix candidates ("Off-White" → "white") would mix colours.
  const own = ["pf", "bb", "utt", "fr", "nwg"].includes(source)
    ? rows.filter(row => !!row.color && !!color && row.color.trim().toLowerCase() === color.trim().toLowerCase())
    : rows.filter(row => row.color && colorCodeCandidates(row.color).some(value => candidates.includes(value.toLowerCase())));
  // Izvēlēta krāsa: tikai tās pašas krāsas kadri (tukšs, ja nav); modeļa kadri tikai bez krāsas.
  const selected = color ? own : rows.filter(row => !row.color);
  const lead = firstIsColor || !color ? first : null;
  return [...new Set([lead, ...selected.map(row => thumbUrl(row.url || row.alternate || null))].filter((url): url is string => Boolean(url)))];
}