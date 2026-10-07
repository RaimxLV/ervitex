import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { techs, resolveImageRef } from "@/data/technologies";

let version = 0;
let loading: Promise<void> | null = null;
const listeners = new Set<(v: number) => void>();

/** Applies admin-saved gallery order (tech_galleries) onto the shared techs data. */
export function applyTechGalleries(rows: { tech_id: string; images: string[] }[]) {
  for (const row of rows) {
    const tech = techs.find((t) => t.id === row.tech_id);
    if (!tech) continue;
    const urls = row.images.map(resolveImageRef).filter((u): u is string => Boolean(u));
    if (urls.length) tech.images = urls;
  }
  version++;
  listeners.forEach((l) => l(version));
}

export function loadTechGalleries() {
  if (!loading) {
    loading = (async () => {
      const { data } = await supabase.from("tech_galleries" as never).select("tech_id,images");
      if (data) applyTechGalleries(data as unknown as { tech_id: string; images: string[] }[]);
    })().catch(() => undefined);
  }
  return loading;
}

/** Re-renders when saved galleries arrive; returns a version number for effect deps. */
export function useTechGalleries() {
  const [v, setV] = useState(version);
  useEffect(() => {
    listeners.add(setV);
    void loadTechGalleries();
    return () => { listeners.delete(setV); };
  }, []);
  return v;
}
