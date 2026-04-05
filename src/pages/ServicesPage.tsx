import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Printer, Layers, Scissors, Palette, ArrowRight,
  Shirt, UserPlus, Wind, Box, BookOpen, TrendingUp,
  ShieldCheck, Briefcase, Zap, Droplets, Infinity,
  Activity, Maximize, Thermometer, Tag, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ServiceImageCarousel from "@/components/services/ServiceImageCarousel";
import { useLanguage } from "@/i18n/LanguageContext";

import screenPrint1 from "@/assets/services/screen-printing-1.jpg";
import screenPrint2 from "@/assets/services/screen-printing-2.jpg";
import screenPrint3 from "@/assets/services/screen-printing-3.jpg";
import screenPrint4 from "@/assets/services/screen-printing-4.jpg";

const serviceImages: Record<string, string[]> = {
  screen: [screenPrint1, screenPrint2, screenPrint3, screenPrint4],
  dtf: [],
  embroidery: [],
  sublimation: [],
};

const SW = 1.2;

interface ServiceFeature {
  icon: React.ReactNode;
  label: { lv: string; en: string };
  text: { lv: string; en: string };
}

interface ServiceSection {
  id: string;
  icon: React.ReactNode;
  title: { lv: string; en: string };
  subtitle: { lv: string; en: string };
  features: ServiceFeature[];
}

