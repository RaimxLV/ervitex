import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { worksheetPath, worksheetUrl } from "@/lib/worksheet";
import { ASSIGNEES } from "@/data/assignees";
import RequestPrintStatus from "@/components/quote/RequestPrintStatus";
import ExpandableMessage from "@/components/quote/ExpandableMessage";
import { CreateOfferButton } from "@/components/quote/CreateOfferButton";
import { requestConversionSource, CONFIRMED_EMPTY_MESSAGE } from "@/lib/requestOffer";
import { attachmentName } from "@/lib/requestPresentation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ClipboardList,
  Copy,
  Mail,
  Paperclip,
  RefreshCw,
  History,
  Trash2,
  Phone, Search, X, Package, UserRound, Forward, MoreHorizontal,
  Printer,
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

const PM_TABS = [
  { slug: "all", label: "Visi" },
  { slug: "laura", label: "Laura" },
  { slug: "ilona", label: "Ilona" },
  { slug: "justine", label: "Justīne" },
  { slug: "santa", label: "Santa" },
];

/** Krāsu indikators pēc pieprasījuma vecuma: šodiena — zaļš, 1–2 d. — dzeltens, 3+ d. — sarkans. */
const ageBadgeClass = (age: number) =>
  age === 0
    ? "bg-success/15 text-success"
    : age <= 2
      ? "quote-age-recent"
      : "bg-destructive/15 text-destructive";

