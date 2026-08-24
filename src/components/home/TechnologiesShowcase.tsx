import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { techs } from "@/data/technologies";

import guaranteeImg from "@/assets/partner-section.jpg.asset.json";

const TechnologiesShowcase = () => {
  const { lang } = useLanguage();
  const isLv = lang === "lv";

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
            {isLv ? "APDRUKAS RISINĀJUMI" : "Decoration technologies"}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            {isLv
              ? "No smalkām detaļām līdz lielām tirāžām — palīdzēsim izvēlēties pareizo metodi, lai jūsu zīmols uz apģērba izskatītos nevainojami."
              : "Screen printing, DTF, embroidery and sublimation — all produced in our own facility in Latvia. We help you pick the technology that fits your design and quantity best."}
          </p>
        </motion.div>

        {/* Overview cards */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 md:mt-16">
          {techs.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link to={`/tehnologijas/${t.id}`} className="group block w-full text-left">
                <div className="overflow-hidden rounded-sm">
                  <img
                    src={t.images[0]}
                    alt={t.name[lang]}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold uppercase text-foreground">
                  {t.name[lang]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.short[lang]}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-accent">
                  {isLv ? "Vairāk informācijas" : "Learn more"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Guarantee block */}
        <div className="mt-20 grid gap-10 border-t border-border pt-16 lg:grid-cols-2 lg:items-center lg:gap-16 md:mt-28">
          <img
            src={guaranteeImg.url}
            alt={isLv ? "Apdrukāts krekls ar individualizētu dizainu" : "Printed t-shirt with a custom design"}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover"
          />
          <div>
            <h3 className="font-heading text-2xl font-bold uppercase leading-tight text-foreground md:text-4xl">
              {isLv
                ? "UZTICAMS PARTNERIS\nJŪSU UZŅĒMUMA\nAPĢĒRBU PROJEKTIEM"
                : "We guarantee accuracy, quality and delivery on every order."}
            </h3>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {isLv
                ? "Pārbaudīti zīmoli, industriālas iekārtas un personīga projektu vadība — lai jūsu komandas vai pasākuma apģērbs tiktu izgatavots precīzi laikā."
                : "Long-standing experience, a wide range of completed projects and a large product catalogue. One shirt or a large run — the process is just as careful."}
            </p>
            <ul className="mt-6 space-y-2.5">
              {(isLv
                ? [
                    "Uzticami partneri un tekstils — strādājam tikai ar pārbaudītiem apģērbu piegādātājiem",
                    "Precīzi jūsu termiņi — vienmēr pielāgojamies jūsu grafikam un pasākuma datumam",
                    "Individuāla pieeja prasībām — iedziļināmies detaļās un pirms ražošanas saskaņojam katru niansi",
                    "Kvalitatīvas un drošas krāsas — noturīgi materiāli, kas saglabā toni un neplaisā pēc mazgāšanas",
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
