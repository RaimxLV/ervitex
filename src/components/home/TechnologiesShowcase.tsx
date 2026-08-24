import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ServiceImageCarousel from "@/components/services/ServiceImageCarousel";

import screen1 from "@/assets/services/screen-printing-1.jpg";
import screen2 from "@/assets/services/screen-printing-2.jpg";
import screen3 from "@/assets/services/screen-printing-3.jpg";
import screen4 from "@/assets/services/screen-printing-4.jpg";
import dtf1 from "@/assets/services/dtf-1.jpg";
import dtf2 from "@/assets/services/dtf-2.jpg";
import dtf3 from "@/assets/services/dtf-3.jpg";
import dtf4 from "@/assets/services/dtf-4.jpg";
import emb1 from "@/assets/services/embroidery-1.jpg";
import emb2 from "@/assets/services/embroidery-2.jpg";
import emb3 from "@/assets/services/embroidery-3.jpg";
import emb4 from "@/assets/services/embroidery-4.jpg";
import sub1 from "@/assets/services/sublimation-1.jpg";
import sub2 from "@/assets/services/sublimation-2.jpg";
import sub3 from "@/assets/services/sublimation-3.jpg";
import sub4 from "@/assets/services/sublimation-4.jpg";
import guaranteeImg from "@/assets/services/rt-hero.jpg";

type Tech = {
  id: string;
  name: { lv: string; en: string };
  tagline: { lv: string; en: string };
  desc: { lv: string; en: string };
  features: { lv: string; en: string }[];
  specs: { label: { lv: string; en: string }; value: { lv: string; en: string } }[];
  images: string[];
};

