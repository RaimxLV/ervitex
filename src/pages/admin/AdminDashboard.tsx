import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Package, MessageSquare, FolderTree, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ products: 0, categories: 0, quotes: 0, newQuotes: 0 });

  useEffect(() => {
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
    fetchStats();
  }, []);

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
    </AdminLayout>
  );
};

export default AdminDashboard;
