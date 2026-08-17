import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight, Users, Building2, ShoppingBag, Gift, CircleCheck, MessageCircle,
  ShieldCheck, Shirt, HardHat, Package, Clock, Wallet, Ruler,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
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

/* ---------------- Ko var pasūtīt ---------------- */

interface OfferBlock {
  id: string;
  icon: React.ReactNode;
  eyebrow: L;
  title: L;
  lead: L;
  items: L[];
  facts: { icon: React.ReactNode; label: L; value: L }[];
  image: string;
  ctaLabel: L;
  ctaHref: string;
}

const OFFERS: OfferBlock[] = [
  {
    id: "teamwear",
    icon: <Users className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Sports un komandas", en: "Sport & teams" },
    title: { lv: "Komandu formas ar vārdiem un numuriem", en: "Team kits with names and numbers" },
    lead: {
      lv: "Basketbola, futbola, florbola un skriešanas komandām — spēlētāju uzvārdi, numuri, klubu un sponsoru logo. Katrs krekls citāds, cena tā dēļ nemainās.",
      en: "For basketball, football, floorball and running teams — player names, numbers, club and sponsor logos. Every shirt different, at the same price.",
    },
    items: [
      { lv: "Spēļu un treniņu formas, sporta t-krekli", en: "Match and training kits, sports tees" },
      { lv: "Uzvārdi un numuri katram spēlētājam", en: "Names and numbers for each player" },
      { lv: "Sponsoru logo uz krūtīm, piedurknēm, mugurām", en: "Sponsor logos on chest, sleeves, back" },
      { lv: "Bufi, cepures, somas komandas krāsās", en: "Buffs, caps and bags in team colours" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "1 gab.", en: "1 pc" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "3–7 darba dienas", en: "3–7 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Apdrukas izmērs un skaits", en: "Print size and quantity" } },
    ],
    image: teamwearImg,
    ctaHref: "/catalog?category=Sportswear",
    ctaLabel: { lv: "Skatīt sporta apģērbu", en: "Browse sportswear" },
  },
  {
    id: "corporate",
    icon: <Building2 className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Uzņēmumiem", en: "For companies" },
    title: { lv: "Uzņēmuma apģērbs ar jūsu logo", en: "Company apparel with your logo" },
    lead: {
      lv: "Polo krekli, hūdiji, flīsa un virsjakas, vestes, kreklu apkakles — ar izšūtu vai apdrukātu logo. Apģērbu izvēlaties mūsu katalogā, pārējo darām mēs.",
      en: "Polos, hoodies, fleece and outer jackets, vests and shirts — with an embroidered or printed logo. Pick the garment from our catalogue, we do the rest.",
    },
    items: [
      { lv: "Izšūts logo uz polo, flīša, jakām, cepurēm", en: "Embroidered logo on polos, fleece, jackets, caps" },
      { lv: "Apdruka uz t-krekliem un hūdijiem", en: "Printing on tees and hoodies" },
      { lv: "Vienāds komplekts visai komandai", en: "One consistent kit for the whole team" },
      { lv: "Papildinājumi vēlāk — tā pati kvalitāte", en: "Repeat orders later — identical result" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "10 gab. (izšuvumam)", en: "10 pcs (embroidery)" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "5–10 darba dienas", en: "5–10 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Izšuvuma lielums un sarežģītība", en: "Embroidery size and complexity" } },
    ],
    image: embroideryImg,
    ctaHref: "/catalog?category=Polo",
    ctaLabel: { lv: "Skatīt polo un jakas", en: "Browse polos & jackets" },
  },
  {
    id: "volume",
    icon: <Shirt className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Lielām tirāžām", en: "Volume runs" },
    title: { lv: "T-krekli un hūdiji pasākumiem, akcijām, veikaliem", en: "Tees and hoodies for events, campaigns and retail" },
    lead: {
      lv: "Jo lielāks skaits, jo zemāka cena par gabalu. Festivāliem, skolām, konferencēm, zīmolu kolekcijām — līdz pat vairākiem tūkstošiem vienību.",
      en: "The bigger the run, the lower the unit price. Festivals, schools, conferences, brand collections — up to several thousand pieces.",
    },
    items: [
      { lv: "T-krekli, polo, hūdiji, auduma maisiņi", en: "Tees, polos, hoodies, tote bags" },
      { lv: "Precīza logo krāsa pēc Pantone®", en: "Exact logo colour to Pantone®" },
      { lv: "Efekti: zelts, sudrabs, fluo, 3D, silikons", en: "Effects: gold, silver, fluo, 3D, silicone" },
      { lv: "Apdruka arī uz jūsu piegādātā apģērba", en: "We also print on your own garments" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "25 gab.", en: "25 pcs" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "7–14 darba dienas", en: "7–14 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Krāsu skaits un tirāža", en: "Number of colours and run size" } },
    ],
    image: screenImg,
    ctaHref: "/catalog?category=T-shirts",
    ctaLabel: { lv: "Skatīt t-kreklus", en: "Browse t-shirts" },
  },
  {
    id: "single",
    icon: <Gift className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "No 1 gabala", en: "From 1 piece" },
    title: { lv: "Viens krekls, dāvana vai paraugs", en: "One shirt, a gift or a sample" },
    lead: {
      lv: "Nav minimālā pasūtījuma. Pilnkrāsu attēls, foto, teksts vai vārds uz viena krekla, hūdija, somas vai cepures — arī kā paraugs pirms lielās tirāžas.",
      en: "No minimum order. Full-colour artwork, photos, text or a name on a single shirt, hoodie, bag or cap — including a sample before a big run.",
    },
    items: [
      { lv: "Dāvanas, jubilejas, vecmeitu/vecpuišu ballītes", en: "Gifts, anniversaries, parties" },
      { lv: "Paraugs pirms lielās tirāžas", en: "Sample before the main run" },
      { lv: "Personalizēti vārdi un teksti", en: "Personalised names and text" },
      { lv: "Foto kvalitātes pilnkrāsu attēli", en: "Photo-quality full-colour artwork" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "1 gab.", en: "1 pc" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "1–3 darba dienas", en: "1–3 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Apdrukas izmērs (A5/A4/A3)", en: "Print size (A5/A4/A3)" } },
    ],
    image: dtfImg,
    ctaHref: "/catalog?category=T-shirts",
    ctaLabel: { lv: "Izvēlēties apģērbu", en: "Pick a garment" },
  },
  {
    id: "promo",
    icon: <ShoppingBag className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Reklāmas preces", en: "Promotional items" },
    title: { lv: "Somas, lietussargi, krūzes, cepures", en: "Bags, umbrellas, mugs, caps" },
    lead: {
      lv: "Ne tikai apģērbs. Apdrukājam auduma maisiņus, lietussargus, krūzes, peles paliktņus, dvieļus un aksesuārus — viss vienā pasūtījumā ar vienu logo.",
      en: "Not only apparel. We brand tote bags, umbrellas, mugs, mousepads, towels and accessories — all in one order with one logo.",
    },
    items: [
      { lv: "Auduma maisiņi un mugursomas", en: "Tote bags and backpacks" },
      { lv: "Lietussargi", en: "Umbrellas" },
      { lv: "Krūzes un keramika (sublimācija)", en: "Mugs and ceramics (sublimation)" },
      { lv: "Dvieļi, bufi, cepures, uzšuves", en: "Towels, buffs, caps, patches" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "1–25 gab. atkarībā no preces", en: "1–25 pcs depending on item" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "3–10 darba dienas", en: "3–10 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Preces veids un skaits", en: "Item type and quantity" } },
    ],
    image: promoImg,
    ctaHref: "/catalog?category=Bags",
    ctaLabel: { lv: "Skatīt reklāmas preces", en: "Browse promo items" },
  },
  {
    id: "custom-sewn",
    icon: <Ruler className="h-5 w-5" strokeWidth={SW} />,
    eyebrow: { lv: "Šūts pēc pasūtījuma", en: "Made to order" },
    title: { lv: "Formas, kas šūtas tieši jums", en: "Kits sewn specifically for you" },
    lead: {
      lv: "Ja katalogā nav vajadzīgā, apdrukājam audumu pa visu virsmu un pēc piegrieznēm sašujam gatavu izstrādājumu — sporta formas, bufus, speciālus komplektus.",
      en: "If the catalogue doesn't have it, we print the fabric edge to edge and sew the finished garment to pattern — sports kits, buffs, special sets.",
    },
    items: [
      { lv: "Sporta formas ar dizainu pa visu virsmu", en: "Sports kits with all-over design" },
      { lv: "Bufi un galvas aksesuāri", en: "Buffs and headwear" },
      { lv: "Karogi un tekstila reklāma", en: "Flags and textile signage" },
      { lv: "Druka neizbalē un nav jūtama ar roku", en: "Print won't fade and has no hand feel" },
    ],
    facts: [
      { icon: <Package className="h-4 w-4" strokeWidth={SW} />, label: { lv: "No cik gab.", en: "From" }, value: { lv: "10 gab.", en: "10 pcs" } },
      { icon: <Clock className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Termiņš", en: "Lead time" }, value: { lv: "10–20 darba dienas", en: "10–20 working days" } },
      { icon: <Wallet className="h-4 w-4" strokeWidth={SW} />, label: { lv: "Cenu nosaka", en: "Price driven by" }, value: { lv: "Modelis un daudzums", en: "Model and quantity" } },
    ],
    image: sublimationImg,
    ctaHref: "/request",
    ctaLabel: { lv: "Pieprasīt piedāvājumu", en: "Request a quote" },
  },
];

