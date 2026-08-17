import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Printer, Grid3X3, PenLine, Wind, Users, Building2, ShoppingBag,
  Gift, CircleCheck, MessageCircle, ShieldCheck, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import TechShowcase from "@/components/services/TechShowcase";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/i18n/LanguageContext";

import heroImg from "@/assets/services/rt-hero.jpg";
import dtfImg from "@/assets/services/rt-dtf.jpg";
import screenImg from "@/assets/services/rt-screen.jpg";
import embroideryImg from "@/assets/services/rt-embroidery.jpg";
import sublimationImg from "@/assets/services/rt-sublimation.jpg";
import teamwearImg from "@/assets/services/rt-teamwear.jpg";
import promoImg from "@/assets/services/rt-promo.jpg";

type L = { lv: string; en: string };
const SW = 1.4;

interface TechBlock {
  id: string;
  icon: React.ReactNode;
  eyebrow: L;
  title: L;
  lead: L;
  body: L;
  bullets: L[];
  stats: { label: L; value: L }[];
  image: string;
  ctaLabel: L;
  ctaHref: string;
}

const TECH_BLOCKS: TechBlock[] = [
  {
    id: "dtf",
    icon: <Printer className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "No 1 gabala", en: "From 1 piece" },
    title: { lv: "DTF digitālā apdruka", en: "DTF digital printing" },
    lead: {
      lv: "Pilnkrāsu druka bez sietu sagatavošanas — vienlīdz izdevīga gan vienam kreklam, gan visai komandai.",
      en: "Full-colour printing with no screen setup — equally viable for one shirt or a whole team.",
    },
    body: {
      lv: "DTF ir mūsu elastīgākā tehnoloģija. Ar to apdrukājam gan individuālus pasūtījumus, gan vairumtirdzniecības tirāžas komandām un uzņēmumiem. Īpaši bieži to izmantojam sporta formām — spēlētāju vārdiem, numuriem, sponsoru logotipiem uz basketbola un futbola kreklu mugurām. Apģērbu ņemam no sava kataloga, taču strādājam arī ar klienta materiālu.",
      en: "DTF is our most flexible technology. We use it for one-off orders as well as wholesale runs for teams and companies. It is our default for sportswear — player names, numbers and sponsor logos on basketball and football jerseys. Garments come from our own catalogue, but we also print on customer-supplied stock.",
    },
    bullets: [
      { lv: "Vārdi, numuri un sponsori sporta formām", en: "Names, numbers and sponsors on sportswear" },
      { lv: "Individuāli pasūtījumi no 1 gab.", en: "Individual orders from 1 pc" },
      { lv: "Komandu un uzņēmumu vairumtirāžas", en: "Team and corporate wholesale runs" },
      { lv: "Kokvilna, poliesters, neilons, somas, cepures", en: "Cotton, polyester, nylon, bags, caps" },
    ],
    stats: [
      { label: { lv: "Tirāža", en: "Run size" }, value: { lv: "1–250 gab.", en: "1–250 pcs" } },
      { label: { lv: "Krāsas", en: "Colours" }, value: { lv: "CMYK+W", en: "CMYK+W" } },
      { label: { lv: "Mazgāšana", en: "Wash" }, value: { lv: "līdz 40 °C", en: "up to 40 °C" } },
    ],
    image: dtfImg,
    ctaHref: "/catalog?category=T-shirts",
    ctaLabel: { lv: "Izvēlēties apģērbu DTF drukai", en: "Pick garments for DTF" },
  },
  {
    id: "screen",
    icon: <Grid3X3 className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Lielām tirāžām", en: "For volume" },
    title: { lv: "Sietspiede", en: "Screen printing" },
    lead: {
      lv: "Industriāla M&R automatizācija — koša, sedzoša un noturīga druka par zemāko cenu vienā vienībā.",
      en: "Industrial M&R automation — vivid, opaque, durable prints at the lowest cost per piece.",
    },
    body: {
      lv: "Sietspiede ir izdevīgākais risinājums no aptuveni 50 vienībām: jo lielāka tirāža, jo zemāka cena par gabalu. Drukājam t-kreklus, polo, hūdijus un auduma maisiņus — gan no sava kataloga, gan uz klienta piegādātā apģērba. Katrai krāsai gatavojam atsevišķu sietu un saskaņojam toņus pēc Pantone® Solid Coated.",
      en: "Screen printing is the most economical route from roughly 50 pieces up: the larger the run, the lower the unit price. We print tees, polos, hoodies and tote bags — from our catalogue or on customer-supplied garments. Every colour gets its own screen, matched to Pantone® Solid Coated.",
    },
    bullets: [
      { lv: "T-krekli, polo, hūdiji, auduma maisiņi", en: "Tees, polos, hoodies, tote bags" },
      { lv: "Pantone® toņu saskaņošana", en: "Pantone® colour matching" },
      { lv: "Līdz 12 krāsām vienā dizainā", en: "Up to 12 colours per design" },
      { lv: "Zemākā cena par vienību lielās tirāžās", en: "Lowest unit price at scale" },
    ],
    stats: [
      { label: { lv: "Tirāža", en: "Run size" }, value: { lv: "50–10 000 gab.", en: "50–10,000 pcs" } },
      { label: { lv: "Krāsas", en: "Colours" }, value: { lv: "Pantone®", en: "Pantone®" } },
      { label: { lv: "Mazgāšana", en: "Wash" }, value: { lv: "līdz 60 °C", en: "up to 60 °C" } },
    ],
    image: screenImg,
    ctaHref: "/catalog?category=T-shirts",
    ctaLabel: { lv: "Izvēlēties apģērbu sietspiedei", en: "Pick garments for screen printing" },
  },
  {
    id: "embroidery",
    icon: <PenLine className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Premium segments", en: "Premium segment" },
    title: { lv: "Izšūšana", en: "Embroidery" },
    lead: {
      lv: "Taustāma tekstūra un praktiski neierobežots kalpošanas laiks — augstākā pievienotā vērtība zīmolam.",
      en: "Tangible texture and a practically unlimited lifespan — the highest perceived brand value.",
    },
    body: {
      lv: "Izšujam cepures, uzšuves (patch), polo un kreklus, flīsu, jakas un darba apģērbu. Logotipu digitalizējam izšuvuma programmā, saskaņojam paraugu un tikai tad laižam tirāžā. Uzšuves varam izgatavot atsevišķi un piestiprināt uz jebkura izstrādājuma — arī tur, kur tiešā izšūšana nav iespējama.",
      en: "We embroider caps, patches, polos and shirts, fleece, jackets and workwear. Your logo is digitised into a stitch file, approved as a sample, and only then run in production. Patches can be produced separately and applied to items where direct embroidery is not possible.",
    },
    bullets: [
      { lv: "Cepures un beanie", en: "Caps and beanies" },
      { lv: "Uzšuves (patch) ar apmali", en: "Patches with merrowed border" },
      { lv: "Polo, krekli, flīss, jakas", en: "Polos, shirts, fleece, jackets" },
      { lv: "Madeira / Isacord palete + metāliskie", en: "Madeira / Isacord palette + metallics" },
    ],
    stats: [
      { label: { lv: "Tirāža", en: "Run size" }, value: { lv: "10–5 000 gab.", en: "10–5,000 pcs" } },
      { label: { lv: "Digitalizācija", en: "Digitising" }, value: { lv: "Vienreizēja", en: "One-off" } },
      { label: { lv: "Mazgāšana", en: "Wash" }, value: { lv: "līdz 90 °C", en: "up to 90 °C" } },
    ],
    image: embroideryImg,
    ctaHref: "/catalog?category=Caps%20%26%20Hats,Caps,Headwear,Beanies",
    ctaLabel: { lv: "Izvēlēties cepures izšūšanai", en: "Pick headwear for embroidery" },
  },
  {
    id: "sublimation",
    icon: <Wind className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Šūts pēc mēra", en: "Cut & sewn" },
    title: { lv: "Sublimācija un šūšana", en: "Sublimation & sewing" },
    lead: {
      lv: "Vispirms apdrukājam audumu, tad pēc piegrieztnēm sašujam gatavu izstrādājumu — bez šuvju pārtraukumiem dizainā.",
      en: "We print the fabric first, then cut and sew the finished garment — with no breaks in the design at the seams.",
    },
    body: {
      lv: "Sublimācijā krāsa kļūst par auduma daļu: nav taustāmas kārtas, nezūd elpojamība un druka nenolobās. Šādi ražojam sporta formas, bufus, kaklautus, karogus un citus poliestera izstrādājumus. Dizains var klāt visu virsmu, un cena nav atkarīga no krāsu skaita.",
      en: "In sublimation the ink becomes part of the fabric: no hand feel, no loss of breathability, nothing to peel. This is how we make sports kits, buffs, neck gaiters, flags and other polyester products. The design can cover the full surface and pricing is independent of colour count.",
    },
    bullets: [
      { lv: "Sporta formas pēc individuāla dizaina", en: "Fully custom sports kits" },
      { lv: "Bufi, kaklauti, karogi", en: "Buffs, neck gaiters, flags" },
      { lv: "Druka pa visu virsmu, bez šuvju robiem", en: "Full-surface print, seamless across panels" },
      { lv: "Tikai poliesters un tā maisījumi", en: "Polyester and blends only" },
    ],
    stats: [
      { label: { lv: "Tirāža", en: "Run size" }, value: { lv: "10–2 000 gab.", en: "10–2,000 pcs" } },
      { label: { lv: "Krāsas", en: "Colours" }, value: { lv: "Neierobežotas", en: "Unlimited" } },
      { label: { lv: "Noturība", en: "Durability" }, value: { lv: "Nenolobās", en: "Will not peel" } },
    ],
    image: sublimationImg,
    ctaHref: "/catalog?category=Sportswear,Sports,Fitness%20%26%20Sport",
    ctaLabel: { lv: "Apskatīt sporta apģērbu", en: "Browse sportswear" },
  },
];

