import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Mail, Paperclip, Phone, Printer, RefreshCw, ShieldAlert, ShieldCheck, ListChecks, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadManagerArtwork, getManagerRequest } from "@/lib/managerRequest.functions";

const BILLING: Record<string, string> = { company: "Uzņēmums", regNo: "Reģ. Nr.", vatNo: "PVN Nr.", address: "Juridiskā adrese", delivery: "Piegādes adrese", bank: "Banka", iban: "Konta numurs (IBAN)", bic: "SWIFT/BIC" };
const METHOD: Record<string, string> = { consult: "Nezinu / konsultēties", silkscreen: "Sietspiede", dtf: "DTF", termodruka: "Termodruka", embroidery: "Izšūšana", sublimation: "Sublimācija", other: "Cita", none: "Bez apdrukas" };
const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;
const kb = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** Focused staff page opened from the PM email: request, files, Reply. No admin navigation. */
export default function ManagerRequestPage() {
  const { id } = useParams({ from: "/pieprasijums/$id" });
  const [key, setKey] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const k = new URLSearchParams(window.location.hash.slice(1)).get("k") || undefined;
    setKey(k); setReady(true);
  }, []);
  const load = useServerFn(getManagerRequest);
  const download = useServerFn(downloadManagerArtwork);
  const query = useQuery({ queryKey: ["manager-request", id, key], enabled: ready, retry: 1, queryFn: () => load({ data: { id, key } }) });
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const get = async (fileId: string, retry = false) => {
    setBusy(fileId);
    try {
      const r = await download({ data: { id, key, fileId, retry } });
      if (r.url) { window.location.assign(r.url); setNotes((n) => ({ ...n, [fileId]: "" })); }
      else { setNotes((n) => ({ ...n, [fileId]: r.note || "Fails nav pieejams." })); query.refetch(); }
    } catch { setNotes((n) => ({ ...n, [fileId]: "Savienojums pārtrūka. Mēģiniet vēlreiz." })); }
    finally { setBusy(null); }
  };

  if (!ready || query.isLoading) return <Shell><p className="text-muted-foreground">Ielādē pieprasījumu…</p></Shell>;
  if (query.isError) return <Shell><p className="mb-3">Pieprasījumu neizdevās ielādēt.</p><Button onClick={() => query.refetch()}><RefreshCw className="mr-2 h-4 w-4" />Mēģināt vēlreiz</Button></Shell>;
  const res = query.data;
  if (!res || !res.authorized) {
    const back = `/pieprasijums/${id}`;
    return <Shell>
      <h1 className="mb-2 text-xl font-bold">{res?.reason === "expired" ? "Saite ir novecojusi" : "Nepieciešama darbinieka pierakstīšanās"}</h1>
      <p className="mb-4 text-sm text-muted-foreground">Pēc pierakstīšanās atgriezīsieties tieši šajā pieprasījumā.</p>
      <Button asChild><a href={`/login?redirect=${encodeURIComponent(back)}`}><LogIn className="mr-2 h-4 w-4" />Pierakstīties</a></Button>
    </Shell>;
  }
  const q = res.request as any;
  const items: any[] = Array.isArray(q.items) ? q.items : [];
  const total = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unitPrice) || 0), 0);
  const subject = `Re: Pieprasījums ${q.ref || ""} — Ervitex`.trim();
  const printNeeded = q.print_method && q.print_method !== "none";

  return <Shell>
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Pieprasījums {q.ref || ""} · {new Date(q.created_at).toLocaleString("lv-LV")}</p>
        <h1 className="break-words text-2xl font-bold">{q.company || q.name}</h1>
        <p className="text-sm">{q.name}</p>
        <p className="flex flex-wrap gap-x-4 text-sm text-muted-foreground"><a className="underline" href={`mailto:${q.email}`}>{q.email}</a>{q.phone && <a href={`tel:${q.phone}`} className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{q.phone}</a>}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild><a href={`mailto:${q.email}?subject=${encodeURIComponent(subject)}`}><Mail className="mr-2 h-4 w-4" />Atbildēt klientam</a></Button>
        {q.worksheetPath && <Button variant="outline" asChild><a href={q.worksheetPath} target="_blank" rel="noopener"><ListChecks className="mr-2 h-4 w-4" />Preču saraksts</a></Button>}
      </div>
    </header>

    {(printNeeded || q.deadline) && <section className="mb-5 rounded-sm border border-accent/40 bg-accent/10 p-3 text-sm">
      {printNeeded && <p className="flex items-center gap-2 font-bold uppercase tracking-wider text-accent"><Printer className="h-4 w-4" />Apdruka nepieciešama</p>}
      <p className="mt-1 flex flex-wrap gap-x-4">{q.print_method && <span>Tehnoloģija: <b>{METHOD[q.print_method] || q.print_method}</b></span>}{q.print_placement && <span>Vieta: <b>{q.print_placement}</b></span>}{q.print_colors && <span>Krāsas: <b>{q.print_colors}</b></span>}{q.deadline && <span>Termiņš: <b>{q.deadline}</b></span>}</p>
    </section>}

    <section className="mb-5">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><Paperclip className="h-4 w-4" />Faili ({res.files.length})</h2>
      {res.files.length === 0 ? <p className="text-sm text-muted-foreground">Faili nav pievienoti.</p> :
        <ul className="space-y-2">{res.files.map((f) => {
          const blocked = f.status === "rejected" || f.status === "infected";
          return <li key={f.id} className="rounded-sm border border-border bg-card p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0"><p className="break-all font-medium">{f.name}</p><p className="flex items-center gap-1 text-xs text-muted-foreground">{blocked ? <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> : <ShieldCheck className="h-3.5 w-3.5" />}{kb(f.size)} · {f.note || (f.status === "validated" ? "Pārbaudīts automātiski" : f.status)}</p></div>
              {f.downloadable ? <Button size="sm" disabled={busy === f.id} onClick={() => get(f.id)}><Download className="mr-2 h-4 w-4" />Lejupielādēt</Button>
                : !blocked ? <Button size="sm" variant="outline" disabled={busy === f.id} onClick={() => get(f.id, true)}><RefreshCw className="mr-2 h-4 w-4" />Pārbaudīt vēlreiz</Button>
                : <span className="text-xs font-semibold text-destructive">Bloķēts</span>}
            </div>
            {notes[f.id] && <p className="mt-1 text-xs text-destructive">{notes[f.id]}</p>}
          </li>;
        })}</ul>}
    </section>

    {items.length > 0 && <section className="mb-5">
      <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Preces</h2>
      <ul className="divide-y divide-border rounded-sm border border-border">{items.map((i, n) => <li key={n} className="flex gap-3 p-3">
        {i.image ? <img src={i.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-sm bg-muted object-contain" /> : <div className="h-16 w-16 shrink-0 rounded-sm bg-muted" />}
        <div className="min-w-0 flex-1 text-sm"><p className="font-medium">{i.name || "—"}</p><p className="text-xs text-muted-foreground">{[i.brand, i.code].filter(Boolean).join(" · ")}</p><p className="text-xs">{[i.colorName || i.colorCode, i.size].filter(Boolean).join(" · ")}</p></div>
        <div className="text-right text-sm tabular-nums"><p className="font-semibold">{i.qty} gab.</p>{Number(i.unitPrice) > 0 && <p className="text-xs text-muted-foreground">{eur(Number(i.unitPrice))}/gab.</p>}</div>
      </li>)}</ul>
      {total > 0 && <p className="mt-2 text-right text-sm text-muted-foreground">Kataloga cenas kopā: <b className="text-foreground">{eur(total)}</b></p>}
    </section>}

    {q.message && <section className="mb-5"><h2 className="mb-2 text-sm font-bold uppercase tracking-wider">Ziņa</h2><p className="whitespace-pre-wrap break-words rounded-sm border border-border bg-card p-3 text-sm">{q.message}</p></section>}
    {q.billing && Object.values(q.billing).some(Boolean) && <section className="mb-5 text-sm"><h2 className="mb-2 font-bold uppercase tracking-wider">Rekvizīti</h2>{Object.keys(BILLING).filter((k) => (q.billing as Record<string, string>)[k]).map((k) => <p key={k}><span className="text-muted-foreground">{BILLING[k]}: </span>{(q.billing as Record<string, string>)[k]}</p>)}</section>}
  </Shell>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-screen max-w-3xl bg-background px-4 py-6 text-foreground sm:py-10">{children}</main>;
}
