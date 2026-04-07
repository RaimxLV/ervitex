import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Printer, Grid3X3, PenLine, Wind, ArrowRight,
  Layers, Palette, ShieldCheck, ShoppingBag, Tag,
  Paintbrush, MessageCircle, CircleCheck, Cylinder, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ModernGallery, { type GallerySlide } from "@/components/ModernGallery";
import { useLanguage } from "@/i18n/LanguageContext";

import screenPrint1 from "@/assets/services/screen-printing-1.jpg";
import screenPrint2 from "@/assets/services/screen-printing-2.jpg";
import screenPrint3 from "@/assets/services/screen-printing-3.jpg";
import screenPrint4 from "@/assets/services/screen-printing-4.jpg";
import dtf1 from "@/assets/services/dtf-1.jpg";
import dtf2 from "@/assets/services/dtf-2.jpg";
import dtf3 from "@/assets/services/dtf-3.jpg";
import dtf4 from "@/assets/services/dtf-4.jpg";
import dtf5 from "@/assets/services/dtf-5.jpg";
import emb1 from "@/assets/services/embroidery-1.jpg";
import emb2 from "@/assets/services/embroidery-2.jpg";
import emb3 from "@/assets/services/embroidery-3.jpg";
import emb4 from "@/assets/services/embroidery-4.jpg";
import emb5 from "@/assets/services/embroidery-5.jpg";
import emb6 from "@/assets/services/embroidery-6.jpg";
import emb7 from "@/assets/services/embroidery-7.jpg";
import sub1 from "@/assets/services/sublimation-1.jpg";
import sub2 from "@/assets/services/sublimation-2.jpg";
import sub3 from "@/assets/services/sublimation-3.jpg";
import sub4 from "@/assets/services/sublimation-4.jpg";

