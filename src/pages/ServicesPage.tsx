import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Layers, Grid3x3, Scissors, Palette, ArrowRight,
  Shirt, UserPlus, Wind, Box, BookOpen, TrendingUp,
  ShieldCheck, Briefcase, Zap, Droplet, Infinity,
  Activity, Maximize, Thermometer, Tag, MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

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
    icon: <Layers className="h-8 w-8" />,
    title: {
      lv: "DTF un Termodruka – No viena eksemplāra līdz personalizētai tirāžai",
      en: "DTF & Heat Transfer – From One Piece to Personalized Runs",
    },
    subtitle: {
      lv: "Modernākā digitālā tehnoloģija ar neierobežotām personalizācijas iespējām.",
      en: "The most advanced digital technology with unlimited personalization options.",
    },
    features: [
      {
        icon: <Shirt className="h-6 w-6" />,
        label: { lv: "MATERIĀLI", en: "MATERIALS" },
        text: {
          lv: "Kokvilna, poliesters, neilons, darba apģērbs, somas, cepures.",
          en: "Cotton, polyester, nylon, workwear, bags, caps.",
        },
      },
      {
        icon: <Palette className="h-6 w-6" />,
        label: { lv: "KRĀSAS", en: "COLORS" },
        text: {
          lv: "Pilnkrāsu CMYK+W druka un speciālās plēves (zelta, sudraba, atstarojošas). Pantone matching available.",
          en: "Full-color CMYK+W printing and specialty films (gold, silver, reflective). Pantone matching available.",
        },
      },
      {
        icon: <UserPlus className="h-6 w-6" />,
        label: { lv: "PASŪTĪJUMS", en: "ORDERING" },
        text: {
          lv: "Ideāli piemērots individuāliem vārdiem, numuriem un mazām tirāžām (no 1 gab.).",
          en: "Perfect for individual names, numbers, and small runs (from 1 pc).",
        },
      },
      {
        icon: <Wind className="h-6 w-6" />,
        label: { lv: "KOPŠANA", en: "CARE" },
        text: {
          lv: "Mazgāt līdz 40°C, gludināt no kreisās puses.",
          en: "Wash up to 40°C, iron inside out.",
        },
      },
    ],
  },
  {
    id: "screen",
    icon: <Grid3x3 className="h-8 w-8" />,
    title: {
      lv: "Sietspiede – Industriāla kvalitāte lieliem apjomiem",
      en: "Screen Printing – Industrial Quality for Large Volumes",
    },
    subtitle: {
      lv: "Klasiski pārbaudīta metode ar nepārspējamu krāsu intensitāti.",
      en: "A time-tested method with unmatched color intensity.",
    },
    features: [
      {
        icon: <Box className="h-6 w-6" />,
        label: { lv: "MATERIĀLI", en: "MATERIALS" },
        text: {
          lv: "Labākā izvēle T-krekliem, polo un auduma maisiņiem lielos daudzumos.",
          en: "Best choice for T-shirts, polos, and tote bags in large quantities.",
        },
      },
      {
        icon: <BookOpen className="h-6 w-6" />,
        label: { lv: "KRĀSAS", en: "COLORS" },
        text: {
          lv: "Pantone® solid Coated precizitāte. Īpaši koši un sedzoši toņi.",
          en: "Pantone® solid Coated precision. Exceptionally vibrant and opaque tones.",
        },
      },
      {
        icon: <TrendingUp className="h-6 w-6" />,
        label: { lv: "PASŪTĪJUMS", en: "ORDERING" },
        text: {
          lv: "Ekonomiski izdevīgākais veids tirāžām virs 50 gabaliem.",
          en: "The most cost-effective method for runs over 50 pieces.",
        },
      },
      {
        icon: <ShieldCheck className="h-6 w-6" />,
        label: { lv: "NOTURĪBA", en: "DURABILITY" },
        text: {
          lv: "Augstākā mehāniskā izturība. Krāsa burtiski iesūcas audumā.",
          en: "Highest mechanical durability. Ink literally absorbs into the fabric.",
        },
      },
    ],
  },
  {
    id: "embroidery",
    icon: <Scissors className="h-8 w-8" />,
    title: {
      lv: "Izšūšana – Ekskluzīvs un ilgmūžīgs risinājums",
      en: "Embroidery – Exclusive and Long-Lasting Solution",
    },
    subtitle: {
      lv: "Premium izskats un neierobežota ilgmūžība jūsu zīmolam.",
      en: "Premium look and unlimited lifespan for your brand.",
    },
    features: [
      {
        icon: <Briefcase className="h-6 w-6" />,
        label: { lv: "PIELIETOJUMS", en: "APPLICATIONS" },
        text: {
          lv: "Polo krekli, flīsa jakas, cepures, frotē dvieļi, reprezentācijas apģērbs.",
          en: "Polo shirts, fleece jackets, caps, terry towels, corporate apparel.",
        },
      },
      {
        icon: <Zap className="h-6 w-6" />,
        label: { lv: "KVALITĀTE", en: "QUALITY" },
        text: {
          lv: "3D efekts un tekstūra. Piešķir apģērbam augstu pievienoto vērtību.",
          en: "3D effect and texture. Adds premium perceived value to garments.",
        },
      },
      {
        icon: <Droplet className="h-6 w-6" />,
        label: { lv: "DIEGI", en: "THREADS" },
        text: {
          lv: "Plaša krāsu izvēle (Madeira/Isacord), ieskaitot metāliskos diegus.",
          en: "Wide color selection (Madeira/Isacord), including metallic threads.",
        },
      },
      {
        icon: <Infinity className="h-6 w-6" />,
        label: { lv: "NOTURĪBA", en: "DURABILITY" },
        text: {
          lv: "Neierobežots kalpošanas laiks. Drīkst mazgāt augstās temperatūrās.",
          en: "Unlimited lifespan. Safe to wash at high temperatures.",
        },
      },
    ],
  },
  {
    id: "sublimation",
    icon: <Palette className="h-8 w-8" />,
    title: {
      lv: "Sublimācija – Neierobežots dizains sportam un reklāmai",
      en: "Sublimation – Unlimited Designs for Sport & Promotion",
    },
    subtitle: {
      lv: "Krāsa kļūst par auduma daļu — fotogrāfiska kvalitāte bez robežām.",
      en: "Color becomes part of the fabric — photographic quality without limits.",
    },
    features: [
      {
        icon: <Activity className="h-6 w-6" />,
        label: { lv: "MATERIĀLI", en: "MATERIALS" },
        text: {
          lv: "Tikai sintētiski (poliestera) audumi — sporta formas, karogi, speciālie suvenīri.",
          en: "Synthetic (polyester) fabrics only — sports uniforms, flags, specialty souvenirs.",
        },
      },
      {
        icon: <Maximize className="h-6 w-6" />,
        label: { lv: "DIZAINS", en: "DESIGN" },
        text: {
          lv: "Druka pa visu izstrādājuma laukumu. Krāsa kļūst par auduma sastāvdaļu (nejūtama uz tausti).",
          en: "Full-surface printing. Color becomes part of the fabric (imperceptible to touch).",
        },
      },
      {
        icon: <Thermometer className="h-6 w-6" />,
        label: { lv: "ĪPAŠĪBAS", en: "PROPERTIES" },
        text: {
          lv: "Audums saglabā elpošanas funkcijas. Ideāls aktīvam sportam.",
          en: "Fabric retains breathability. Ideal for active sports.",
        },
      },
      {
        icon: <Tag className="h-6 w-6" />,
        label: { lv: "CENA", en: "PRICE" },
        text: {
          lv: "Nav atkarīga no krāsu skaita dizainā.",
          en: "Not dependent on the number of colors in the design.",
        },
      },
    ],
  },
];

