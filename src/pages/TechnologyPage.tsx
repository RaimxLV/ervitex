import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import Layout from "@/components/Layout";
import ServiceImageCarousel from "@/components/services/ServiceImageCarousel";
import TechGallery from "@/components/services/TechGallery";
import TechRelatedProducts from "@/components/services/TechRelatedProducts";

import { useLanguage } from "@/i18n/LanguageContext";
import { getTech, techs, type TechExtra } from "@/data/technologies";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
} as const;

const SectionKicker = ({ children }: { children: string }) => (
  <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-accent">
    {children}
  </span>
);

const ExtraSection = ({ extra, isLv }: { extra: TechExtra; isLv: boolean }) => (
  <section className="border-t border-border bg-muted/30 py-16 md:py-20">
    <div className="container">
      <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="max-w-3xl">
        <SectionKicker>{extra.tagline ? extra.tagline[isLv ? "lv" : "en"] : isLv ? "Papildu iespēja" : "Extra option"}</SectionKicker>
        <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
          {extra.title[isLv ? "lv" : "en"]}
        </h2>
        {extra.paragraphs.map((p) => (
          <p key={p.en} className="mt-4 leading-relaxed text-muted-foreground">
            {p[isLv ? "lv" : "en"]}
          </p>
        ))}
      </motion.div>

      {extra.steps && extra.steps.length > 0 && (
        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="font-heading text-lg font-bold uppercase text-foreground md:text-xl">
              {extra.stepsTitle?.[isLv ? "lv" : "en"]}
            </h3>
            <ol className="mt-8 space-y-8">
              {extra.steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.li
                    key={step.text.en}
                    {...fadeUp}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-5"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background font-heading text-sm font-bold text-foreground">
                        {i + 1}
                      </div>
                      {i < extra.steps!.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-1 pt-2">
                      <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                      <p className="mt-2 text-sm leading-relaxed text-foreground md:text-base">{step.text[isLv ? "lv" : "en"]}</p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          {extra.highlights && extra.highlights.length > 0 && (
            <div className="grid content-start gap-4 self-start sm:grid-cols-2 lg:grid-cols-1">
              {extra.highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label.en} className="border border-border bg-card p-6">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {h.label[isLv ? "lv" : "en"]}
                    </p>
                    <p className="mt-1 font-heading text-lg font-bold uppercase leading-snug text-foreground">
                      {h.value[isLv ? "lv" : "en"]}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(!extra.steps || extra.steps.length === 0) && extra.highlights && extra.highlights.length > 0 && (
        <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {extra.highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label.en} className="bg-card p-6">
                <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {h.label[isLv ? "lv" : "en"]}
                </p>
                <p className="mt-1 font-heading text-lg font-bold uppercase leading-snug text-foreground">
                  {h.value[isLv ? "lv" : "en"]}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {extra.note && (
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {extra.note[isLv ? "lv" : "en"]}
        </p>
      )}
    </div>
  </section>
);

const TechnologyPage = () => {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const isLv = lang === "lv";
  const tech = getTech(slug);

  if (!tech) return <Navigate to="/#tehnologijas" replace />;

  const others = techs.filter((t) => t.id !== tech.id);
  const iconSize = "h-5 w-5";

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-background py-12 md:py-16">
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
            className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16"
          >
            <div className="[&>div]:mt-0">
              <ServiceImageCarousel images={tech.images} alt={tech.name[lang]} />
            </div>

            <div>
              <SectionKicker>{tech.name[lang]}</SectionKicker>
              <h1 className="mt-3 font-heading text-2xl font-bold uppercase leading-tight text-foreground md:text-4xl">
                {tech.tagline[lang]}
              </h1>
              {tech.intro.map((p) => (
                <p key={p.en} className="mt-4 leading-relaxed text-muted-foreground">
                  {p[lang]}
                </p>
              ))}

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

          {/* Specs strip */}
          <motion.dl
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
          >
            {tech.specs.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label.en} className="bg-card p-5">
                  <Icon className={`${iconSize} text-accent`} strokeWidth={1.8} />
                  <dt className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {s.label[lang]}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-snug text-foreground">{s.value[lang]}</dd>
                </div>
              );
            })}
          </motion.dl>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-border bg-muted/30 py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl">
            <SectionKicker>{isLv ? "Priekšrocības" : "Benefits"}</SectionKicker>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
              {tech.benefitsTitle[lang]}
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tech.benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.title.en}
                  {...fadeUp}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                  className="border border-border bg-card p-6 md:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-border bg-background">
                    <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 font-heading text-base font-bold uppercase leading-snug text-foreground">
                    {b.title[lang]}
                  </h3>
                  {b.desc && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc[lang]}</p>}
                </motion.div>
              );
            })}
          </div>

          {/* Use cases */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="mt-16 max-w-2xl">
            <SectionKicker>{isLv ? "Lietojums" : "Use cases"}</SectionKicker>
            <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
              {tech.useCasesTitle[lang]}
            </h2>
          </motion.div>
          <div className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {tech.useCases.map((u) => (
              <div key={u.en} className="flex items-start gap-3 border-b border-border pb-4">
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
                <span className="text-sm leading-relaxed text-foreground md:text-base">{u[lang]}</span>
              </div>
            ))}
          </div>

          {/* Process steps (izšūšana) */}
          {tech.processSteps && tech.processSteps.length > 0 && (
            <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionKicker>{isLv ? "Process" : "Process"}</SectionKicker>
                <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
                  {tech.processTitle?.[lang]}
                </h2>
              </div>
              <ol className="space-y-8 self-center">
                {tech.processSteps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <motion.li
                      key={step.text.en}
                      {...fadeUp}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex items-start gap-5"
                    >
                      <div className="relative flex flex-col items-center">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-background font-heading text-sm font-bold text-foreground">
                          {i + 1}
                        </div>
                        {i < tech.processSteps!.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-1 pt-2">
                        <Icon className="h-5 w-5 text-accent" strokeWidth={1.8} />
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                          {step.text[lang]}
                        </p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* Films (termodruka) */}
          {tech.films && tech.films.length > 0 && (
            <div className="mt-16">
              <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="max-w-2xl">
                <SectionKicker>{isLv ? "Materiāli" : "Materials"}</SectionKicker>
                <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl">
                  {tech.filmsTitle?.[lang]}
                </h2>
              </motion.div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {tech.films.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.name.en}
                      {...fadeUp}
                      transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                      className="border border-border bg-card p-6"
                    >
                      <Icon className={`${iconSize} text-accent`} strokeWidth={1.8} />
                      <h3 className="mt-4 font-heading text-sm font-bold uppercase text-foreground">{f.name[lang]}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc[lang]}</p>
                    </motion.div>
                  );
                })}
              </div>
              {tech.filmsNote && (
                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-foreground">
                  {tech.filmsNote[lang]}
                </p>
              )}
            </div>
          )}

          {/* Note (sublimācija) */}
          {tech.note && (
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5 }}
              className="mt-16 flex items-start gap-4 border border-border bg-card p-6 md:p-8"
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={1.8} />
              <div>
                <p className="font-heading text-sm font-bold uppercase tracking-wider text-foreground">
                  {isLv ? "Svarīgi zināt" : "Good to know"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{tech.note[lang]}</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Extra sections (DTF transfēri, termokrūzes) */}
      {tech.extras?.map((extra) => (
        <ExtraSection key={extra.title.en} extra={extra} isLv={isLv} />
      ))}

      <section className="bg-background py-16 md:py-24">
        <div className="container">
          {/* Gallery */}
          <div className="border-t border-border pt-12">
            <TechGallery images={tech.images} alt={tech.name[lang]} />
          </div>

          <TechRelatedProducts techId={tech.id} />

          {/* Other technologies */}
          <div className="mt-16 border-t border-border pt-12 md:mt-24">
            <h2 className="font-heading text-xl font-bold uppercase text-foreground md:text-2xl">
              {isLv ? "Citas tehnoloģijas" : "Other technologies"}
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
