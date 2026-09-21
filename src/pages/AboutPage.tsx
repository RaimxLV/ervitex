import { motion } from "framer-motion";
import { BadgeCheck, BriefcaseBusiness, Printer, ShieldCheck } from "lucide-react";
import Layout from "@/components/Layout";
import PageIntro from "@/components/PageIntro";
import AbandonedStoryScene from "@/components/about/AbandonedStoryScene";
import { useLanguage } from "@/i18n/LanguageContext";

const SW = 1.2;

const AboutPage = () => {
  const { t, lang } = useLanguage();

  return (
    <Layout>
      <PageIntro
        title={t("about.title")}
        subtitle={t("about.heroText")}
        eyebrow={lang === "lv" ? "Uzņēmuma profils" : "Company profile"}
      />

      <AbandonedStoryScene>
      <div className="container space-y-8 py-20 text-primary-foreground md:space-y-10 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl rounded-xl border border-primary-foreground/15 bg-primary/75 p-7 shadow-xl shadow-black/20 backdrop-blur-md md:p-10"
        >
          <p className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-accent">
            {t("about.storyKicker")}
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold uppercase text-foreground md:text-4xl [text-wrap:balance]">
            {t("about.storyHeadline")}
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-primary-foreground/80 [text-wrap:pretty]">
            <p className="text-lg text-primary-foreground">{t("about.story1")}</p>
            <p>{t("about.story2")}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-px overflow-hidden rounded-xl border border-primary-foreground/15 bg-primary-foreground/20 shadow-xl shadow-black/20 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { title: t("about.highlight1Title"), desc: t("about.highlight1Desc") },
            { title: t("about.highlight2Title"), desc: t("about.highlight2Desc") },
            { title: t("about.highlight3Title"), desc: t("about.highlight3Desc") },
            { title: t("about.highlight4Title"), desc: t("about.highlight4Desc") },
          ].map((item, i) => (
            <div key={i} className="bg-primary/75 p-6 backdrop-blur-md">
              <div className="h-1 w-8 bg-accent" />
              <h3 className="mt-4 font-heading text-sm font-bold uppercase text-primary-foreground [text-wrap:balance]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/75 [text-wrap:pretty]">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-px overflow-hidden rounded-xl border border-primary-foreground/15 bg-primary-foreground/20 shadow-xl shadow-black/20 md:grid-cols-2"
        >
          <article className="bg-primary/75 p-7 backdrop-blur-md md:p-10">
            <h3 className="font-heading text-xl font-bold uppercase text-primary-foreground [text-wrap:balance]">
              {t("about.blockStabilityTitle")}
            </h3>
            <div className="mt-4 space-y-4 leading-relaxed text-primary-foreground/75 [text-wrap:pretty]">
              <p>{t("about.blockStabilityBody1")}</p>
              <p>{t("about.blockStabilityBody2")}</p>
            </div>
          </article>
          <article className="bg-primary/75 p-7 backdrop-blur-md md:p-10">
            <h3 className="font-heading text-xl font-bold uppercase text-primary-foreground [text-wrap:balance]">
              {t("about.blockCapacityTitle")}
            </h3>
            <div className="mt-4 space-y-4 leading-relaxed text-primary-foreground/75 [text-wrap:pretty]">
              <p>{t("about.blockCapacityBody1")}</p>
              <p>{t("about.blockCapacityBody2")}</p>
            </div>
          </article>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-primary-foreground/15 border-l-4 border-l-accent bg-primary/75 p-7 shadow-xl shadow-black/20 backdrop-blur-md md:p-10"
        >
          <h3 className="font-heading text-xl font-bold uppercase text-primary-foreground [text-wrap:balance]">
            {t("about.blockPartnerTitle")}
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-primary-foreground/80 [text-wrap:pretty]">
            {t("about.story3")}
          </p>
        </motion.div>
      </div>
      </AbandonedStoryScene>


      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-3xl font-bold uppercase text-foreground md:text-4xl"
          >
            {t("about.valuesTitle")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {[
              { icon: BriefcaseBusiness, motionClass: "group-hover:-translate-y-0.5", title: t("about.precision"), desc: t("about.precisionDesc"), surface: "bg-value-blue-soft", accent: "text-value-blue", border: "group-hover:border-value-blue/35" },
              { icon: Printer, motionClass: "group-hover:scale-110", title: t("about.partnership"), desc: t("about.partnershipDesc"), surface: "bg-value-cyan-soft", accent: "text-value-cyan", border: "group-hover:border-value-cyan/35" },
              { icon: BadgeCheck, motionClass: "group-hover:-rotate-6 group-hover:scale-110", title: t("about.quality"), desc: t("about.qualityDesc"), surface: "bg-value-emerald-soft", accent: "text-value-emerald", border: "group-hover:border-value-emerald/35" },
              { icon: ShieldCheck, motionClass: "group-hover:scale-110", title: t("about.capacity"), desc: t("about.capacityDesc"), surface: "bg-value-slate-soft", accent: "text-value-slate", border: "group-hover:border-value-slate/35" },
            ].map((item, i) => {
              const [lead, detail] = item.desc.split("\n\n");

              return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, delay: i * 0.09 }}
                whileHover={{ y: -6 }}
                className={`values-card group relative flex min-h-[390px] flex-col overflow-hidden rounded-lg border border-border bg-card p-7 transition-[border-color,box-shadow] duration-300 ${item.border}`}
              >
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-lg ${item.surface} ${item.accent}`}>
                  <item.icon className={`h-6 w-6 transition-transform duration-500 ${item.motionClass}`} strokeWidth={SW} />
                </div>
                <h3 className="mt-8 font-heading text-lg font-bold uppercase text-foreground">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-foreground/80">{lead}</p>
                {detail && <p className="mt-3 text-sm leading-relaxed text-muted-foreground [text-wrap:pretty]">{detail}</p>}
                <div className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 ${item.surface} transition-transform duration-500 group-hover:scale-x-100`} />
              </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
