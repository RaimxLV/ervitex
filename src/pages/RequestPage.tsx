import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useAuth } from "@/hooks/useAuth";

import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { OFFICE_EMAIL } from "@/data/projectManagers";
import { Trash2, Upload, Send, X, ArrowLeft } from "lucide-react";

const MAX_FILES = 10;
const MAX_FILE_MB = 15;

const RequestPage = () => {
  const { items, remove, updateQty, clear, totalQty } = useQuoteCart();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const cartNet = items.reduce((s, i) => s + (i.unitPrice || 0) * i.qty, 0);


  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [print, setPrint] = useState({ method: "", placement: "", colors: "", deadline: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const { isAdmin } = useAuth();

  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  const createOffer = async () => {
    setCreatingOffer(true);
    const payload = items.map((i) => ({
      id: i.id, source: i.source, productId: i.productId, name: i.name, code: i.code,
      brand: i.brand, image: i.image, colorName: i.colorName, colorHex: i.colorHex,
      size: i.size, qty: i.qty, unitPrice: i.unitPrice ?? null,
    }));
    const { data, error } = await supabase
      .from("pm_offers")
      .insert({ title: "Piedāvājums", items: payload as any })
      .select("id")
      .single();
    setCreatingOffer(false);
    if (error || !data) {
      toast({ title: t("Kļūda", "Error"), description: error?.message, variant: "destructive" });
      return;
    }
    navigate(`/admin/offers/${data.id}`);
  };


  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const combined = [...files, ...incoming].slice(0, MAX_FILES);
    const oversized = incoming.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (oversized) {
      toast({ title: t(`Fails ${oversized.name} pārsniedz ${MAX_FILE_MB}MB`, `File ${oversized.name} exceeds ${MAX_FILE_MB}MB`), variant: "destructive" });
      return;
    }
    setFiles(combined);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const k = `${it.source}:${it.productId}:${it.colorCode || ""}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(it);
    }
    return [...map.values()];
  }, [items]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({ title: t("Pieprasījums ir tukšs", "Request is empty"), variant: "destructive" });
      return;
    }
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast({ title: t("Nederīgs vārds vai e-pasts", "Invalid name or email"), variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const assignedEmail = OFFICE_EMAIL;
      const assignedName = lang === "lv" ? "Ervitex birojs" : "Ervitex office";

      const messageParts: string[] = [];
      if (print.notes) messageParts.push(print.notes);
      const message = messageParts.join("\n\n").slice(0, 9800);

      // Generate the request id client-side so anonymous users don't need public read access
      // to quote_requests just to get the saved row id back.
      const requestId = crypto.randomUUID();

      // Insert the quote request FIRST so storage uploads can be tied back to it
      // (RLS on quote-attachments requires the object path to reference an existing request).
      const { error: insErr } = await supabase
        .from("quote_requests")
        .insert({
          id: requestId,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          message,
          items: items as any,
          print_method: print.method || null,
          print_placement: print.placement || null,
          print_colors: print.colors || null,
          deadline: print.deadline || null,
          file_urls: [],
          assigned_pm_email: assignedEmail,
          assigned_pm_name: assignedName,
        });
      if (insErr) throw insErr;

      // Upload attachments under "<requestId>/<filename>" so RLS binds them to this request
      const uploadedPaths: string[] = [];
      for (const f of files) {
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${requestId}/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("quote-attachments").upload(path, f, {
          contentType: f.type || "application/octet-stream",
          upsert: false,
        });
        if (upErr) throw upErr;
        uploadedPaths.push(path);
      }

      // Trigger email send (non-blocking on failure — DB row is safety net).
      // The edge function (service role) will patch file_urls onto the request.
      try {
        await supabase.functions.invoke("send-quote-request", {
          body: { request_id: requestId, file_urls: uploadedPaths },
        });
      } catch (mailErr) {
        console.warn("Email send failed, but request stored", mailErr);
      }

      toast({
        title: t("Pieprasījums nosūtīts!", "Request sent!"),
        description: t(`${assignedName} sazināsies ar Tevi tuvākajā laikā.`, `${assignedName} will contact you shortly.`),
      });
      clear();
      navigate("/");
    } catch (err: any) {
      toast({ title: t("Kļūda", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-black uppercase tracking-tight">
              {t("Mans pieprasījums", "My request")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Pārbaudi preces un nosūti pieprasījumu — mēs sazināsimies tuvākajā laikā.", "Review items and send the request — we'll get back to you shortly.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isAdmin && items.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="font-heading text-xs uppercase tracking-widest"
                onClick={createOffer}
                disabled={creatingOffer}
              >
                {t("Izveidot piedāvājumu klientam", "Create client offer")}
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="font-heading text-xs uppercase tracking-widest">
              <Link to="/catalog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Atgriezties katalogā", "Back to catalog")}
              </Link>
            </Button>
          </div>

        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
            {t("Pieprasījums ir tukšs. Pārlūko katalogu un pievieno preces.", "Your request is empty. Browse the catalog and add items.")}
          </div>
        ) : (
          <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
            <div className="min-w-0 space-y-4">

              {/* Items */}
              <section className="rounded-md border border-border bg-card p-4 sm:p-6">

                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-heading text-base font-black uppercase tracking-wide sm:text-lg">
                    {t("Preces", "Items")} <span className="text-muted-foreground text-sm">({totalQty})</span>
                  </h2>
                  <Button type="button" variant="ghost" size="sm" onClick={clear} className="h-8 px-2 text-[11px] text-muted-foreground">
                    {t("Notīrīt visu", "Clear all")}
                  </Button>
                </div>
                <div className="divide-y divide-border border-y border-border">
                  {grouped.map((group) => {
                    const head = group[0];
                    const groupNet = group.reduce((s, it) => s + (it.unitPrice || 0) * it.qty, 0);
                    const groupQty = group.reduce((s, it) => s + it.qty, 0);
                    return (
                      <div key={head.productId + head.colorCode} className="flex gap-2.5 py-2.5 sm:gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-white sm:h-16 sm:w-16">
                          {head.image ? (
                            <img src={head.image} alt={head.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold leading-tight">{head.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                            <span className="font-mono">{head.code}</span>
                            {head.colorName && (
                              <>
                                <span>·</span>
                                {head.colorHex && (
                                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/20" style={{ backgroundColor: head.colorHex }} />
                                )}
                                <span className="truncate">{head.colorName}</span>
                              </>
                            )}
                          </p>
                          <div className="mt-1.5 space-y-1">
                            {group.map((it) => (
                              <div key={it.id} className="flex items-center gap-1.5 text-[13px]">
                                <span className="w-11 shrink-0 rounded border border-border px-1 py-0.5 text-center text-[11px] font-bold">
                                  {it.size || "—"}
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  inputMode="numeric"
                                  value={it.qty}
                                  onChange={(e) => updateQty(it.id, parseInt(e.target.value) || 1)}
                                  className="h-7 w-14 px-1 text-center text-[13px]"
                                />
                                {it.unitPrice ? (
                                  <span className="ml-1 truncate text-[11px] text-muted-foreground">
                                    €{it.unitPrice.toFixed(2)} → <span className="font-semibold text-foreground">€{(it.unitPrice * it.qty).toFixed(2)}</span>
                                  </span>
                                ) : null}
                                <button
                                  type="button"
                                  aria-label={t("Dzēst", "Remove")}
                                  className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-destructive"
                                  onClick={() => remove(it.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {groupQty} {t("gab.", "pcs")}
                            {groupNet > 0 && (
                              <>
                                {" · "}
                                <span className="font-semibold text-foreground">€{groupNet.toFixed(2)}</span> {t("bez PVN", "excl. VAT")}
                                {" · "}€{(groupNet * 1.21).toFixed(2)} {t("ar PVN", "incl. VAT")}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cartNet > 0 && (
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("Kopā bez PVN", "Total excl. VAT")}</dt>
                      <dd className="font-medium">€{cartNet.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("PVN 21%", "VAT 21%")}</dt>
                      <dd>€{(cartNet * 0.21).toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 text-base">
                      <dt className="font-semibold">{t("Kopā ar PVN", "Total incl. VAT")}</dt>
                      <dd className="font-black text-accent">€{(cartNet * 1.21).toFixed(2)}</dd>
                    </div>
                    <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
                      {t(
                        "Cenas ir informatīvas, par preci bez apdrukas. Apdrukas un izšuvumu izmaksas aprēķinām atsevišķi.",
                        "Prices are indicative, for the product without decoration. Printing and embroidery are quoted separately.",
                      )}
                    </p>
                  </dl>
                )}
              </section>

              {/* Print details */}
              <section className="space-y-5 rounded-md border border-border bg-card p-5 sm:p-6">
                <h2 className="font-heading text-base font-black uppercase tracking-wide sm:text-lg">
                  {t("Apdrukas informācija", "Print details")}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Apdrukas metode", "Print method")}</Label>
                    <select
                      value={print.method}
                      onChange={(e) => setPrint({ ...print, method: e.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">{t("Nezinu / konsultēties", "Not sure / consult")}</option>
                      <option value="silkscreen">{t("Sietspiede", "Silkscreen")}</option>
                      <option value="dtf">{t("Termodruka / DTF", "Heat transfer / DTF")}</option>
                      <option value="embroidery">{t("Izšuvums", "Embroidery")}</option>
                      <option value="none">{t("Bez apdrukas", "No print")}</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Vēlamais termiņš", "Deadline")}</Label>
                    <Input className="h-10" value={print.deadline} onChange={(e) => setPrint({ ...print, deadline: e.target.value })} placeholder={t("piem. 2 nedēļas", "e.g. 2 weeks")} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Piezīmes projektu vadītājam", "Notes to project manager")}</Label>
                  <Textarea rows={4} className="resize-none" value={print.notes} onChange={(e) => setPrint({ ...print, notes: e.target.value })} placeholder={t("Papildu informācija, jautājumi...", "Additional info, questions...")} />
                </div>
              </section>


              {/* Files */}
              <section className="space-y-4 rounded-md border border-border bg-card p-5 sm:p-6">
                <h2 className="font-heading text-base font-black uppercase tracking-wide sm:text-lg">
                  {t("Faili (logo, dizains)", "Files (logo, artwork)")}
                </h2>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-background px-4 py-7 text-center transition-colors hover:bg-muted/40">
                  <Upload className="mb-2.5 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium leading-snug">{t("Ievelc failus šeit vai spied, lai izvēlētos", "Drop files here or click to choose")}</span>
                  <span className="mt-1.5 text-[11px] text-muted-foreground">
                    {t(`Līdz ${MAX_FILES} failiem, katrs līdz ${MAX_FILE_MB}MB`, `Up to ${MAX_FILES} files, ${MAX_FILE_MB}MB each`)}
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                    accept="image/*,.pdf,.ai,.eps,.svg,.psd,.zip"
                  />
                </label>
                {files.length > 0 && (
                  <ul className="space-y-1.5 text-sm">
                    {files.map((f, i) => (
                      <li key={i} className="flex min-w-0 items-center gap-2 rounded-md border border-border py-1.5 pl-3 pr-1.5">
                        <span className="min-w-0 flex-1 truncate">
                          {f.name} <span className="text-[11px] text-muted-foreground">({(f.size / 1024 / 1024).toFixed(2)}MB)</span>
                        </span>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFile(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {/* Contact */}
              <section className="space-y-4 rounded-md border border-border bg-card p-5 sm:p-6">
                <h2 className="font-heading text-base font-black uppercase tracking-wide sm:text-lg">
                  {t("Tavi kontakti", "Your contacts")}
                </h2>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Vārds", "Name")} *</Label>
                  <Input className="h-10" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("E-pasts", "Email")} *</Label>
                  <Input type="email" className="h-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Tālrunis", "Phone")}</Label>
                  <Input className="h-10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">{t("Uzņēmums", "Company")}</Label>
                  <Input className="h-10" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </section>

              <Button
                type="submit"
                disabled={sending || items.length === 0}
                className="h-12 w-full bg-accent font-heading text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90"
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? t("Sūta...", "Sending...") : t("Nosūtīt pieprasījumu", "Send request")}
              </Button>
            </aside>

          </form>
        )}
      </div>
    </Layout>
  );
};

export default RequestPage;
