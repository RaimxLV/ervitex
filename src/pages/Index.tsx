import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Printer, Scissors, Palette, PenTool, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { categories, products, services } from "@/data/products";

const iconMap: Record<string, React.ReactNode> = {
  Printer: <Printer className="h-6 w-6" />,
  Scissors: <Scissors className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  PenTool: <PenTool className="h-6 w-6" />,
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(25,85%,55%)_0%,transparent_50%)]" />
        </div>
        <div className="container relative py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              Premium Textile
              <br />
              <span className="text-accent">Solutions</span>
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/70 md:text-xl">
              Wholesale clothing, accessories, and professional printing services for businesses across Europe. Quality you can trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/catalog">
                  Browse Catalog <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/contact">Get a Quote</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16 md:py-24">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Product Categories
          </h2>
          <p className="mt-2 text-muted-foreground">Explore our complete range of wholesale textiles</p>
        </motion.div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <CategoryCard category={cat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Featured Products</h2>
              <p className="mt-2 text-muted-foreground">Our most popular items for custom branding</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/catalog">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/catalog">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-16 md:py-24">
        <motion.div {...fadeUp} className="text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">Our Services</h2>
          <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
            From concept to finished product — we handle printing, embroidery, and design
          </p>
        </motion.div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-lg border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-card-foreground">{service.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">Why Choose Ervitex</h2>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "20+ Years Experience", desc: "Trusted textile partner since 2003 with deep industry expertise." },
              { title: "Fast Turnaround", desc: "Efficient production and reliable delivery across Europe." },
              { title: "Premium Quality", desc: "Only certified materials and professional-grade printing." },
              { title: "Flexible Orders", desc: "From 10 to 10,000 pieces — we scale with your needs." },
              { title: "In-House Production", desc: "Screen printing, embroidery, and sublimation under one roof." },
              { title: "Expert Support", desc: "Dedicated account managers for personalized service." },
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
                  <h3 className="font-body text-sm font-semibold text-primary-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-primary-foreground/60">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center md:py-24">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
            Ready to elevate your brand?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Get in touch for a personalized quote. We'll help you find the perfect textile solutions.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link to="/contact">Contact Us Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
};

export default Index;