/* ---------------- Ātrā izvēles tabula ---------------- */

const CHOICE_ROWS: { method: L; best: L; from: L; wash: L }[] = [
  {
    method: { lv: "DTF digitālā apdruka", en: "DTF digital printing" },
    best: { lv: "Vārdi, numuri, foto, mazi apjomi", en: "Names, numbers, photos, small runs" },
    from: { lv: "1 gab.", en: "1 pc" },
    wash: { lv: "40 °C", en: "40 °C" },
  },
  {
    method: { lv: "Sietspiede", en: "Screen printing" },
    best: { lv: "Lielas tirāžas ar vienu dizainu", en: "Large runs of one design" },
    from: { lv: "25 gab.", en: "25 pcs" },
    wash: { lv: "40–60 °C", en: "40–60 °C" },
  },
  {
    method: { lv: "Izšūšana", en: "Embroidery" },
    best: { lv: "Logo uz polo, jakām, cepurēm", en: "Logos on polos, jackets, caps" },
    from: { lv: "10 gab.", en: "10 pcs" },
    wash: { lv: "60–90 °C", en: "60–90 °C" },
  },
  {
    method: { lv: "Sublimācija", en: "Sublimation" },
    best: { lv: "Poliestera formas, krūzes, karogi", en: "Polyester kits, mugs, flags" },
    from: { lv: "1 gab.", en: "1 pc" },
    wash: { lv: "60 °C", en: "60 °C" },
  },
  {
    method: { lv: "Termodruka (plēve, floks)", en: "Heat transfer (vinyl, flock)" },
    best: { lv: "Atstarojoši, metāliski, 3D efekti", en: "Reflective, metallic, 3D effects" },
    from: { lv: "1 gab.", en: "1 pc" },
    wash: { lv: "40 °C", en: "40 °C" },
  },
];

