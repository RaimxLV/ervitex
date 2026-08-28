import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MegaMenuSection } from "@/lib/megaMenuConfig";

export type { MegaMenuSection };

export interface MegaMenuItem {
  id: string;
  section: MegaMenuSection;
  label_lv: string;
  label_en: string;
  categories: string[];
  image_url: string | null;
  sort_order: number;
  active: boolean;
  auto_added: boolean;
}

export function useMegaMenuItems(opts: { onlyActive?: boolean } = {}) {
  const { onlyActive = true } = opts;
  const [items, setItems] = useState<MegaMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    setLoading(true);
    let query = supabase
      .from("mega_menu_items")
      .select("*")
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });
    if (onlyActive) query = query.eq("active", true);
    const { data } = await query;
    setItems((data as MegaMenuItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyActive]);

  return { items, loading, refetch };
}
