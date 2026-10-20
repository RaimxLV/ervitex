import { useId, useState } from "react";
import { usePendingRequest, rejectedText } from "@/hooks/usePendingRequest";
import { PendingRequestNotice } from "@/components/quote/PendingRequestNotice";
import { saveRequest, notifyRequest } from "@/lib/submitRequest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { Send } from "lucide-react";

interface QuoteFormProps {
  productId?: string;
  productName?: string;
}

const QuoteRequestForm = ({ productId, productName }: QuoteFormProps) => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const fieldId = useId();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const { submission, locked, sync, rejected, discard } = usePendingRequest(`quote:${productId || "general"}`, ({ payload: p }) =>
    setForm({ name: String(p.name ?? ""), email: String(p.email ?? ""), phone: String(p.phone ?? ""), company: String(p.company ?? ""), message: String(p.message ?? "") }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (((e.currentTarget as HTMLFormElement).elements.namedItem("website") as HTMLInputElement | null)?.value) {
      return;
    }
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const company = form.company.trim();
    const message = form.message.trim();

    if (name.length < 2 || name.length > 100) {
      toast({ title: lang === "lv" ? "Nederīgs vārds" : "Invalid name", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      toast({ title: lang === "lv" ? "Nederīgs e-pasts" : "Invalid email", variant: "destructive" });
      return;
    }
    if (phone.length > 50 || company.length > 200 || message.length > 5000) {
      toast({ title: lang === "lv" ? "Pārāk garš teksts" : "Text too long", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const result = await submission.current.run({ name, email, phone, company, message: productName ? `[${productName}] ${message}` : message, product_id: productId || null }, saveRequest, (id, key) => notifyRequest(id, key));
      if (result.state === "busy") return;
      if (result.state === "rejected") { toast({ title: rejectedText(lang), variant: "destructive" }); return; }
      toast({ title: result.state === "delivered" ? (lang === "lv" ? "Pieprasījums nosūtīts!" : "Quote request sent!") : (lang === "lv" ? "Pieprasījums saglabāts; paziņojums vēl nav nosūtīts. Mēģini vēlreiz." : "Request saved; notification not sent yet. Retry.") });
      if (result.state === "delivered") setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      const limited = error instanceof Error && /rate_limited/.test(error.message);
      toast({ title: lang === "lv" ? "Neizdevās nosūtīt" : "Could not send", description: limited ? (lang === "lv" ? "Mēģini pēc minūtes." : "Try again in a minute.") : undefined, variant: "destructive" });
    } finally { setSending(false); sync(); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>
      
      <PendingRequestNotice locked={locked} rejected={rejected} lang={lang} onNew={() => { discard(); setForm({ name: "", email: "", phone: "", company: "", message: "" }); }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${fieldId}-0`} className="text-xs uppercase tracking-wider">{lang === "lv" ? "Vārds *" : "Name *"}</Label>
          <Input id={`${fieldId}-0`} name="name" autoComplete="name" disabled={sending || locked} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-1`} className="text-xs uppercase tracking-wider">{lang === "lv" ? "E-pasts *" : "Email *"}</Label>
          <Input id={`${fieldId}-1`} name="email" autoComplete="email" disabled={sending || locked} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${fieldId}-2`} className="text-xs uppercase tracking-wider">{lang === "lv" ? "Tālrunis" : "Phone"}</Label>
          <Input id={`${fieldId}-2`} name="phone" type="tel" autoComplete="tel" disabled={sending || locked} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <Label htmlFor={`${fieldId}-3`} className="text-xs uppercase tracking-wider">{lang === "lv" ? "Uzņēmums" : "Company"}</Label>
          <Input id={`${fieldId}-3`} name="company" autoComplete="organization" disabled={sending || locked} value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
        </div>
      </div>
      <div>
        <Label htmlFor={`${fieldId}-4`} className="text-xs uppercase tracking-wider">{lang === "lv" ? "Ziņojums" : "Message"}</Label>
        <Textarea id={`${fieldId}-4`} name="message" disabled={sending || locked} value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} />
      </div>
      <Button type="submit" disabled={sending || rejected} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
        <Send className="mr-2 h-4 w-4" />
        {sending ? (lang === "lv" ? "Sūta..." : "Sending...") : (lang === "lv" ? "Pieprasīt piedāvājumu" : "Request Quote")}
      </Button>
    </form>
  );
};

export default QuoteRequestForm;