/* ---------------- Process ---------------- */

const STEPS: { title: L; text: L }[] = [
  {
    title: { lv: "Atsūti pieprasījumu", en: "Send your request" },
    text: {
      lv: "Pievieno logo vai ideju, norādi apģērbu, skaitu, izmērus un vēlamo termiņu. Ja nezini, ko izvēlēties — pasaki mērķi, pārējo ieteiksim mēs.",
      en: "Attach your logo or idea and tell us the garment, quantity, sizes and deadline. Not sure what to pick? Tell us the goal and we'll advise.",
    },
  },
  {
    title: { lv: "Saņem piedāvājumu", en: "Get a quote" },
    text: {
      lv: "Atbildam vienas darba dienas laikā ar cenu par gabalu, apdrukas metodi un izpildes termiņu.",
      en: "We reply within one working day with a unit price, the decoration method and a delivery date.",
    },
  },
  {
    title: { lv: "Apstiprini vizualizāciju", en: "Approve the mockup" },
    text: {
      lv: "Nosūtām maketu ar apdrukas izvietojumu un izmēru. Ražošanu sākam tikai pēc jūsu apstiprinājuma.",
      en: "We send a mockup with placement and print size. Production only starts after your approval.",
    },
  },
  {
    title: { lv: "Ražojam Rīgā", en: "We produce in Riga" },
    text: {
      lv: "Viss notiek mūsu ražotnē — nav starpnieku, tāpēc termiņus un kvalitāti kontrolējam paši.",
      en: "Everything happens in our own facility — no middlemen, so we control timing and quality ourselves.",
    },
  },
  {
    title: { lv: "Saņem pasūtījumu", en: "Receive your order" },
    text: {
      lv: "Salokām, iepakojam un piegādājam visā Latvijā vai sagatavojam saņemšanai uz vietas Rīgā.",
      en: "Folded, packed and delivered anywhere in Latvia, or ready for pickup in Riga.",
    },
  },
];

