import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Send, X, PhoneCall, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";
import GoogleMapEmbed from "@/components/GoogleMapEmbed";
import HausmanaKvartalsMap from "@/components/HausmanaKvartalsMap";
import StoreLocations from "@/components/contact/StoreLocations";
import vilnisPhoto from "@/assets/team/vilnis-lacis.jpg";
import eriksPhoto from "@/assets/team/eriks-lacis.jpg";
import lauraPhoto from "@/assets/team/laura-daukste.jpg";
import ilonaPhoto from "@/assets/team/ilona-romanovska.jpg";
import santaPhoto from "@/assets/team/santa-zvaigzne.jpg";
import justinePhoto from "@/assets/team/justine-strunka.jpg";

const specialists = [
  { name: "Vilnis Lācis", title: { lv: "Valdes priekšsēdētājs", en: "Chairman of the Board" }, email: "vilnis@ervitex.lv", phone: "+371 67543384", phoneLabel: { lv: "Tel", en: "Tel" }, photo: vilnisPhoto },
  { name: "Ēriks Lācis", title: { lv: "Tirdzniecības direktors", en: "Sales Director" }, email: "eriks@ervitex.lv", phone: "+371 29395600", phoneLabel: { lv: "Mob", en: "Mob" }, photo: eriksPhoto },
  { name: "Laura Daukšte", title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" }, email: "laura@ervitex.lv", phone: "+371 26164635", phoneLabel: { lv: "Mob", en: "Mob" }, photo: lauraPhoto },
  { name: "Ilona Romanovska", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "ilona@ervitex.lv", phone: "+371 29494626", phoneLabel: { lv: "Mob", en: "Mob" }, photo: ilonaPhoto },
  { name: "Santa Zvaigzne", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "santa.k@ervitex.lv", phone: "+371 67436899", phoneLabel: { lv: "Tel", en: "Tel" }, photo: santaPhoto },
  { name: "Justīne Strunka", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "justine@ervitex.lv", phone: "+371 29725412", phoneLabel: { lv: "Mob", en: "Mob" }, photo: justinePhoto },
  { name: "Evita Ņesterova", title: { lv: "Mazumtirdzniecība", en: "Retail" }, email: "evita@ervitex.lv", phone: "+371 29475227", phoneLabel: { lv: "Tel", en: "Tel" }, photo: null as string | null },
];

const ContactPage = () => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const { error } = await supabase.from("quote_requests").insert({
        name,
        email,
        company: company || null,
        phone: phone || null,
        message,
        status: "new",
      });
      if (error) throw error;
      toast({ title: t("contact.sent"), description: t("contact.sentDesc") });
      setForm({ name: "", email: "", company: "", phone: "", message: "" });
    } catch {
      toast({ title: lang === "lv" ? "Kļūda" : "Error", description: lang === "lv" ? "Neizdevās nosūtīt ziņu. Mēģiniet vēlreiz." : "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-bold uppercase md:text-5xl">{t("contact.title")}</h1>
            <p className="mt-4 max-w-lg text-lg text-primary-foreground/60">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      {/* General Office Info + Form */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-xl font-bold uppercase text-foreground">{t("contact.officeTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("contact.responseTime")}</p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6">
              <div>
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{t("contact.address")}</p>
                <p className="mt-1 text-sm text-foreground leading-snug">Braslas Biznesa Centrs,{"\n"}ieeja "D", 2. stāvs{"\n"}Braslas ielā 29, Rīga, LV-1084</p>
              </div>
              <div>
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{t("contact.hours")}</p>
                <p className="mt-1 text-sm text-foreground">{t("contact.hoursValue")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{lang === "lv" ? "Se., Sv.: Slēgts" : "Sat, Sun: Closed"}</p>
              </div>
              <div>
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{t("contact.officeEmail")}</p>
                <a href="mailto:birojs@ervitex.lv" className="mt-1 block text-sm text-foreground hover:text-accent transition-colors">birojs@ervitex.lv</a>
              </div>
              <div>
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{t("contact.accounting")}</p>
                <a href="tel:+37167552540" className="mt-1 block text-sm text-foreground hover:text-accent transition-colors">+371 67552540</a>
              </div>
              <div>
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{lang === "lv" ? "Tālrunis" : "Phone"}</p>
                <a href="tel:+37129475227" className="mt-1 block text-sm text-foreground hover:text-accent transition-colors">+371 29475227</a>
              </div>
              <div className="col-span-2 mt-2">
                <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
                  <a href="tel:+37129475227">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    {lang === "lv" ? "Zvanīt tūlīt" : "Call Now"}
                  </a>
                </Button>
              </div>
              <div className="col-span-2">
                <p className="font-heading text-[10px] font-bold uppercase text-muted-foreground/60">{t("contact.regNr")}</p>
                <p className="mt-1 text-sm text-foreground">LV40002074377</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5 border border-border p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase text-foreground">{t("contact.name")}</label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase text-foreground">{t("contact.emailLabel")}</label>
                  <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase text-foreground">{t("contact.company")}</label>
                  <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-heading text-xs font-bold uppercase text-foreground">{t("contact.phoneLabel")}</label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-heading text-xs font-bold uppercase text-foreground">{t("contact.message")}</label>
                <Textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("contact.messagePlaceholder")} />
              </div>
              <Button type="submit" size="lg" disabled={sending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase sm:w-auto">
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" strokeWidth={1.2} />} {sending ? (lang === "lv" ? "Sūta..." : "Sending...") : t("contact.send")}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Maps Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 text-center">
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">
              {lang === "lv" ? "Kā mūs atrast" : "How to find us"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "lv" ? "Braslas Biznesa Centrs, Braslas ielā 29, Rīga" : "Braslas Business Center, Braslas street 29, Riga"}
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 font-heading text-xs font-bold uppercase text-muted-foreground">
                {lang === "lv" ? "Atrašanās vieta kartē" : "Location on map"}
              </p>
              <GoogleMapEmbed />
            </div>
            <div>
              <p className="mb-3 font-heading text-xs font-bold uppercase text-muted-foreground">
                {lang === "lv" ? "Ēku plāns — Hausmaņa Kvartāls" : "Building plan — Hausmaņa Kvartāls"}
              </p>
              <HausmanaKvartalsMap />
            </div>
          </div>
        </div>
      </section>

      {/* Specialists Section — single container animation */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-accent" />
              <span className="font-heading text-[10px] font-bold uppercase text-accent">
                {lang === "lv" ? "Komanda" : "Team"}
              </span>
              <div className="h-px w-12 bg-accent" />
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground">{t("contact.specialistsTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("team.subtitle")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {specialists.map((member, i) => (
              <div
                key={i}
                className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5"
              >
                <div className="absolute top-0 left-0 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />

                <div
                  className={`relative aspect-[4/3] w-full overflow-hidden bg-muted ${member.photo ? "cursor-pointer" : ""}`}
                  onClick={() => member.photo && setLightboxImg(member.photo)}
                >
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-accent/5 text-accent font-heading text-3xl font-bold">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <div className="relative -mt-4 mx-4 mb-4 bg-card/95 backdrop-blur-sm p-4 shadow-sm border border-border/50">
                  <h3 className="font-heading text-sm font-bold uppercase text-foreground">{member.name}</h3>
                  <p className="text-xs text-accent font-medium mt-0.5">{member.title[lang]}</p>
                  <div className="mt-3 space-y-1.5 border-t border-border pt-3">
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.2} /> {member.email}
                    </a>
                    <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-accent transition-colors">
                      <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.2} /> {member.phoneLabel[lang]}: {member.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <StoreLocations />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setLightboxImg(null)}
          >
            <button
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110"
              onClick={() => setLightboxImg(null)}
            >
              <X className="h-5 w-5" strokeWidth={1.2} />
            </button>
            {(() => {
              const member = specialists.find((s) => s.photo === lightboxImg);
              return member ? (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-3 text-center shadow-lg">
                  <p className="font-heading text-sm font-bold uppercase text-foreground">{member.name}</p>
                  <p className="text-xs text-accent">{member.title[lang]}</p>
                </div>
              ) : null;
            })()}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImg}
              alt="Specialist"
              className="max-h-[80vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ContactPage;
