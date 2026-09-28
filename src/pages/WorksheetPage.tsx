import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { money } from "@/lib/offer";
import {
  PRINT_METHODS, lineNet, printNet, worksheetTotals,
  type PrintLine, type Worksheet, type WorksheetItem, type WorksheetVersion,
} from "@/lib/worksheet";
import { CheckCircle2, ChevronDown, Clock3, Copy, History, Loader2, Mail, Plus, Printer, Repeat, RotateCcw, Send, ShieldCheck, Store, Trash2, Undo2, X } from "lucide-react";
import logo from "@/assets/ervitex-logo-2.svg";
import { ASSIGNEES, assigneeBySlug } from "@/data/assignees";
import { useAuth } from "@/hooks/useAuth";
import { startWorksheetPick } from "@/lib/worksheetPick";
import RowVariantControls from "@/components/worksheet/RowVariantControls";

const num = (v: string) => {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const WorksheetPage = () => {
  const { token } = useParams<{ token: string }>();
  const [sheet, setSheet] = useState<Worksheet | null>(null);
  const [items, setItems] = useState<WorksheetItem[]>([]);
  const [editor, setEditor] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [versions, setVersions] = useState<WorksheetVersion[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveSequence = useRef(0);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isStaff = isAdmin || searchParams.get("v") === "pm";
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const publicUrl = `https://raimxlv.github.io/ervitex/saraksts/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Saite nokopēta");
    } catch {
      window.prompt("Saite", publicUrl);
    }
  };

  const sendToClient = async () => {
    if (!sheet?.email || !token) return;
    setReplySending(true);
    const pmMail = sheet.assigned_pm_email || "laura@ervitex.lv";
    const pmName = sheet.assigned_pm_name || "Laura";
    const { data, error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "worksheet-update",
        recipientEmail: sheet.email,
        replyTo: pmMail,
        fromEmail: pmMail,
        fromName: pmName,
        idempotencyKey: `ws-${token}-r${sheet.revision}-${Date.now()}`,
        templateData: {
          message: replyText.trim(),
          pmName,
          pmEmail: pmMail,
          company: sheet.company || "",
          clientName: sheet.name || "",
          worksheetUrl: publicUrl,
        },
      },
    });
    setReplySending(false);
    if (error || (data as { error?: unknown } | null)?.error) return toast.error("Neizdevās nosūtīt");
    toast.success("Nosūtīts klientam");
    setReplyText("");
    setReplyOpen(false);
  };

  /** Reads the live sheet. `withItems` is false after status actions so local edits survive. */
  const reload = async (withItems: boolean) => {
    const { data } = await supabase.rpc("get_quote_worksheet" as any, { _token: token });
    const row = (Array.isArray(data) ? data[0] : data) as Worksheet | undefined;
    if (!row) return null;
    setSheet(row);
    if (withItems) {
      const activeItems = Array.isArray(row.draft_items) ? row.draft_items : row.items;
      setItems(
        (Array.isArray(activeItems) ? activeItems : []).map((i, idx) => ({
          ...i,
          id: i.id || `row-${idx}`,
          qty: Number(i.qty) || 0,
          prints: Array.isArray(i.prints) ? i.prints : [],
        })),
      );
    }
    return row;
  };

  const loadVersions = async () => {
    const { data } = await supabase.rpc("get_quote_worksheet_versions" as any, { _token: token });
    setVersions((Array.isArray(data) ? data : []) as WorksheetVersion[]);
  };

  useEffect(() => {
    (async () => {
      await reload(true);
      await loadVersions();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const totals = useMemo(() => worksheetTotals(items, sheet?.vat_rate ?? 21), [items, sheet?.vat_rate]);
  const readOnly = !!sheet?.locked;
  const assignedSlug = useMemo(() => {
    const byEmail = ASSIGNEES.find((a) => a.email.toLowerCase() === (sheet?.assigned_pm_email || "").toLowerCase());
    return byEmail?.slug || "";
  }, [sheet?.assigned_pm_email]);
  const statusLabel = sheet?.status === "closed" ? "Pabeigts" : sheet?.assigned_pm_email ? "Darbā" : "Jauns";

  const patch = (id: string, changes: Partial<WorksheetItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
    setDirty(true);
    setSaveState("idle");
  };
  const patchPrint = (id: string, idx: number, changes: Partial<PrintLine>) =>
    patch(id, {
      prints: (items.find((i) => i.id === id)?.prints || []).map((p, n) => (n === idx ? { ...p, ...changes } : p)),
    });
  const addPrint = (id: string) =>
    patch(id, { prints: [...(items.find((i) => i.id === id)?.prints || []), { method: PRINT_METHODS[0], placement: "", price: null }] });
  const removePrint = (id: string, idx: number) =>
    patch(id, { prints: (items.find((i) => i.id === id)?.prints || []).filter((_, n) => n !== idx) });
  const removeRow = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDirty(true);
    setSaveState("idle");
  };

  /** Aizved uz parasto katalogu ar visiem filtriem; izvēlētās preces atgriežas sarakstā. */
  const goCatalog = async (mode: "add" | "swap", row?: WorksheetItem) => {
    if (!token) return;
    if (dirty && !(await save())) return;
    startWorksheetPick({
      token,
      mode,
      rowId: row?.id ?? null,
      label: row ? [row.name, row.colorName, row.size, `${row.qty} gab.`].filter(Boolean).join(" · ") : null,
    });
    navigate("/catalog");
  };

  const save = async (quiet = false) => {
    const sequence = ++saveSequence.current;
    setSaving(true);
    setSaveState("saving");
    const { data, error } = await supabase.rpc("save_quote_worksheet" as any, {
      _token: token,
      _items: items as any,
      _by: editor || null,
      _base_revision: sheet?.revision ?? 0,
    });
    setSaving(false);
    if (error || data === false) {
      setSaveState("error");
      if (!quiet) toast.error(error?.message ? `Neizdevās saglabāt: ${error.message}` : "Neizdevās saglabāt — saraksts ir slēgts");
      return false;
    }
    if (sequence === saveSequence.current) {
      const savedAt = new Date().toISOString();
      setDirty(false);
      setSaveState("saved");
      setSheet((s) => (s ? { ...s, draft_items: items, draft_updated_at: savedAt, draft_updated_by: editor || null } : s));
    }
    if (!quiet) toast.success("Melnraksts saglabāts");
    return true;
  };

  useEffect(() => {
    if (!dirty || readOnly) return;
    const timer = window.setTimeout(() => void save(true), 900);
    return () => window.clearTimeout(timer);
    // `items` is the autosave payload; editor is intentionally captured with it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, editor, dirty, readOnly]);

  const confirmChanges = async () => {
    if (!token) return;
    setActionBusy(true);
    if (dirty && !(await save())) {
      setActionBusy(false);
      return;
    }
    if (!dirty && !sheet?.draft_items) {
      setActionBusy(false);
      toast.success("Saglabāts");
      closeView();
      return;
    }
    const { data, error } = await supabase.rpc("confirm_quote_worksheet" as any, { _token: token, _by: editor || null });
    setActionBusy(false);
    if (error) {
      toast.error("Neizdevās apstiprināt izmaiņas");
      return;
    }
    await Promise.all([reload(true), loadVersions()]);
    setSavedOnce(true);
    setSaveState("saved");
    toast.success(`Saglabāts${typeof data === "number" ? ` · versija ${data}` : ""}`);
    closeView();
  };

  const closeView = () => {
    if (isStaff) {
      setReplyOpen(true);
      return;
    }
    window.setTimeout(() => {
      window.close();
      if (!window.closed) navigate(isAdmin ? "/admin/quotes" : "/");
    }, 600);
  };

  const discardDraft = async () => {
    if (!token || !window.confirm("Atmest visas neapstiprinātās izmaiņas?")) return;
    setActionBusy(true);
    const { data, error } = await supabase.rpc("discard_quote_worksheet_draft" as any, { _token: token });
    setActionBusy(false);
    if (error || data === false) return toast.error("Neizdevās atmest melnrakstu");
    setDirty(false);
    setSaveState("idle");
    await reload(true);
    toast.success("Melnraksts atmests");
  };

  const restoreVersion = async (version: WorksheetVersion) => {
    if (!token || !window.confirm(`Atjaunot versiju ${version.revision} kā jaunu melnrakstu?`)) return;
    setActionBusy(true);
    const { data, error } = await supabase.rpc("restore_quote_worksheet_version" as any, {
      _token: token,
      _version_id: version.id,
      _by: editor || null,
    });
    setActionBusy(false);
    if (error || data === false) return toast.error("Neizdevās atjaunot versiju");
    await reload(true);
    setSaveState("saved");
    toast.success(`Versija ${version.revision} atjaunota kā melnraksts`);
  };
  const assign = async (slug: string) => {
    if (!token || !sheet) return;
    const person = assigneeBySlug(slug);
    if (!person) return;
    setActionBusy(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote-action?token=${token}&action=assign:${person.slug}&format=json`,
      );
      const out = (await res.json().catch(() => null)) as { ok?: boolean; emailed?: boolean } | null;
      if (!res.ok || !out?.ok) throw new Error("Neizdevās nodot");
      await reload(false);
      if (out.emailed === false) toast.warning(`Nodots ${person.name} — vēstule uz ${person.email} neaizgāja`);
      else toast.success(`Nodots ${person.name}`);
    } catch {
      toast.error("Neizdevās nodot");
    } finally {
      setActionBusy(false);
    }
  };

  const complete = async () => {
    if (!sheet) return;
    setActionBusy(true);
    if (dirty && !(await save())) {
      setActionBusy(false);
      return;
    }
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: "closed", completed_at: new Date().toISOString(), worksheet_locked: true } as never)
      .eq("id", sheet.id);
    setActionBusy(false);
    if (error) {
      toast.error("Neizdevās pabeigt");
      return;
    }
    await reload(true);
    toast.success("Pabeigts");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Ielādē…</div>;
  }

  if (!sheet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-heading text-2xl font-black uppercase">Saraksts nav atrasts</h1>
        <p className="text-sm text-muted-foreground">Saite var būt nepilna vai novecojusi. Raksti mums uz birojs@ervitex.lv.</p>
        <Button asChild variant="outline"><Link to="/">Uz sākumlapu</Link></Button>
      </div>
    );
  }

  const pmEmail = sheet.assigned_pm_email || "birojs@ervitex.lv";
  const mailtoNext = `mailto:${isAdmin ? sheet.email || "" : pmEmail}?subject=${encodeURIComponent(
    `Preču saraksts — ${sheet.company || sheet.name || ""}`,
  )}&body=${encodeURIComponent(`${window.location.href}\n\nKopā bez PVN ${totals.net.toFixed(2)} EUR\nKopā ar PVN ${totals.gross.toFixed(2)} EUR\n`)}`;

  return (
    <div className="public-readable min-h-screen bg-muted/30 py-4 sm:py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="mb-3 flex items-center justify-between print:hidden">
          <Link to="/catalog" className="inline-flex items-center gap-1.5 font-heading text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <Store className="h-3.5 w-3.5" /> Ervitex katalogs
          </Link>
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-3.5 w-3.5" /> Drukāt / PDF
          </Button>
        </div>

        <article className="rounded-md border border-border bg-card p-4 sm:p-7">
          <header className="border-b border-border pb-5">
            <img src={logo} alt="Ervitex" className="h-7 w-auto" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-heading text-xl font-black uppercase leading-tight sm:text-3xl">Preču saraksts</h1>
                <p className="mt-1.5 break-words text-sm text-muted-foreground">
                  {[sheet.company, sheet.name, sheet.email, sheet.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {sheet.assigned_pm_name && (
              <p className="mt-3 text-sm">
                <span className="text-muted-foreground">Projekta vadītāja: </span>
                <a href={`mailto:${pmEmail}`} className="font-medium hover:underline">{sheet.assigned_pm_name}</a>
              </p>
            )}
            {!readOnly && (saveState === "saving" || saveState === "error" || !!sheet.draft_items) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground print:hidden">
                {saveState === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>{saveState === "saving" ? "Saglabā…" : saveState === "error" ? "Neizdevās saglabāt" : "Nesaglabātas izmaiņas"}</span>
              </div>
            )}
            {readOnly && (
              <p className="mt-3 rounded-sm border border-dashed border-border p-3 text-xs text-muted-foreground">
                Labošana slēgta. Raksti uz {pmEmail}.
              </p>
            )}

          </header>

          <div className="mt-5 space-y-2">
            {!readOnly && (
              <div className="flex items-center justify-between gap-2 print:hidden">
                <span className="font-heading text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Preces ({items.length})
                </span>
                <Button size="sm" variant="outline" onClick={() => goCatalog("add")}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Pievienot no kataloga
                </Button>
              </div>
            )}

            {items.length === 0 && (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Sarakstā nav preču.
              </p>
            )}


            {items.map((i) => {
              const open = openId === i.id;
              return (
              <div key={i.id} className="overflow-hidden rounded-md border border-border bg-background">
                <div className="flex flex-wrap items-center gap-3 p-2.5 sm:flex-nowrap sm:p-3">
                  <button type="button" onClick={() => setOpenId(open ? null : i.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    {i.image ? (
                      <img src={i.image} alt={i.name} loading="lazy" className="h-14 w-14 shrink-0 rounded-sm border border-border object-contain p-0.5" />
                    ) : (
                      <span className="h-14 w-14 shrink-0 rounded-sm border border-dashed border-border" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{i.name}</span>
                      {(i.code || i.brand) && <span className="block truncate text-xs text-muted-foreground">{[i.code, i.brand].filter(Boolean).join(" · ")}</span>}
                      <span className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                        <span className="rounded-sm border border-border bg-muted/50 px-2 py-0.5"><span className="text-muted-foreground">Krāsa </span><b className="font-medium">{i.colorName || "—"}</b></span>
                        <span className="rounded-sm border border-border bg-muted/50 px-2 py-0.5"><span className="text-muted-foreground">Izmērs </span><b className="font-medium">{i.size || "—"}</b></span>
                        <span className="rounded-sm border border-border bg-muted/50 px-2 py-0.5"><span className="text-muted-foreground">Daudzums </span><b className="font-medium">{i.qty} gab.</b></span>
                        {(i.prints || []).length > 0 && (
                          <span className="rounded-sm border border-border bg-muted/50 px-2 py-0.5"><span className="text-muted-foreground">Apdruka </span><b className="font-medium">{(i.prints || []).map((p) => p.method).join(" + ")}</b></span>
                        )}
                      </span>
                    </span>
                  </button>
                  <span className="ml-auto flex shrink-0 items-center gap-2">
                    <span className="text-right">
                      <span className="block font-heading text-sm font-black tabular-nums">{money(lineNet(i))}</span>
                      <span className="block text-xs text-muted-foreground tabular-nums">ar PVN {money(lineNet(i) * (1 + (sheet.vat_rate || 21) / 100))}</span>
                    </span>
                    {!readOnly && (
                      <Button size="sm" variant="outline" className="print:hidden" onClick={() => goCatalog("swap", i)}>
                        <Repeat className="mr-1.5 h-3.5 w-3.5" /> Nomainīt preci
                      </Button>
                    )}
                    <button type="button" onClick={() => setOpenId(open ? null : i.id)} aria-label="Atvērt" className="p-1 print:hidden">
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                  </span>
                </div>

                {open && (
                  <div className="border-t border-border p-3 sm:p-4">
                    <div>
                      <RowVariantControls item={i} disabled={readOnly} onChange={(changes) => patch(i.id, changes)} />
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <label className="block">
                        <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Skaits</span>
                        <Input type="number" min={0} value={i.qty} disabled={readOnly} onChange={(e) => patch(i.id, { qty: Math.max(0, Math.round(num(e.target.value))) })} />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Prece €/gab. bez PVN</span>
                        <Input inputMode="decimal" value={i.unitPrice ?? ""} disabled={readOnly} onChange={(e) => patch(i.id, { unitPrice: e.target.value === "" ? null : num(e.target.value) })} />
                      </label>
                      <div className="flex items-end justify-between gap-2 sm:justify-end">
                        <div className="text-right">
                          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Rinda bez PVN</span>
                          <span className="font-heading text-sm font-black">{money(lineNet(i))}</span>
                          <span className="block text-[11px] text-muted-foreground">
                            ar PVN {money(lineNet(i) * (1 + (sheet.vat_rate || 21) / 100))}
                          </span>
                        </div>
                        {!readOnly && (
                          <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeRow(i.id)} aria-label="Dzēst rindu">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Apdruka */}
                    <div className="mt-3 rounded-sm border border-border/70 bg-muted/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-[11px] font-black uppercase tracking-wider">Apdruka</span>
                        {!readOnly && (
                          <Button size="sm" variant="outline" onClick={() => addPrint(i.id)}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Pievienot apdruku
                          </Button>
                        )}
                      </div>

                      {(i.prints || []).length === 0 ? (
                        <p className="mt-2 text-xs text-muted-foreground">Bez apdrukas</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {(i.prints || []).map((p, idx) => (
                            <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_130px_120px_auto]">
                              <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={p.method}
                                disabled={readOnly}
                                onChange={(e) => patchPrint(i.id, idx, { method: e.target.value })}
                              >
                                {PRINT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <Input
                                placeholder="Vieta"
                                value={p.placement || ""}
                                disabled={readOnly}
                                onChange={(e) => patchPrint(i.id, idx, { placement: e.target.value })}
                              />
                              <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={p.mode === "total" ? "total" : "unit"}
                                disabled={readOnly}
                                onChange={(e) => patchPrint(i.id, idx, { mode: e.target.value === "total" ? "total" : "unit" })}
                              >
                                <option value="unit">€ par gabalu</option>
                                <option value="total">€ kopā</option>
                              </select>
                              <Input
                                inputMode="decimal"
                                placeholder={p.mode === "total" ? "€ kopā" : "€/gab."}
                                value={p.price ?? ""}
                                disabled={readOnly}
                                onChange={(e) => patchPrint(i.id, idx, { price: e.target.value === "" ? null : num(e.target.value) })}
                              />
                              {!readOnly && (
                                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => removePrint(i.id, idx)} aria-label="Noņemt apdruku">
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <p className="text-[11px] text-muted-foreground">
                            Apdruka kopā {money(printNet(i))} bez PVN
                          </p>
                        </div>
                      )}
                    </div>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Piezīme par šo preci</span>
                      <Input value={i.note || ""} disabled={readOnly} onChange={(e) => patch(i.id, { note: e.target.value })} />
                    </label>
                  </div>
                )}
              </div>
              );
            })}
          </div>

          {/* Kopsummas */}
          <div className="mt-6 flex justify-end border-t border-border pt-5">
            <dl className="w-full space-y-1.5 text-sm sm:max-w-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Gabali kopā</dt><dd className="tabular-nums">{totals.qty}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Preces bez PVN</dt><dd className="tabular-nums">{money(totals.goods)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Apdruka bez PVN</dt><dd className="tabular-nums">{money(totals.print)}</dd></div>
              <div className="flex justify-between gap-4 border-t border-border pt-2"><dt className="font-medium">Kopā bez PVN</dt><dd className="font-medium tabular-nums">{money(totals.net)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">PVN {sheet.vat_rate}%</dt><dd className="tabular-nums">{money(totals.vat)}</dd></div>
              <div className="flex items-baseline justify-between gap-4 border-t border-border pt-2.5 text-base">
                <dt className="font-heading text-sm font-black uppercase tracking-wide">Kopā ar PVN</dt>
                <dd className="font-heading font-black tabular-nums text-accent">{money(totals.gross)}</dd>
              </div>
            </dl>
          </div>

          {versions.length > 0 && (
            <section className="mt-6 border-t border-border pt-5 print:hidden">
              <h2 className="flex items-center gap-2 font-heading text-sm font-black uppercase tracking-wide">
                <History className="h-4 w-4 text-accent" /> Versiju vēsture
              </h2>
              <div className="mt-3 divide-y divide-border rounded-sm border border-border">
                {versions.map((version) => (
                  <div key={version.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="font-semibold">Versija {version.revision}</span>
                    <span className="text-muted-foreground">{version.actor_name || (version.actor_side === "staff" ? "Ervitex" : "Klients")}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" /> {new Date(version.created_at).toLocaleString("lv-LV")}
                    </span>
                    <span className="text-xs text-muted-foreground">{version.items.length} preces</span>
                    {!readOnly && version.revision !== sheet.revision && (
                      <Button className="ml-auto" size="sm" variant="ghost" onClick={() => restoreVersion(version)} disabled={actionBusy}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Atjaunot
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {!readOnly && (
            <div className="mt-6 flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-end print:hidden">
              <div className="flex flex-wrap gap-2">
                <Button onClick={confirmChanges} disabled={saving || actionBusy}>
                  {saving || actionBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Saglabāt un aizvērt
                </Button>
                {(dirty || sheet.draft_items) && (
                  <Button variant="outline" onClick={discardDraft} disabled={saving || actionBusy}>
                    <Undo2 className="mr-2 h-4 w-4" /> Atcelt izmaiņas
                  </Button>
                )}
                {isStaff && (
                  <Button variant="outline" onClick={copyLink}>
                    <Copy className="mr-2 h-4 w-4" /> Kopēt saiti
                  </Button>
                )}
                {isStaff && !replyOpen && sheet.email && (
                  <Button variant="outline" onClick={() => setReplyOpen(true)}>
                    <Send className="mr-2 h-4 w-4" /> Ziņa klientam
                  </Button>
                )}
                {!isStaff && !dirty && !sheet.draft_items && (
                  <Button variant="outline" asChild>
                    <a href={mailtoNext}>
                      <Mail className="mr-2 h-4 w-4" /> {isAdmin ? "Rakstīt klientam" : `Rakstīt ${sheet.assigned_pm_name || "Ervitex"}`}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {isStaff && replyOpen && sheet.email && (
            <div className="mt-4 space-y-3 rounded-md border border-border p-4 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-sm font-black uppercase tracking-wide">Ziņa klientam</h2>
                <span className="text-sm text-muted-foreground">{sheet.email}</span>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                className="w-full rounded-sm border border-input bg-background p-3 text-sm"
                placeholder="Labdien! ..."
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={sendToClient} disabled={replySending || !replyText.trim()}>
                  {replySending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Nosūtīt
                </Button>
                <Button variant="ghost" onClick={() => setReplyOpen(false)}>
                  <X className="mr-2 h-4 w-4" /> Aizvērt
                </Button>
              </div>
            </div>
          )}
        </article>

      </div>

    </div>
  );
};

export default WorksheetPage;
