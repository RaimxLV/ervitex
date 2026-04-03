import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <span className="font-heading text-2xl font-bold tracking-tight">ERVITEX</span>
            <p className="text-sm text-primary-foreground/70">
              Wholesale clothing and accessories supplier with professional printing and embroidery services since 2003.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Navigation</h4>
            <nav className="flex flex-col gap-2">
              {[{ label: "Home", path: "/" }, { label: "Catalog", path: "/catalog" }, { label: "About", path: "/about" }, { label: "Contact", path: "/contact" }].map((item) => (
                <Link key={item.path} to={item.path} className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Services</h4>
            <nav className="flex flex-col gap-2">
              {["Screen Printing", "Embroidery", "Sublimation", "Custom Design"].map((s) => (
                <span key={s} className="text-sm text-primary-foreground/70">{s}</span>
              ))}
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground/50">Contact</h4>
            <div className="flex flex-col gap-3">
              <a href="tel:+37167818282" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground">
                <Phone className="h-4 w-4" /> +371 678 18282
              </a>
              <a href="mailto:info@ervitex.lv" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground">
                <Mail className="h-4 w-4" /> info@ervitex.lv
              </a>
              <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 shrink-0" /> Rīga, Latvia
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} SIA Ervitex. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
