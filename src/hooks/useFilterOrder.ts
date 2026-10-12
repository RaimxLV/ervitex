import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FilterOrderMap = Record<string, string[]>;

export function useFilterOrder() {
  const [order, setOrder] = useState<FilterOrderMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("catalog_filter_order")
      .select("key, order_values")
      .then(({ data }) => {
        if (cancelled) return;
        const map: FilterOrderMap = {};
        for (const r of data || []) map[r.key] = r.order_values || [];
        setOrder(map);
        setReady(true);
      });
    return () => { cancelled = true; };
  }, []);

  const save = useCallback(async (next: FilterOrderMap) => {
    const { data: u } = await supabase.auth.getUser();
    const rows = Object.entries(next).map(([key, order_values]) => ({
      key, order_values, updated_at: new Date().toISOString(), updated_by: u.user?.id ?? null,
    }));
    const { error } = await supabase.from("catalog_filter_order").upsert(rows, { onConflict: "key" });
    if (!error) setOrder((cur) => ({ ...cur, ...next }));
    return error;
  }, []);

  return { order, ready, save };
}
