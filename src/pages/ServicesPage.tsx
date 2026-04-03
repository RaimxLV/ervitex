import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Grid3x3, Scissors, Palette, Layers, Flame, PenTool, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { services } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, React.ReactNode> = {
  Grid3x3: <Grid3x3 className="h-10 w-10" />,
  Scissors: <Scissors className="h-10 w-10" />,
  Palette: <Palette className="h-10 w-10" />,
  Layers: <Layers className="h-10 w-10" />,
  Flame: <Flame className="h-10 w-10" />,
  PenTool: <PenTool className="h-10 w-10" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const ServicesPage = () => {
  const { lang, t } = useLanguage();

  return (
    <Layout>
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-3xl font-black uppercase tracking-wide md:text-5xl">{t("services.title")}</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/60">{t("services.subtitle")}</p>
          </motion.div>
        </div>
        <div className="mt-0 h-1 bg-accent" />
      </section>

      <section className="container py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-sm border border-border bg-card p-8 transition-all hover:border-accent hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-6 font-heading text-lg font-bold uppercase tracking-wider text-card-foreground">{service.title[lang]}</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{service.description[lang]}</p>
              <Button variant="ghost" className="mt-6 px-0 text-xs font-heading uppercase tracking-widest text-accent hover:text-accent/80 hover:bg-transparent" asChild>
                <Link to="/contact">
                  {t("services.learnMore")} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide md:text-4xl">{t("cta.title")}</h2>
            <p className="mx-auto mt-3 max-w-md text-primary-foreground/50">{t("cta.subtitle")}</p>
            <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
              <Link to="/contact">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
