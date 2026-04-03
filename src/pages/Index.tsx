import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Grid3x3, Scissors, Palette, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { categories, products, services } from "@/data/products";
import { useLanguage } from "@/i18n/LanguageContext";

const iconMap: Record<string, React.ReactNode> = {
  Grid3x3: <Grid3x3 className="h-6 w-6" />,
  Scissors: <Scissors className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Index = () => {
  const { lang, t } = useLanguage();
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="container relative py-28 md:py-44">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-block border border-accent/40 px-4 py-1.5">
              <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-accent">
                {lang === "lv" ? "Apģērbu un aksesuāru vairumtirdzniecība" : "Wholesale Clothing & Accessories"}
              </span>
            </div>
            <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tight md:text-7xl lg:text-8xl">
              {t("hero.title1")}
              <br />
              <span className="text-accent">{t("hero.title2")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-primary-foreground/60 md:text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
                <Link to="/catalog">
                  {t("hero.browse")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground font-heading text-xs uppercase tracking-widest" asChild>
                <Link to="/contact">{t("hero.getQuote")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        {/* Accent line */}
        <div className="h-1 bg-accent" />
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-24">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t("categories.title")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("categories.subtitle")}</p>
        </motion.div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button variant="outline" className="font-heading text-xs uppercase tracking-widest" asChild>
            <Link to="/catalog">{t("featured.viewAll")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">{t("featured.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("featured.subtitle")}</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex font-heading text-xs uppercase tracking-widest hover:text-accent">
              <Link to="/catalog">{t("featured.viewAll")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </motion.div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-16 md:py-24">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">{t("services.title")}</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">{t("services.subtitle")}</p>
        </motion.div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-sm border border-border bg-card p-6 transition-all hover:border-accent hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-4 font-heading text-sm font-bold uppercase tracking-wider text-card-foreground">{service.title[lang]}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.description[lang]}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-heading text-2xl font-black uppercase tracking-wide md:text-4xl">{t("why.title")}</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: t("why.experience"), desc: t("why.experienceDesc") },
              { title: t("why.turnaround"), desc: t("why.turnaroundDesc") },
              { title: t("why.quality"), desc: t("why.qualityDesc") },
              { title: t("why.flexible"), desc: t("why.flexibleDesc") },
              { title: t("why.inHouse"), desc: t("why.inHouseDesc") },
              { title: t("why.support"), desc: t("why.supportDesc") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-3"
              >
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h3 className="font-heading text-sm font-bold uppercase tracking-wider">{item.title}</h3>
                  <p className="mt-1 text-sm text-primary-foreground/50">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center md:py-24">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-2xl font-black uppercase tracking-wide text-foreground md:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t("cta.subtitle")}
          </p>
          <Button size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest" asChild>
            <Link to="/contact">{t("cta.button")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
