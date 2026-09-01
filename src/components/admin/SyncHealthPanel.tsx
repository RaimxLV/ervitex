import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, KeyRound, Loader2, RefreshCw } from "lucide-react";

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
}

const SUPPLIERS: { key: string; label: string; fn: string }[] = [
  { key: "stanley-stella", label: "Stanley/Stella", fn: "stanley-stella-sync" },
  { key: "nwg", label: "NWG (Craft, Clique, ProJob, Cutter & Buck)", fn: "nwg-sync" },
  { key: "pf", label: "PF Concept (prezentmateriāli)", fn: "pf-concept-sync" },
  { key: "bb", label: "Beechfield / Bagbase / Quadra", fn: "beechfield-sync" },
  { key: "malfini", label: "Malfini", fn: "malfini-sync" },
];

const NWG_BRANDS = ["Craft", "Clique", "ProJob", "Cutter & Buck"];
const STUCK_MS = 60 * 60 * 1000;

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
  const [nwg, setNwg] = useState({ total: 0, priced: 0, lastUpdate: null as string | null });
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [logRes, total, priced, last] = await Promise.all([
      supabase
        .from("sync_logs")
        .select("source,status,message,started_at,finished_at,products_updated")
        .order("started_at", { ascending: false })
        .limit(300),
      supabase
        .from("nwg_skus")
        .select("nwg_styles!inner(brand)", { count: "exact", head: true })
        .in("nwg_styles.brand", NWG_BRANDS)
        .eq("nwg_styles.published", true)
        .eq("nwg_styles.archived", false)
        .eq("active", true)
        .eq("discontinued", false),
      supabase
        .from("nwg_skus")
        .select("nwg_styles!inner(brand)", { count: "exact", head: true })
        .in("nwg_styles.brand", NWG_BRANDS)
        .eq("nwg_styles.published", true)
        .eq("nwg_styles.archived", false)
        .eq("active", true)
        .eq("discontinued", false)
        .gt("purchase_price", 0),
      supabase
        .from("nwg_skus")
        .select("purchase_updated_at,nwg_styles!inner(brand)")
        .in("nwg_styles.brand", NWG_BRANDS)
        .eq("nwg_styles.published", true)
        .eq("nwg_styles.archived", false)
        .eq("active", true)
        .eq("discontinued", false)
        .not("purchase_updated_at", "is", null)
        .order("purchase_updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setLogs((logRes.data as unknown as SyncRow[]) ?? []);
    setNwg({
      total: total.count ?? 0,
      priced: priced.count ?? 0,
      lastUpdate: (last.data as { purchase_updated_at: string } | null)?.purchase_updated_at ?? null,
    });
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
        const rows = logs.filter((l) => l.source.split(":")[0] === s.key);
        return {
          ...s,
          latest: rows[0],
          lastSuccess: rows.find((r) => r.status === "success"),
        };
      }),
    [logs],
  );

  const nwgPriceLog = useMemo(() => logs.find((l) => l.source === "nwg:prices"), [logs]);
  const tokenExpired = !!nwgPriceLog?.message?.includes("invalid_grant");

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

  const seedToken = async () => {
    setSeeding(true);
    try {
      await callFn("nwg-price-sync", "?mode=seed", { refresh_token: token.trim() });
      setToken("");
      toast({ title: "NWG pieeja atjaunota", description: "Cenu sinhronizācija atkal var strādāt." });
      await callFn("nwg-price-sync", "?limit=100000&batch=400");
    } catch (e) {
      toast({ title: "NWG pieeju neizdevās atjaunot", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSeeding(false);
      setTimeout(load, 3000);
    }
  };

  const pct = nwg.total ? (nwg.priced / nwg.total) * 100 : 0;

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
            const stuck =
              latest?.status === "running" && Date.now() - new Date(latest.started_at).getTime() > STUCK_MS;
            const state = !latest
              ? "none"
              : stuck
                ? "stuck"
                : latest.status === "error"
                  ? "error"
                  : latest.status === "running"
                    ? "running"
                    : "ok";
            return (
              <div key={s.key} className="rounded-sm border border-border p-3 sm:p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {state === "ok" && <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />}
                      {(state === "error" || state === "stuck") && (
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

      {/* NWG contract prices */}
      <div className="rounded-sm border border-border bg-card p-4 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">NWG līgumcenas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Craft, Clique, ProJob, Cutter &amp; Buck — līgumcena × 1,67 (bez PVN).
        </p>

        <div className="mt-4">
          <div className="flex items-end justify-between text-sm">
            <span className="font-heading text-2xl font-black text-foreground">{pct.toFixed(1)}%</span>
            <span className="text-muted-foreground">
              {nwg.priced.toLocaleString("lv-LV")} / {nwg.total.toLocaleString("lv-LV")} aktuālie SKU ar līgumcenu
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pēdējā cena saņemta: {fmt(nwg.lastUpdate)} · pēdējais mēģinājums: {fmt(nwgPriceLog?.started_at)} (
            {nwgPriceLog?.status === "error" ? "kļūda" : nwgPriceLog?.status === "running" ? "darbojas" : "labi"})
          </p>
        </div>

        {tokenExpired ? (
          <div className="mt-4 rounded-sm border border-destructive/40 bg-destructive/5 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm font-medium text-destructive">NWG pieejas atļauja beigusies</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              NWG vairs neatzīst mūsu pieslēgšanās atļauju, tāpēc procents stāv uz vietas — jaunas cenas netiek
              saņemtas. Ielogojies NWG portālā, nokopē jauno pieejas kodu (refresh token) un ievieto to šeit. Pēc
              saglabāšanas cenu sinhronizācija tiek palaista automātiski.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="NWG refresh token"
                className="rounded-sm"
                autoComplete="off"
              />
              <Button
                onClick={seedToken}
                disabled={seeding || token.trim().length < 20}
                className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Saglabāt un palaist
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => run({ key: "nwg-prices", label: "NWG līgumcenas", fn: "nwg-price-sync" })}
              disabled={running === "nwg-prices"}
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${running === "nwg-prices" ? "animate-spin" : ""}`} />
              Palaist cenu sinhronizāciju
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncHealthPanel;
