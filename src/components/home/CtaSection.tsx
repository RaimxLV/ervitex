import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const CtaSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-primary py-20 md:py-28">
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-accent/15 to-transparent" />
      <div className="absolute bottom-0 right-0 h-1 w-32 bg-accent" />
      <div className="absolute bottom-0 right-0 w-1 h-32 bg-accent" />

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold uppercase text-primary-foreground md:text-5xl">
            {lang === "lv" ? "Gatavi sākt?" : "Ready to Start?"}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-primary-foreground/50 md:text-base">
            {lang === "lv"
              ? "Sazinieties ar mums personalizētam piedāvājumam. Mēs palīdzēsim atrast ideālo tekstila risinājumu jūsu biznesam."
              : "Get in touch for a personalized quote. We'll help you find the perfect textile solution for your business."}
          </p>
          <Button
            size="lg"
            className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase rounded-none px-10 h-12"
            asChild
          >
            <Link to="/contact">
              {lang === "lv" ? "Sazināties ar mums" : "Contact Us"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
