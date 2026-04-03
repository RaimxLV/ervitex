import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ervitexLogo from "@/assets/ervitex-logo.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <img src={ervitexLogo} alt="Ervitex" className="h-8 w-auto brightness-0 invert" />
            <p className="text-sm text-primary-foreground/60">
              {t("footer.desc")}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-primary-foreground/40">{t("footer.navigation")}</h4>
            <nav className="flex flex-col gap-2">
              {[
                { key: "nav.home" as const, path: "/" },
                { key: "nav.catalog" as const, path: "/catalog" },
                { key: "nav.services" as const, path: "/services" },
                { key: "nav.about" as const, path: "/about" },
                { key: "nav.contact" as const, path: "/contact" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="text-sm text-primary-foreground/60 transition-colors hover:text-accent">
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-primary-foreground/40">{t("footer.services")}</h4>
            <nav className="flex flex-col gap-2">
              {[
                { lv: "Sietspiede", en: "Screen Printing" },
                { lv: "Izšūšana", en: "Embroidery" },
                { lv: "Sublimācija", en: "Sublimation" },
                { lv: "DTF druka", en: "DTF Printing" },
                { lv: "Termodruka", en: "Heat Transfer" },
              ].map((s) => (
                <span key={s.en} className="text-sm text-primary-foreground/60">{s.lv}</span>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-primary-foreground/40">{t("footer.contact")}</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+37167818282" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent">
                <Phone className="h-4 w-4" /> +371 678 18282
              </a>
              <a href="mailto:info@ervitex.lv" className="flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent">
                <Mail className="h-4 w-4" /> info@ervitex.lv
              </a>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/60">
                <MapPin className="h-4 w-4 shrink-0" /> Rīga, Latvia
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/30">
          © {new Date().getFullYear()} SIA Ervitex. {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
