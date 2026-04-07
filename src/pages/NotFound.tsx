import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLanguage } from "@/i18n/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="flex min-h-[70vh] items-center justify-center bg-primary text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-6"
        >
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.4em] text-accent mb-4">
            {lang === "lv" ? "Lapa nav atrasta" : "Page not found"}
          </p>
          <h1 className="font-heading text-8xl font-black text-primary-foreground/10 md:text-[12rem] leading-none select-none">
            404
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/60 max-w-md mx-auto">
            {lang === "lv"
              ? "Diemžēl šī lapa neeksistē vai ir pārvietota."
              : "Sorry, this page doesn't exist or has been moved."}
          </p>
          <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" strokeWidth={1.2} />
              {lang === "lv" ? "Uz sākumu" : "Back to Home"}
            </Link>
          </Button>
        </motion.div>
      </section>
    </Layout>
  );
};

export default NotFound;
