import { useState } from "react";
import ervitexLogo from "@/assets/ervitex-logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

const navItems = [
  { key: "nav.home" as const, path: "/" },
  { key: "nav.catalog" as const, path: "/catalog" },
  { key: "nav.services" as const, path: "/services" },
  { key: "nav.about" as const, path: "/about" },
  { key: "nav.contact" as const, path: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary text-primary-foreground">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center">
          <img src={ervitexLogo} alt="Ervitex" className="h-8 w-auto brightness-0 invert md:h-10" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium uppercase tracking-wider transition-colors hover:text-accent ${
                location.pathname === item.path
                  ? "text-accent"
                  : "text-primary-foreground/70"
              }`}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {/* Search */}
          {searchOpen ? (
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("header.search")}
                className="h-9 w-48 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Language switcher */}
          <div className="flex items-center rounded border border-primary-foreground/20 text-xs font-medium">
            <button
              onClick={() => setLang("lv")}
              className={`px-2 py-1.5 transition-colors ${lang === "lv" ? "bg-accent text-accent-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"}`}
            >
              LV
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2 py-1.5 transition-colors ${lang === "en" ? "bg-accent text-accent-foreground" : "text-primary-foreground/70 hover:text-primary-foreground"}`}
            >
              EN
            </button>
          </div>

          <a href="tel:+37167818282" className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground">
            <Phone className="h-4 w-4" />
            +371 678 18282
          </a>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/contact">{t("header.quote")}</Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center rounded border border-primary-foreground/20 text-xs font-medium">
            <button
              onClick={() => setLang("lv")}
              className={`px-1.5 py-1 transition-colors ${lang === "lv" ? "bg-accent text-accent-foreground" : "text-primary-foreground/70"}`}
            >
              LV
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 py-1 transition-colors ${lang === "en" ? "bg-accent text-accent-foreground" : "text-primary-foreground/70"}`}
            >
              EN
            </button>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-primary-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary px-4 pb-6 pt-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium uppercase tracking-wider transition-colors ${
                  location.pathname === item.path
                    ? "text-accent"
                    : "text-primary-foreground/70"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact" onClick={() => setIsOpen(false)}>{t("header.quote")}</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
