import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Lock, ShieldCheck, Share2, MessageCircle, Clock, Calculator } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ervitexLogo from "@/assets/ervitex-logo-2.svg";
import stellaLogo from "@/assets/stella-dealer-logo-white.png";

const SW = 1.5;

const SHARE_URL = "https://www.ervitex.lv";
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
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16 md:py-24">
        {/* 4 columns */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-16 xl:gap-x-24">
          {/* Col 1 — Logo + socials */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={ervitexLogo} alt="Ervitex" className="h-10 w-auto" />
              <span className="h-6 w-px bg-primary-foreground/25" />
              <img src={stellaLogo} alt="Stanley/Stella Dealer" className="h-4 w-auto opacity-60" />
            </Link>
            <div className="flex items-center gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-foreground/15 text-primary-foreground/70 transition-all hover:border-accent hover:text-accent"
                >
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-foreground/15 text-primary-foreground/70 transition-all hover:border-accent hover:text-accent"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={SW} />
              </a>
              <button
                onClick={handleShare}
                aria-label="Share"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-primary-foreground/15 text-primary-foreground/70 transition-all hover:border-accent hover:text-accent"
              >
                <Share2 className="h-4 w-4" strokeWidth={SW} />
              </button>
            </div>
          </div>

          {/* Col 2 — Contact info */}
          <div className="space-y-5">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-accent">
              {lang === "lv" ? "Kontaktinformācija" : "Contact"}
            </h4>
            <ul className="flex flex-col gap-4 text-[15px] leading-relaxed">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={SW} />
                <div>
                  <div className="font-semibold">
                    {lang === "lv" ? "Braslas Biznesa Centrs" : "Braslas Business Center"}
                  </div>
                  <div className="text-primary-foreground/70">
                    {lang === "lv" ? "Ieeja “D”, 2. stāvs" : "Entrance “D”, 2nd floor"}
                  </div>
                  <div className="text-primary-foreground/70">Braslas iela 29, Rīga, LV-1084</div>
                  <div className="mt-1 text-primary-foreground/60 text-sm">
                    {lang === "lv" ? "Reģ. Nr." : "Reg. No."} LV40002074377
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={SW} />
                <a href="mailto:birojs@ervitex.lv" className="font-semibold hover:text-accent transition-colors">
                  birojs@ervitex.lv
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={SW} />
                <div>
                  <a href="tel:+37167543384" className="block hover:text-accent transition-colors">+371 67543384</a>
                  <a href="tel:+37167436896" className="block hover:text-accent transition-colors">+371 67436896</a>
                  <div className="mt-1 text-primary-foreground/70 text-sm">
                    <Calculator className="mr-1 inline h-3.5 w-3.5" strokeWidth={SW} />
                    <a href="tel:+37167552540" className="hover:text-accent transition-colors">+371 67552540</a>
                    <span className="ml-1 text-primary-foreground/50">
                      ({lang === "lv" ? "grāmatvedība" : "accounting"})
                    </span>
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={SW} />
                <div>
                  <div className="text-primary-foreground/75">
                    {lang === "lv" ? "P. – C." : "Mon – Thu"}: 9:00 – 17:30
                  </div>
                  <div className="text-primary-foreground/75">
                    {lang === "lv" ? "Pk." : "Fri"}: 9:00 – 16:00
                  </div>
                  <div className="text-primary-foreground/60">
                    {lang === "lv" ? "Sest., Sv.: Slēgts" : "Sat, Sun: Closed"}
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Col 3 — Navigation + Legal */}
          <div className="space-y-5">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-accent">
              {t("footer.navigation")}
            </h4>
            <nav className="flex flex-col gap-3 text-[15px]">
              {[
                { key: "nav.home" as const, path: "/" },
                { key: "nav.catalog" as const, path: "/catalog" },
                { key: "nav.services" as const, path: "/services" },
                { key: "nav.about" as const, path: "/about" },
                { key: "nav.contact" as const, path: "/contact" },
              ].map((item) => (
                <Link key={item.path} to={item.path} className="text-primary-foreground/80 transition-colors hover:text-accent">
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="h-px w-10 bg-primary-foreground/20" />

            <ul className="flex flex-col gap-3 text-[15px]">
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {lang === "lv" ? "Lietošanas noteikumi" : "Terms of Service"}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {lang === "lv" ? "Privātuma politika" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link to="/privacy#cookies" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  {lang === "lv" ? "Sīkdatnes" : "Cookies"}
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-primary-foreground/60 hover:text-accent transition-colors"
                >
                  <Lock className="h-3.5 w-3.5" strokeWidth={SW} />
                  {lang === "lv" ? "Piekļuve" : "Access"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 — Services */}
          <div className="space-y-5">
            <h4 className="font-heading text-sm font-bold uppercase tracking-widest text-accent">
              {t("footer.services")}
            </h4>
            <ul className="flex flex-col gap-3 text-[15px] text-primary-foreground/80">
              {[
                { lv: "Sietspiede", en: "Screen Printing" },
                { lv: "Izšūšana", en: "Embroidery" },
                { lv: "Sublimācija", en: "Sublimation" },
                { lv: "DTF druka", en: "DTF Printing" },
                { lv: "Termodruka", en: "Heat Transfer" },
              ].map((s) => (
                <li key={s.en}>{lang === "lv" ? s.lv : s.en}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* OEKO-TEX badge */}
      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="container flex items-center justify-center gap-2 py-4">
          <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={SW} />
          <span className="text-[11px] font-heading uppercase text-primary-foreground/55 tracking-widest">OEKO-TEX® Standard 100</span>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="container flex flex-col items-center justify-center gap-2 py-5 text-center">
          <span className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} SIA Ervitex. {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
