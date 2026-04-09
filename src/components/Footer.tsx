import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Lock, ShieldCheck, Share2, MessageCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ervitexLogo from "@/assets/ervitex-logo-2.svg";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

const SW = 1.2;

const SHARE_URL = "https://ervitex.lovable.app";
const SHARE_TEXT = "Ervitex – apģērbu personalizācija un vairumtirdzniecība";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const socials = [
  { Icon: FacebookIcon, href: "https://www.facebook.com/ervitex", label: "Facebook" },
  { Icon: InstagramIcon, href: "https://www.instagram.com/t_bode_lv/", label: "Instagram" },
];

const Footer = () => {
  const { t, lang } = useLanguage();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Ervitex", text: SHARE_TEXT, url: SHARE_URL });
    } else {
      await navigator.clipboard.writeText(SHARE_URL);
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`;

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-8 md:py-16">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <img src={ervitexLogo} alt="Ervitex" className="h-7 w-auto" />
            <span className="h-5 w-px bg-primary-foreground/20" />
            <img src={stellaLogo} alt="Stanley/Stella Dealer" className="h-3.5 w-auto opacity-50" />
          </div>
          <p className="mt-2 text-xs text-primary-foreground/50">
            {lang === "lv" ? "Jūsu uzticamais apģērbu partneris" : "Your trusted apparel partner"}
          </p>
        </div>

        {/* Columns — block centered, text left-aligned */}
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-4">
            {/* Navigation */}
            <div className="space-y-2">
              <h4 className="font-heading text-[10px] font-bold uppercase text-primary-foreground/35">
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

            {/* Services */}
            <div className="space-y-2">
              <h4 className="font-heading text-[10px] font-bold uppercase text-primary-foreground/35">
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

            {/* Contact */}
            <div className="space-y-2">
              <h4 className="font-heading text-[10px] font-bold uppercase text-primary-foreground/35">
                {t("footer.contact")}
              </h4>
              <div className="flex flex-col gap-2">
                <a href="tel:+37167818282" className="inline-flex items-center gap-2 text-xs text-primary-foreground/55 hover:text-accent transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={SW} /> +371 678 18282
                </a>
                <a href="mailto:info@ervitex.lv" className="inline-flex items-center gap-2 text-xs text-primary-foreground/55 hover:text-accent transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={SW} /> info@ervitex.lv
                </a>
                <span className="inline-flex items-center gap-2 text-xs text-primary-foreground/55">
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={SW} /> Rīga, Latvia
                </span>
              </div>
            </div>

            {/* Social */}
            <div className="space-y-2">
              <h4 className="font-heading text-[10px] font-bold uppercase text-primary-foreground/35">
                {lang === "lv" ? "Sekojiet mums" : "Follow us"}
              </h4>
              <div className="flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary-foreground/10 text-primary-foreground/50 transition-all hover:border-accent/50 hover:text-accent"
                  >
                    <s.icon className="h-4 w-4" strokeWidth={SW} />
                  </a>
                ))}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary-foreground/10 text-primary-foreground/50 transition-all hover:border-accent/50 hover:text-accent"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={SW} />
                </a>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="flex h-8 w-8 items-center justify-center rounded-sm border border-primary-foreground/10 text-primary-foreground/50 transition-all hover:border-accent/50 hover:text-accent"
                >
                  <Share2 className="h-4 w-4" strokeWidth={SW} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OEKO-TEX badge */}
      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="container flex items-center justify-center gap-2 py-3">
          <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={SW} />
          <span className="text-[10px] font-heading uppercase text-primary-foreground/40 tracking-wide">OEKO-TEX® Standard 100</span>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="container flex flex-col items-center justify-center gap-2 py-4 text-center">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="text-[10px] text-primary-foreground/25">
              © {new Date().getFullYear()} SIA Ervitex. {t("footer.rights")}
            </span>
            <span className="flex items-center gap-2 text-[10px] text-primary-foreground/20">
              <span>·</span>
              <Link to="/privacy" className="hover:text-accent/60 transition-colors">
                {lang === "lv" ? "Privātuma politika" : "Privacy Policy"}
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-accent/60 transition-colors">
                {lang === "lv" ? "Lietošanas noteikumi" : "Terms of Service"}
              </Link>
              <span>·</span>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 hover:text-accent/60 transition-colors"
                aria-label="Admin access"
              >
                <Lock className="h-3 w-3" strokeWidth={SW} />
                <span>{lang === "lv" ? "Piekļuve" : "Access"}</span>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
