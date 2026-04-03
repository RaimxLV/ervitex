import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const ContactPage = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: t("contact.sent"), description: t("contact.sentDesc") });
    setForm({ name: "", email: "", company: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide md:text-5xl">{t("contact.title")}</h1>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/60">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">{t("contact.getInTouch")}</h2>
              <p className="mt-2 text-muted-foreground">{t("contact.responseTime")}</p>
            </div>

            <div className="space-y-5">
              {[
                { icon: <Phone className="h-5 w-5" />, label: t("contact.phone"), value: "+371 678 18282", href: "tel:+37167818282" },
                { icon: <Mail className="h-5 w-5" />, label: t("contact.email"), value: "info@ervitex.lv", href: "mailto:info@ervitex.lv" },
                { icon: <MapPin className="h-5 w-5" />, label: t("contact.address"), value: "Rīga, Latvia" },
                { icon: <Clock className="h-5 w-5" />, label: t("contact.hours"), value: t("contact.hoursValue") },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent/10 text-accent">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-foreground hover:text-accent transition-colors">{item.value}</a>
                    ) : (
                      <p className="text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 rounded-sm border border-border p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.name")}</label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.emailLabel")}</label>
                  <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.company")}</label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.phoneLabel")}</label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.message")}</label>
                <Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("contact.messagePlaceholder")} />
              </div>
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest sm:w-auto">
                <Send className="mr-2 h-4 w-4" /> {t("contact.send")}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
