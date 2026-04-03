import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";

const COLOR_NAME_TO_HEX: Record<string, string> = {
  white: "#FFFFFF", black: "#000000", navy: "#1B2A4A", red: "#DC2626",
  grey: "#6B7280", gray: "#6B7280", blue: "#2563EB", green: "#16A34A",
  yellow: "#EAB308", orange: "#EA580C", burgundy: "#7F1D1D", khaki: "#A3A06C",
  natural: "#F5F0E8", brown: "#78350F", pink: "#EC4899", purple: "#7C3AED",
  royal: "#1D4ED8", "royal blue": "#1D4ED8", charcoal: "#374151",
  "grey heather": "#9CA3AF", "dark grey": "#4B5563", "light grey": "#D1D5DB",
  beige: "#D4C5A9", sand: "#C2B280", olive: "#6B7234", teal: "#0D9488",
  turquoise: "#06B6D4", lime: "#84CC16", coral: "#F97316", gold: "#D97706",
  silver: "#94A3B8", cream: "#FFFDD0", ivory: "#FFFFF0", maroon: "#800000",
};

function getHexForColor(name: string, hexCode?: string | null): string | null {
  if (hexCode) return hexCode;
  const lower = name.toLowerCase().trim();
  return COLOR_NAME_TO_HEX[lower] || null;
}

const MAX_SWATCHES = 6;

const ProductCard = ({ product }: { product: Product }) => {
  const { lang } = useLanguage();

  const swatches = product.colors.slice(0, MAX_SWATCHES).map((color, i) => ({
    name: color,
    hex: getHexForColor(color, product.colorHexCodes?.[i]),
  }));
  const extraColors = Math.max(0, product.colors.length - MAX_SWATCHES);

  const price = product.retailPrice;
  const hasPrice = price && price > 0;

  return (
    <div className="group relative flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
          <img
            src={product.images[0]}
            alt={product.name[lang]}
            className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.new && (
              <Badge className="bg-accent text-accent-foreground font-heading text-[10px] uppercase tracking-widest shadow-lg">
                {lang === "lv" ? "Jaunums" : "New"}
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-foreground text-background font-heading text-[10px] uppercase tracking-widest shadow-lg">
                {lang === "lv" ? "Populārs" : "Popular"}
              </Badge>
            )}
          </div>

          {/* Hover CTA */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center p-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <span className="flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-lg font-heading">
              {lang === "lv" ? "Apskatīt" : "View"} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 space-y-2">
          {/* Brand */}
          {product.brand && (
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {product.brand}
            </span>
          )}

          {/* Name */}
          <h3 className="font-heading text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 group-hover:text-accent line-clamp-2">
            {product.name[lang]}
          </h3>

          {/* Price */}
          {hasPrice && (
            <p className="font-heading text-base font-black text-accent">
              €{price.toFixed(2)}
              <span className="ml-1 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                {lang === "lv" ? "ar PVN" : "incl. VAT"}
              </span>
            </p>
          )}

          {/* Color swatches */}
          {swatches.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {swatches.map((swatch) => (
                <span
                  key={swatch.name}
                  title={swatch.name}
                  className={cn(
                    "h-4 w-4 rounded-full border border-border/50 shadow-sm transition-transform duration-200 hover:scale-125",
                    !swatch.hex && "bg-muted"
                  )}
                  style={swatch.hex ? { backgroundColor: swatch.hex } : undefined}
                />
              ))}
              {extraColors > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground">+{extraColors}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
