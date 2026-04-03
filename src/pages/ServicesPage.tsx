import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Grid3x3, Scissors, Palette, Layers, Flame, PenTool, ArrowRight, ShieldCheck, Tag, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { services } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, React.ReactNode> = {
  Grid3x3: <Grid3x3 className="h-10 w-10" />,
  Scissors: <Scissors className="h-10 w-10" />,
  Palette: <Palette className="h-10 w-10" />,
  Layers: <Layers className="h-10 w-10" />,
  Flame: <Flame className="h-10 w-10" />,
  PenTool: <PenTool className="h-10 w-10" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const dtfSections = [
  {
    icon: <Layers className="h-8 w-8" />,
    title: { lv: "MATERIĀLI", en: "MATERIALS" },
    text: {
      lv: "DTF tehnoloģija ir neticami daudzpusīga. Tā ir piemērota T-krekliem, Polo krekliem, hūdijiem, vestēm, jakām, somām, darba apģērbam, lietussargiem un cepurēm. Izcila saite ar kokvilnu, neilonu, poliesteru un dažādiem audumu maisījumiem.",
      en: "DTF technology is incredibly versatile. It's suitable for T-shirts, Polo shirts, hoodies, vests, jackets, bags, workwear, umbrellas, and caps. Excellent adhesion to cotton, nylon, polyester, and various fabric blends.",
    },
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: { lv: "KRĀSAS UN KVALITĀTE", en: "COLORS & QUALITY" },
    text: {
      lv: "Nodrošina pilnkrāsu (CMYK+W) druku ar fotoreālistisku precizitāti un košiem toņiem. Tehnoloģija ļauj realizēt vissmalkākās detaļas, pārejas un ēnas, nezaudējot krāsu intensitāti.",
      en: "Delivers full-color (CMYK+W) printing with photorealistic precision and vibrant tones. The technology reproduces the finest details, gradients, and shadows without losing color intensity.",
    },
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: { lv: "PASŪTĪJUMA APJOMS", en: "ORDER VOLUME" },
    text: {
      lv: "Ideāli piemērots gan individuāliem pasūtījumiem (no 1 eksemplāra), gan lielām tirāžām. Labākā izvēle mainīgo datu drukai – vārdiem, uzvārdiem vai unikāliem numuriem uz katra izstrādājuma.",
      en: "Perfectly suited for both individual orders (from 1 piece) and large runs. The best choice for variable data printing — names, surnames, or unique numbers on each item.",
    },
  },
  {
    icon: <Tag className="h-8 w-8" />,
    title: { lv: "CENAS EFEKTIVITĀTE", en: "COST EFFICIENCY" },
    text: {
      lv: "Cena tiek aprēķināta pēc apdrukas laukuma (cm²). Tā ir viena no izdevīgākajām metodēm daudzkrāsu drukai, jo nav nepieciešama dārga klišeju vai sietu sagatavošana.",
      en: "Price is calculated by print area (cm²). It's one of the most cost-effective methods for full-color printing, as no expensive clichés or screen preparation is required.",
    },
  },
  {
    icon: <ShieldCheck className="h-8 w-8" />,
    title: { lv: "NOTURĪBA UN KOPŠANA", en: "DURABILITY & CARE" },
    text: {
      lv: "Īpaši elastīga un izturīga pret plaisāšanu. Saglabā sākotnējo izskatu pēc daudzām mazgāšanas reizēm. Kopšana: Mazgāt, žāvēt un gludināt no kreisās puses. Ieteicamā temperatūra līdz 40°C.",
      en: "Highly elastic and resistant to cracking. Maintains its original appearance after many washes. Care: Wash, dry, and iron inside out. Recommended temperature up to 40°C.",
    },
  },
];

const ServicesPage = () => {
  const { lang, t } = useLanguage();

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide md:text-5xl">{t("services.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/60">{t("services.subtitle")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-sm border border-border bg-card p-8 transition-all hover:border-accent hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-6 font-heading text-lg font-bold uppercase tracking-wider text-card-foreground">{service.title[lang]}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.description[lang]}</p>
              <Button variant="ghost" className="mt-6 px-0 text-xs font-heading uppercase tracking-widest text-accent hover:text-accent/80 hover:bg-transparent" asChild>
                <Link to="/contact">
                  {t("services.learnMore")} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DTF Druka Section */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="mb-12 max-w-3xl">
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
              {lang === "lv" ? "DTF druka – Inovācija un augstākā kvalitāte tekstila apdrukā" : "DTF Printing – Innovation & Top Quality in Textile Printing"}
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dtfSections.map((item, i) => (
              <motion.div
                key={item.title[lang]}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-sm border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10 text-accent">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-heading text-sm font-bold uppercase tracking-wider text-card-foreground">
                  {item.title[lang]}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.text[lang]}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-10 text-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
              <Link to="/contact">
                Pieprasīt piedāvājumu <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide md:text-4xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/50">{t("cta.subtitle")}</p>
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
              <Link to="/contact">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