/* ---------------- FAQ ---------------- */

const FAQ: { q: L; a: L }[] = [
  {
    q: { lv: "Cik maksā apdruka?", en: "How much does decoration cost?" },
    a: {
      lv: "Cenu nosaka apģērba veids, apdrukas izmērs, krāsu skaits dizainā un daudzums. Piemēram, 100 t-kreklu ar viena krāsas logo maksā ievērojami mazāk par gabalu nekā 10 gab. Precīzu cenu nosūtām vienas darba dienas laikā pēc pieprasījuma.",
      en: "Price depends on the garment, print size, number of colours in the design and quantity. 100 tees with a one-colour logo cost far less per piece than 10. We send an exact price within one working day.",
    },
  },
  {
    q: { lv: "Vai varu pasūtīt tikai vienu gabalu?", en: "Can I order just one piece?" },
    a: {
      lv: "Jā. DTF, sublimācijas un termodrukas apdruku veicam arī no 1 gabala. Sietspiedei minimums ir 25 gab., izšūšanai — 10 gab.",
      en: "Yes. DTF, sublimation and heat transfer work from a single piece. Screen printing starts at 25 pcs and embroidery at 10 pcs.",
    },
  },
  {
    q: { lv: "Vai varu atnest savu apģērbu?", en: "Can I bring my own garments?" },
    a: {
      lv: "Jā, apdrukājam arī klienta piegādāto apģērbu. Iepriekš pārrunājam materiālu un apdrukas metodi, lai rezultāts būtu garantēts.",
      en: "Yes, we decorate customer-supplied garments too. We agree on the fabric and method beforehand so the result is guaranteed.",
    },
  },
  {
    q: { lv: "Cik ilgi jāgaida?", en: "How long does it take?" },
    a: {
      lv: "Standarta pasūtījums ir gatavs 5–10 darba dienās pēc makets apstiprināšanas. Atsevišķi krekli un mazi apjomi bieži 1–3 dienās. Steidzamiem projektiem pasakiet termiņu — meklēsim risinājumu.",
      en: "A standard order is ready in 5–10 working days after mockup approval. Single shirts and small runs are often done in 1–3 days. For rush jobs, tell us the deadline and we'll find a way.",
    },
  },
  {
    q: { lv: "Kāds fails jāatsūta?", en: "What file should I send?" },
    a: {
      lv: "Vislabāk vektorgrafika (AI, EPS, PDF, SVG). Der arī PNG ar caurspīdīgu fonu vismaz 300 dpi apdrukas izmērā. Ja ir tikai foto vai zīmējums — pārzīmēsim.",
      en: "Vector art is best (AI, EPS, PDF, SVG). A transparent PNG at 300 dpi at final print size also works. If you only have a photo or sketch, we can redraw it.",
    },
  },
  {
    q: { lv: "Vai varu pasūtīt papildus vēlāk?", en: "Can I reorder later?" },
    a: {
      lv: "Jā. Saglabājam jūsu maketus, sietus un izšūšanas programmas, tāpēc atkārtots pasūtījums izskatās tieši tāpat kā pirmais.",
      en: "Yes. We keep your artwork, screens and embroidery programs, so a repeat order looks exactly like the first one.",
    },
  },
  {
    q: { lv: "Vai apdruka iztur mazgāšanu?", en: "Does it survive washing?" },
    a: {
      lv: "Iztur. Izšuvums neizbalē un nenolobās, sietspiede un sublimācija iztur regulāru mazgāšanu. Iesakām mazgāt no kreisās puses līdz 40 °C.",
      en: "Yes. Embroidery won't fade or peel; screen prints and sublimation handle regular washing. We recommend washing inside out at up to 40 °C.",
    },
  },
];