const USE_CASES: { icon: React.ReactNode; title: L; text: L; image?: string; href: string }[] = [
  {
    icon: <Users className="h-5 w-5" strokeWidth={SW} />,
    title: { lv: "Komandu formas", en: "Team kits" },
    text: {
      lv: "Basketbola un futbola formas ar vārdiem, numuriem un sponsoriem. DTF uz gataviem krekliem vai pilnībā sublimēts komplekts.",
      en: "Basketball and football kits with names, numbers and sponsors. DTF on stock garments or a fully sublimated set.",
    },
    image: teamwearImg,
    href: "/catalog?category=Sportswear,Sports,Fitness%20%26%20Sport",
  },
  {
    icon: <Building2 className="h-5 w-5" strokeWidth={SW} />,
    title: { lv: "Uzņēmumu apģērbs", en: "Corporate apparel" },
    text: {
      lv: "Polo, krekli, jakas un darba apģērbs ar izšūtu logotipu — vienots izskats visai komandai un atkārtojami pasūtījumi.",
      en: "Polos, shirts, jackets and workwear with an embroidered logo — one consistent look and repeatable reorders.",
    },
    href: "/catalog?category=Polos,Workwear",
  },
  {
    icon: <ShoppingBag className="h-5 w-5" strokeWidth={SW} />,
    title: { lv: "Somas un lietussargi", en: "Bags & umbrellas" },
    text: {
      lv: "Auduma maisiņi, mugursomas un lietussargi ar sietspiedes vai DTF apdruku — pasākumiem, veikaliem un dāvanām.",
      en: "Tote bags, backpacks and umbrellas with screen or DTF printing — for events, retail and gifting.",
    },
    image: promoImg,
    href: "/catalog?category=Tote%20Bags,Shopping%20%26%20Tote%20Bags,Standard%20Umbrellas,Folding%20Umbrellas",
  },
  {
    icon: <Gift className="h-5 w-5" strokeWidth={SW} />,
    title: { lv: "Individuāli pasūtījumi", en: "One-off orders" },
    text: {
      lv: "Viens krekls dāvanai, personalizēts vārds vai neliela ģimenes tirāža — DTF ļauj to izdarīt bez sagatavošanas izmaksām.",
      en: "A single gift shirt, a personalised name or a small family run — DTF makes it possible with no setup cost.",
    },
    href: "/catalog",
  },
];

