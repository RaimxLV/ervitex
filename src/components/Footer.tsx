import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ervitexLogo from "@/assets/ervitex-logo.png";

const Footer = () => {
  const { t, lang } = useLanguage();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-8 md:py-16">
        {/* Logo */}
        <div className="mb-6">
          <img src={ervitexLogo} alt="Ervitex" className="h-7 w-auto brightness-0 invert" />
          <p className="mt-2 text-xs text-primary-foreground/50 max-w-[220px]">
            {lang === "lv" ? "Jūsu uzticamais apģērbu partneris" : "Your trusted apparel partner"}
          </p>
        </div>

        {/* 2-column grid for nav + services */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4">
          <div className="space-y-2">
            <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground/35">
              {t("footer.navigation")}
            </h4>
            <nav className="flex flex-col gap-1.5">
              {[
                { key: "nav.home" as const, path: "/" },
                { key: "nav.catalog" as const, path: "/catalog" },
                { key: "nav.services" as const, path: "/services" },
                { key: "nav.about" as const, path: "/about" },
                { key: "nav.contact" as const, path: "/contact" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="text-xs text-primary-foreground/55 transition-colors hover:text-accent">
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-2">
            <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground/35">
              {t("footer.services")}
            </h4>
            <nav className="flex flex-col gap-1.5">
              {[
                { lv: "Sietspiede", en: "Screen Printing" },
                { lv: "Izšūšana", en: "Embroidery" },
                { lv: "Sublimācija", en: "Sublimation" },
                { lv: "DTF druka", en: "DTF Printing" },
                { lv: "Termodruka", en: "Heat Transfer" },
              ].map((s) => (
                <span key={s.en} className="text-xs text-primary-foreground/55">
                  {lang === "lv" ? s.lv : s.en}
                </span>
              ))}
            </nav>
          </div>

          {/* Contact - spans full width on mobile, 1 col on desktop */}
          <div className="col-span-2 md:col-span-2 space-y-2 mt-1 md:mt-0">
            <h4 className="font-heading text-[10px] font-bold uppercase tracking-widest text-primary-foreground/35">
              {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-2">
              <a href="tel:+37167818282" className="inline-flex items-center gap-2 text-xs text-primary-foreground/55 hover:text-accent transition-colors">
                <Phone className="h-3.5 w-3.5 shrink-0" /> +371 678 18282
              </a>
              <a href="mailto:info@ervitex.lv" className="inline-flex items-center gap-2 text-xs text-primary-foreground/55 hover:text-accent transition-colors">
                <Mail className="h-3.5 w-3.5 shrink-0" /> info@ervitex.lv
              </a>
              <span className="inline-flex items-center gap-2 text-xs text-primary-foreground/55">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> Rīga, Latvia
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-footer with copyright + discreet admin link */}
      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="container flex items-center justify-between py-4">
          <span className="text-[10px] text-primary-foreground/25">
            © {new Date().getFullYear()} SIA Ervitex. {t("footer.rights")}
          </span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-[10px] text-primary-foreground/20 hover:text-accent/60 transition-colors"
            aria-label="Admin access"
          >
            <Lock className="h-3 w-3" />
            <span className="hidden sm:inline">{lang === "lv" ? "Piekļuve" : "Access"}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
