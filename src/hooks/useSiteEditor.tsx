import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CatalogOverrideDialog from "@/components/admin/CatalogOverrideDialog";

export interface CatalogOverride {
  source: string;
  item_id: string;
  name_lv: string | null;
  name_en: string | null;
  description_lv: string | null;
  description_en: string | null;
  extra_images: string[];
  hidden_images: string[];
  price_override: number | null;
  hide_price: boolean;
  hidden: boolean;
}

export const overrideKey = (source: string, id: string) => `${source}:${id}`;

interface Ctx {
  /** True when the signed-in admin has turned on on-site editing. */
  editMode: boolean;
  toggleEditMode: () => void;
  canEdit: boolean;
  overrides: Map<string, CatalogOverride>;
  get: (source: string, id: string) => CatalogOverride | undefined;
  openEditor: (source: string, id: string, fallback?: { name?: string | null; image?: string | null }) => void;
  refresh: () => Promise<void>;
}

const SiteEditorContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "ervitex:edit-mode";

export const SiteEditorProvider = ({ children }: { children: ReactNode }) => {
  const { isAdmin } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, CatalogOverride>>(new Map());
  const [target, setTarget] = useState<{ source: string; id: string; name?: string | null; image?: string | null } | null>(null);

  useEffect(() => {
    try {
      setEditMode(localStorage.getItem(STORAGE_KEY) === "1");
    } catch { /* ignore */ }
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("catalog_overrides" as any)
      .select("source,item_id,name_lv,name_en,description_lv,description_en,extra_images,hidden_images,price_override,hide_price,hidden");
    const map = new Map<string, CatalogOverride>();
    for (const row of ((data || []) as unknown as CatalogOverride[])) {
      map.set(overrideKey(row.source, row.item_id), {
        ...row,
        extra_images: row.extra_images || [],
        hidden_images: row.hidden_images || [],
      });
    }
    setOverrides(map);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const get = useCallback(
    (source: string, id: string) => overrides.get(overrideKey(source, id)),
    [overrides],
  );

  const openEditor: Ctx["openEditor"] = useCallback((source, id, fallback) => {
    setTarget({ source, id, name: fallback?.name ?? null, image: fallback?.image ?? null });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ editMode: isAdmin && editMode, toggleEditMode, canEdit: isAdmin, overrides, get, openEditor, refresh }),
    [isAdmin, editMode, toggleEditMode, overrides, get, openEditor, refresh],
  );

  return (
    <SiteEditorContext.Provider value={value}>
      {children}
      {target && isAdmin && (
        <CatalogOverrideDialog
          source={target.source}
          itemId={target.id}
          fallbackName={target.name}
          fallbackImage={target.image}
          existing={get(target.source, target.id)}
          onClose={() => setTarget(null)}
          onSaved={async () => { await refresh(); setTarget(null); }}
        />
      )}
    </SiteEditorContext.Provider>
  );
};

export const useSiteEditor = () => {
  const ctx = useContext(SiteEditorContext);
  if (!ctx) throw new Error("useSiteEditor must be used within SiteEditorProvider");
  return ctx;
};

/** Apply an override on top of supplier data for display. */
export const applyOverride = (
  ov: CatalogOverride | undefined,
  lang: "lv" | "en",
  base: { name?: string | null; description?: string | null; images?: (string | null)[] },
) => {
  const name = (lang === "lv" ? ov?.name_lv : ov?.name_en) || ov?.name_lv || ov?.name_en || base.name || null;
  const description =
    (lang === "lv" ? ov?.description_lv : ov?.description_en) || ov?.description_lv || ov?.description_en || base.description || null;
  const hidden = new Set((ov?.hidden_images || []).map((u) => u.trim()));
  const baseImages = (base.images || []).filter((u): u is string => !!u).filter((u) => !hidden.has(u.trim()));
  const images = [...(ov?.extra_images || []), ...baseImages];
  return { name, description, images, hidePrice: !!ov?.hide_price, priceOverride: ov?.price_override ?? null };
};
