import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, Building, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import HausmanaKvartalsMap from "@/components/HausmanaKvartalsMap";

const specialists = [
  {
    name: "Vilnis Lācis",
    title: { lv: "Valdes priekšsēdētājs", en: "Chairman of the Board" },
    email: "vilnis@ervitex.lv",
    phone: "+371 67543384",
    phoneLabel: { lv: "Tel", en: "Tel" },
  },
  {
    name: "Ēriks Lācis",
    title: { lv: "Tirdzniecības direktors", en: "Sales Director" },
    email: "eriks@ervitex.lv",
    phone: "+371 29395600",
    phoneLabel: { lv: "Mob", en: "Mob" },
  },
  {
    name: "Laura Daukšte",
    title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" },
    email: "laura@ervitex.lv",
    phone: "+371 26164635",
    phoneLabel: { lv: "Mob", en: "Mob" },
  },
  {
    name: "Ilona Romanovska",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "ilona@ervitex.lv",
    phone: "+371 29494626",
    phoneLabel: { lv: "Mob", en: "Mob" },
  },
  {
    name: "Santa Zvaigzne",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "santa.k@ervitex.lv",
    phone: "67436899",
    phoneLabel: { lv: "Tel", en: "Tel" },
  },
  {
    name: "Justīne Strunka",
    title: { lv: "Projektu vadītāja", en: "Project Manager" },
    email: "justine@ervitex.lv",
    phone: "29725412",
    phoneLabel: { lv: "Mob", en: "Mob" },
  },
  {
    name: "Evita Ņesterova",
    title: { lv: "Mazumtirdzniecība", en: "Retail" },
    email: "evita@ervitex.lv",
    phone: "29475227",
    phoneLabel: { lv: "Tel", en: "Tel" },
  },
];

const ContactPage = () => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
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

      {/* General Office Info + Form */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="font-heading text-xl font-black uppercase tracking-wide text-foreground">{t("contact.officeTitle")}</h2>
              <p className="mt-2 text-muted-foreground">{t("contact.responseTime")}</p>
            </div>

            <div className="space-y-5">
              {[
                { icon: <MapPin className="h-5 w-5" />, label: t("contact.address"), value: "Braslas Biznesa Centrs, ieeja \"D\", 2. stāvs\nBraslas ielā 29, Rīga, LV-1084" },
                { icon: <Mail className="h-5 w-5" />, label: t("contact.officeEmail"), value: "birojs@ervitex.lv", href: "mailto:birojs@ervitex.lv" },
                { icon: <Phone className="h-5 w-5" />, label: t("contact.accounting"), value: "+371 67552540", href: "tel:+37167552540" },
                { icon: <FileText className="h-5 w-5" />, label: t("contact.regNr"), value: "LV40002074377" },
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
                      <p className="text-foreground whitespace-pre-line">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent/10 text-accent">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {lang === "lv" ? "Brīvdienas" : "Weekends"}
                  </p>
                  <p className="text-foreground">{lang === "lv" ? "Se., Sv.: Slēgts" : "Sat, Sun: Closed"}</p>
                </div>
              </div>
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

      {/* Specialists Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground">{t("contact.specialistsTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("team.subtitle")}</p>
          </motion.div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {specialists.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-sm border border-border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 shrink-0 border-2 border-muted">
                    <AvatarFallback className="bg-accent/10 text-accent font-heading text-sm font-bold">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-heading text-sm font-bold text-foreground">{member.name}</h3>
                    <p className="text-xs text-accent font-medium">{member.title[lang]}</p>
                    <div className="mt-2 space-y-1">
                      <a href={`mailto:${member.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors truncate">
                        <Mail className="h-3 w-3 shrink-0" /> {member.email}
                      </a>
                      <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                        <Phone className="h-3 w-3 shrink-0" /> {member.phoneLabel[lang]}: {member.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
