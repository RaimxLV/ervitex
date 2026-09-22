import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { money } from "@/lib/offer";
import {
  PRINT_METHODS, lineNet, printNet, worksheetTotals,
  type PrintLine, type Worksheet, type WorksheetItem,
} from "@/lib/worksheet";
import { CheckCircle2, ChevronDown, Loader2, Mail, Plus, Printer, Repeat, Save, Store, Trash2, X } from "lucide-react";
import logo from "@/assets/ervitex-logo-2.svg";
import { ASSIGNEES, assigneeBySlug } from "@/data/assignees";
import { useAuth } from "@/hooks/useAuth";
import ItemPickerDialog, { type SwapPayload } from "@/components/worksheet/ItemPickerDialog";
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
  const [pickerMode, setPickerMode] = useState<"add" | "swap" | null>(null);
  const [swapId, setSwapId] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("get_quote_worksheet" as any, { _token: token });
      const row = (Array.isArray(data) ? data[0] : data) as Worksheet | undefined;
      if (row) {
        const list = (Array.isArray(row.items) ? row.items : []).map((i, idx) => ({
          ...i,
          id: i.id || `row-${idx}`,
          qty: Number(i.qty) || 0,
          prints: Array.isArray(i.prints) ? i.prints : [],
        }));
        setSheet(row);
        setItems(list);
      }
      setLoading(false);
    })();
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
  };

  const addItems = (rows: WorksheetItem[]) => {
    setItems((prev) => [...prev, ...rows]);
    setDirty(true);
    setOpenId(rows[0]?.id ?? null);
    toast.success(`Pievienots: ${rows.length}`);
  };

  const swapModel = (next: SwapPayload) => {
    if (!swapId) return;
    let missing = false;
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== swapId) return i;
        const key = i.size || "-";
        const has = next.priceBySize.has(key);
        if (!has) missing = true;
        return {
          ...i,
          source: next.source,
          productId: next.productId,
          name: next.name,
          code: next.code,
          brand: next.brand,
          image: next.image,
          colorName: next.colorName,
          colorHex: next.colorHex,
          unitPrice: has ? next.priceBySize.get(key) ?? null : null,
        };
      }),
    );
    setDirty(true);
    setSwapId(null);
    toast[missing ? "warning" : "success"](
      missing ? "Modelis nomainīts — izvēlies pieejamu izmēru" : "Modelis nomainīts",
    );
  };


  const save = async () => {
    setSaving(true);
    const { data, error } = await supabase.rpc("save_quote_worksheet" as any, {
      _token: token,
      _items: items as any,
      _by: editor || null,
    });
    setSaving(false);
    if (error || data === false) {
      toast.error("Neizdevās saglabāt");
      return;
    }
    setDirty(false);
    setSavedOnce(true);
    setSheet((s) => (s ? { ...s, worksheet_updated_at: new Date().toISOString(), worksheet_updated_by: editor || null } : s));
    toast.success("Saglabāts");

  };
  const assign = async (slug: string) => {
    if (!token || !sheet) return;
    const person = assigneeBySlug(slug);
    if (!person) return;
    setActionBusy(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote-action?token=${token}&action=assign:${person.slug}`);
      if (!res.ok) throw new Error("Neizdevās nodot");
      setSheet((s) => (s ? {
        ...s,
        assigned_pm_name: person.name,
        assigned_pm_email: person.email,
        status: s.status === "new" ? "contacted" : s.status,
      } : s));
      toast.success(`Nodots ${person.name}`);
    } catch {
      toast.error("Neizdevās nodot");
    } finally {
      setActionBusy(false);
    }
  };

  const complete = async () => {
    if (!sheet) return;
    setActionBusy(true);
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: "closed", completed_at: new Date().toISOString(), worksheet_locked: true } as never)
      .eq("id", sheet.id);
    setActionBusy(false);
    if (error) {
      toast.error("Neizdevās pabeigt");
      return;
    }
    setSheet((s) => (s ? { ...s, status: "closed", locked: true } : s));
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
    <div className="min-h-screen bg-muted/30 py-4 sm:py-8 print:bg-white print:py-0">
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
              <Badge variant={sheet.status === "closed" ? "secondary" : sheet.assigned_pm_email ? "default" : "outline"} className="w-fit shrink-0">
                {statusLabel}
              </Badge>
            </div>
            {isAdmin && (
              <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-[minmax(180px,240px)_auto] sm:items-center">
                <Select value={assignedSlug} onValueChange={assign} disabled={actionBusy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Atbildīgais" />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNEES.map((a) => (
                      <SelectItem key={a.slug} value={a.slug}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sheet.status !== "closed" && (
                  <Button variant="outline" size="sm" onClick={complete} disabled={actionBusy}>
                    {actionBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Pabeigts
                  </Button>
                )}
              </div>
            )}
            {sheet.worksheet_updated_at && (
              <p className="mt-2 text-xs text-muted-foreground">
                Pēdējās izmaiņas: {new Date(sheet.worksheet_updated_at).toLocaleString("lv-LV")}
                {sheet.worksheet_updated_by ? ` · ${sheet.worksheet_updated_by}` : ""}
              </p>
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
                <Button size="sm" variant="outline" onClick={() => { setSwapId(null); setPickerMode("add"); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Pievienot preci
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
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : i.id)}
                  className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-muted/50 sm:p-3"
                >
                  {i.image ? (
                    <img src={i.image} alt={i.name} loading="lazy" className="h-11 w-11 shrink-0 rounded-sm border border-border object-contain p-0.5" />
                  ) : (
                    <span className="h-11 w-11 shrink-0 rounded-sm border border-dashed border-border" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{i.name}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {[i.colorName, i.size, `${i.qty} gab.`, (i.prints || []).map((p) => p.method).join(" + ")].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-heading text-sm font-black tabular-nums">{money(lineNet(i))}</span>
                    <span className="block text-[11px] text-muted-foreground tabular-nums">
                      ar PVN {money(lineNet(i) * (1 + (sheet.vat_rate || 21) / 100))}
                    </span>
                  </span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="border-t border-border p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-muted-foreground">
                        {[i.code, i.brand].filter(Boolean).join(" · ")}
                      </p>
                      {!readOnly && (
                        <Button size="sm" variant="outline" onClick={() => { setSwapId(i.id); setPickerMode("swap"); }}>
                          <Repeat className="mr-1.5 h-3.5 w-3.5" /> Mainīt modeli
                        </Button>
                      )}
                    </div>

                    <div className="mt-3">
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

          {!readOnly && (
            <div className="mt-6 flex flex-col gap-3 rounded-md border border-border bg-muted/40 p-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
              <label className="block sm:max-w-xs sm:flex-1">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Kas labo? (vārds)</span>
                <Input value={editor} placeholder="Piem. Jānis" onChange={(e) => setEditor(e.target.value)} />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button onClick={save} disabled={saving || !dirty}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {dirty ? "Saglabāt" : "Saglabāts"}
                </Button>
                {savedOnce && !dirty && (
                  <Button variant="outline" asChild>
                    <a href={mailtoNext}>
                      <Mail className="mr-2 h-4 w-4" /> {isAdmin ? "Rakstīt klientam" : `Rakstīt ${sheet.assigned_pm_name || "Ervitex"}`}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </article>

      </div>

      <ItemPickerDialog
        open={pickerMode !== null}
        onOpenChange={(v) => { if (!v) { setPickerMode(null); setSwapId(null); } }}
        mode={pickerMode === "swap" ? "swap" : "add"}
        target={items.find((i) => i.id === swapId) || null}
        onAdd={addItems}
        onSwap={swapModel}
      />
    </div>
  );
};

export default WorksheetPage;
