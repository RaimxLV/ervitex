import { useEffect, useId, useRef, useState } from "react";
import { usePendingRequest, rejectedText } from "@/hooks/usePendingRequest";
import { PendingRequestNotice } from "@/components/quote/PendingRequestNotice";
import { pendingDisplayItems } from "@/lib/requestSubmission";
import { missingAttachmentNames } from "@/lib/requestSubmission";
import { saveRequest, notifyRequest } from "@/lib/submitRequest";
import { printStatusLabel } from "@/lib/requestPresentation";
import { requestBillingSchema, requestPrintStatus } from "@/lib/requestDetails";
import { Link, useNavigate } from "@/lib/router-compat";
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
import { uploadArtwork } from "@/lib/uploadArtwork";
import { ARTWORK_ACCEPT, ARTWORK_LIMITS, artworkMetadata, checkArtworkBatch } from "@/lib/artworkPolicy";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useAuth } from "@/hooks/useAuth";

import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Send, Printer, Paperclip } from "lucide-react";

const MAX_FILES = ARTWORK_LIMITS.files;
const MAX_FILE_MB = 15;

const RequestPage = () => {
  const fieldId = useId();
  const { items: cartItems, remove, updateQty, clear } = useQuoteCart();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();


  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [billing, setBilling] = useState({ company: "", regNo: "", vatNo: "", address: "", delivery: "", bank: "", iban: "", bic: "" });
  const [print, setPrint] = useState({ method: "", placement: "", colors: "", deadline: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [fileLinks, setFileLinks] = useState<{ name: string; url: string }[]>([]);
  useEffect(() => {
    const links = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setFileLinks(links);
    return () => links.forEach((file) => URL.revokeObjectURL(file.url));
  }, [files]);
  const [sending, setSending] = useState(false);
  const [lostFiles, setLostFiles] = useState<string[]>([]);
  const restoredRef = useRef(false);
  const { submission, locked, sync, pending, rejected, discard } = usePendingRequest("cart", (pending) => {
    restoredRef.current = true;
    const p = pending.payload as Record<string, any>;
    setForm({ name: String(p.name ?? ""), email: String(p.email ?? ""), phone: String(p.phone ?? ""), company: String(p.company ?? "") });
    setPrint({ method: p.print_method || "", placement: p.print_placement || "", colors: p.print_colors || "", deadline: p.deadline || "", notes: p.message || "" });
    if (p.billing && typeof p.billing === "object") setBilling((b) => ({ ...b, ...p.billing }));
    // File blobs cannot survive a reload; already uploaded paths are kept, the rest are reported.
    setLostFiles(missingAttachmentNames(pending));
  });
  // A pending request shows its own immutable items; the live cart (maybe changed in another tab) is untouched.
  const items = pendingDisplayItems(pending, cartItems) as typeof cartItems;
  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const cartNet = items.reduce((s, i) => s + (i.unitPrice || 0) * i.qty, 0);
  const pendingFiles = useRef<File[] | null>(null);
  const uploaded = useRef(new Map<File, string>());
  const uploadIds = useRef(new Map<File, string>());
  const [quarantined, setQuarantined] = useState(false);
  const { create: createOffer, busy: creatingOffer } = useCreateOffer();
  const { isAdmin } = useAuth();

  const t = (lv: string, en: string) => (lang === "lv" ? lv : en);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const combined = [...files, ...incoming];
    try {
      checkArtworkBatch(combined.map((f) => f.size));
      combined.forEach((f) => artworkMetadata(f.name, f.type, f.size));
    } catch (error) {
      toast({ title: t("Failu nevar pievienot", "File not accepted"), description: error instanceof Error ? error.message : undefined, variant: "destructive" });
      return;
    }
    setFiles(combined);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const createFromForm = () => {
    const checked = requestBillingSchema.safeParse(billing);
    if (!checked.success) { toast({ title: t("Pārbaudi bankas rekvizītus", "Check bank details"), variant: "destructive" }); return; }
    return createOffer(true, {
    client_name: form.name.trim(), client_email: form.email.trim() || null,
    client_phone: form.phone.trim() || null, client_company: form.company.trim() || null,
    client_billing: checked.data, note: [printStatusLabel(print.method), print.placement, print.colors, print.deadline, print.notes].filter(Boolean).join("\n"),
  }, print.method && print.method !== "none" ? [{ method: ({ silkscreen: "Sietspiede", dtf: "DTF", termodruka: "Termodruka", embroidery: "Izšūšana", sublimation: "Sublimācija", other: "Cita" } as Record<string, string>)[print.method] || print.method, placement: print.placement || null, price: null, mode: "unit" }] : []);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (((e.currentTarget as HTMLFormElement).elements.namedItem("website") as HTMLInputElement | null)?.value) {
      return;
    }
    if (items.length === 0) {
      toast({ title: t("Pieprasījums ir tukšs", "Request is empty"), variant: "destructive" });
      return;
    }
    if (form.name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast({ title: t("Nederīgs vārds vai e-pasts", "Invalid name or email"), variant: "destructive" });
      return;
    }

    const checkedBilling = requestBillingSchema.safeParse(billing);
    if (!checkedBilling.success) {
      toast({ title: t("Pārbaudi bankas rekvizītus", "Check bank details"), variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const messageParts: string[] = [];
      if (print.notes) messageParts.push(print.notes);
      const message = messageParts.join("\n\n").slice(0, 9800);

      const result = await submission.current.run({
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
          billing: Object.values(billing).some((v) => v.trim())
            ? Object.fromEntries(Object.entries(checkedBilling.data).filter(([, v]) => v))
            : null,
        }, async (id, key, payload) => {
          pendingFiles.current ??= [...files];
          await saveRequest(id, key, payload);
        }, async (requestId, key, pending) => {
      for (const f of pendingFiles.current || []) {
        if (uploaded.current.has(f)) continue;
        const fileId = uploadIds.current.get(f) || crypto.randomUUID();
        uploadIds.current.set(f, fileId);
        const { path, pending: pendingScan } = await uploadArtwork(f, requestId, key, fileId);
        if (pendingScan) setQuarantined(true);
        uploaded.current.set(f, path);
        submission.current.addPath(path, f.name);
      }
      return notifyRequest(requestId, key, [...pending.paths]);
      }, files.map((f) => f.name));
      if (result.state === "busy") return;
      if (result.state === "rejected") {
        toast({ title: rejectedText(lang), variant: "destructive" });
        return;
      }
      const delivered = result.state === "delivered";
      toast({
        title: delivered ? t("Pieprasījums nosūtīts!", "Request sent!") : t("Pieprasījums saglabāts", "Request saved"),
        description: delivered
          ? files.length || pending?.paths.length ? t("Pieprasījums nosūtīts. Faili saņemti.", "Request sent. Files received.") : t("Mēs sazināsimies ar Tevi tuvākajā laikā.", "We will contact you shortly.")
          : t(
              `Paziņojums vēl nav nosūtīts. Mēģini vēlreiz.`,
              `Notification not sent yet. Retry.`,
            ),
      });
      if (delivered) {
        pendingFiles.current = null;
        uploaded.current.clear();
        setLostFiles([]);
        // Only empty the cart it was submitted from; a restored request never wipes a different cart.
        if (!restoredRef.current) clear();
        restoredRef.current = false;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: t("Kļūda", "Error"), description: /rate_limited/.test(err?.message || "") ? t("Pārāk daudz pieprasījumu. Mēģini pēc minūtes.", "Too many requests. Try again in a minute.") : /Failed to fetch|NetworkError|fetch failed/i.test(err?.message || "") ? t("Neizdevās savienoties. Mēģini vēlreiz; tas pats pieprasījums tiks saglabāts bez dublikāta.", "Connection failed. Retry; the same request will be retained without a duplicate.") : err.message, variant: "destructive" });
    } finally {
      setSending(false);
      sync();
    }
  };

  return (
    <OfferWorkspace>
      <div className="quote-form">
        <header className="mb-7 border-b border-border pb-6">
          <img src={logo} alt="Ervitex" className="mb-5 h-14 w-auto sm:h-16" />
          <h1 className="font-heading text-lg font-bold uppercase leading-snug sm:text-xl">{isAdmin ? t("Mans piedāvājums", "My offer") : t("Mans pieprasījums", "My request")}</h1>
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
            <PendingRequestNotice className="lg:col-span-2" locked={locked} rejected={rejected} lang={lang} onNew={() => { discard(); restoredRef.current = false; pendingFiles.current = null; uploaded.current.clear(); setLostFiles([]); }}>
              {lostFiles.length > 0 && <p>{t(`Šie faili netika augšupielādēti pirms lapas pārlādes — nosūti tos uz birojs@ervitex.lv: ${lostFiles.join(", ")}`, `These files were not uploaded before the page reloaded — email them to birojs@ervitex.lv: ${lostFiles.join(", ")}`)}</p>}
            </PendingRequestNotice>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      
            <div className="min-w-0 space-y-6 sm:space-y-8">

              <section aria-label={t("Apdruka un faili", "Decoration and files")} className="border-y-2 border-accent bg-accent/5 py-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase text-accent"><Printer className="h-5 w-5 shrink-0" />
                    {requestPrintStatus(print.method) === "required" ? t("Apdruka nepieciešama", "Decoration required") : requestPrintStatus(print.method) === "none" ? t("Bez apdrukas", "No decoration") : t("Apdruka nav norādīta", "Decoration not specified")}
                  </div>
                  <a href="#request-files" className="flex items-center gap-2 text-sm font-semibold underline underline-offset-4"><Paperclip className="h-5 w-5 shrink-0" />{t("Pievienoti faili", "Attached files")}: {files.length}</a>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant={print.method && print.method !== "none" ? "default" : "outline"} disabled={sending || locked} onClick={() => setPrint({ ...print, method: print.method && print.method !== "none" ? print.method : "consult" })}>{t("Nepieciešama apdruka", "Decoration required")}</Button>
                  <Button type="button" size="sm" variant={print.method === "none" ? "default" : "outline"} disabled={sending || locked} onClick={() => setPrint({ ...print, method: "none", placement: "", colors: "" })}>{t("Bez apdrukas", "No decoration")}</Button>
                </div>
                {fileLinks.length > 0 && <ul className="mt-3 space-y-2">{fileLinks.map((file) => <li key={file.url} className="break-all text-sm">{file.name}</li>)}</ul>}
                {quarantined && <p role="status" className="mt-3 text-sm text-muted-foreground">{t("Faili gaida drošības pārbaudi; darbiniekiem tie vēl nav pieejami.", "Files pending security review; staff cannot access them yet.")}</p>}
              </section>

              {/* Items */}
              <section>
                <div className="mb-5 flex items-end justify-between gap-3 border-b-2 border-foreground pb-3">
                  <h2 className="section-kicker font-heading text-xs font-bold uppercase text-accent">
                    {t("Preces", "Items")}
                    <span className="ml-2 align-middle font-heading text-sm font-bold text-muted-foreground">{totalQty} {t("gab.", "pcs")}</span>
                  </h2>
                  <Button type="button" variant="ghost" size="sm" disabled={sending || locked} onClick={clear} className="text-muted-foreground"><Trash2 className="h-4 w-4" />{t("Notīrīt visu", "Clear all")}</Button>
                </div>
                <QuoteItemsTable disabled={sending || locked} items={items.map((i) => ({ ...i, unitPrice: i.unitPrice ?? null }))} onQuantity={updateQty} onRemove={remove} />
              </section>

              {/* Print details */}
              <section className="border-t border-border py-6">
                <h2 className="mb-6 section-kicker font-heading text-xs font-bold uppercase text-accent">
                  {t("Apdruka visām precēm", "Decoration for all items")}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-method`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Apdrukas metode", "Print method")}</Label>
                    <Select disabled={sending || locked} value={print.method || "consult"} onValueChange={(value) => setPrint({ ...print, method: value })}>
                      <SelectTrigger id={`${fieldId}-method`} aria-label={t("Apdrukas metode visām precēm", "Print method for all items")}><SelectValue /></SelectTrigger>
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
                    <Label htmlFor={`${fieldId}-0`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vēlamais termiņš", "Deadline")}</Label>
                    <Input id={`${fieldId}-0`} disabled={sending || locked} className="h-11 rounded-sm" value={print.deadline} onChange={(e) => setPrint({ ...print, deadline: e.target.value })} placeholder={t("piem. 2 nedēļas", "e.g. 2 weeks")} />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2"><span className="quote-label">{t("Apdrukas vieta", "Print placement")}</span><Input disabled={sending || locked} value={print.placement} onChange={(e) => setPrint({ ...print, placement: e.target.value })} /></label>
                  <label className="space-y-2"><span className="quote-label">{t("Krāsu skaits", "Number of colours")}</span><Input disabled={sending || locked} value={print.colors} onChange={(e) => setPrint({ ...print, colors: e.target.value })} /></label>
                </div>
                <div className="mt-5 space-y-2">
                  <Label htmlFor={`${fieldId}-1`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Piezīmes projektu vadītājam", "Notes to project manager")}</Label>
                  <Textarea id={`${fieldId}-1`} disabled={sending || locked} rows={4} className="resize-none rounded-sm" value={print.notes} onChange={(e) => setPrint({ ...print, notes: e.target.value })} placeholder={t("Papildu informācija, jautājumi...", "Additional info, questions...")} />
                </div>
              </section>


              {/* Files */}
              <section id="request-files" className="border-t border-border py-6">
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
                    disabled={sending || locked}
                    onChange={(e) => handleFiles(e.target.files)}
                    accept={ARTWORK_ACCEPT}
                  />
                </label>
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm">
                    {files.map((f, i) => (
                      <li key={i} className="flex min-w-0 items-center gap-3 rounded-sm border border-border bg-background py-2 pl-4 pr-2">
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {f.name} <span className="text-xs font-normal text-muted-foreground">({(f.size / 1024 / 1024).toFixed(2)}MB)</span>
                        </span>
                        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" disabled={sending || locked} onClick={() => removeFile(i)}>
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
                    <Label htmlFor={`${fieldId}-2`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Vārds", "Name")} *</Label>
                    <Input id={`${fieldId}-2`} name="name" autoComplete="name" disabled={sending || locked} className="h-11 rounded-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-3`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("E-pasts", "Email")} *</Label>
                    <Input id={`${fieldId}-3`} name="email" autoComplete="email" disabled={sending || locked} type="email" className="h-11 rounded-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-4`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Tālrunis", "Phone")}</Label>
                    <Input id={`${fieldId}-4`} name="phone" type="tel" autoComplete="tel" disabled={sending || locked} className="h-11 rounded-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${fieldId}-5`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("Uzņēmums", "Company")}</Label>
                    <Input id={`${fieldId}-5`} name="company" autoComplete="organization" disabled={sending || locked} className="h-11 rounded-sm" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
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
                        ["bank", t("Banka", "Bank")],
                        ["iban", t("Konta numurs (IBAN)", "Account number (IBAN)")],
                        ["bic", "SWIFT/BIC"],
                      ] as const).map(([k, label]) => (
                        <div key={k} className="space-y-1.5">
                          <Label htmlFor={`${fieldId}-billing-${k}`} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
                          <Input id={`${fieldId}-billing-${k}`} disabled={sending || locked} aria-label={label} className="h-11 rounded-sm" maxLength={k === "iban" ? 42 : k === "bic" ? 11 : 300} value={billing[k]} onChange={(e) => setBilling({ ...billing, [k]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </section>

              <Button
                type={isAdmin ? "button" : "submit"}
                onClick={isAdmin ? createFromForm : undefined}
                disabled={sending || creatingOffer || rejected || items.length === 0}
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

