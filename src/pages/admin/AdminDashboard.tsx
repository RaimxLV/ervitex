import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import NwgSyncProgress from "@/components/admin/NwgSyncProgress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, FileText, TrendingUp, RefreshCw, CheckCircle2, AlertTriangle, BadgeEuro } from "lucide-react";

interface SourceSummary {
  source: string;
  variants: number;
  checked: number;
  mismatches: number;
  missing_base: number;
}

interface SyncRow {
  source: string;
  status: string;
  message: string | null;
  started_at: string;
  finished_at: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  ss: "Stanley/Stella",
  nwg: "NWG (Craft, Clique, ProJob, C&B)",
  pf: "PF Concept (prezentmateriāli)",
  bb: "Beechfield / Bagbase",
  mf: "Malfini",
  ru: "Russell Europe",
};

/** Sinhronizācijas soļi tiek izsaukti ar taimautu, lai panelis nekad neuzkārtos. */
const SYNC_TIMEOUT_MS = 120_000;

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ quotes: 0, newQuotes: 0, offers: 0, sentOffers: 0 });
  const [sources, setSources] = useState<SourceSummary[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [q, nq, o, so, sum, logs] = await Promise.all([
      supabase.from("quote_requests").select("*", { count: "exact", head: true }),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("pm_offers").select("*", { count: "exact", head: true }),
      supabase.from("pm_offers").select("*", { count: "exact", head: true }).neq("status", "draft"),
      supabase.rpc("price_audit_summary" as never),
      supabase
        .from("sync_logs")
        .select("source,status,message,started_at,finished_at")
        .order("started_at", { ascending: false })
        .limit(60),
    ]);

    setStats({
      quotes: q.count ?? 0,
      newQuotes: nq.count ?? 0,
      offers: o.count ?? 0,
      sentOffers: so.count ?? 0,
    });

    setSources(
      ((sum.data as unknown as SourceSummary[]) || []).map((r) => ({
        ...r,
        variants: Number(r.variants),
        checked: Number(r.checked),
        mismatches: Number(r.mismatches),
        missing_base: Number(r.missing_base),
      })),
    );

    // Pēdējais ieraksts katram avotam (source var būt "stanley-stella:styles" u.tml.)
    const latest = new Map<string, SyncRow>();
    for (const row of ((logs.data as unknown as SyncRow[]) || [])) {
      const key = row.source.split(":")[0];
      if (!latest.has(key)) latest.set(key, row);
    }
    setSyncLogs([...latest.values()]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const callSync = async (mode: string) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stanley-stella-sync?mode=${mode}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      const res = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const data = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    } catch (e) {
      if ((e as Error).name === "AbortError") throw new Error("Solis pārsniedza 2 minūtes un tika apturēts");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  };

  const runSync = async () => {
    setSyncing(true);
    const steps: [string, string][] = [
      ["colors", "Krāsas"],
      ["sizes", "Izmēri"],
      ["styles", "Modeļi un varianti"],
      ["stock", "Pieejamība"],
      ["prices", "Iepirkuma cenas"],
    ];
    const failed: string[] = [];
    for (const [mode, label] of steps) {
      setSyncStep(label);
      try {
        await callSync(mode);
      } catch (e) {
        failed.push(`${label}: ${(e as Error).message}`);
      }
    }
    setSyncStep(null);
    setSyncing(false);
    if (failed.length) {
      toast({
        title: "Sinhronizācija pabeigta ar kļūdām",
        description: failed.join(" · "),
        variant: "destructive",
      });
    } else {
      toast({ title: "Stanley/Stella katalogs sinhronizēts" });
    }
    await load();
  };

  const cards = [
    { label: "Pieprasījumi", value: stats.quotes, icon: MessageSquare, to: "/admin/quotes" },
    { label: "Jauni pieprasījumi", value: stats.newQuotes, icon: TrendingUp, to: "/admin/quotes" },
    { label: "Piedāvājumi", value: stats.offers, icon: FileText, to: "/admin/offers" },
    { label: "Nosūtīti piedāvājumi", value: stats.sentOffers, icon: FileText, to: "/admin/offers" },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">Galvenais panelis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ervitex pārskata skats</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunot
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className="rounded-sm border border-border bg-card p-4 transition-colors hover:border-accent sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground sm:text-sm">{card.label}</p>
              <card.icon className="h-4 w-4 shrink-0 text-accent sm:h-5 sm:w-5" />
            </div>
            <p className="mt-2 font-heading text-2xl font-black text-foreground sm:text-3xl">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Katalogu statuss */}
      <div className="mt-8 rounded-sm border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Katalogu statuss</h2>
          <Link to="/admin/price-audit" className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline">
            <BadgeEuro className="h-3.5 w-3.5" /> Cenu audits
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-2 py-2 text-left">Piegādātājs</th>
                <th className="px-2 py-2 text-right">Varianti ar cenu</th>
                <th className="px-2 py-2 text-right">Bez bāzes cenas</th>
                <th className="px-2 py-2 text-right">Neatbilstības</th>
                <th className="px-2 py-2 text-left">Pēdējā sinhronizācija</th>
              </tr>
            </thead>
            <tbody>
              {loading && sources.length === 0 ? (
                <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Ielādē...</td></tr>
              ) : sources.length === 0 ? (
                <tr><td colSpan={5} className="px-2 py-6 text-center text-muted-foreground">Nav datu</td></tr>
              ) : (
                sources.map((s) => {
                  const log = syncLogs.find((l) => l.source.startsWith(s.source) || (s.source === "ss" && l.source.startsWith("stanley-stella")));
                  return (
                    <tr key={s.source} className="border-t border-border">
                      <td className="px-2 py-2 font-medium text-foreground">{SOURCE_LABELS[s.source] ?? s.source}</td>
                      <td className="px-2 py-2 text-right">{s.variants.toLocaleString("lv-LV")}</td>
                      <td className="px-2 py-2 text-right">{s.missing_base.toLocaleString("lv-LV")}</td>
                      <td className={`px-2 py-2 text-right ${s.mismatches > 0 ? "font-semibold text-destructive" : ""}`}>
                        {s.mismatches.toLocaleString("lv-LV")}
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        {log ? (
                          <span className="inline-flex items-center gap-1.5">
                            {log.status === "error" ? (
                              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
                            )}
                            {new Date(log.finished_at ?? log.started_at).toLocaleString("lv-LV")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NwgSyncProgress />

      {/* Stanley/Stella sinhronizācija */}
      <div className="mt-8 rounded-sm border border-border bg-card p-4 sm:p-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Stanley/Stella sinhronizācija</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Atjauno krāsas, izmērus, modeļus, variantus, pieejamību un iepirkuma cenas. Katram solim ir 2 minūšu limits — ja kāds solis
          neizdodas, pārējie tomēr izpildās un kļūda tiek parādīta.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={runSync} disabled={syncing} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? syncStep ?? "Sinhronizē..." : "Sinhronizēt katalogu"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
