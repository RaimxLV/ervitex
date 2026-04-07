import { useState, useRef, useEffect } from "react";
import ervitexLogo from "@/assets/ervitex-logo-2.svg";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

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
  const [searchValue, setSearchValue] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success(lang === "lv" ? "Saite nokopēta!" : "Link copied!");
    setShareOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue("");
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-primary/80 backdrop-blur-md text-primary-foreground">
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img src={ervitexLogo} alt="Ervitex" className="h-8 w-auto md:h-10" />
          <span className="h-5 w-px bg-primary-foreground/20 sm:h-6" />
          <img src={stellaLogo} alt="Stanley/Stella Dealer" className="h-4 w-auto opacity-70 sm:h-5 md:h-6" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium uppercase transition-colors hover:text-accent ${
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
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                placeholder={t("header.search")}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-9 w-48 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                autoFocus
                onBlur={() => { if (!searchValue) setSearchOpen(false); }}
              />
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Search className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}

          {/* Share dropdown */}
          <div className="relative" ref={shareRef}>
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              aria-label={lang === "lv" ? "Dalīties" : "Share"}
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-sm border border-border bg-background shadow-lg z-50 py-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setShareOpen(false)}
                >
                  <svg className="h-4 w-4 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setShareOpen(false)}
                >
                  <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => setShareOpen(false)}
                >
                  <svg className="h-4 w-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  {lang === "lv" ? "Kopēt saiti" : "Copy link"}
                </button>
              </div>
            )}
          </div>

          {/* Language switcher */}
          <div className="flex items-center border border-primary-foreground/20 text-xs font-medium">
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
            <Phone className="h-4 w-4" strokeWidth={1.5} />
            +371 678 18282
          </a>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/contact">{t("header.quote")}</Link>
          </Button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center border border-primary-foreground/20 text-xs font-medium">
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
            className="inline-flex items-center justify-center p-2 text-primary-foreground"
          >
            {isOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {isOpen && (
        <div className="border-t border-primary-foreground/10 bg-primary px-4 pb-6 pt-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/40" strokeWidth={1.5} />
              <Input
                placeholder={lang === "lv" ? "Meklēt produktus..." : "Search products..."}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-10 border-primary-foreground/20 bg-primary-foreground/10 pl-9 text-primary-foreground placeholder:text-primary-foreground/40"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium uppercase transition-colors ${
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
