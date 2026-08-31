import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Layout from "@/components/Layout";
import ServiceImageCarousel from "@/components/services/ServiceImageCarousel";
import TechGallery from "@/components/services/TechGallery";
import TechRelatedProducts from "@/components/services/TechRelatedProducts";

import { useLanguage } from "@/i18n/LanguageContext";
import { getTech, techs } from "@/data/technologies";

const TechnologyPage = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const isLv = lang === "lv";
  const tech = getTech(slug);

  if (!tech) return <Navigate to="/#tehnologijas" replace />;

  const others = techs.filter((t) => t.id !== tech.id);

  return (
    <Layout>
      <section className="bg-background py-12 md:py-20">
        <div className="container">
          <Link
            to="/#tehnologijas"
            className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isLv ? "Visas tehnoloģijas" : "All technologies"}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16"
          >
            <div className="[&>div]:mt-0">
              <ServiceImageCarousel images={tech.images} alt={tech.name[lang]} />
            </div>

            <div>
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                {tech.tagline[lang]}
              </span>
              <h1 className="mt-3 font-heading text-3xl font-bold uppercase text-foreground md:text-5xl">
                {tech.name[lang]}
              </h1>
              <p className="mt-5 leading-relaxed text-muted-foreground">{tech.desc[lang]}</p>

              <p className="mt-8 font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                {isLv ? "Iespējas" : "Capabilities"}
              </p>
              <ul className="mt-4 space-y-2.5">
                {tech.features.map((f) => (
                  <li key={f.en} className="flex items-start gap-3 text-sm text-foreground md:text-base">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
                    <span>{f[lang]}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
                {tech.specs.map((s) => (
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

          {/* Gallery */}
          <div className="mt-16 border-t border-border pt-12 md:mt-24">
            <TechGallery images={tech.images} alt={tech.name[lang]} />
          </div>


          <TechRelatedProducts techId={tech.id} />


          {/* Other technologies */}
          <div className="mt-16 border-t border-border pt-12 md:mt-24">
            <h2 className="font-heading text-xl font-bold uppercase text-foreground md:text-2xl">
              {isLv ? "Citas tehnoloģijas" : "Other technologies"}
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-3">
              {others.map((t) => (
                <Link key={t.id} to={`/tehnologijas/${t.id}`} className="group block">
                  <div className="overflow-hidden rounded-sm">
                    <img
                      src={t.images[0]}
                      alt={t.name[lang]}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-4 font-heading text-base font-bold uppercase text-foreground group-hover:text-accent">
                    {t.name[lang]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.short[lang]}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TechnologyPage;
