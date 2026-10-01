import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { worksheetPath, worksheetUrl } from "@/lib/worksheet";
import {
  ChevronDown,
  ClipboardList,
  Copy,
  Mail,
  Paperclip,
  RefreshCw,
  History,
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
  worksheet_locked?: boolean;
}

interface QuoteEvent {
  id: string;
  quote_id: string;
  event_type: string;
  actor_name: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

const EVENT_LABELS: Record<string, string> = {
  submitted: "Pieprasījums iesniegts",
  assigned: "Nodots",
  worksheet_confirmed: "Preču saraksts apstiprināts",
  completed: "Pabeigts",
  reopened: "Atvērts atkārtoti",
};

const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [events, setEvents] = useState<QuoteEvent[]>([]);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    setLoading(true);
    const [{ data, error }, eventResult] = await Promise.all([
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("quote_events").select("*").order("created_at", { ascending: false }).limit(2000),
    ]);
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    else setQuotes((data as unknown as QuoteRow[]) || []);
    if (!eventResult.error) setEvents((eventResult.data as QuoteEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  /** Dzēš pieprasījumu un tam pievienotos failus. */
  const remove = async (row: QuoteRow) => {
    if (!confirm(`Dzēst pieprasījumu (${row.name})? To nevar atsaukt.`)) return;
    setBusy(row.id);
    const paths = (row.file_urls || [])
      .map((u) => (u.includes("/quote-attachments/") ? u.split("/quote-attachments/")[1] : u))
      .filter((p) => p && !/^https?:\/\//i.test(p));
    if (paths.length) await supabase.storage.from("quote-attachments").remove(paths);
    const { error } = await supabase.from("quote_requests").delete().eq("id", row.id);
    setBusy(null);
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    setQuotes((prev) => prev.filter((x) => x.id !== row.id));
    toast({ title: "Pieprasījums izdzēsts" });
  };

  const copyText = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title });
    } catch {
      toast({ title: "Neizdevās nokopēt", variant: "destructive" });
    }
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

  const search = q.trim().toLowerCase();
  const matches = (row: QuoteRow) => {
    if (!search) return true;
    const itemText = (Array.isArray(row.items) ? row.items : [])
      .map((i) => [i.name, i.code, i.brand, i.colorName, i.size].filter(Boolean).join(" "))
      .join(" ");
    return [row.name, row.company, row.email, row.phone, row.message, itemText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  };

  const qtyOf = (row: QuoteRow) =>
    (Array.isArray(row.items) ? row.items : []).reduce((s, i) => s + (i.qty || 0), 0);

  const visible = quotes
    .filter(matches)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">
            Visi pasūtījumi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {quotes.length} pieprasījumu vēsture
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchQuotes} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atjaunot
        </Button>
      </div>

      <div className="mt-5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Meklēt: klients, uzņēmums, e-pasts, telefons, prece…"
          className="sm:max-w-sm"
        />
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {search ? "Nekas netika atrasts" : "Nav pieprasījumu"}
          </p>
        ) : (
          visible.map((row) => {
            const items = Array.isArray(row.items) ? row.items : [];
            const totalQty = qtyOf(row);
            const age = daysSince(row.created_at);
            const isOpen = expanded === row.id;
            return (
              <div key={row.id} className="overflow-hidden rounded-sm border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {row.company || row.name}
                      </span>
                      {row.company && (
                        <span className="truncate text-xs text-muted-foreground">{row.name}</span>
                      )}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="truncate">{row.email}</span>
                      {row.phone && <span>· {row.phone}</span>}
                      {items.length > 0 && (
                        <span>
                          · {items.length} preces, {totalQty} gab.
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                    {new Date(row.created_at).toLocaleDateString("lv")}
                    <span className="block">{age === 0 ? "šodien" : `${age} d. atpakaļ`}</span>
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{row.name}</p>
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
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a
                            href={`mailto:${row.email}?subject=${encodeURIComponent(
                              "Cenu pieprasījums",
                            )}`}
                          >
                            <Mail className="mr-2 h-4 w-4" /> Rakstīt klientam
                          </a>
                        </Button>
                        {row.action_token && (
                          <>
                            <Button asChild size="sm" className="w-full">
                              <a href={worksheetPath(row.action_token)} target="_blank" rel="noreferrer">
                                <ClipboardList className="mr-2 h-4 w-4" /> Preču saraksts
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => copyText(worksheetUrl(row.action_token!), "Saraksta saite nokopēta")}
                            >
                              <Copy className="mr-1.5 h-3.5 w-3.5" /> Kopēt saraksta saiti
                            </Button>
                          </>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() =>
                              copyText(
                                [row.name, row.email, row.phone, row.company]
                                  .filter(Boolean)
                                  .join(" · "),
                                "Klienta dati nokopēti",
                              )
                            }
                          >
                            <Copy className="mr-1.5 h-3.5 w-3.5" /> Kopēt
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs text-destructive"
                            disabled={busy === row.id}
                            onClick={() => remove(row)}
                          >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Dzēst
                          </Button>
                        </div>
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
                    {events.some((event) => event.quote_id === row.id) && (
                      <div className="border-t border-border pt-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          <History className="h-3.5 w-3.5" /> Darbību vēsture
                        </p>
                        <ol className="space-y-2">
                          {events.filter((event) => event.quote_id === row.id).map((event) => {
                            const target = typeof event.details?.to === "string" ? event.details.to : null;
                            const revision = typeof event.details?.revision === "number" ? ` · versija ${event.details.revision}` : "";
                            return (
                              <li key={event.id} className="flex flex-wrap items-baseline gap-x-2 text-xs">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                                <span className="font-medium text-foreground">{EVENT_LABELS[event.event_type] || event.event_type}</span>
                                {(target || event.actor_name) && <span className="text-muted-foreground">{target || event.actor_name}</span>}
                                <span className="text-muted-foreground">{revision} · {new Date(event.created_at).toLocaleString("lv-LV")}</span>
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    )}
                  </div>
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
