import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, Loader2, RefreshCw } from "lucide-react";

interface SyncRow {
  source: string;
  status: string;
  message: string | null;
  started_at: string;
  finished_at: string | null;
  products_updated: number | null;
}

interface SupplierState {
  key: string;
  label: string;
  fn: string;
  latest?: SyncRow;
  lastSuccess?: SyncRow;
  coverage?: PriceHealth;
}

interface PriceHealth {
  source: string;
  total_variants: number;
  priced_variants: number;
  contract_priced: number;
  fallback_priced: number;
}

const SUPPLIERS: { key: string; label: string; fn: string }[] = [
  { key: "stanley-stella", label: "Stanley/Stella", fn: "stanley-stella-sync" },
  { key: "nwg", label: "NWG (Craft, Clique, ProJob, Cutter & Buck)", fn: "nwg-sync" },
  { key: "pf", label: "PF Concept (prezentmateriāli)", fn: "pf-concept-sync" },
  { key: "bb", label: "Beechfield / Bagbase / Quadra", fn: "beechfield-sync" },
  { key: "malfini", label: "Malfini", fn: "malfini-sync" },
];

const STUCK_MS = 30 * 60 * 1000;

const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("lv-LV") : "—");

const ago = (iso?: string | null) => {
  if (!iso) return "nekad";
  const h = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min atpakaļ`;
  if (h < 48) return `${Math.round(h)} h atpakaļ`;
  return `${Math.round(h / 24)} dienas atpakaļ`;
};

const SyncHealthPanel = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SyncRow[]>([]);
  const [coverage, setCoverage] = useState<PriceHealth[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [logRes, coverageRes] = await Promise.all([
      supabase
        .from("sync_logs")
        .select("source,status,message,started_at,finished_at,products_updated")
        .order("started_at", { ascending: false })
        .limit(300),
      supabase.rpc("supplier_price_health" as never),
    ]);
    setLogs((logRes.data as unknown as SyncRow[]) ?? []);
    setCoverage((coverageRes.data as unknown as PriceHealth[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const suppliers = useMemo<SupplierState[]>(
    () =>
      SUPPLIERS.map((s) => {
        const rows = logs.filter((l) => {
          if (s.key === "nwg") return l.source === "nwg" || l.source === "nwg:all" || l.source === "nwg:styles" || l.source === "nwg:assortments";
          return l.source === s.key || l.source.startsWith(`${s.key}:`);
        });
        return {
          ...s,
          latest: rows[0],
          lastSuccess: rows.find((r) => r.status === "success"),
          coverage: coverage.find((item) => item.source === s.key),
        };
      }),
    [coverage, logs],
  );

  const callFn = async (fn: string, query = "", body?: unknown) => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}${query}`, {
      method: "POST",
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
    if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  };

  const run = async (s: SupplierState) => {
    setRunning(s.key);
    try {
      await callFn(s.fn);
      toast({ title: `${s.label}: sinhronizācija palaista` });
    } catch (e) {
      toast({ title: `${s.label}: neizdevās`, description: (e as Error).message, variant: "destructive" });
    } finally {
      setRunning(null);
      setTimeout(load, 3000);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-sm border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Sinhronizāciju veselība</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Katram piegādātājam redzams pēdējais mēģinājums, pēdējā veiksmīgā reize un kļūda, ja tāda ir.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atjaunot
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {suppliers.map((s) => {
            const latest = s.latest;
            const health = s.coverage;
            const missing = Math.max(0, (health?.total_variants ?? 0) - (health?.priced_variants ?? 0));
            const pct = health?.total_variants ? (health.priced_variants / health.total_variants) * 100 : 0;
            const stuck =
              latest?.status === "running" && Date.now() - new Date(latest.started_at).getTime() > STUCK_MS;
            const processState = !latest
              ? "none"
              : stuck
                ? "stuck"
                : latest.status === "error"
                  ? "error"
                  : latest.status === "running"
                    ? "running"
                    : "ok";
            const state = processState === "ok" && missing > 0 ? "warning" : processState;
            return (
              <div key={s.key} className="rounded-sm border border-border p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {state === "ok" && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />}
                      {(state === "error" || state === "stuck" || state === "warning") && (
                        <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                      )}
                      {state === "running" && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />}
                      {state === "none" && <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />}
                      <p className="truncate font-medium text-foreground">{s.label}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pēdējā veiksmīgā: {fmt(s.lastSuccess?.finished_at ?? s.lastSuccess?.started_at)} (
                      {ago(s.lastSuccess?.finished_at ?? s.lastSuccess?.started_at)})
                    </p>
                    {state === "stuck" && (
                      <p className="mt-1 text-xs font-medium text-destructive">
                        Process sācies {fmt(latest?.started_at)} un nav pabeigts — visticamāk apstājies pusceļā.
                        Palaid vēlreiz.
                      </p>
                    )}
                    {state === "error" && latest?.message && (
                      <p className="mt-1 break-words text-xs text-destructive">Kļūda: {latest.message}</p>
                    )}
                    {state === "running" && !stuck && (
                      <p className="mt-1 text-xs text-muted-foreground">Šobrīd darbojas…</p>
                    )}
                    {health && (
                      <div className="mt-3 max-w-2xl">
                        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 text-sm">
                          <span className="font-heading text-xl font-black text-foreground">{pct.toFixed(1)}%</span>
                          <span className={missing > 0 ? "text-destructive" : "text-muted-foreground"}>
                            {health.priced_variants.toLocaleString("lv-LV")} / {health.total_variants.toLocaleString("lv-LV")} variācijas ar cenu
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${missing > 0 ? "bg-destructive" : "bg-accent"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {s.key === "nwg" && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            {health.contract_priced.toLocaleString("lv-LV")} līgumcenas · {health.fallback_priced.toLocaleString("lv-LV")} piegādātāja rezerves cenas
                          </p>
                        )}
                        {missing > 0 && (
                          <p className="mt-2 text-xs font-medium text-destructive">
                            {missing.toLocaleString("lv-LV")} publicējamām variācijām trūkst cenas.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => run(s)}
                    disabled={running === s.key}
                    className="shrink-0 text-xs font-bold uppercase tracking-wider"
                  >
                    <RefreshCw className={`mr-2 h-3.5 w-3.5 ${running === s.key ? "animate-spin" : ""}`} />
                    Palaist
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SyncHealthPanel;
