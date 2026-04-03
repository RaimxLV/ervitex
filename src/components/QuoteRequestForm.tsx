import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: lang === "lv" ? "Aizpildiet obligātos laukus" : "Fill in required fields", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.from("quote_requests").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      message: productName ? `[${productName}] ${form.message.trim()}` : form.message.trim(),
      product_id: productId || null,
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: lang === "lv" ? "Pieprasījums nosūtīts!" : "Quote request sent!" });
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-wider">{lang === "lv" ? "Vārds *" : "Name *"}</Label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider">Email *</Label>
          <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="text-xs uppercase tracking-wider">{lang === "lv" ? "Tālrunis" : "Phone"}</Label>
          <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider">{lang === "lv" ? "Uzņēmums" : "Company"}</Label>
          <Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
        </div>
      </div>
      <div>
        <Label className="text-xs uppercase tracking-wider">{lang === "lv" ? "Ziņojums" : "Message"}</Label>
        <Textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} />
      </div>
      <Button type="submit" disabled={sending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
        <Send className="mr-2 h-4 w-4" />
        {sending ? (lang === "lv" ? "Sūta..." : "Sending...") : (lang === "lv" ? "Pieprasīt piedāvājumu" : "Request Quote")}
      </Button>
    </form>
  );
};

export default QuoteRequestForm;
