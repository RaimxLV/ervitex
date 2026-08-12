import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Layers, Palette, Droplets, Gauge, Printer, Grid3X3, PenLine, Wind, Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

import dtf from "@/assets/services/dtf-2.jpg";
import screenPrint from "@/assets/services/screen-printing-2.jpg";
import embroidery from "@/assets/services/embroidery-3.jpg";
import sublimation from "@/assets/services/sublimation-2.jpg";
import vinylFlock from "@/assets/services/vinyl-flock-1.jpg";

type L = { lv: string; en: string };

interface Tech {
  id: string;
  tab: L;
  icon: React.ReactNode;
  badge: L;
  title: L;
  desc: L;
  specs: { icon: React.ReactNode; label: L; value: L }[];
  image: string;
  ctaHref: string;
}

const SW = 1.4;

const TECHS: Tech[] = [
  {
    id: "dtf",
    tab: { lv: "DTF Apdruka", en: "DTF Printing" },
    icon: <Printer className="h-4 w-4" strokeWidth={SW} />,
    badge: { lv: "Maza apjoma līderis", en: "Small-run leader" },
    title: { lv: "DTF digitālā apdruka", en: "DTF Digital Printing" },
    desc: {
      lv: "Pilnkrāsu druka ar fotogrāfisku detalizāciju uz gandrīz jebkura auduma — bez sietu sagatavošanas izmaksām. Ideāla izvēle personalizētiem vārdiem, numuriem un mazām tirāžām no viena gabala.",
      en: "Full-colour, photo-detailed prints on almost any fabric — with no screen setup costs. The ideal choice for personalised names, numbers and small runs from a single piece.",
    },
    specs: [
      { icon: <Gauge className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Ieteicamā tirāža", en: "Recommended run" }, value: { lv: "1–250 gab.", en: "1–250 pcs" } },
      { icon: <Layers className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Auduma savietojamība", en: "Fabric compatibility" }, value: { lv: "Kokvilna, poliesters, neilons, somas, cepures", en: "Cotton, polyester, nylon, bags, caps" } },
      { icon: <Droplets className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Mazgāšanas izturība", en: "Wash resistance" }, value: { lv: "līdz 40 °C", en: "up to 40 °C" } },
      { icon: <Palette className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Krāsu precizitāte", en: "Colour accuracy" }, value: { lv: "CMYK+W pilnkrāsu", en: "CMYK+W full colour" } },
    ],
    image: dtf,
    ctaHref: "/catalog?category=t-shirts",
  },
  {
    id: "screen",
    tab: { lv: "Sietspiede", en: "Screen Printing" },
    icon: <Grid3X3 className="h-4 w-4" strokeWidth={SW} />,
    badge: { lv: "Vispopulārākā izvēle", en: "Most popular choice" },
    title: { lv: "Industriālā sietspiede", en: "Industrial Screen Printing" },
    desc: {
      lv: "M&R industriālā automatizācija nodrošina nepārspējamu krāsu intensitāti un stabilu kvalitāti lielās tirāžās. Ekonomiski izdevīgākā tehnoloģija apjomiem virs 50 vienībām.",
      en: "M&R industrial automation delivers unmatched colour intensity and consistent quality at scale. The most cost-effective technology for runs above 50 pieces.",
    },
    specs: [
      { icon: <Gauge className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Ieteicamā tirāža", en: "Recommended run" }, value: { lv: "50–10 000 gab.", en: "50–10,000 pcs" } },
      { icon: <Layers className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Auduma savietojamība", en: "Fabric compatibility" }, value: { lv: "Kokvilna, kokvilnas maisījumi, auduma maisiņi", en: "Cotton, cotton blends, tote bags" } },
      { icon: <Droplets className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Mazgāšanas izturība", en: "Wash resistance" }, value: { lv: "līdz 60 °C", en: "up to 60 °C" } },
      { icon: <Palette className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Krāsu precizitāte", en: "Colour accuracy" }, value: { lv: "Pantone® Solid Coated, līdz 12 krāsām", en: "Pantone® Solid Coated, up to 12 colours" } },
    ],
    image: screenPrint,
    ctaHref: "/catalog?category=t-shirts",
  },
  {
    id: "embroidery",
    tab: { lv: "Izšūšana", en: "Embroidery" },
    icon: <PenLine className="h-4 w-4" strokeWidth={SW} />,
    badge: { lv: "Premium segments", en: "Premium segment" },
    title: { lv: "Izšūšana", en: "Embroidery" },
    desc: {
      lv: "Taustāma 3D tekstūra un praktiski neierobežots kalpošanas laiks — augstākā pievienotā vērtība reprezentācijas apģērbam. Piemērota polo krekliem, flīsam, cepurēm un darba apģērbam.",
      en: "Tangible 3D texture and a practically unlimited lifespan — the highest perceived value for corporate apparel. Suited to polos, fleece, caps and workwear.",
    },
    specs: [
      { icon: <Gauge className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Ieteicamā tirāža", en: "Recommended run" }, value: { lv: "10–5 000 gab.", en: "10–5,000 pcs" } },
      { icon: <Layers className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Auduma savietojamība", en: "Fabric compatibility" }, value: { lv: "Polo, flīss, jakas, cepures, frotē", en: "Polos, fleece, jackets, caps, terry" } },
      { icon: <Droplets className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Mazgāšanas izturība", en: "Wash resistance" }, value: { lv: "līdz 90 °C", en: "up to 90 °C" } },
      { icon: <Palette className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Krāsu precizitāte", en: "Colour accuracy" }, value: { lv: "Madeira / Isacord palete + metāliskie", en: "Madeira / Isacord palette + metallics" } },
    ],
    image: embroidery,
    ctaHref: "/catalog?category=polo",
  },
  {
    id: "sublimation",
    tab: { lv: "Sublimācija", en: "Sublimation" },
    icon: <Wind className="h-4 w-4" strokeWidth={SW} />,
    badge: { lv: "Sportam un reklāmai", en: "Sport & promo" },
    title: { lv: "Sublimācija", en: "Sublimation" },
    desc: {
      lv: "Krāsa kļūst par auduma daļu — druka pa visu virsmu bez taustāmas kārtas un bez elpojamības zaudēšanas. Cena nav atkarīga no krāsu skaita dizainā.",
      en: "The ink becomes part of the fabric — full-surface printing with no hand feel and no loss of breathability. Pricing is independent of the number of colours.",
    },
    specs: [
      { icon: <Gauge className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Ieteicamā tirāža", en: "Recommended run" }, value: { lv: "10–2 000 gab.", en: "10–2,000 pcs" } },
      { icon: <Layers className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Auduma savietojamība", en: "Fabric compatibility" }, value: { lv: "Tikai poliesters — sporta formas, karogi", en: "Polyester only — sportswear, flags" } },
      { icon: <Droplets className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Mazgāšanas izturība", en: "Wash resistance" }, value: { lv: "līdz 60 °C, nenolobās", en: "up to 60 °C, will not peel" } },
      { icon: <Palette className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Krāsu precizitāte", en: "Colour accuracy" }, value: { lv: "Foto kvalitāte, neierobežotas krāsas", en: "Photo quality, unlimited colours" } },
    ],
    image: sublimation,
    ctaHref: "/catalog?category=sportswear",
  },
  {
    id: "vinyl",
    tab: { lv: "Līmplēve & Floks", en: "Vinyl & Flock" },
    icon: <Scissors className="h-4 w-4" strokeWidth={SW} />,
    badge: { lv: "Komandām un numuriem", en: "Teams & numbers" },
    title: { lv: "Līmplēve un floks", en: "Vinyl & Flock" },
    desc: {
      lv: "Griezta termoplēve ar perfekti asām kontūrām — spilgti, atstarojoši vai samtaini floka burti un numuri. Ātrs risinājums sporta komandām, vārda uzrakstiem un darba apģērba marķēšanai.",
      en: "Cut heat-transfer film with razor-sharp contours — vivid, reflective or velvety flock letters and numbers. A fast solution for sports teams, name prints and workwear marking.",
    },
    specs: [
      { icon: <Gauge className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Ieteicamā tirāža", en: "Recommended run" }, value: { lv: "1–300 gab.", en: "1–300 pcs" } },
      { icon: <Layers className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Auduma savietojamība", en: "Fabric compatibility" }, value: { lv: "Kokvilna, poliesters, elastīgi sporta audumi", en: "Cotton, polyester, stretch sportswear" } },
      { icon: <Droplets className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Mazgāšanas izturība", en: "Wash resistance" }, value: { lv: "līdz 40 °C, no kreisās puses", en: "up to 40 °C, inside out" } },
      { icon: <Palette className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Krāsu precizitāte", en: "Colour accuracy" }, value: { lv: "Vienlaidu toņi, Pantone® tuvinājums", en: "Solid tones, Pantone® match" } },
    ],
    image: vinylFlock,
    ctaHref: "/catalog?category=sportswear",
  },
];

const TechShowcase = () => {
  const { lang } = useLanguage();
  const [active, setActive] = useState(TECHS[0].id);
  const tech = TECHS.find((t) => t.id === active) || TECHS[0];

  return (
    <section className="bg-primary py-16 text-primary-foreground md:py-24">
      <div className="container">
        <div className="mb-3 flex items-center gap-3">
          <span className="block h-px w-8 bg-accent" />
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
            {lang === "lv" ? "Tehnoloģijas un procesi" : "Technologies & Processes"}
          </span>
        </div>
        <h2 className="max-w-2xl font-heading text-2xl font-bold uppercase md:text-4xl">
          {lang === "lv" ? "Apdrukas tehnoloģijas" : "Decoration technologies"}
        </h2>

        {/* Tabs */}
        <div className="-mx-4 mt-8 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 md:w-full md:flex-wrap">
            {TECHS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  aria-pressed={isActive}
                  className={`relative flex shrink-0 items-center gap-2 border px-4 py-2.5 font-heading text-[11px] font-bold uppercase tracking-wide transition-colors ${
                    isActive
                      ? "border-accent text-accent-foreground"
                      : "border-primary-foreground/15 text-primary-foreground/60 hover:border-primary-foreground/40 hover:text-primary-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tech-tab-bg"
                      className="absolute inset-0 -z-0 bg-gradient-to-r from-accent to-accent/70"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {t.icon}
                    {t.tab[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12"
          >
            {/* Left */}
            <div>
              <span className="inline-flex items-center border border-accent/40 bg-accent/10 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wide text-accent">
                {tech.badge[lang]}
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold uppercase md:text-3xl">
                {tech.title[lang]}
              </h3>
              <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-primary-foreground/60">
                {tech.desc[lang]}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {tech.specs.map((s, i) => (
                  <div
                    key={i}
                    className="border border-primary-foreground/10 bg-primary-foreground/[0.03] p-4"
                  >
                    <div className="flex items-center gap-2 text-accent">
                      {s.icon}
                      <span className="font-heading text-[10px] font-bold uppercase tracking-wide">
                        {s.label[lang]}
                      </span>
                    </div>
                    <p className="mt-2 font-body text-sm leading-snug text-primary-foreground">
                      {s.value[lang]}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="mt-8 bg-accent font-heading text-xs uppercase text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link to={tech.ctaHref}>
                  {lang === "lv" ? "Apskatīt piemērus katalogā" : "See examples in catalog"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Right */}
            <div className="group relative overflow-hidden rounded-2xl border border-primary-foreground/10">
              <img
                src={tech.image}
                alt={tech.title[lang]}
                width={1280}
                height={960}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="pointer-events-none absolute bottom-4 left-5 font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">
                {tech.tab[lang]}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TechShowcase;