const PROCESS: { step: string; title: L; text: L }[] = [
  {
    step: "01",
    title: { lv: "Pieprasījums", en: "Request" },
    text: {
      lv: "Izvēlies preces katalogā un nosūti pieprasījumu vai uzraksti mums — pietiek ar aptuvenu apjomu un ideju.",
      en: "Pick items from the catalogue and send a request, or just write to us — a rough quantity and idea is enough.",
    },
  },
  {
    step: "02",
    title: { lv: "Tehnoloģijas izvēle", en: "Technology choice" },
    text: {
      lv: "Iesakām apdrukas veidu, kas atbilst apjomam, audumam un dizainam, un sagatavojam tāmi.",
      en: "We recommend the decoration method that fits your volume, fabric and artwork, and prepare a quote.",
    },
  },
  {
    step: "03",
    title: { lv: "Makets un saskaņošana", en: "Mockup & approval" },
    text: {
      lv: "Sagatavojam vizualizāciju ar precīzu novietojumu un izmēru. Ražošanu sākam tikai pēc tavas apstiprināšanas.",
      en: "We produce a visual with exact placement and size. Production starts only after your approval.",
    },
  },
  {
    step: "04",
    title: { lv: "Ražošana", en: "Production" },
    text: {
      lv: "Apdrukājam vai izšujam savā ražotnē Rīgā, veicot kvalitātes pārbaudi katrā partijā.",
      en: "We print or embroider in our own facility in Riga, with quality control on every batch.",
    },
  },
  {
    step: "05",
    title: { lv: "Piegāde", en: "Delivery" },
    text: {
      lv: "Salokām, iepakojam un piegādājam visā Latvijā un Baltijā vai sagatavojam saņemšanai uz vietas.",
      en: "Folded, packed and delivered across Latvia and the Baltics, or ready for pickup.",
    },
  },
];

