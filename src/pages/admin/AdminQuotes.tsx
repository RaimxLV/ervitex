import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ASSIGNEES, assigneeBySlug } from "@/data/assignees";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  FileText,
  Mail,
  Paperclip,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface QuoteItem {
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
  ref: string | null;
  action_token: string | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  assigned_at: string | null;
  assigned_pm_slug: string | null;
  assigned_pm_email: string | null;
  assigned_pm_name: string | null;
  items: QuoteItem[] | null;
  file_urls: string[] | null;
  print_method: string | null;
  print_placement: string | null;
  print_colors: string | null;
  deadline: string | null;
}

const eur = (n: number) => `${n.toFixed(2)} €`;
const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
const isDone = (q: QuoteRow) => q.status === "closed";

type TabKey = "unassigned" | "mine" | "active" | "done";

const TABS: { key: TabKey; label: string }[] = [
  { key: "unassigned", label: "Nenodotie" },
  { key: "mine", label: "Mani" },
  { key: "active", label: "Visi aktīvie" },
  { key: "done", label: "Pabeigtie" },
];

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("unassigned");
  const [q, setQ] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const patch = async (id: string, values: Partial<QuoteRow>) => {
    const { error } = await supabase.from("quote_requests").update(values as never).eq("id", id);
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else setQuotes((prev) => prev.map((x) => (x.id === id ? { ...x, ...values } : x)));
  };

  const assign = (row: QuoteRow, slug: string) => {
    const p = assigneeBySlug(slug);
    if (!p) return;
    patch(row.id, {
      assigned_pm_slug: p.slug,
      assigned_pm_name: p.name,
      assigned_pm_email: p.email,
      assigned_at: new Date().toISOString(),
    });
  };

  const complete = (row: QuoteRow) =>
    patch(row.id, { status: "closed", completed_at: new Date().toISOString() });

  const reopen = (row: QuoteRow) => patch(row.id, { status: "contacted", completed_at: null });

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

  const myEmail = (user?.email || "").toLowerCase();

  const inTab = (row: QuoteRow, key: TabKey) => {
    if (key === "done") return isDone(row);
    if (isDone(row)) return false;
    if (key === "unassigned") return !row.assigned_pm_slug;
    if (key === "mine") return (row.assigned_pm_email || "").toLowerCase() === myEmail;
    return true;
  };

  const counts = useMemo(
    () =>
      TABS.reduce<Record<TabKey, number>>(
        (acc, t) => ({ ...acc, [t.key]: quotes.filter((x) => inTab(x, t.key)).length }),
        { unassigned: 0, mine: 0, active: 0, done: 0 },
      ),
    [quotes, myEmail],
  );

  const search = q.trim().toLowerCase();
  const visible = quotes.filter(
    (row) =>
      inTab(row, tab) &&
      (!search ||
        [row.ref, row.name, row.company, row.email, row.assigned_pm_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search)),
  );

  const stale = quotes.filter((x) => !isDone(x) && !x.assigned_pm_slug && daysSince(x.created_at) >= 2).length;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">
            Pieprasījumi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sadale un pārskats. Sarakste ar klientu notiek tavā e-pastā.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQuotes} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunot
        </Button>
      </div>

      {stale > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-sm border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-foreground">
            <span className="font-semibold text-destructive">{stale}</span> pieprasījumi stāv nenodoti ilgāk par 2
            dienām.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.key)}
            className="text-xs font-bold uppercase tracking-wider"
          >
            {t.label} ({counts[t.key]})
          </Button>
        ))}
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Meklēt pēc numura, klienta vai atbildīgā…"
        className="mt-4 max-w-sm"
      />

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Šajā sadaļā nav pieprasījumu</p>
        ) : (
          visible.map((row) => {
            const items = Array.isArray(row.items) ? row.items : [];
            const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
            const totalNet = items.reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0);
            const age = daysSince(row.created_at);
            const done = isDone(row);
            const late = !done && age >= 2 && !row.assigned_pm_slug;
            return (
              <div
                key={row.id}
                className={`space-y-3 rounded-sm border p-4 sm:p-5 ${late ? "border-destructive/50" : "border-border"}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {row.ref && (
                        <span className="font-mono text-xs font-bold text-accent">#{row.ref}</span>
                      )}
                      <p className="font-medium text-foreground">{row.name}</p>
                      {done ? (
                        <Badge className="bg-muted text-muted-foreground">Pabeigts</Badge>
                      ) : row.assigned_pm_name ? (
                        <Badge className="bg-blue-500 text-white">{row.assigned_pm_name}</Badge>
                      ) : (
                        <Badge className="bg-accent text-accent-foreground">Nenodots</Badge>
                      )}
                      {!done && (
                        <Badge
                          variant="outline"
                          className={late ? "border-destructive/60 text-destructive" : "text-muted-foreground"}
                        >
                          {age === 0 ? "Šodien" : `${age} d.`}
                        </Badge>
                      )}
                    </div>
                    <p className="break-words text-sm text-muted-foreground">
                      {row.email}
                      {row.phone && ` · ${row.phone}`}
                    </p>
                    {row.company && <p className="text-sm text-muted-foreground">Uzņēmums: {row.company}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString("lv")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-52">
                    <Select value={row.assigned_pm_slug ?? ""} onValueChange={(v) => assign(row, v)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Nodot…" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNEES.map((a) => (
                          <SelectItem key={a.slug} value={a.slug}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <a
                        href={`mailto:${row.email}?subject=${encodeURIComponent(
                          `[#${row.ref || "ERV"}] Cenu pieprasījums`,
                        )}`}
                      >
                        <Mail className="mr-2 h-4 w-4" /> Rakstīt klientam
                      </a>
                    </Button>
                    {done ? (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => reopen(row)}>
                        Atvērt atkal
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => complete(row)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Pabeigts
                      </Button>
                    )}
                  </div>
                </div>

                {(row.print_method || row.print_placement || row.print_colors || row.deadline) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                    {row.print_method && <span>Tehnoloģija: <span className="text-foreground">{row.print_method}</span></span>}
                    {row.print_placement && <span>Vieta: <span className="text-foreground">{row.print_placement}</span></span>}
                    {row.print_colors && <span>Krāsas: <span className="text-foreground">{row.print_colors}</span></span>}
                    {row.deadline && <span>Termiņš: <span className="text-foreground">{row.deadline}</span></span>}
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
                        Kopā bez PVN: <span className="font-semibold text-foreground">{eur(totalNet)}</span> · ar PVN
                        21%: <span className="font-semibold text-foreground">{eur(totalNet * 1.21)}</span>
                      </p>
                    )}
                  </div>
                )}

                {row.file_urls && row.file_urls.length > 0 && (
                  <div className="border-t border-border pt-3">
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Pielikumi</p>
                    <div className="flex flex-wrap gap-2">
                      {row.file_urls.map((u, i) => (
                        <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => openAttachment(u)}>
                          <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                          {decodeURIComponent(u.split("/").pop() || `Fails ${i + 1}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {row.message && (
                  <p className="whitespace-pre-wrap border-t border-border pt-3 text-sm text-muted-foreground">
                    {row.message}
                  </p>
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