const serviceImages: Record<string, string[]> = {
  screen: [screenPrint1, screenPrint2, screenPrint3, screenPrint4],
  dtf: [dtf1, dtf2, dtf3, dtf4, dtf5],
  embroidery: [emb1, emb2, emb3, emb4, emb5, emb6, emb7],
  sublimation: [sub1, sub2, sub3, sub4],
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
      { icon: <Layers className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Kokvilna, poliesters, neilons, darba apģērbs, somas, cepures.", en: "Cotton, polyester, nylon, workwear, bags, caps." } },
      { icon: <Palette className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Krāsas", en: "Colors" }, text: { lv: "Pilnkrāsu CMYK+W druka, speciālās plēves (zelta, sudraba, atstarojošas). Pantone® atbilstība pieejama.", en: "Full-color CMYK+W printing, specialty films (gold, silver, reflective). Pantone® matching available." } },
      { icon: <ShoppingBag className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Pasūtījums", en: "Ordering" }, text: { lv: "Ideāli individuāliem vārdiem, numuriem un mazām tirāžām — no 1 gabala.", en: "Ideal for individual names, numbers, and small runs — starting from 1 piece." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Kopšana", en: "Care" }, text: { lv: "Mazgāt līdz 40 °C, gludināt no kreisās puses.", en: "Wash up to 40 °C, iron inside out." } },
    ],
  },
  {
    id: "screen",
    icon: <Grid3X3 className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Sietspiede", en: "Screen Printing" },
    subtitle: {
      lv: "Industriāla kvalitāte lieliem apjomiem — klasika ar nepārspējamu krāsu intensitāti. Powered by M&R industrial automation — 100% Pantone® precizitāte un stabila kvalitāte liela apjoma tirāžās.",
      en: "Industrial quality for large volumes — a time-tested method with unmatched colour intensity. Powered by M&R industrial automation for 100% Pantone® accuracy and high-volume consistency.",
    },
    features: [
      { icon: <Layers className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Labākā izvēle t-krekliem, polo un auduma maisiņiem lielos daudzumos.", en: "The go-to method for t-shirts, polos, and tote bags in large quantities." } },
      { icon: <Palette className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Krāsas", en: "Colors" }, text: { lv: "Pantone® Solid Coated precizitāte. Īpaši koši un sedzoši toņi.", en: "Pantone® Solid Coated precision. Exceptionally vibrant and opaque tones." } },
      { icon: <ShoppingBag className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Pasūtījums", en: "Ordering" }, text: { lv: "Ekonomiski izdevīgākais veids tirāžām virs 50 vienībām.", en: "The most cost-effective method for runs exceeding 50 pieces." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Noturība", en: "Durability" }, text: { lv: "Augstākā mehāniskā izturība — krāsa iesūcas tieši audumā.", en: "Superior mechanical resistance — ink bonds directly with the fabric." } },
    ],
  },
  {
    id: "embroidery",
    icon: <PenLine className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Izšūšana", en: "Embroidery" },
    subtitle: {
      lv: "Ekskluzīvs un ilgmūžīgs risinājums — premium izskats jūsu zīmolam.",
      en: "An exclusive, long-lasting solution — premium aesthetics for your brand.",
    },
    features: [
      { icon: <CircleCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Paredzēts", en: "Intended For" }, text: { lv: "Polo krekli, flīsa jakas, cepures, frotē dvieļi, reprezentācijas apģērbs.", en: "Polo shirts, fleece jackets, caps, terry towels, corporate apparel." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Kvalitāte", en: "Quality" }, text: { lv: "3D efekts un taustāma tekstūra. Piešķir apģērbam augstu pievienoto vērtību.", en: "3D effect and tangible texture. Adds measurable perceived value to garments." } },
      { icon: <Cylinder className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Diegi", en: "Threads" }, text: { lv: "Plaša krāsu palete (Madeira / Isacord), ieskaitot metāliskos diegus.", en: "Wide colour palette (Madeira / Isacord), including metallic threads." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Noturība", en: "Durability" }, text: { lv: "Neierobežots kalpošanas laiks. Droši mazgāt augstās temperatūrās.", en: "Unlimited lifespan. Safe to wash at high temperatures." } },
    ],
  },
  {
    id: "sublimation",
    icon: <Wind className="h-7 w-7" strokeWidth={SW} />,
    title: { lv: "Sublimācija", en: "Sublimation" },
    subtitle: {
      lv: "Neierobežots dizains sportam un reklāmai — fotogrāfiska kvalitāte bez robežām.",
      en: "Unlimited design for sport & promotion — photographic quality without boundaries.",
    },
    features: [
      { icon: <Layers className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Materiāli", en: "Materials" }, text: { lv: "Tikai sintētiski (poliestera) audumi — sporta formas, karogi, suvenīri.", en: "Polyester fabrics only — sports uniforms, flags, specialty souvenirs." } },
      { icon: <Paintbrush className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Dizains", en: "Design" }, text: { lv: "Druka pa visu virsmu. Krāsa kļūst par auduma daļu — nejūtama uz tausti.", en: "Full-surface printing. Colour becomes part of the fabric — imperceptible to touch." } },
      { icon: <ShieldCheck className="h-5 w-5" strokeWidth={SW} />, label: { lv: "Īpašības", en: "Properties" }, text: { lv: "Audums saglabā elpojamību. Ideāli aktīvam sportam.", en: "Fabric retains full breathability. Ideal for active sports." } },
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
        <ModernGallery
          slides={serviceImages[section.id].map((src) => ({ src }))}
          aspectRatio="16/9"
          className="mt-6"
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

      {/* Technical Requirements */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Tehniskās prasības" : "Technical Requirements"}
              </span>
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase text-foreground md:text-3xl">
              {lang === "lv" ? "Failu sagatavošana" : "File Preparation"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">
              {lang === "lv"
                ? "Lai nodrošinātu augstāko drukas kvalitāti, lūdzu ievērojiet šīs vadlīnijas:"
                : "To ensure the highest print quality, please follow these guidelines:"}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: { lv: "Vektora faili", en: "Vector Files" },
                  desc: { lv: "AI, PDF vai EPS formātā. Rastra attēli — min. 300 DPI.", en: "AI, PDF, or EPS format. Raster images — min. 300 DPI." },
                },
                {
                  title: { lv: "Krāsu telpa", en: "Colour Space" },
                  desc: { lv: "CMYK vai Pantone® Solid Coated. Neizmantojiet RGB.", en: "CMYK or Pantone® Solid Coated. Do not use RGB." },
                },
                {
                  title: { lv: "Fonti", en: "Fonts" },
                  desc: { lv: "Visi fonti jāpārveido līknēs (outlines/curves).", en: "All fonts must be converted to outlines/curves." },
                },
                {
                  title: { lv: "Izmērs", en: "Size" },
                  desc: { lv: "Dizains reālajā izmērā (1:1). Norādiet novietojumu uz apģērba.", en: "Design at actual size (1:1). Specify placement on garment." },
                },
                {
                  title: { lv: "Izšūšana", en: "Embroidery" },
                  desc: { lv: "Vienkāršotas formas bez gradieniem. Maks. 12 krāsas.", en: "Simplified shapes without gradients. Max 12 colours." },
                },
                {
                  title: { lv: "Piegāde", en: "Delivery" },
                  desc: { lv: "Sūtiet uz birojs@ervitex.lv vai saskaņojiet ar projektu vadītāju.", en: "Send to birojs@ervitex.lv or coordinate with your project manager." },
                },
              ].map((item, i) => (
                <div key={i} className="border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
                    <div>
                      <h3 className="font-heading text-xs font-bold uppercase text-card-foreground">{item.title[lang]}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc[lang]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* OEKO-TEX Badge */}
      <section className="border-t border-border bg-card py-10">
        <div className="container flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-accent" strokeWidth={SW} />
            <span className="font-heading text-sm font-bold uppercase text-card-foreground tracking-wide">OEKO-TEX® Standard 100</span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            {lang === "lv"
              ? "Mūsu izmantotie materiāli un drukas tehnoloģijas atbilst OEKO-TEX® standartiem — droši cilvēkiem un videi."
              : "Our materials and printing technologies comply with OEKO-TEX® standards — safe for people and the environment."}
          </p>
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