const FILE_SPECS: { title: L; desc: L }[] = [
  { title: { lv: "Vektora faili", en: "Vector files" }, desc: { lv: "AI, PDF vai EPS. Rastra attēli — vismaz 300 DPI reālajā izmērā.", en: "AI, PDF or EPS. Raster images — at least 300 DPI at final size." } },
  { title: { lv: "Krāsu telpa", en: "Colour space" }, desc: { lv: "CMYK vai Pantone® Solid Coated. RGB toņi drukā mainās.", en: "CMYK or Pantone® Solid Coated. RGB tones shift in print." } },
  { title: { lv: "Fonti", en: "Fonts" }, desc: { lv: "Visi teksti pārveidoti līknēs (outlines/curves).", en: "All text converted to outlines/curves." } },
  { title: { lv: "Novietojums", en: "Placement" }, desc: { lv: "Norādi izmēru centimetros un vietu uz apģērba.", en: "Specify size in centimetres and position on the garment." } },
  { title: { lv: "Izšūšanai", en: "For embroidery" }, desc: { lv: "Vienkāršotas formas bez gradientiem, minimālais teksta augstums 5 mm.", en: "Simplified shapes without gradients, minimum text height 5 mm." } },
  { title: { lv: "Sublimācijai", en: "For sublimation" }, desc: { lv: "Dizains ar 2 cm izlaidumu ārpus piegriezuma kontūras.", en: "Artwork with a 2 cm bleed beyond the pattern outline." } },
];

