import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useAuth } from "@/hooks/useAuth";

import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
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
  const [billing, setBilling] = useState({ company: "", regNo: "", vatNo: "", address: "", delivery: "" });
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
          billing: Object.values(billing).some((v) => v.trim())
            ? Object.fromEntries(Object.entries(billing).map(([k, v]) => [k, v.trim().slice(0, 300)]).filter(([, v]) => v))
            : null,
        } as any);
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
      let delivered = false;
      try {
        const { data: mailOut, error: mailErr } = await supabase.functions.invoke("send-quote-request", {
          body: { request_id: requestId, file_urls: uploadedPaths },
        });
        delivered = !mailErr && (mailOut as { delivered?: boolean } | null)?.delivered === true;
      } catch (mailErr) {
        console.warn("Email send failed, but request stored", mailErr);
      }

      toast({
        title: t("Pieprasījums nosūtīts!", "Request sent!"),
        description: delivered
          ? t("Mēs sazināsimies ar Tevi tuvākajā laikā.", "We will contact you shortly.")
          : t(
              `Pieprasījums saglabāts. Ja neredzi apstiprinājumu e-pastā, zvani mums.`,
              `Request saved. If you don't see a confirmation e-mail, please call us.`,
            ),
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
      <PageIntro
        title={t("Mans pieprasījums", "My request")}
        subtitle={t(
          "Pārbaudi preces un nosūti pieprasījumu — mēs sazināsimies tuvākajā laikā.",
          "Review items and send the request — we'll get back to you shortly.",
        )}
        eyebrow={t("Pasūtījuma sagatavošana", "Preparing your order")}
      />
      <div className="container mx-auto max-w-6xl px-4 py-7 sm:py-14">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2 font-heading text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Atgriezties katalogā", "Back to catalog")}
            </Link>
          </Button>
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
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 px-5 py-10 text-center sm:rounded-2xl sm:p-14">
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t("Pieprasījums ir tukšs. Pārlūko katalogu un pievieno preces.", "Your request is empty. Browse the catalog and add items.")}
            </p>
            <Button asChild className="mt-5 h-11 bg-accent px-5 font-heading text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 sm:mt-6">
              <Link to="/catalog">{t("Atvērt katalogu", "Open catalog")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr),400px] lg:gap-8">
            <div className="min-w-0 space-y-6 sm:space-y-8">

              {/* Items */}
              <section>
                <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-foreground pb-3">
                  <h2 className="font-heading text-xl font-black uppercase tracking-wide sm:text-2xl">
                    {t("Preces", "Items")}
                    <span className="ml-2 align-middle font-heading text-sm font-bold text-muted-foreground">{totalQty} {t("gab.", "pcs")}</span>
                  </h2>
                  <button
                    type="button"
                    onClick={clear}
                    className="font-heading text-[11px] font-bold uppercase tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-destructive hover:underline"
                  >
                    {t("Notīrīt visu", "Clear all")}
                  </button>
                </div>
                <div className="space-y-4">
                  {grouped.map((group) => {
                    const head = group[0];
                    const groupNet = group.reduce((s, it) => s + (it.unitPrice || 0) * it.qty, 0);
                    const groupQty = group.reduce((s, it) => s + it.qty, 0);
                    return (
                      <article
                        key={head.productId + head.colorCode}
                        className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-5 sm:p-5"
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/60 bg-white sm:h-24 sm:w-24">
                          {head.image ? (
                            <img src={head.image} alt={head.name} className="h-full w-full object-contain p-1.5" />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-[15px] font-bold leading-tight sm:text-base">{head.name}</h3>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono tracking-tight">{head.code}</span>
                                {head.colorName && (
                                  <>
                                    <span aria-hidden>·</span>
                                    {head.colorHex && (
                                      <span className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-inset ring-black/15" style={{ backgroundColor: head.colorHex }} />
                                    )}
                                    <span className="truncate">{head.colorName}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            {groupNet > 0 && (
                              <div className="shrink-0 text-right">
                                <p className="font-heading text-base font-black leading-none sm:text-lg">€{groupNet.toFixed(2)}</p>
                                <p className="mt-1 text-[11px] text-muted-foreground">€{(groupNet * 1.21).toFixed(2)} {t("ar PVN", "incl. VAT")}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 space-y-2">
                            {group.map((it) => (
                              <div key={it.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-1.5">
                                <span className="min-w-9 shrink-0 rounded-md border border-border bg-background px-1.5 py-1 text-center font-heading text-xs font-bold">
                                  {it.size || "—"}
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  inputMode="numeric"
                                  value={it.qty}
                                  onChange={(e) => updateQty(it.id, parseInt(e.target.value) || 1)}
                                  className="h-8 w-14 border-border bg-background px-1 text-center text-sm font-semibold"
                                />
                                {it.unitPrice ? (
                                  <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
                                    €{it.unitPrice.toFixed(2)} / {t("gab.", "pc")}
                                  </span>
                                ) : null}
                                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                                  <span className="text-sm font-bold">€{((it.unitPrice || 0) * it.qty).toFixed(2)}</span>
                                  <button
                                    type="button"
                                    aria-label={t("Dzēst", "Remove")}
                                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => remove(it.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* Print details */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <h2 className="mb-6 font-heading text-xl font-black uppercase tracking-wide sm:text-2xl">
                  {t("Apdrukas informācija", "Print details")}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Apdrukas metode", "Print method")}</Label>
                    <select
                      value={print.method}
                      onChange={(e) => setPrint({ ...print, method: e.target.value })}
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm transition-colors focus:border-accent focus:outline-none"
                    >
                      <option value="">{t("Nezinu / konsultēties", "Not sure / consult")}</option>
                      <option value="silkscreen">{t("Sietspiede", "Silkscreen")}</option>
                      <option value="dtf">{t("DTF druka", "DTF printing")}</option>
                      <option value="termodruka">{t("Termodruka", "Heat transfer")}</option>
                      <option value="embroidery">{t("Izšuvums", "Embroidery")}</option>
                      <option value="none">{t("Bez apdrukas", "No print")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vēlamais termiņš", "Deadline")}</Label>
                    <Input className="h-11 rounded-lg" value={print.deadline} onChange={(e) => setPrint({ ...print, deadline: e.target.value })} placeholder={t("piem. 2 nedēļas", "e.g. 2 weeks")} />
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Piezīmes projektu vadītājam", "Notes to project manager")}</Label>
                  <Textarea rows={4} className="resize-none rounded-lg" value={print.notes} onChange={(e) => setPrint({ ...print, notes: e.target.value })} placeholder={t("Papildu informācija, jautājumi...", "Additional info, questions...")} />
                </div>
              </section>


              {/* Files */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <h2 className="mb-6 font-heading text-xl font-black uppercase tracking-wide sm:text-2xl">
                  {t("Faili (logo, dizains)", "Files (logo, artwork)")}
                </h2>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-center transition-colors hover:border-accent/50 hover:bg-muted/50">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                    <Upload className="h-5 w-5 text-accent" />
                  </span>
                  <span className="text-sm font-semibold leading-snug">{t("Ievelc failus šeit vai spied, lai izvēlētos", "Drop files here or click to choose")}</span>
                  <span className="mt-1.5 text-xs text-muted-foreground">
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
                  <ul className="mt-4 space-y-2 text-sm">
                    {files.map((f, i) => (
                      <li key={i} className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background py-2 pl-4 pr-2">
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {f.name} <span className="text-xs font-normal text-muted-foreground">({(f.size / 1024 / 1024).toFixed(2)}MB)</span>
                        </span>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeFile(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              {/* Summary */}
              {cartNet > 0 && (
                <section className="rounded-2xl bg-foreground p-6 text-background shadow-lg sm:p-7">
                  <h2 className="mb-5 font-heading text-lg font-black uppercase tracking-wide">
                    {t("Kopsavilkums", "Summary")}
                  </h2>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-background/60">{t("Kopā bez PVN", "Total excl. VAT")}</dt>
                      <dd className="font-semibold">€{cartNet.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-background/60">{t("PVN 21%", "VAT 21%")}</dt>
                      <dd className="font-semibold">€{(cartNet * 0.21).toFixed(2)}</dd>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between border-t border-background/20 pt-4">
                      <dt className="font-heading text-sm font-bold uppercase tracking-wide">{t("Kopā ar PVN", "Total incl. VAT")}</dt>
                      <dd className="font-heading text-2xl font-black text-accent">€{(cartNet * 1.21).toFixed(2)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-[11px] leading-snug text-background/50">
                    {t(
                      "Cenas ir informatīvas, par preci bez apdrukas. Apdrukas un izšuvumu izmaksas aprēķinām atsevišķi.",
                      "Prices are indicative, for the product without decoration. Printing and embroidery are quoted separately.",
                    )}
                  </p>
                </section>
              )}

              {/* Contact */}
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <h2 className="mb-6 font-heading text-xl font-black uppercase tracking-wide sm:text-2xl">
                  {t("Tavi kontakti", "Your contacts")}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vārds", "Name")} *</Label>
                    <Input className="h-11 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("E-pasts", "Email")} *</Label>
                    <Input type="email" className="h-11 rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Tālrunis", "Phone")}</Label>
                    <Input className="h-11 rounded-lg" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Uzņēmums", "Company")}</Label>
                    <Input className="h-11 rounded-lg" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <details className="group rounded-lg border border-border">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wider text-foreground">
                      {t("Rekvizīti rēķinam", "Billing details")}
                      <span className="text-accent transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="space-y-3 border-t border-border p-4">
                      {([
                        ["company", t("Uzņēmuma nosaukums", "Company name")],
                        ["regNo", t("Reģ. Nr.", "Reg. No.")],
                        ["vatNo", t("PVN Nr.", "VAT No.")],
                        ["address", t("Juridiskā adrese", "Legal address")],
                        ["delivery", t("Piegādes adrese", "Delivery address")],
                      ] as const).map(([k, label]) => (
                        <div key={k} className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
                          <Input className="h-11 rounded-lg" maxLength={300} value={billing[k]} onChange={(e) => setBilling({ ...billing, [k]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </section>

              <Button
                type="submit"
                disabled={sending || items.length === 0}
                className="h-14 w-full rounded-xl bg-accent font-heading text-sm font-black uppercase tracking-widest text-accent-foreground shadow-lg transition-transform hover:bg-accent/90 active:scale-[0.99]"
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

