import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Clock3, Mail, MapPin, Phone, Send, X, Loader2, ReceiptText, Navigation, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { AccentIcon } from "@/components/ui/accent-icon";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/i18n/LanguageContext";
import GoogleMapEmbed, { GMAPS_URL, WAZE_URL } from "@/components/GoogleMapEmbed";
import HausmanaKvartalsMap from "@/components/HausmanaKvartalsMap";
import StoreLocations from "@/components/contact/StoreLocations";
import SectionHeading from "@/components/contact/SectionHeading";
import vilnisPhoto from "@/assets/team/vilnis-lacis.webp";
import eriksPhoto from "@/assets/team/eriks-lacis.webp";
import lauraPhoto from "@/assets/team/laura-daukste.webp";
import ilonaPhoto from "@/assets/team/ilona-romanovska.webp";
import santaPhoto from "@/assets/team/santa-zvaigzne.webp";
import justinePhoto from "@/assets/team/justine-strunka.webp";
import evitaPhoto from "@/assets/team/evita-nesterova.webp";

const specialists = [
  { slug: "laura", name: "Laura Daukšte", title: { lv: "Iepirkumu un pārdošanas daļas vadītāja", en: "Head of Purchasing and Sales" }, email: "laura@ervitex.lv", phone: "+371 26164635", phoneLabel: { lv: "Mob", en: "Mob" }, photo: lauraPhoto },
  { slug: "ilona", name: "Ilona Romanovska", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "ilona@ervitex.lv", phone: "+371 29494626", phoneLabel: { lv: "Mob", en: "Mob" }, photo: ilonaPhoto },
  { slug: "santa", name: "Santa Zvaigzne", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "santa.k@ervitex.lv", phone: "+371 67436899", phoneLabel: { lv: "Tel", en: "Tel" }, photo: santaPhoto },
  { slug: "justine", name: "Justīne Strunka", title: { lv: "Projektu vadītāja", en: "Project Manager" }, email: "justine@ervitex.lv", phone: "+371 29725412", phoneLabel: { lv: "Mob", en: "Mob" }, photo: justinePhoto },
  { slug: "evita", name: "Evita Ņesterova", title: { lv: "Mazumtirdzniecība", en: "Retail" }, email: "evita@ervitex.lv", phone: "+371 29475227", phoneLabel: { lv: "Tel", en: "Tel" }, photo: evitaPhoto },
  { slug: "vilnis", name: "Vilnis Lācis", title: { lv: "Valdes priekšsēdētājs", en: "Chairman of the Board" }, email: "vilnis@ervitex.lv", phone: "+371 67543384", phoneLabel: { lv: "Tel", en: "Tel" }, photo: vilnisPhoto },
  { slug: "eriks", name: "Ēriks Lācis", title: { lv: "Tirdzniecības direktors", en: "Sales Director" }, email: "eriks@ervitex.lv", phone: "+371 29395600", phoneLabel: { lv: "Mob", en: "Mob" }, photo: eriksPhoto },
];

const teamGroups: { label: { lv: string; en: string }; slugs: string[] }[] = [
  { label: { lv: "Projektu vadītāji", en: "Project managers" }, slugs: ["laura", "ilona", "santa", "justine"] },
  { label: { lv: "Mazumtirdzniecība", en: "Retail" }, slugs: ["evita"] },
  { label: { lv: "Vadība", en: "Management" }, slugs: ["vilnis", "eriks"] },
];

type PhotoSettings = { zoom: number; position_x: number; position_y: number };