const ageLabel = (age: number) => (age === 0 ? "Šodien" : age === 1 ? "Vakar" : `${age} d.`);

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [events, setEvents] = useState<QuoteEvent[]>([]);
  const [period, setPeriod] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<QuoteRow | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    setLoading(true);
    setLoadError(false);
    const [{ data, error }, eventResult] = await Promise.all([
      supabase.from("quote_requests").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("quote_events").select("*").order("created_at", { ascending: false }).limit(2000),
    ]);
    if (error) { setLoadError(true); toast({ title: "Neizdevās ielādēt pieprasījumus", variant: "destructive" }); }
    else setQuotes((data as unknown as QuoteRow[]) || []);
    if (!eventResult.error) setEvents((eventResult.data as QuoteEvent[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  /** Dzēš pieprasījumu un tam pievienotos failus. */
  const remove = async (row: QuoteRow) => {
    setBusy(row.id);
    const paths = (row.file_urls || [])
      .map((u) => (u.includes("/quote-attachments/") ? u.split("/quote-attachments/")[1] : u))
      .filter((p) => p && !/^https?:\/\//i.test(p));
    if (paths.length) await supabase.storage.from("quote-attachments").remove(paths);
    const { error } = await supabase.from("quote_requests").delete().eq("id", row.id);
    setBusy(null);
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    setQuotes((prev) => prev.filter((x) => x.id !== row.id));
    setDeleteTarget(null);
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
    return [row.name, row.company, row.email, row.phone, row.message, row.assigned_pm_name, itemText]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);
  };

  const qtyOf = (row: QuoteRow) =>
    (Array.isArray(row.items) ? row.items : []).reduce((s, i) => s + (i.qty || 0), 0);

  const visible = quotes
    .filter(matches)
    .filter((row) => tab === "all" || row.assigned_pm_slug === tab)
    .filter((row) => period === "all" || daysSince(row.created_at) < Number(period))
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-black uppercase tracking-wide text-foreground sm:text-2xl">
            Pieprasījumi
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

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-lg">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Meklēt: klients, uzņēmums, e-pasts, telefons, prece…"
          aria-label="Meklēt pieprasījumus"
          className="pl-9 pr-10"
        />
        {q && <Button variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setQ("")} aria-label="Notīrīt meklēšanu"><X /></Button>}
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Pieprasījumu periods"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Viss periods</SelectItem><SelectItem value="1">Šodien</SelectItem><SelectItem value="7">Pēdējās 7 dienas</SelectItem><SelectItem value="30">Pēdējās 30 dienas</SelectItem></SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {PM_TABS.map((t) => {
          const count =
            t.slug === "all"
              ? quotes.length
              : quotes.filter((row) => row.assigned_pm_slug === t.slug).length;
          return (
            <Button
              key={t.slug}
              type="button"
              variant="ghost"
              aria-pressed={tab === t.slug}
              onClick={() => setTab(t.slug)}
              className={`h-10 rounded-md px-3.5 text-sm transition-colors ${
                tab === t.slug
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </Button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">{visible.length} pieprasījumi · {visible.reduce((sum, row) => sum + qtyOf(row), 0)} gab.</p>
      <div className="mt-3 space-y-4">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground">Ielādē...</p>
        ) : loadError ? (
          <div className="py-8 text-center text-muted-foreground"><p>Neizdevās ielādēt pieprasījumus</p><Button variant="outline" className="mt-3" onClick={fetchQuotes}><RefreshCw />Mēģināt vēlreiz</Button></div>
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
              <article key={row.id} className={`overflow-hidden rounded-md border bg-card transition-colors ${isOpen ? "border-accent/50" : "border-border"}`}>
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={isOpen}
                  aria-controls={`quote-${row.id}`}
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                  className="flex h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-none px-4 py-4 text-left hover:bg-muted/40 hover:text-foreground sm:px-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="break-words text-base font-semibold text-foreground">
                        {row.company || row.name}
                      </span>
                      {row.company && (
                        <span className="truncate text-xs text-muted-foreground">{row.name}</span>
                      )}
                    </span>
                    <span className="mt-2 block"><RequestPrintStatus method={row.print_method} /></span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{row.assigned_pm_name || "Nav piešķirts"}</span>
                      {!!row.file_urls?.length && <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{row.file_urls.length}</span>}
                      {row.deadline && <span>Termiņš: {row.deadline}</span>}
                    </span>
                    {row.message && <span className="mt-2 line-clamp-2 block text-xs font-normal text-muted-foreground">{row.message}</span>}
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
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${ageBadgeClass(age)}`}
                    >
                      {ageLabel(age)}
                    </span>
                      <span className="text-[11px] text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("lv")}
                    </span>
                  </span>
                  <ChevronDown
                    className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5 sm:px-5">
                  {row.action_token && <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><a href={worksheetPath(row.action_token)} target="_blank" rel="noreferrer"><ClipboardList />Preču saraksts</a></Button>}
                  <CreateOfferButton requestId={row.id} compact blockedReason={requestConversionSource(row) === "confirmed_empty" ? CONFIRMED_EMPTY_MESSAGE : undefined} />
                  <Button asChild variant="outline" size="sm"><a href={`mailto:${row.email}?subject=${encodeURIComponent("Cenu pieprasījums")}`}><Mail />Rakstīt</a></Button>
                  {row.phone && <Button asChild variant="ghost" size="icon"><a href={`tel:${row.phone.replace(/[^+\d]/g, "")}`} title="Zvanīt klientam" aria-label="Zvanīt klientam"><Phone /></a></Button>}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="ml-auto" aria-label={`Vairāk darbību: ${row.company || row.name}`} title="Vairāk darbību"><MoreHorizontal /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      {row.action_token && <DropdownMenuItem onSelect={() => { if (row.action_token) void copyText(worksheetUrl(row.action_token), "Saraksta saite nokopēta"); }}><Copy className="mr-2 h-4 w-4" />Kopēt saraksta saiti</DropdownMenuItem>}
                      <DropdownMenuItem onSelect={() => void copyText([row.name, row.email, row.phone, row.company].filter(Boolean).join(" · "), "Klienta dati nokopēti")}><Copy className="mr-2 h-4 w-4" />Kopēt klienta datus</DropdownMenuItem>
                      <DropdownMenuLabel>Pārsūtīt e-pastā</DropdownMenuLabel>
                      {ASSIGNEES.map((person) => <DropdownMenuItem key={person.slug} asChild><a href={`mailto:${person.slug === "laura" ? "birojs@ervitex.lv" : person.email}?subject=${encodeURIComponent(`Pieprasījums — ${row.company || row.name}`)}&body=${encodeURIComponent([row.name, row.company, row.email, row.phone, row.message, row.action_token ? worksheetUrl(row.action_token) : ""].filter(Boolean).join("\n"))}`}><Forward className="mr-2 h-4 w-4" />{person.name}</a></DropdownMenuItem>)}
                      <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteTarget(row)}><Trash2 className="mr-2 h-4 w-4" />Dzēst pieprasījumu</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {(!!row.file_urls?.length || (row.print_method && row.print_method !== "none")) && (
                  <div className="border-t border-accent/40 bg-accent/10 px-4 py-3 sm:px-5">
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold uppercase tracking-wider text-accent">
                      {row.print_method && row.print_method !== "none" && <span className="flex items-center gap-1.5"><Printer className="h-4 w-4" />Apdruka nepieciešama</span>}
                      {!!row.file_urls?.length && <span className="flex items-center gap-1.5"><Paperclip className="h-4 w-4" />Pievienoti {row.file_urls.length} faili</span>}
                    </p>
                    {!!row.file_urls?.length && <div className="mt-2 flex flex-wrap gap-2">
                      {row.file_urls.map((u, i) => (
                        <Button key={i} variant="outline" size="sm" className="h-auto min-h-9 max-w-full justify-start whitespace-normal break-all bg-background py-2 text-left text-xs" onClick={() => openAttachment(u)}>
                          <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                          {attachmentName(u)}
                        </Button>
                      ))}
                    </div>}
                  </div>
                )}
                {isOpen && (
                  <div id={`quote-${row.id}`} className="space-y-3 border-t border-border p-4 sm:p-5">
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

                    </div>

                    {items.length > 0 && <div className="border-t border-border pt-3">
                      <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Package className="h-4 w-4 text-accent" />Pieprasītās preces <span className="ml-auto text-xs font-normal text-muted-foreground">{totalQty} gab.</span></p>
                      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-muted-foreground"><tr className="border-b border-border"><th className="py-2 pr-3 font-medium">Prece</th><th className="py-2 pr-3 font-medium">Krāsa</th><th className="py-2 pr-3 font-medium">Izmērs</th><th className="py-2 text-right font-medium">Daudzums</th></tr></thead><tbody>{items.map((item, index) => <tr key={index} className="border-b border-border last:border-0"><td className="min-w-32 py-3 pr-3"><span className="block font-medium text-foreground">{item.name || "—"}</span><span className="text-muted-foreground">{[item.brand, item.code].filter(Boolean).join(" · ")}</span></td><td className="py-3 pr-3">{item.colorName || item.colorCode || "—"}</td><td className="py-3 pr-3">{item.size || "—"}</td><td className="py-3 text-right font-semibold tabular-nums">{item.qty || 0}</td></tr>)}</tbody></table></div>
                    </div>}

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
                            <Button key={i} variant="outline" size="sm" className="h-auto min-h-9 max-w-full justify-start whitespace-normal break-all py-2 text-left text-xs" onClick={() => openAttachment(u)}>
                              <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                              {attachmentName(u)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {row.message && (
                      <div className="border-t border-border pt-3"><ExpandableMessage message={row.message} /></div>
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
              </article>
            );
          })
        )}
      </div>
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open && !busy) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader><AlertDialogTitle>Dzēst pieprasījumu?</AlertDialogTitle><AlertDialogDescription>{deleteTarget?.company || deleteTarget?.name} — pieprasījums un pielikumi tiks dzēsti neatgriezeniski.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={!!busy}>Atcelt</AlertDialogCancel><Button variant="destructive" disabled={!!busy} onClick={() => { if (deleteTarget) void remove(deleteTarget); }}><Trash2 />{busy ? "Dzēš…" : "Dzēst"}</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminQuotes;
