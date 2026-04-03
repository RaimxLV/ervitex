import { motion } from "framer-motion";
import { Target, Users, Award, Factory } from "lucide-react";
import Layout from "@/components/Layout";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-4xl font-bold text-primary-foreground md:text-5xl">About Ervitex</h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/70">
              For over 20 years, SIA Ervitex has been a trusted partner for businesses seeking high-quality wholesale clothing, accessories, and professional textile printing services across the Baltic region and Europe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div {...fadeUp}>
            <h2 className="font-heading text-3xl font-bold text-foreground">Our Story</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2003 in Riga, Latvia, Ervitex started as a small wholesale textile supplier with a vision: to provide businesses of all sizes access to premium quality clothing at competitive wholesale prices.
              </p>
              <p>
                Over the years, we expanded our services to include professional screen printing, embroidery, and sublimation — becoming a one-stop shop for branded corporate and promotional apparel.
              </p>
              <p>
                Today, we serve hundreds of clients across the Baltic states and beyond, from small businesses ordering their first branded polo shirts to large corporations requiring thousands of custom workwear pieces.
              </p>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="relative">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"
              alt="Textile production"
              className="rounded-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container">
          <motion.h2 {...fadeUp} className="text-center font-heading text-3xl font-bold text-foreground">
            What Drives Us
          </motion.h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <Target className="h-8 w-8" />, title: "Precision", desc: "Every detail matters — from thread count to print alignment." },
              { icon: <Users className="h-8 w-8" />, title: "Partnership", desc: "We grow when our clients grow. Your success is our mission." },
              { icon: <Award className="h-8 w-8" />, title: "Quality", desc: "Only certified materials from trusted European suppliers." },
              { icon: <Factory className="h-8 w-8" />, title: "Capacity", desc: "In-house production handles orders from 10 to 10,000 pieces." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container py-16 md:py-24">
        <div className="grid gap-8 text-center sm:grid-cols-4">
          {[
            { num: "20+", label: "Years of Experience" },
            { num: "500+", label: "Active Clients" },
            { num: "1M+", label: "Items Delivered" },
            { num: "50+", label: "Product Lines" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="font-heading text-4xl font-bold text-accent">{stat.num}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