const ServiceSectionCard = ({ section, index }: { section: ServiceSection; index: number }) => {
  const { lang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="rounded-sm border border-border bg-card p-8 md:p-10"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-accent/10 text-accent">
          {section.icon}
        </div>
        <div>
          <h2 className="font-heading text-lg font-black uppercase tracking-wide text-card-foreground md:text-xl">
            {section.title[lang]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{section.subtitle[lang]}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {section.features.map((feat, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent/10 text-accent">
              {feat.icon}
            </div>
            <div>
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-card-foreground">
                {feat.label[lang]}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feat.text[lang]}
              </p>
            </div>
          </div>
        ))}
      </div>
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
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide md:text-5xl">{t("services.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/60">{t("services.subtitle")}</p>
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
          <motion.div {...fadeUp}>
            <MessageCircle className="mx-auto mb-4 h-10 w-10 text-accent" />
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide md:text-4xl">
              {lang === "lv"
                ? "Saņemt bezmaksas konsultāciju par tehnoloģijām"
                : "Get a Free Technology Consultation"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/50">
              {lang === "lv"
                ? "Mūsu speciālisti palīdzēs izvēlēties labāko apdrukāšanas tehnoloģiju jūsu projektam."
                : "Our specialists will help you choose the best printing technology for your project."}
            </p>
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
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
