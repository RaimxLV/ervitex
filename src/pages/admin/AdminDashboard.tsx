import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Package, MessageSquare, FolderTree, TrendingUp, RefreshCw, CheckCircle2, AlertTriangle, Search } from "lucide-react";

interface PriceRow {
  sku: string;
  style_code: string;
  purchase_price: number | null;
  suggested_retail_price: number | null;
  currency: string | null;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ products: 0, categories: 0, quotes: 0, newQuotes: 0 });
  const [ssStats, setSsStats] = useState({ styles: 0, variants: 0, stock: 0, prices: 0, images: 0 });
  const [syncing, setSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<string | null>(null);
  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [priceQuery, setPriceQuery] = useState("");

  const [lastSync, setLastSync] = useState<{ status: string; message: string | null; finished_at: string | null } | null>(null);

  const fetchStats = async () => {
    const [p, c, q, nq, ssStyles, ssVariants, ssStock, ssPrices, ssImages] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }),
      supabase.from("quote_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("ss_styles").select("*", { count: "exact", head: true }),
      supabase.from("ss_variants").select("*", { count: "exact", head: true }),
      supabase.from("ss_stock").select("*", { count: "exact", head: true }),
      supabase.from("ss_prices").select("*", { count: "exact", head: true }),
      supabase.from("ss_images").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      products: p.count ?? 0,
      categories: c.count ?? 0,
      quotes: q.count ?? 0,
      newQuotes: nq.count ?? 0,
    });
    setSsStats({
      styles: ssStyles.count ?? 0,
      variants: ssVariants.count ?? 0,
      stock: ssStock.count ?? 0,
      prices: ssPrices.count ?? 0,
      images: ssImages.count ?? 0,
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
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setPricesLoading(true);
    const { data } = await supabase
      .from("ss_prices")
      .select("sku,style_code,purchase_price,suggested_retail_price,currency")
      .order("style_code", { ascending: true })
      .limit(500);
    setPrices((data || []) as PriceRow[]);
    setPricesLoading(false);
  };

  const filteredPrices = useMemo(() => {
    const n = priceQuery.trim().toLowerCase();
    if (!n) return prices;
    return prices.filter((p) => `${p.style_code} ${p.sku}`.toLowerCase().includes(n));
  }, [prices, priceQuery]);

  const callSync = async (mode: string) => {
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
    return data;
  };

  const runSync = async () => {
    setSyncing(true);
    try {
      const steps = [
        ["colors", "Krāsu saraksts"],
        ["sizes", "Izmēru saraksts"],
        ["styles", "Produktu modeļi un varianti"],
        ["stock", "Pieejamība klientu katalogam"],
        ["prices", "Iepirkuma dati administrēšanai"],
      ];
      for (const [mode, label] of steps) {
        setSyncStep(label);
        await callSync(mode);
      }
      toast({ title: "Stanley/Stella katalogs sinhronizēts", description: "Produkti, varianti, noliktavas pieejamība un piegādātāja cenas ir atjaunotas." });
      await fetchStats();
      await fetchLastSync();
    } catch (e: any) {
      toast({ title: "Sinhronizācija neizdevās", description: e.message, variant: "destructive" });
    } finally {
      setSyncStep(null);
      setSyncing(false);
    }
  };

  const runImageSync = async () => {
    setSyncing(true);
    setSyncStep("Attēlu lejupielāde");
    try {
      await callSync("images&maxImages=200");
      toast({ title: "Attēli papildināti", description: "Lejupielādēta nākamā drošā attēlu porcija lokālai glabāšanai." });
      await fetchStats();
      await fetchLastSync();
    } catch (e: any) {
      toast({ title: "Attēlu lejupielāde neizdevās", description: e.message, variant: "destructive" });
    } finally {
      setSyncStep(null);
      setSyncing(false);
    }
  };

  const cards = [
    { label: "Produkti", value: stats.products, icon: Package, color: "text-blue-500" },
    { label: "Kategorijas", value: stats.categories, icon: FolderTree, color: "text-green-500" },
    { label: "Pieprasījumi", value: stats.quotes, icon: MessageSquare, color: "text-purple-500" },
    { label: "Jauni pieprasījumi", value: stats.newQuotes, icon: TrendingUp, color: "text-accent" },
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
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Viena poga atjauno visu klientiem vajadzīgo katalogu: produktus, krāsas, izmērus, variantus, pieejamību un piegādātāja cenas.
            </p>
            {lastSync && (
              <p className="mt-2 text-xs text-muted-foreground">
                Pēdējā sinhronizācija: <span className="font-semibold text-foreground">{lastSync.status}</span>
                {lastSync.finished_at && ` · ${new Date(lastSync.finished_at).toLocaleString("lv-LV")}`}
                {lastSync.message && ` · ${lastSync.message}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runSync} disabled={syncing} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? syncStep ?? "Sinhronizē..." : "Sinhronizēt katalogu"}
            </Button>
            <Button onClick={runImageSync} disabled={syncing} variant="outline">
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              Pievienot nākamos attēlus
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-5">
          {[
            ["Modeļi", ssStats.styles],
            ["Varianti", ssStats.variants],
            ["Pieejamība", ssStats.stock],
            ["Piegādātāja cenas", ssStats.prices],
            ["Attēli", ssStats.images],
          ].map(([label, value]) => (
            <div key={label} className="rounded-sm border border-border bg-background p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="mt-1 font-heading text-xl font-black text-foreground">{Number(value).toLocaleString("lv-LV")}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          {lastSync?.status === "error" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
          <p>
            Pircējiem cenas netiek rādītas automātiski — tās paliek administrēšanai un uzcenojuma kontrolei. Klientiem redzams katalogs un pieprasījuma forma.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
