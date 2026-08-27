import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Paperclip, RefreshCw } from "lucide-react";

interface QuoteItem {
  source?: string;
  productId?: string;
  name?: string;
  code?: string;
  brand?: string | null;
  colorName?: string | null;
  colorCode?: string | null;
  size?: string | null;
  qty?: number;
  unitPrice?: number | null;
}

interface QuoteRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string;
  created_at: string;
  items: QuoteItem[] | null;
  file_urls: string[] | null;
  assigned_pm_email: string | null;
  assigned_pm_name: string | null;
  print_method: string | null;
  print_placement: string | null;
  print_colors: string | null;
  deadline: string | null;
}

const STATUS_OPTIONS = [
  { value: "new", label: "Jauns" },
  { value: "contacted", label: "Sazināts" },
  { value: "quoted", label: "Nosūtīts piedāvājums" },
  { value: "closed", label: "Slēgts" },
];

const statusColors: Record<string, string> = {
  new: "bg-accent text-accent-foreground",
  contacted: "bg-blue-500 text-white",
  quoted: "bg-yellow-500 text-black",
  closed: "bg-muted text-muted-foreground",
};

const statusLabel = (val: string) => STATUS_OPTIONS.find((s) => s.value === val)?.label || val;
const eur = (n: number) => `${n.toFixed(2)} €`;

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quote_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else setQuotes((data as unknown as QuoteRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  };

  /** Pielikumi glabājas privātā glabātavā — atveram ar parakstītu, laikā ierobežotu saiti. */
  const openAttachment = async (url: string) => {
    const path = url.includes("/quote-attachments/") ? url.split("/quote-attachments/")[1] : url;
    const { data, error } = await supabase.storage.from("quote-attachments").createSignedUrl(path, 600);
    if (error || !data?.signedUrl) {
      toast({ title: "Nevar atvērt failu", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">Cenu pieprasījumi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pārvaldīt ienākošos pieprasījumus</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQuotes} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunot
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : quotes.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nav cenu pieprasījumu</p>
        ) : (
          quotes.map((q) => {
            const items = Array.isArray(q.items) ? q.items : [];
            const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
            const totalNet = items.reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0);
            return (
              <div key={q.id} className="space-y-3 rounded-sm border border-border p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{q.name}</p>
                      <Badge className={statusColors[q.status] || ""}>{statusLabel(q.status)}</Badge>
                    </div>
                    <p className="break-words text-sm text-muted-foreground">
                      {q.email}
                      {q.phone && ` · ${q.phone}`}
                    </p>
                    {q.company && <p className="text-sm text-muted-foreground">Uzņēmums: {q.company}</p>}
                    {(q.assigned_pm_name || q.assigned_pm_email) && (
                      <p className="text-xs text-muted-foreground">
                        Atbildīgais: {q.assigned_pm_name || q.assigned_pm_email}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString("lv")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-52">
                    <Select value={q.status} onValueChange={(v) => updateStatus(q.id, v)}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a href={`mailto:${q.email}?subject=${encodeURIComponent("Ervitex piedāvājums")}`}>
                        <Mail className="mr-2 h-4 w-4" /> Atbildēt e-pastā
                      </a>
                    </Button>
                  </div>
                </div>

                {(q.print_method || q.print_placement || q.print_colors || q.deadline) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    {q.print_method && <span>Tehnoloģija: <span className="text-foreground">{q.print_method}</span></span>}
                    {q.print_placement && <span>Vieta: <span className="text-foreground">{q.print_placement}</span></span>}
                    {q.print_colors && <span>Krāsas: <span className="text-foreground">{q.print_colors}</span></span>}
                    {q.deadline && <span>Termiņš: <span className="text-foreground">{q.deadline}</span></span>}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Preces ({items.length} rindas · {totalQty} gab.)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-xs">
                        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          <tr>
                            <th className="px-2 py-1 text-left">Prece</th>
                            <th className="px-2 py-1 text-left">Kods</th>
                            <th className="px-2 py-1 text-left">Krāsa</th>
                            <th className="px-2 py-1 text-left">Izmērs</th>
                            <th className="px-2 py-1 text-right">Skaits</th>
                            <th className="px-2 py-1 text-right">Cena/gab.</th>
                            <th className="px-2 py-1 text-right">Summa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, i) => (
                            <tr key={i} className="border-t border-border">
                              <td className="px-2 py-1.5 text-foreground">{it.name || "—"}</td>
                              <td className="px-2 py-1.5 font-mono">{it.code || "—"}</td>
                              <td className="px-2 py-1.5">{it.colorName || it.colorCode || "—"}</td>
                              <td className="px-2 py-1.5">{it.size || "—"}</td>
                              <td className="px-2 py-1.5 text-right">{it.qty ?? 0}</td>
                              <td className="px-2 py-1.5 text-right">{it.unitPrice ? eur(it.unitPrice) : "—"}</td>
                              <td className="px-2 py-1.5 text-right">
                                {it.unitPrice ? eur(it.unitPrice * (it.qty || 0)) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalNet > 0 && (
                      <p className="mt-2 text-right text-xs text-muted-foreground">
                        Kopā bez PVN: <span className="font-semibold text-foreground">{eur(totalNet)}</span> · ar PVN 21%:{" "}
                        <span className="font-semibold text-foreground">{eur(totalNet * 1.21)}</span>
                      </p>
                    )}
                  </div>
                )}

                {q.file_urls && q.file_urls.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Pielikumi</p>
                    <div className="flex flex-wrap gap-2">
                      {q.file_urls.map((u, i) => (
                        <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => openAttachment(u)}>
                          <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                          {decodeURIComponent(u.split("/").pop() || `Fails ${i + 1}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {q.message && (
                  <p className="whitespace-pre-wrap border-t border-border pt-3 text-sm text-muted-foreground">{q.message}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQuotes;