const techs: Tech[] = [
  {
    id: "sietspiede",
    name: { lv: "Sietspiede", en: "Screen printing" },
    tagline: { lv: "Lielām tirāžām", en: "For large runs" },
    desc: {
      lv: "Klasiskā un ekonomiskākā tehnoloģija lielām tirāžām. Katrai krāsai tiek sagatavots atsevišķs siets, tāpēc rezultāts ir spilgts, mīksts uz taustes un ļoti izturīgs pret mazgāšanu. Ideāla izvēle T-krekliem, hūdijiem un pasākumu apģērbam.",
      en: "The classic and most cost-effective technology for large runs. A separate screen is prepared for every colour, so the result is vivid, soft to the touch and extremely wash-resistant. Ideal for tees, hoodies and event apparel.",
    },
    features: [
      { lv: "Izdevīgi no 30 gab.", en: "Cost-effective from 30 pcs" },
      { lv: "Līdz 6 krāsām vienā apdrukā", en: "Up to 6 colours per print" },
      { lv: "Mīksta, elastīga apdruka", en: "Soft, flexible print" },
      { lv: "Pantone krāsu saskaņošana", en: "Pantone colour matching" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "30 gab.", en: "30 pcs" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "5–8 darba dienas", en: "5–8 business days" } },
      { label: { lv: "Faili", en: "Files" }, value: { lv: "AI, EPS, PDF (vektors)", en: "AI, EPS, PDF (vector)" } },
    ],
    images: [screen1, screen2, screen3, screen4],
  },
  {
    id: "dtf",
    name: { lv: "DTF druka", en: "DTF printing" },
    tagline: { lv: "Fotogrāfiskai detaļai", en: "For photographic detail" },
    desc: {
      lv: "Digitālā druka uz plēves, kas tiek pārnesta ar presi. Bez krāsu skaita ierobežojuma — gradienti, fotogrāfijas un smalkas detaļas izskatās perfekti pat uz tumša auduma. Piemērota mazām tirāžām un personalizācijai pa vienam gabalam.",
      en: "Digital film printing transferred with a heat press. No colour limit — gradients, photos and fine detail look perfect even on dark fabric. Perfect for small runs and one-off personalisation.",
    },
    features: [
      { lv: "No 1 gabala", en: "From a single piece" },
      { lv: "Neierobežots krāsu skaits", en: "Unlimited colours" },
      { lv: "Der arī sintētikai un jakām", en: "Works on synthetics and jackets" },
      { lv: "Vārdi un numuri komandām", en: "Names and numbers for teams" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "1 gab.", en: "1 pc" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "2–5 darba dienas", en: "2–5 business days" } },
      { label: { lv: "Faili", en: "Files" }, value: { lv: "PNG 300 dpi, PDF, AI", en: "PNG 300 dpi, PDF, AI" } },
    ],
    images: [dtf1, dtf2, dtf3, dtf4],
  },
  {
    id: "izsusana",
    name: { lv: "Izšūšana", en: "Embroidery" },
    tagline: { lv: "Premium izskatam", en: "For a premium look" },
    desc: {
      lv: "Vissolīdākais risinājums korporatīvajam apģērbam. Dizains tiek digitalizēts un izšūts ar diegu — reljefs, taustāms un praktiski nenodilstošs. Lieliski strādā uz cepurēm, polo krekliem, jakām un darba apģērba.",
      en: "The most solid solution for corporate apparel. The design is digitised and stitched with thread — textured, tangible and virtually indestructible. Works great on caps, polos, jackets and workwear.",
    },
    features: [
      { lv: "No 10 gab.", en: "From 10 pcs" },
      { lv: "Līdz 12 diegu krāsām", en: "Up to 12 thread colours" },
      { lv: "3D / puff izšūšana un uzšuves", en: "3D / puff embroidery and patches" },
      { lv: "Bezmaksas digitalizācijas pārbaude", en: "Free digitising check" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "10 gab.", en: "10 pcs" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "5–10 darba dienas", en: "5–10 business days" } },
      { label: { lv: "Ieteicamais izmērs", en: "Recommended size" }, value: { lv: "līdz 25 × 25 cm", en: "up to 25 × 25 cm" } },
    ],
    images: [emb1, emb2, emb3, emb4],
  },
  {
    id: "sublimacija",
    name: { lv: "Sublimācija", en: "Sublimation" },
    tagline: { lv: "Sporta un pilnkrāsu risinājums", en: "Sport & all-over solution" },
    desc: {
      lv: "Krāsa iekļūst pašā šķiedrā, tāpēc apdruka nav ne saredzama, ne sajūtama — tā nekad neplaisā un neatlīmējas. Piemērota gaišam poliestera audumam: sporta formām, pilnkrāsu dizainiem, krūzēm un suvenīriem.",
      en: "The ink bonds inside the fibre, so the print cannot be seen or felt — it never cracks or peels. Suited to light polyester fabrics: sports kits, all-over designs, mugs and gifts.",
    },
    features: [
      { lv: "Apdruka pa visu virsmu", en: "All-over printing" },
      { lv: "Neizbalo un neplaisā", en: "Never fades or cracks" },
      { lv: "Elpojošs — nemaina auduma īpašības", en: "Breathable — fabric stays as it is" },
      { lv: "Arī krūzes un suvenīri", en: "Also mugs and gifts" },
    ],
    specs: [
      { label: { lv: "Minimālais daudzums", en: "Minimum quantity" }, value: { lv: "1 gab.", en: "1 pc" } },
      { label: { lv: "Izpildes laiks", en: "Turnaround" }, value: { lv: "3–7 darba dienas", en: "3–7 business days" } },
      { label: { lv: "Materiāls", en: "Material" }, value: { lv: "Poliesters, gaišas krāsas", en: "Polyester, light colours" } },
    ],
    images: [sub1, sub2, sub3, sub4],
  },
];

