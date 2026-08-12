import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

interface Progress {
  total: number;
  priced: number;
  lastUpdate: string | null;
}

const NwgSyncProgress = () => {
  const [p, setP] = useState<Progress>({ total: 0, priced: 0, lastUpdate: null });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [total, priced, last] = await Promise.all([
      supabase.from("nwg_skus").select("*", { count: "exact", head: true }),
      supabase.from("nwg_skus").select("*", { count: "exact", head: true }).gt("purchase_price", 0),
      supabase
        .from("nwg_skus")
        .select("purchase_updated_at")
        .not("purchase_updated_at", "is", null)
        .order("purchase_updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setP({
      total: total.count ?? 0,
      priced: priced.count ?? 0,
      lastUpdate: (last.data as { purchase_updated_at: string } | null)?.purchase_updated_at ?? null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);

  const pct = p.total ? Math.round((p.priced / p.total) * 100) : 0;
  const stale = p.lastUpdate ? Date.now() - new Date(p.lastUpdate).getTime() > 5 * 60 * 1000 : true;

  return (
    <div className="mt-10 rounded-sm border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider">
            NWG līgumcenu sinhronizācija
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Craft, Clique, ProJob, Cutter &amp; Buck — līgumcena × 1,67 (bez PVN)
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atjaunot
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between text-sm">
          <span className="font-heading text-2xl font-black text-foreground">{pct}%</span>
          <span className="text-muted-foreground">
            {p.priced.toLocaleString("lv-LV")} / {p.total.toLocaleString("lv-LV")} SKU
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Pēdējā cena saņemta:{" "}
          {p.lastUpdate ? new Date(p.lastUpdate).toLocaleString("lv-LV") : "—"}
          {" · "}
          {stale ? "process šobrīd neaktīvs" : "process darbojas"}
        </p>
      </div>
    </div>
  );
};

export default NwgSyncProgress;
