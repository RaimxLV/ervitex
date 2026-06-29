import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Package, MessageSquare, FolderTree, TrendingUp, RefreshCw } from "lucide-react";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ products: 0, categories: 0, quotes: 0, newQuotes: 0 });
  const [syncing, setSyncing] = useState(false);
  
  const [lastSync, setLastSync] = useState<{ status: string; message: string | null; finished_at: string | null } | null>(null);

  const fetchStats = async () => {
    const [p, c, q, nq] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);
    setStats({
      products: p.count ?? 0,
      categories: c.count ?? 0,
      quotes: q.count ?? 0,
      newQuotes: nq.count ?? 0,
    });
  };

  const fetchLastSync = async () => {
    const { data } = await supabase
      .from("sync_logs")
      .select("source, status, message, finished_at")
      .like("source", "stanley-stella%")
      .order("started_at", { ascending: false })
      .limit(5);
    setLastSync(data?.[0] ? (data[0] as any) : null);
  };

  useEffect(() => {
    fetchStats();
    fetchLastSync();
  }, []);

  const runSync = async (mode: string) => {
    setSyncing(true);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stanley-stella-sync?mode=${mode}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Sync failed");
      toast({ title: `Sinhronizēts: ${mode}`, description: JSON.stringify(data.result).slice(0, 140) });
      await fetchLastSync();
    } catch (e: any) {
      toast({ title: "Sinhronizācija neizdevās", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const cards = [
    { label: "Produkti", value: stats.products, icon: Package, color: "text-blue-500" },
    { label: "Kategorijas", value: stats.categories, icon: FolderTree, color: "text-green-500" },
    { label: "Pieprasījumi", value: stats.quotes, icon: MessageSquare, color: "text-purple-500" },
    { label: "Jauni pieprasījumi", value: stats.newQuotes, icon: TrendingUp, color: "text-accent" },
  ];

  const syncModes = [
    { id: "colors",  label: "Krāsas" },
    { id: "sizes",   label: "Izmēri" },
    { id: "styles",  label: "Modeļi" },
    { id: "stock",   label: "Noliktava" },
    { id: "prices",  label: "Cenas" },
    { id: "combos",  label: "Kombo" },
    { id: "images",  label: "Attēli (200)" },
    { id: "all",     label: "VISS" },
  ];

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Galvenais panelis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ervitex pārskata skats</p>

      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-sm border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
            </div>
            <p className="mt-2 font-heading text-2xl sm:text-3xl font-black text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-sm border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-sm font-bold uppercase tracking-wider">Stanley/Stella sinhronizācija</h2>
            {lastSync && (
              <p className="mt-2 text-xs text-muted-foreground">
                Pēdējā ({(lastSync as any).source}): <span className="font-semibold text-foreground">{lastSync.status}</span>
                {lastSync.finished_at && ` · ${new Date(lastSync.finished_at).toLocaleString("lv-LV")}`}
                {lastSync.message && ` · ${lastSync.message}`}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {syncModes.map((m) => (
            <Button
              key={m.id}
              onClick={() => runSync(m.id)}
              disabled={syncing}
              variant={m.id === "all" ? "default" : "outline"}
              className={m.id === "all" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
              size="sm"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {m.label}
            </Button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
