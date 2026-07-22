import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuoteCart } from "@/hooks/useQuoteCart";
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

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [print, setPrint] = useState({ method: "", placement: "", colors: "", deadline: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

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
          <Button asChild variant="outline" size="sm" className="font-heading text-xs uppercase tracking-widest">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Atgriezties katalogā", "Back to catalog")}
            </Link>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-10 text-center text-muted-foreground">
            {t("Pieprasījums ir tukšs. Pārlūko katalogu un pievieno preces.", "Your request is empty. Browse the catalog and add items.")}
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr,380px]">
            <div className="space-y-8">
              {/* Items */}
              <section className="rounded-md border border-border bg-card p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-black uppercase tracking-wide">
                    {t("Preces", "Items")} <span className="text-muted-foreground text-sm">({totalQty})</span>
                  </h2>
                  <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-xs text-muted-foreground">
                    {t("Notīrīt visu", "Clear all")}
                  </Button>
                </div>
                <div className="space-y-4">
                  {grouped.map((group) => {
                    const head = group[0];
                    return (
                      <div key={head.productId + head.colorCode} className="flex gap-3 rounded border border-border p-3">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-white">
                          {head.image ? (
                            <img src={head.image} alt={head.name} className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-muted" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-sm">{head.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {head.code}
                                {head.colorName && <> · <span className="inline-flex items-center gap-1">
                                  {head.colorHex && <span className="inline-block h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: head.colorHex }} />}
                                  {head.colorName}
                                </span></>}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            {group.map((it) => (
                              <div key={it.id} className="flex items-center gap-2 text-sm">
                                <span className="min-w-[3rem] rounded border border-border px-2 py-0.5 text-center text-xs font-bold">
                                  {it.size || "—"}
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  value={it.qty}
                                  onChange={(e) => updateQty(it.id, parseInt(e.target.value) || 1)}
                                  className="h-8 w-20"
                                />
                                <span className="text-xs text-muted-foreground">{t("gab.", "pcs")}</span>
                                <Button type="button" size="icon" variant="ghost" className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(it.id)}>
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Print details */}
              <section className="rounded-md border border-border bg-card p-4 sm:p-6 space-y-4">
                <h2 className="font-heading text-lg font-black uppercase tracking-wide">
                  {t("Apdrukas informācija", "Print details")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("Norādi, ja vēlies apdruku. Ja bez apdrukas — atstāj tukšu.", "Fill in if you want printing. Leave blank if no print is needed.")}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("Apdrukas metode", "Print method")}</Label>
                    <select
                      value={print.method}
                      onChange={(e) => setPrint({ ...print, method: e.target.value })}
                      className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">{t("Nezinu / konsultēties", "Not sure / consult")}</option>
                      <option value="silkscreen">{t("Sietspiede", "Silkscreen")}</option>
                      <option value="dtf">{t("Termodruka / DTF", "Heat transfer / DTF")}</option>
                      <option value="embroidery">{t("Izšuvums", "Embroidery")}</option>
                      <option value="digital">{t("Digitālā druka", "Digital print")}</option>
                      <option value="none">{t("Bez apdrukas", "No print")}</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("Izvietojums", "Placement")}</Label>
                    <Input value={print.placement} onChange={(e) => setPrint({ ...print, placement: e.target.value })} placeholder={t("piem. priekšpuse, uz muguras", "e.g. front, back")} />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("Krāsu skaits", "Number of colors")}</Label>
                    <Input value={print.colors} onChange={(e) => setPrint({ ...print, colors: e.target.value })} placeholder="1, 2, CMYK..." />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider">{t("Vēlamais termiņš", "Deadline")}</Label>
                    <Input value={print.deadline} onChange={(e) => setPrint({ ...print, deadline: e.target.value })} placeholder={t("piem. 2 nedēļas", "e.g. 2 weeks")} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("Piezīmes projektu vadītājam", "Notes to project manager")}</Label>
                  <Textarea rows={4} value={print.notes} onChange={(e) => setPrint({ ...print, notes: e.target.value })} placeholder={t("Papildu informācija, jautājumi...", "Additional info, questions...")} />
                </div>
              </section>

              {/* Files */}
              <section className="rounded-md border border-border bg-card p-4 sm:p-6 space-y-3">
                <h2 className="font-heading text-lg font-black uppercase tracking-wide">
                  {t("Faili (logo, dizains)", "Files (logo, artwork)")}
                </h2>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border bg-background p-6 text-center hover:bg-muted/40 transition-colors">
                  <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("Ievelc failus šeit vai spied, lai izvēlētos", "Drop files here or click to choose")}</span>
                  <span className="mt-1 text-xs text-muted-foreground">
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
                  <ul className="space-y-1 text-sm">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between rounded border border-border px-3 py-2">
                        <span className="truncate">{f.name} <span className="text-xs text-muted-foreground">({(f.size / 1024 / 1024).toFixed(2)}MB)</span></span>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFile(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {/* Contact */}
              <section className="rounded-md border border-border bg-card p-4 sm:p-6 space-y-3">
                <h2 className="font-heading text-lg font-black uppercase tracking-wide">
                  {t("Tavi kontakti", "Your contacts")}
                </h2>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("Vārds", "Name")} *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("E-pasts", "Email")} *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("Tālrunis", "Phone")}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider">{t("Uzņēmums", "Company")}</Label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
              </section>


              <Button
                type="submit"
                disabled={sending || items.length === 0}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest h-12"
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
