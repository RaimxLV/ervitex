import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OfferWorkspace from "@/components/quote/OfferWorkspace";
import { QuoteItemsTable } from "@/components/quote/QuoteItemsTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccentIcon } from "@/components/ui/accent-icon";
import logo from "@/assets/ervitex-logo-dark.svg";
import { useCreateOffer } from "@/components/quote/CreateOfferButton";
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
  const { create: createOffer, busy: creatingOffer } = useCreateOffer();
  const { isAdmin } = useAuth();

  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

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

  const createFromForm = () => createOffer(true, {
    client_name: form.name.trim(), client_email: form.email.trim() || null,
    client_phone: form.phone.trim() || null, client_company: form.company.trim() || null,
    client_billing: billing, note: print.notes || null,
  }, print.method && print.method !== "none" ? [{ method: ({ silkscreen: "Sietspiede", dtf: "DTF", termodruka: "Termodruka", embroidery: "Izšūšana", sublimation: "Sublimācija", other: "Cita" } as Record<string, string>)[print.method] || print.method, placement: print.placement || null, price: null, mode: "unit" }] : []);

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
    <OfferWorkspace>
      <div className="quote-form">
        <header className="mb-7 border-b border-border pb-6">
          <img src={logo} alt="Ervitex" className="mb-5 h-14 w-auto sm:h-16" />
          <h1 className="font-heading text-2xl font-black uppercase sm:text-3xl">{isAdmin ? t("Mans piedāvājums", "My offer") : t("Mans pieprasījums", "My request")}</h1>
        </header>
        {items.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border bg-card/50 px-5 py-10 text-center sm:rounded-sm sm:p-14">
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              {t("Saraksts ir tukšs", "List is empty")}
            </p>
            <Button asChild className="mt-5 h-11 bg-accent px-5 font-heading text-xs uppercase tracking-widest text-accent-foreground hover:bg-accent/90 sm:mt-6">
              <Link to="/catalog">{t("Atvērt katalogu", "Open catalog")}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
            <div className="min-w-0 space-y-6 sm:space-y-8">

              {/* Items */}
              <section>
                <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-foreground pb-3">
                  <h2 className="section-kicker font-heading text-xs font-bold uppercase text-accent">
                    {t("Preces", "Items")}
                    <span className="ml-2 align-middle font-heading text-sm font-bold text-muted-foreground">{totalQty} {t("gab.", "pcs")}</span>
                  </h2>
                  <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-muted-foreground"><Trash2 className="h-4 w-4" />{t("Notīrīt visu", "Clear all")}</Button>
                </div>
                <QuoteItemsTable items={items.map((i) => ({ ...i, unitPrice: i.unitPrice ?? null }))} onQuantity={updateQty} onRemove={remove} />
              </section>

              {/* Print details */}
              <section className="border-t border-border py-6">
                <h2 className="mb-6 section-kicker font-heading text-xs font-bold uppercase text-accent">
                  {t("Apdruka visām precēm", "Decoration for all items")}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Apdrukas metode", "Print method")}</Label>
                    <Select value={print.method || "consult"} onValueChange={(value) => setPrint({ ...print, method: value === "consult" ? "" : value })}>
                      <SelectTrigger aria-label={t("Apdrukas metode visām precēm", "Print method for all items")}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consult">{t("Nezinu / konsultēties", "Not sure / consult")}</SelectItem>
                        <SelectItem value="silkscreen">{t("Sietspiede", "Screen print")}</SelectItem>
                        <SelectItem value="dtf">DTF</SelectItem><SelectItem value="termodruka">{t("Termodruka", "Heat transfer")}</SelectItem>
                        <SelectItem value="embroidery">{t("Izšūšana", "Embroidery")}</SelectItem><SelectItem value="sublimation">{t("Sublimācija", "Sublimation")}</SelectItem><SelectItem value="other">{t("Cita", "Other")}</SelectItem>
                        <SelectItem value="none">{t("Bez apdrukas", "No print")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vēlamais termiņš", "Deadline")}</Label>
                    <Input className="h-11 rounded-sm" value={print.deadline} onChange={(e) => setPrint({ ...print, deadline: e.target.value })} placeholder={t("piem. 2 nedēļas", "e.g. 2 weeks")} />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2"><span className="quote-label">{t("Apdrukas vieta", "Print placement")}</span><Input value={print.placement} onChange={(e) => setPrint({ ...print, placement: e.target.value })} /></label>
                  <label className="space-y-2"><span className="quote-label">{t("Krāsu skaits", "Number of colours")}</span><Input value={print.colors} onChange={(e) => setPrint({ ...print, colors: e.target.value })} /></label>
                </div>
                <div className="mt-5 space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Piezīmes projektu vadītājam", "Notes to project manager")}</Label>
                  <Textarea rows={4} className="resize-none rounded-sm" value={print.notes} onChange={(e) => setPrint({ ...print, notes: e.target.value })} placeholder={t("Papildu informācija, jautājumi...", "Additional info, questions...")} />
                </div>
              </section>


              {/* Files */}
              <section className="border-t border-border py-6">
                <h2 className="mb-6 section-kicker font-heading text-xs font-bold uppercase text-accent">
                  {t("Faili (logo, dizains)", "Files (logo, artwork)")}
                </h2>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-sm border-2 border-dashed border-border bg-muted/30 px-4 py-10 text-center transition-colors hover:border-accent/50 hover:bg-muted/50">
                  <AccentIcon icon={Upload} className="mb-3" />
                  <span className="text-sm font-semibold leading-snug">{t("Pievienot failus", "Add files")}</span>
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
                      <li key={i} className="flex min-w-0 items-center gap-3 rounded-sm border border-border bg-background py-2 pl-4 pr-2">
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
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Summary */}
              {cartNet > 0 && (
                <section className="border-y border-border bg-card py-6">
                  <h2 className="mb-5 font-heading text-lg font-black uppercase tracking-wide">
                    {t("Kopsavilkums", "Summary")}
                  </h2>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("Kopā bez PVN", "Total excl. VAT")}</dt>
                      <dd className="font-semibold">€{cartNet.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("PVN 21%", "VAT 21%")}</dt>
                      <dd className="font-semibold">€{(cartNet * 0.21).toFixed(2)}</dd>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between border-t border-border pt-4">
                      <dt className="font-heading text-sm font-bold uppercase tracking-wide">{t("Kopā ar PVN", "Total incl. VAT")}</dt>
                      <dd className="font-heading text-2xl font-black text-accent">€{(cartNet * 1.21).toFixed(2)}</dd>
                    </div>
                  </dl>
                </section>
              )}

              {/* Contact */}
              <section className="border-t border-border py-6">
                <h2 className="mb-6 section-kicker font-heading text-xs font-bold uppercase text-accent">
                  {t("Tavi kontakti", "Your contacts")}
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vārds", "Name")} *</Label>
                    <Input className="h-11 rounded-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("E-pasts", "Email")} *</Label>
                    <Input type="email" className="h-11 rounded-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Tālrunis", "Phone")}</Label>
                    <Input className="h-11 rounded-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Uzņēmums", "Company")}</Label>
                    <Input className="h-11 rounded-sm" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <details className="group rounded-sm border border-border">
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
                          <Input className="h-11 rounded-sm" maxLength={300} value={billing[k]} onChange={(e) => setBilling({ ...billing, [k]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </section>

              <Button
                type={isAdmin ? "button" : "submit"}
                onClick={isAdmin ? createFromForm : undefined}
                disabled={sending || creatingOffer || items.length === 0}
                className="h-14 w-full rounded-sm bg-accent font-heading text-sm font-black uppercase tracking-widest text-accent-foreground shadow-lg transition-transform hover:bg-accent/90 active:scale-[0.99]"
              >
                <Send className="mr-2 h-4 w-4" />
                {isAdmin ? t("Izveidot piedāvājumu", "Create offer") : sending ? t("Sūta...", "Sending...") : t("Nosūtīt pieprasījumu", "Send request")}
              </Button>
            </aside>

          </form>
        )}
      </div>
    </OfferWorkspace>
  );
};

export default RequestPage;