const ContactPage = () => {
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", message: "" });
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [photoSettings, setPhotoSettings] = useState<Record<string, PhotoSettings>>({});

  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("team_photo_settings").select("slug, zoom, position_x, position_y").then(({ data }) => {
      const next: Record<string, PhotoSettings> = {};
      data?.forEach((row) => {
        next[row.slug] = { zoom: Number(row.zoom), position_x: Number(row.position_x), position_y: Number(row.position_y) };
      });
      setPhotoSettings(next);
    });
  }, []);

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
      <PageIntro
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        eyebrow={lang === "lv" ? "Sāksim sarunu" : "Start a conversation"}
      />

      {/* Team */}
      <section className="bg-background py-12 md:py-24">
        <div className="container">
          <SectionHeading
            eyebrow={lang === "lv" ? "Komanda" : "Team"}
            title={lang === "lv" ? "Sazinieties ar kādu no mūsu speciālistiem" : "Get in touch with one of our specialists"}
          />
          <div className="space-y-12 md:space-y-16">
            {teamGroups.map((group) => {
              const members = group.slugs
                .map((slug) => specialists.find((m) => m.slug === slug))
                .filter(Boolean) as typeof specialists;
              return (
                <div key={group.label.lv}>
                  <div className="mb-5 flex items-center gap-4 md:mb-7">
                    <h3 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">{group.label[lang]}</h3>
                    <div aria-hidden="true" className="h-px w-full bg-border" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {members.map((member) => {
                      const ps = photoSettings[member.slug];
                      return (
                        <article key={member.slug} className="group flex flex-col border border-border bg-card transition-colors hover:border-accent/50">
                          <button
                            type="button"
                            onClick={() => setLightboxImg(member.photo)}
                            className="relative aspect-[4/5] w-full overflow-hidden bg-muted"
                            aria-label={member.name}
                          >
                            <img
                              src={member.photo}
                              alt={member.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                              style={{
                                transform: `translate(${((ps?.position_x ?? 50) - 50) * 0.5}%, ${((ps?.position_y ?? 50) - 50) * 0.5}%) scale(${ps?.zoom ?? 1})`,
                              }}
                            />
                          </button>
                          <div className="flex grow flex-col p-4 md:p-5">
                            <h3 className="font-heading text-base font-bold uppercase text-foreground">{member.name}</h3>
                            <p className="mt-1 min-h-[2.5rem] text-sm font-medium text-accent">{member.title[lang]}</p>
                            <div className="mt-4 space-y-2 border-t border-border pt-4">
                              <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 truncate text-sm text-foreground/80 transition-colors hover:text-accent">
                                <AccentIcon icon={Mail} inline className="h-4 w-4" />{member.email}
                              </a>
                              <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm text-foreground/80 transition-colors hover:text-accent">
                                <AccentIcon icon={Phone} inline className="h-4 w-4" />{member.phone}
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Wholesale Office + Contact Form */}
      <section className="border-t border-border bg-muted/50 py-12 md:py-24">
        <div className="container">
          <SectionHeading eyebrow="Ervitex" title={lang === "lv" ? "Vairumtirdzniecības birojs" : "Wholesale office"} />
          <div className="grid items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col border border-border bg-card p-5 lg:col-span-5 md:p-8">
              <dl className="divide-y divide-border">
                {[
                  { icon: MapPin, label: t("contact.address"), content: <>Hausmaņa biroji, „D” ieeja, 2. stāvs<br />Braslas iela 29, Vidzemes priekšpilsēta,<br />Rīga, LV-1084</> },
                  { icon: ReceiptText, label: t("contact.regNr"), content: <>LV40002074377</> },
                  { icon: Mail, label: t("contact.officeEmail"), content: <a href="mailto:birojs@ervitex.lv" className="transition-colors hover:text-accent">birojs@ervitex.lv</a> },
                  {
                    icon: Phone,
                    label: lang === "lv" ? "Tālrunis" : "Phone",
                    content: (
                      <>
                        <a href="tel:+37167543384" className="block transition-colors hover:text-accent">+371 67543384</a>
                        <a href="tel:+37167436896" className="block transition-colors hover:text-accent">+371 67436896</a>
                      </>
                    ),
                  },
                  { icon: Calculator, label: t("contact.accounting"), content: <a href="tel:+37167552540" className="transition-colors hover:text-accent">+371 67552540</a> },
                  {
                    icon: Clock3,
                    label: t("contact.hours"),
                    content: (
                      <>
                        {lang === "lv" ? "P.–C.: 9:00–17:30" : "Mon–Thu: 9:00–17:30"}<br />
                        {lang === "lv" ? "Pk.: 9:00–16:00" : "Fri: 9:00–16:00"}<br />
                        <span className="text-muted-foreground">{lang === "lv" ? "Sest., Sv.: slēgts" : "Sat, Sun: closed"}</span>
                      </>
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3 py-3.5 first:pt-0 last:pb-0 md:gap-4 md:py-4">
                    <AccentIcon icon={item.icon} />
                    <div className="min-w-0">
                      <dt className="font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground">{item.label}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-foreground md:text-base">{item.content}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border border-border bg-card p-5 lg:col-span-7 md:p-8">
              <h3 className="mb-6 font-heading text-lg font-bold uppercase text-foreground">{lang === "lv" ? "Sazinieties ar mums" : "Contact us"}</h3>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  {([
                    ["name", t("contact.name"), "text", true],
                    ["email", t("contact.emailLabel"), "email", true],
                    ["company", t("contact.company"), "text", false],
                    ["phone", t("contact.phoneLabel"), "tel", false],
                  ] as const).map(([key, label, type, req]) => (
                     <div key={key} className="space-y-1.5 md:space-y-2">
                      <label htmlFor={`c-${key}`} className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{label}</label>
                       <Input id={`c-${key}`} required={req} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="h-11 rounded-none bg-background px-3 focus-visible:ring-accent md:h-12 md:px-4" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label htmlFor="c-message" className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">{t("contact.message")}</label>
                  <Textarea id="c-message" required rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={t("contact.messagePlaceholder")} className="resize-none rounded-none bg-background px-4 py-3 focus-visible:ring-accent" />
                </div>
                <Button type="submit" size="lg" disabled={sending} className="h-12 w-full rounded-none bg-accent px-8 font-heading text-sm uppercase text-accent-foreground hover:bg-accent/90 sm:w-auto">
                  {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" strokeWidth={1.5} />}
                  {sending ? (lang === "lv" ? "Sūta..." : "Sending...") : t("contact.send")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="border-t border-border bg-background py-12 md:py-24">
        <div className="container">
          <SectionHeading
            eyebrow={lang === "lv" ? "Atrašanās vieta" : "Location"}
            title={lang === "lv" ? "Kā mūs atrast" : "How to find us"}
            subtitle={lang === "lv" ? "Braslas iela 29, Hausmaņa biroji, „D” ieeja, 2. stāvs" : "Braslas iela 29, Hausmana offices, entrance D, 2nd floor"}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden border border-border"><GoogleMapEmbed /></div>
            <div className="overflow-hidden border border-border"><HausmanaKvartalsMap /></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
            <a href={GMAPS_URL} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 border border-border bg-card font-heading text-sm font-bold uppercase text-foreground transition-colors hover:border-accent hover:text-accent">
              <AccentIcon icon={Navigation} inline className="h-4 w-4" />Google Maps
            </a>
            <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 border border-border bg-card font-heading text-sm font-bold uppercase text-foreground transition-colors hover:border-accent hover:text-accent">
              <AccentIcon icon={Navigation} inline className="h-4 w-4" />Waze
            </a>
          </div>
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