const ServicesPage = () => {
  const { lang } = useLanguage();
  const tx = (l: L) => (lang === "lv" ? l.lv : l.en);

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-background">
        <img
          src={heroImg}
          alt={lang === "lv" ? "Ervitex apdrukas ražotne Rīgā" : "Ervitex decoration facility in Riga"}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block rounded-full border border-primary/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Pakalpojumi" : "Services"}
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] md:text-6xl">
              {lang === "lv" ? "Ko vari pasūtīt ar savu logo" : "What you can order with your logo"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {lang === "lv"
                ? "Krekli, hūdiji, jakas, cepures, somas, lietussargi un komandu formas — apģērbu izvēlies mūsu katalogā, apdruku un izšūšanu izdarām paši savā ražotnē Rīgā. No viena gabala līdz vairākiem tūkstošiem."
                : "Shirts, hoodies, jackets, caps, bags, umbrellas and team kits — pick the garment from our catalogue and we handle printing and embroidery in our own facility in Riga. From one piece to several thousand."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/request">
                  {lang === "lv" ? "Pieprasīt piedāvājumu" : "Request a quote"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/catalog">{lang === "lv" ? "Apskatīt katalogu" : "Browse the catalogue"}</Link>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { lv: "No 1 gabala", en: "From 1 piece" },
                { lv: "Sava ražotne Rīgā", en: "Own facility in Riga" },
                { lv: "Piegāde visā Latvijā", en: "Delivery across Latvia" },
                { lv: "Atbilde 1 darba dienā", en: "Reply in 1 working day" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={SW} />
                  <span>{tx(f)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* OFFER BLOCKS */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Ko var pasūtīt" : "What you can order"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              {lang === "lv" ? "Sāc ar to, kas tev vajadzīgs" : "Start with what you actually need"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "lv"
                ? "Nav jāzina, kā sauc tehnoloģiju. Pasaki, ko un cik daudz vajag — piemērotāko apdrukas veidu piedāvāsim mēs."
                : "You don't need to know the technology names. Tell us what you need and how many — we'll pick the right method."}
            </p>
          </div>

          <div className="mt-14 space-y-20 md:space-y-28">
            {OFFERS.map((o, idx) => (
              <motion.div
                key={o.id}
                id={o.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="overflow-hidden rounded-2xl border border-border/60">
                    <img
                      src={o.image}
                      alt={tx(o.title)}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-2 text-primary">
                    {o.icon}
                    <span className="text-xs font-medium uppercase tracking-[0.18em]">{tx(o.eyebrow)}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold md:text-3xl">{tx(o.title)}</h3>
                  <p className="mt-4 text-muted-foreground">{tx(o.lead)}</p>

                  <ul className="mt-6 space-y-2.5">
                    {o.items.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={SW} />
                        <span>{tx(b)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    {o.facts.map((s, i) => (
                      <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                          {s.icon}
                          <span>{tx(s.label)}</span>
                        </div>
                        <div className="mt-1.5 text-sm font-semibold">{tx(s.value)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link to={o.ctaHref}>
                        {tx(o.ctaLabel)} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/request">{lang === "lv" ? "Pieprasīt cenu" : "Get a price"}</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CHOICE TABLE */}
      <section className="border-y border-border/60 bg-card/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Īsumā" : "At a glance" }
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              {lang === "lv" ? "Kura metode kam der" : "Which method suits what"}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {lang === "lv"
                ? "Ja gribi zināt tehnisko pusi — te ir viss svarīgākais vienā tabulā. Ja negribi, izlaid to: metodi izvēlēsimies mēs."
                : "If you want the technical side, here it is in one table. If not, skip it — we'll choose the method for you."}
            </p>
          </div>

          <div className="mt-10 overflow-x-auto rounded-2xl border border-border/60">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-background/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">{lang === "lv" ? "Metode" : "Method"}</th>
                  <th className="px-4 py-3 font-medium">{lang === "lv" ? "Kam vislabāk" : "Best for"}</th>
                  <th className="px-4 py-3 font-medium">{lang === "lv" ? "No cik gab." : "From"}</th>
                  <th className="px-4 py-3 font-medium">{lang === "lv" ? "Mazgāšana" : "Wash"}</th>
                </tr>
              </thead>
              <tbody>
                {CHOICE_ROWS.map((r, i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-4 py-3 font-semibold">{tx(r.method)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tx(r.best)}</td>
                    <td className="px-4 py-3">{tx(r.from)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tx(r.wash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Process" : "Process"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">
              {lang === "lv" ? "Kā notiek pasūtījums" : "How an order works"}
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-border/60 bg-card/40 p-5"
              >
                <div className="font-display text-3xl font-bold text-primary/70">{`0${i + 1}`}</div>
                <h3 className="mt-3 font-semibold">{tx(s.title)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{tx(s.text)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FILES + FAQ */}
      <section className="border-t border-border/60 bg-card/30 py-16 md:py-24">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Ko atsūtīt" : "What to send"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold">
              {lang === "lv" ? "Pieprasījumam pievieno" : "Include in your request"}
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { lv: "Logo vai dizainu (AI, EPS, PDF, SVG vai PNG 300 dpi)", en: "Logo or artwork (AI, EPS, PDF, SVG or 300 dpi PNG)" },
                { lv: "Apģērbu no kataloga vai aprakstu, ko meklē", en: "A garment from the catalogue, or a description of what you need" },
                { lv: "Daudzumu un izmēru sadalījumu", en: "Quantity and size breakdown" },
                { lv: "Vēlamo apdrukas vietu un aptuveno izmēru", en: "Desired placement and approximate print size" },
                { lv: "Termiņu, līdz kuram pasūtījums vajadzīgs", en: "The date you need the order by" },
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={SW} />
                  <span>{tx(b)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={SW} />
              <p className="text-sm text-muted-foreground">
                {lang === "lv"
                  ? "Nav gatava faila? Nav problēmu — pārzīmēsim logo drukai piemērotā formātā un pirms ražošanas atsūtīsim maketu apstiprināšanai."
                  : "No print-ready file? No problem — we redraw your logo for production and send a mockup for approval before printing."}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/request">
                  {lang === "lv" ? "Pieprasīt piedāvājumu" : "Request a quote"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">
                  <MessageCircle className="mr-2 h-4 w-4" strokeWidth={SW} />
                  {lang === "lv" ? "Sazināties" : "Contact us"}
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {lang === "lv" ? "Biežākie jautājumi" : "FAQ"}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold">
              {lang === "lv" ? "Pirms pasūti" : "Before you order"}
            </h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm font-semibold">{tx(f.q)}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{tx(f.a)}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl border border-border/60 bg-card/50 p-8 text-center md:p-14">
            <HardHat className="mx-auto h-8 w-8 text-primary" strokeWidth={SW} />
            <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">
              {lang === "lv" ? "Pastāsti, ko vajag" : "Tell us what you need"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {lang === "lv"
                ? "Atsūti logo un aptuvenu daudzumu — atbildēsim vienas darba dienas laikā ar cenu, termiņu un ieteikumiem."
                : "Send your logo and rough quantity — we'll reply within one working day with a price, a deadline and recommendations."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/request">
                  {lang === "lv" ? "Pieprasīt piedāvājumu" : "Request a quote"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/catalog">{lang === "lv" ? "Apskatīt katalogu" : "Browse the catalogue"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