const TechnologiesShowcase = () => {
  const { lang } = useLanguage();
  const isLv = lang === "lv";
  const [active, setActive] = useState(techs[0].id);
  const current = techs.find((t) => t.id === active) ?? techs[0];

  return (
    <section id="tehnologijas" className="bg-background py-20 md:py-28">
      <div className="container">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
            {isLv ? "Mūsu pakalpojumi" : "Our services"}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            {isLv ? "Četras apdrukas tehnoloģijas" : "Four decoration technologies"}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {isLv
              ? "Sietspiede, DTF druka, izšūšana un sublimācija — visu izpildām pašu ražotnē Latvijā. Palīdzēsim izvēlēties tehnoloģiju, kas Jūsu dizainam un tirāžai ir izdevīgākā."
              : "Screen printing, DTF, embroidery and sublimation — all produced in our own facility in Latvia. We help you pick the technology that fits your design and quantity best."}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 md:mt-12 md:gap-3">
          {techs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors md:px-6 md:py-2.5 md:text-sm ${
                active === t.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {t.name[lang]}
            </button>
          ))}
        </div>

        {/* Active technology */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-2 lg:items-center lg:gap-16"
        >
          <div className="[&>div]:mt-0">
            <ServiceImageCarousel images={current.images} alt={current.name[lang]} />
          </div>

          <div>
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {current.tagline[lang]}
            </span>
            <h3 className="mt-3 font-heading text-2xl font-bold uppercase text-foreground md:text-4xl">
              {current.name[lang]}
            </h3>
            <p className="mt-5 leading-relaxed text-muted-foreground">{current.desc[lang]}</p>

            <ul className="mt-6 space-y-2.5">
              {current.features.map((f) => (
                <li key={f.en} className="flex items-start gap-3 text-sm text-foreground md:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
                  <span>{f[lang]}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
              {current.specs.map((s) => (
                <div key={s.label.en} className="bg-card p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.label[lang]}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{s.value[lang]}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 bg-foreground px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-accent"
              >
                {isLv ? "Veikt pasūtījumu" : "Begin your order"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-foreground"
              >
                {isLv ? "Konsultēties ar speciālistu" : "Talk to a specialist"}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Guarantee block */}
        <div className="mt-20 grid gap-10 border-t border-border pt-16 lg:grid-cols-2 lg:items-center lg:gap-16 md:mt-28">
          <img
            src={guaranteeImg}
            alt={isLv ? "Ervitex apdrukas ražotne Latvijā" : "Ervitex print facility in Latvia"}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
          <div>
            <h3 className="font-heading text-2xl font-bold uppercase leading-tight text-foreground md:text-4xl">
              {isLv
                ? "Garantējam precizitāti, kvalitāti un termiņus katrā pasūtījumā."
                : "We guarantee accuracy, quality and delivery on every order."}
            </h3>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {isLv
                ? "20 gadu pieredze, 5000+ realizēti projekti un vairāk nekā 3000 produktu katalogā. Vienam kreklam vai 5000 gabalu tirāžai — process ir tikpat rūpīgs."
                : "20 years of experience, 5,000+ completed projects and over 3,000 products in our catalogue. One shirt or 5,000 pieces — the process is just as careful."}
            </p>
            <ul className="mt-6 space-y-2.5">
              {(isLv
                ? [
                    "Bezmaksas dizaina pārbaude pirms ražošanas",
                    "Digitāls apstiprinājums pirms drukas",
                    "Pārbaudīta kvalitāte — Stanley/Stella, Malfini, Clique",
                    "Precīzi termiņi, arī steidzamiem projektiem",
                  ]
                : [
                    "Free design review before production",
                    "Digital proof before printing",
                    "Quality-tested garments — Stanley/Stella, Malfini, Clique",
                    "Precise deadlines, even for rush projects",
                  ]
              ).map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground md:text-base">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-heading text-xs font-bold uppercase tracking-wider text-background transition-colors hover:bg-accent"
              >
                {isLv ? "Sazināties ar speciālistu" : "Contact a printing pro"}
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-foreground hover:text-accent"
              >
                {isLv ? "Sākt pasūtījumu" : "Begin your order"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologiesShowcase;
