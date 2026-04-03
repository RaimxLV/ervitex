import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface QuoteRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string;
  created_at: string;
  products: { name_en: string } | null;
}

const STATUS_OPTIONS = ["new", "contacted", "quoted", "closed"];
const statusColors: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  contacted: "bg-blue-500 text-white",
  quoted: "bg-yellow-500 text-black",
  closed: "bg-muted text-muted-foreground",
};

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*, products(name_en)")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setQuotes((data as unknown as QuoteRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchQuotes();
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">Quote Requests</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage incoming quote requests</p>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Loading...</p>
        ) : quotes.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No quote requests yet</p>
        ) : quotes.map(q => (
          <div key={q.id} className="rounded-sm border border-border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{q.name}</p>
                  <Badge className={statusColors[q.status] || ""}>{q.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{q.email} {q.phone && `· ${q.phone}`}</p>
                {q.company && <p className="text-sm text-muted-foreground">Company: {q.company}</p>}
                {q.products && <p className="text-xs text-accent">Product: {q.products.name_en}</p>}
              </div>
              <div className="flex items-center gap-2">
                <Select value={q.status} onValueChange={v => updateStatus(q.id, v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {q.message && <p className="text-sm text-muted-foreground border-t border-border pt-3">{q.message}</p>}
            <p className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminQuotes;