const FAQ: { q: L; a: L }[] = [
  {
    q: { lv: "Kāds ir minimālais pasūtījuma apjoms?", en: "What is the minimum order quantity?" },
    a: {
      lv: "DTF apdrukai un izšūšanai minimuma faktiski nav — strādājam no viena gabala. Sietspiedei ieteicamais minimums ir 50 vienības, sublimācijai ar šūšanu — 10 komplekti.",
      en: "For DTF and embroidery there is effectively no minimum — we work from a single piece. For screen printing the recommended minimum is 50 units, and for cut-and-sew sublimation 10 sets.",
    },
  },
  {
    q: { lv: "Vai apģērbs jāpērk pie jums?", en: "Do garments have to be bought from you?" },
    a: {
      lv: "Ērtāk ir izvēlēties no mūsu kataloga — tur ir Stanley/Stella, Craft, Clique, ProJob, Cutter & Buck, Malfini, Russell, Beechfield un prezentmateriālu klāsts ar zināmiem izmēriem un krāsām. Taču apdrukājam arī klienta piegādātu apģērbu pēc iepriekšējas saskaņošanas.",
      en: "It is simpler to choose from our catalogue — Stanley/Stella, Craft, Clique, ProJob, Cutter & Buck, Malfini, Russell, Beechfield and promotional items with known sizes and colours. We also decorate customer-supplied garments after prior agreement.",
    },
  },
  {
    q: { lv: "Cik ilgs ir izpildes termiņš?", en: "What is the lead time?" },
    a: {
      lv: "Standarta termiņš ir 5–10 darba dienas pēc maketa apstiprināšanas un preces saņemšanas noliktavā. Steidzamiem pasūtījumiem meklējam ātrāku risinājumu individuāli.",
      en: "The standard lead time is 5–10 working days after mockup approval and stock arrival. For urgent orders we look for a faster solution case by case.",
    },
  },
  {
    q: { lv: "Kuru tehnoloģiju izvēlēties sporta formām?", en: "Which technology suits sports kits?" },
    a: {
      lv: "Ja forma tiek pirkta gatava un vajag vārdus ar numuriem — DTF. Ja vēlies unikālu dizainu pa visu virsmu, ražojam formu no nulles: apdrukājam audumu sublimācijā un sašujam pēc piegrieztnēm.",
      en: "If you buy ready-made kit and need names and numbers — DTF. If you want a unique full-surface design, we build the kit from scratch: sublimated fabric, cut and sewn to pattern.",
    },
  },
  {
    q: { lv: "Vai varat izgatavot uzšuves?", en: "Can you make patches?" },
    a: {
      lv: "Jā. Izšujam uzšuves ar apmali un piestiprinām tās uz cepurēm, jakām vai darba apģērba — arī uz izstrādājumiem, kur tiešā izšūšana nav iespējama.",
      en: "Yes. We embroider bordered patches and apply them to caps, jackets or workwear — including items where direct embroidery is not possible.",
    },
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

const ServicesPage = () => {
  const { lang } = useLanguage();
  const tx = (l: L) => (lang === "lv" ? l.lv : l.en);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <img
          src={heroImg}
          alt={lang === "lv" ? "Ervitex apdrukas ražotne" : "Ervitex decoration facility"}
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/30" />
        <div className="container relative py-20 md:py-32">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Pakalpojumi" : "Services"}
              </span>
            </div>
            <h1 className="mt-5 font-heading text-4xl font-bold uppercase leading-[0.95] md:text-6xl">
              {lang === "lv" ? "Apdruka, kas iztur" : "Decoration that lasts"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/70 md:text-lg">
              {lang === "lv"
                ? "Sietspiede, DTF, izšūšana un sublimācija zem viena jumta Rīgā. Vienam kreklam vai desmit tūkstošiem — apģērbs no mūsu kataloga, apdruka no mūsu ražotnes."
                : "Screen printing, DTF, embroidery and sublimation under one roof in Riga. From a single shirt to ten thousand — garments from our catalogue, decoration from our own facility."}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="bg-accent font-heading text-xs uppercase text-accent-foreground hover:bg-accent/90" asChild>
                <Link to="/request">
                  {lang === "lv" ? "Pieprasīt piedāvājumu" : "Request a quote"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent font-heading text-xs uppercase text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/catalog">{lang === "lv" ? "Apskatīt katalogu" : "Browse the catalogue"}</Link>
              </Button>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { lv: "No 1 gabala", en: "From 1 piece" },
                { lv: "Sava ražotne Rīgā", en: "Own facility in Riga" },
                { lv: "Makets pirms ražošanas", en: "Mockup before production" },
                { lv: "Piegāde visā Baltijā", en: "Delivery across the Baltics" },
              ].map((item) => (
                <li key={item.en} className="flex items-center gap-2 text-xs uppercase tracking-wide text-primary-foreground/70">
                  <CircleCheck className="h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
                  {tx(item)}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
        <div className="h-1 bg-accent" />
      </section>

      {/* Interactive technology showcase */}
      <TechShowcase />

      {/* Deep dive per technology */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Mūsu tehnoloģijas" : "Our technologies"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-foreground md:text-4xl">
              {lang === "lv" ? "Četras metodes. Viena kvalitātes latiņa." : "Four methods. One quality bar."}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {lang === "lv"
                ? "Katrai idejai ir sava pareizā tehnoloģija. Zemāk — kad kuru izvēlēties un ko ar to reāli apdrukājam."
                : "Every idea has a right technology. Below — when to choose which, and what we actually decorate with it."}
            </p>
          </motion.div>

          <div className="mt-14 space-y-16 md:space-y-24">
            {TECH_BLOCKS.map((block, i) => (
              <motion.article
                key={block.id}
                id={block.id}
                {...fadeUp}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <img
                    src={block.image}
                    alt={tx(block.title)}
                    loading="lazy"
                    width={1600}
                    height={1200}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
                      {block.icon}
                    </span>
                    <span className="font-body text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
                      {tx(block.eyebrow)}
                    </span>
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold uppercase text-foreground md:text-3xl">
                    {tx(block.title)}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-foreground/80 md:text-base">
                    {tx(block.lead)}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tx(block.body)}</p>

                  <ul className="mt-6 space-y-2">
                    {block.bullets.map((b) => (
                      <li key={b.en} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
                        {tx(b)}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-7 grid grid-cols-3 gap-px border border-border bg-border">
                    {block.stats.map((s) => (
                      <div key={s.label.en} className="bg-card p-4">
                        <dt className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {tx(s.label)}
                        </dt>
                        <dd className="mt-1.5 font-heading text-xs font-bold uppercase text-card-foreground">
                          {tx(s.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button className="bg-accent font-heading text-xs uppercase text-accent-foreground hover:bg-accent/90" asChild>
                      <Link to={block.ctaHref}>
                        {tx(block.ctaLabel)} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" className="font-heading text-xs uppercase" asChild>
                      <Link to="/request">{lang === "lv" ? "Pieprasīt cenu" : "Get a price"}</Link>
                    </Button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Ko mēs apdrukājam" : "What we decorate"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-foreground md:text-4xl">
              {lang === "lv" ? "No vienas dāvanas līdz visai līgai" : "From one gift to a whole league"}
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {USE_CASES.map((uc) => (
              <motion.div key={uc.title.en} {...fadeUp} className="flex h-full flex-col border border-border bg-card">
                {uc.image && (
                  <img
                    src={uc.image}
                    alt={tx(uc.title)}
                    loading="lazy"
                    width={1600}
                    height={1200}
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3 text-accent">
                    {uc.icon}
                    <h3 className="font-heading text-sm font-bold uppercase text-card-foreground">{tx(uc.title)}</h3>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{tx(uc.text)}</p>
                  <Link
                    to={uc.href}
                    className="mt-5 inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-wide text-accent hover:underline"
                  >
                    {lang === "lv" ? "Skatīt preces" : "View products"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Process" : "Process"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase md:text-4xl">
              {lang === "lv" ? "Kā notiek pasūtījums" : "How an order works"}
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-px bg-primary-foreground/10 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((p) => (
              <div key={p.step} className="bg-primary p-6">
                <span className="font-heading text-3xl font-bold text-accent">{p.step}</span>
                <h3 className="mt-4 font-heading text-xs font-bold uppercase">{tx(p.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/60">{tx(p.text)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* File preparation */}
      <section className="bg-background py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Tehniskās prasības" : "Technical requirements"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-foreground md:text-3xl">
              {lang === "lv" ? "Failu sagatavošana" : "File preparation"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {lang === "lv"
                ? "Ja kaut kas no šī sagādā grūtības — atsūti, kas ir, un mūsu dizaineri sagatavos failu drukai."
                : "If any of this is a hurdle — send what you have and our designers will prepare the file for print."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FILE_SPECS.map((item) => (
                <div key={item.title.en} className="border border-border bg-card p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={SW} />
                    <div>
                      <h3 className="font-heading text-xs font-bold uppercase text-card-foreground">{tx(item.title)}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tx(item.desc)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-3">
              <span className="block h-px w-8 bg-accent" />
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
                {lang === "lv" ? "Biežākie jautājumi" : "FAQ"}
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold uppercase text-foreground md:text-3xl">
              {lang === "lv" ? "Pirms pasūti" : "Before you order"}
            </h2>

            <Accordion type="single" collapsible className="mt-8">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left font-heading text-sm font-bold uppercase text-foreground">
                    {tx(item.q)}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {tx(item.a)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* OEKO-TEX */}
      <section className="border-t border-border bg-card py-10">
        <div className="container flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-accent" strokeWidth={SW} />
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-card-foreground">
              OEKO-TEX® Standard 100
            </span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            {lang === "lv"
              ? "Mūsu izmantotie materiāli un drukas tehnoloģijas atbilst OEKO-TEX® standartiem — droši cilvēkiem un videi."
              : "Our materials and printing technologies comply with OEKO-TEX® standards — safe for people and the environment."}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container text-center">
          <motion.div {...fadeUp}>
            <MessageCircle className="mx-auto mb-4 h-10 w-10 text-accent" strokeWidth={SW} />
            <h2 className="font-heading text-2xl font-bold uppercase md:text-4xl">
              {lang === "lv" ? "Pastāsti par savu projektu" : "Tell us about your project"}
            </h2>
            <p className="mx-auto mt-4 max-w-md leading-relaxed text-primary-foreground/60">
              {lang === "lv"
                ? "Atsūti ideju, apjomu un termiņu — atbildēsim ar tehnoloģijas ieteikumu un cenu."
                : "Send us the idea, volume and deadline — we will reply with a technology recommendation and a price."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-accent font-heading text-xs uppercase text-accent-foreground hover:bg-accent/90" asChild>
                <Link to="/request">
                  {lang === "lv" ? "Pieprasīt piedāvājumu" : "Request a quote"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent font-heading text-xs uppercase text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/contact">{lang === "lv" ? "Sazināties" : "Contact us"}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