const serviceSections: ServiceSection[] = [
  {
    id: "dtf",
    icon: <Printer className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "DTF un termodruka", en: "DTF & Heat Transfer" },
    subtitle: {
      lv: "No viena eksemplāra līdz personalizētai tirāžai — modernākā digitālā tehnoloģija.",
      en: "From a single piece to personalized runs — the most advanced digital technology.",
    },
    features: [
      { icon: <Shirt className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Kokvilna, poliesters, neilons, darba apģērbs, somas, cepures.", en: "Cotton, polyester, nylon, workwear, bags, caps." } },
      { icon: <Droplets className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Krāsas", en: "Colors" }, text: { lv: "Pilnkrāsu CMYK+W druka, speciālās plēves (zelta, sudraba, atstarojošas). Pantone® atbilstība pieejama.", en: "Full-color CMYK+W printing, specialty films (gold, silver, reflective). Pantone® matching available." } },
      { icon: <UserPlus className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Pasūtījums", en: "Ordering" }, text: { lv: "Ideāli individuāliem vārdiem, numuriem un mazām tirāžām — no 1 gabala.", en: "Ideal for individual names, numbers, and small runs — starting from 1 piece." } },
      { icon: <Wind className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Kopšana", en: "Care" }, text: { lv: "Mazgāt līdz 40 °C, gludināt no kreisās puses.", en: "Wash up to 40 °C, iron inside out." } },
    ],
  },
  {
    id: "screen",
    icon: <Layers className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Sietspiede", en: "Screen Printing" },
    subtitle: {
      lv: "Industriāla kvalitāte lieliem apjomiem — klasika ar nepārspējamu krāsu intensitāti.",
      en: "Industrial quality for large volumes — a time-tested method with unmatched colour intensity.",
    },
    features: [
      { icon: <Shirt className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Labākā izvēle t-krekliem, polo un auduma maisiņiem lielos daudzumos.", en: "The go-to method for t-shirts, polos, and tote bags in large quantities." } },
      { icon: <Palette className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Krāsas", en: "Colors" }, text: { lv: "Pantone® Solid Coated precizitāte. Īpaši koši un sedzoši toņi.", en: "Pantone® Solid Coated precision. Exceptionally vibrant and opaque tones." } },
      { icon: <TrendingUp className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Pasūtījums", en: "Ordering" }, text: { lv: "Ekonomiski izdevīgākais veids tirāžām virs 50 vienībām.", en: "The most cost-effective method for runs exceeding 50 pieces." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Noturība", en: "Durability" }, text: { lv: "Augstākā mehāniskā izturība — krāsa iesūcas tieši audumā.", en: "Superior mechanical resistance — ink bonds directly with the fabric." } },
    ],
  },
  {
    id: "embroidery",
    icon: <Scissors className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Izšūšana", en: "Embroidery" },
    subtitle: {
      lv: "Ekskluzīvs un ilgmūžīgs risinājums — premium izskats jūsu zīmolam.",
      en: "An exclusive, long-lasting solution — premium aesthetics for your brand.",
    },
    features: [
      { icon: <Briefcase className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Pielietojums", en: "Applications" }, text: { lv: "Polo krekli, flīsa jakas, cepures, frotē dvieļi, reprezentācijas apģērbs.", en: "Polo shirts, fleece jackets, caps, terry towels, corporate apparel." } },
      { icon: <Zap className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Kvalitāte", en: "Quality" }, text: { lv: "3D efekts un taustāma tekstūra. Piešķir apģērbam augstu pievienoto vērtību.", en: "3D effect and tangible texture. Adds measurable perceived value to garments." } },
      { icon: <Droplets className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Diegi", en: "Threads" }, text: { lv: "Plaša krāsu palete (Madeira / Isacord), ieskaitot metāliskos diegus.", en: "Wide colour palette (Madeira / Isacord), including metallic threads." } },
      { icon: <Infinity className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Noturība", en: "Durability" }, text: { lv: "Neierobežots kalpošanas laiks. Droši mazgāt augstās temperatūrās.", en: "Unlimited lifespan. Safe to wash at high temperatures." } },
    ],
  },
  {
    id: "sublimation",
    icon: <Palette className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Sublimācija", en: "Sublimation" },
    subtitle: {
      lv: "Neierobežots dizains sportam un reklāmai — fotogrāfiska kvalitāte bez robežām.",
      en: "Unlimited design for sport & promotion — photographic quality without boundaries.",
    },
    features: [
      { icon: <Activity className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Tikai sintētiski (poliestera) audumi — sporta formas, karogi, suvenīri.", en: "Polyester fabrics only — sports uniforms, flags, specialty souvenirs." } },
      { icon: <Maximize className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Dizains", en: "Design" }, text: { lv: "Druka pa visu virsmu. Krāsa kļūst par auduma daļu — nejūtama uz tausti.", en: "Full-surface printing. Colour becomes part of the fabric — imperceptible to touch." } },
      { icon: <Thermometer className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Īpašības", en: "Properties" }, text: { lv: "Audums saglabā elpojamību. Ideāli aktīvam sportam.", en: "Fabric retains full breathability. Ideal for active sports." } },
      { icon: <Tag className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Cena", en: "Pricing" }, text: { lv: "Nav atkarīga no krāsu skaita dizainā.", en: "Independent of the number of colours in the design." } },
    ],
  },
];

const techBadges: Record<string, { lv: string; en: string }[]> = {
  screen: [
    { lv: "Maks. krāsas: 12", en: "Max colours: 12" },
    { lv: "Industriāla skala", en: "Industrial Scale" },
    { lv: "Pantone® precizitāte", en: "Pantone® Precision" },
  ],
  dtf: [
    { lv: "No 1 gab.", en: "From 1 pc" },
    { lv: "CMYK+W", en: "CMYK+W" },
    { lv: "OEKO-TEX® saderīgs", en: "OEKO-TEX® Compatible" },
  ],
  embroidery: [
    { lv: "3D efekts", en: "3D Effect" },
    { lv: "Madeira / Isacord", en: "Madeira / Isacord" },
    { lv: "Premium izskats", en: "Premium Look" },
  ],
  sublimation: [
    { lv: "Pilna virsma", en: "Full Surface" },
    { lv: "Eko krāsas", en: "Eco-Friendly Inks" },
    { lv: "Foto kvalitāte", en: "Photo Quality" },
  ],
};

const ServiceSectionCard = ({ section, index }: { section: ServiceSection; index: number }) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border border-border bg-card p-8 md:p-10"
    >
      <div className="flex items-center gap-4">
        <span className="text-accent">{section.icon}</span>
        <div>
          <h2 className="font-heading text-lg font-bold uppercase text-card-foreground md:text-xl">
            {section.title[lang]}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{section.subtitle[lang]}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {section.features.map((feat, i) => (
          <div key={i} className="flex gap-4">
            <span className="mt-0.5 text-accent shrink-0">{feat.icon}</span>
            <div>
              <h3 className="font-heading text-xs font-bold uppercase text-card-foreground">
                {feat.label[lang]}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {feat.text[lang]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech badges */}
      {techBadges[section.id] && (
        <div className="mt-6 flex flex-wrap gap-2">
          {techBadges[section.id].map((badge, i) => (
            <span key={i} className="inline-flex items-center border border-accent/20 bg-accent/5 px-3 py-1 font-heading text-[10px] font-bold uppercase text-accent">
              {badge[lang]}
            </span>
          ))}
        </div>
      )}

      {/* Image carousel */}
      {serviceImages[section.id]?.length > 0 && (
        <ServiceImageCarousel
          images={serviceImages[section.id]}
          alt={section.title.en}
        />
      )}
    </motion.div>
  );
};

const ServicesPage = () => {
  const { lang, t } = useLanguage();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-bold uppercase md:text-5xl">{t("services.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-primary-foreground/60">{t("services.subtitle")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      {/* Service Sections */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-10">
          {serviceSections.map((section, i) => (
            <ServiceSectionCard key={section.id} section={section} index={i} />
          ))}
        </div>
      </section>

      {/* Global CTA */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle className="mx-auto mb-4 h-10 w-10 text-accent" strokeWidth={SW} />
            <h2 className="font-heading text-2xl font-bold uppercase md:text-4xl">
              {lang === "lv"
                ? "Bezmaksas tehnoloģiju konsultācija"
                : "Free Technology Consultation"}
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-primary-foreground/50">
              {lang === "lv"
                ? "Mūsu speciālisti palīdzēs izvēlēties labāko apdrukas tehnoloģiju tieši jūsu projektam."
                : "Our specialists will help you choose the optimal printing technology for your specific project."}
            </p>
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase" asChild>
              <Link to="/contact">
                {lang === "lv" ? "Sazināties ar mums" : "Contact Us"} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
