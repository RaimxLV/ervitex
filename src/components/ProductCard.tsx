import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Product } from "@/data/products";

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
  "bottle green": "#006A4E", "kelly green": "#008000", "french navy": "#001F3F",
  "bright royal": "#4169E1", "classic red": "#DC143C", "dark olive": "#556B2F",
  aqua: "#00CED1", stone: "#A0937D", graphite: "#4B5563",
  sapphire: "#0F52BA", emerald: "#047857", cobalt: "#0047AB", azure: "#007FFF",
  wine: "#722F37", indigo: "#4B0082", cyan: "#06B6D4", mint: "#98FB98",
  fuchsia: "#D946EF", chocolate: "#5C3317", petrol: "#005F6B",
  "sky blue": "#87CEEB", "heather grey": "#9CA3AF", "heather gray": "#9CA3AF",
  "off white": "#FAF9F6", "jet black": "#000000",
};

function getHexForColor(name: string, hexCode?: string | null): string | null {
  if (hexCode) return hexCode;
  const lower = name.toLowerCase().trim();
  if (COLOR_NAME_TO_HEX[lower]) return COLOR_NAME_TO_HEX[lower];
  for (const [key, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

interface ExtendedProduct extends Product {
  colorHexCodes?: (string | null)[];
  colorImageUrls?: (string | null)[];
}

const MAX_SWATCHES = 8;

const ProductCard = ({ product }: { product: ExtendedProduct }) => {
  const { lang } = useLanguage();

  const images = useMemo(() => {
    const imgs = [...product.images];
    product.colorImageUrls?.forEach((url) => {
      if (url && !imgs.includes(url)) imgs.push(url);
    });
    return imgs;
  }, [product.images, product.colorImageUrls]);

  const main = images[0] || null;
  const over = images[1] || null;

  const swatches = useMemo(
    () =>
      product.colors.slice(0, MAX_SWATCHES).map((name, i) => ({
        name,
        hex: getHexForColor(name, product.colorHexCodes?.[i]),
      })),
    [product.colors, product.colorHexCodes]
  );
  const extraColors = Math.max(0, product.colors.length - MAX_SWATCHES);

  const price = product.retailPrice;
  const hasPrice = price && price > 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
    >
      <div className="catalog-card-media relative aspect-[3/4] overflow-hidden">
        {main ? (
          <>
            <img
              src={main}
              alt={product.name[lang]}
              loading="lazy"
              className={`absolute inset-0 h-full w-full scale-[1.08] object-contain object-center p-1 transition-opacity duration-500 ${over ? "group-hover:opacity-0" : ""}`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            {over && (
              <img
                src={over}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full scale-[1.08] object-contain object-center p-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/60">
            <span className="font-heading text-xs uppercase tracking-widest">{product.brand || "Ervitex"}</span>
            <span className="font-mono text-[10px]">{product.name[lang]}</span>
          </div>
        )}

        {product.brand && (
          <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
            {product.brand}
          </span>
        )}

        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {product.new && (
            <Badge className="bg-accent text-accent-foreground font-heading text-[9px] uppercase tracking-widest px-1.5 py-0">
              {lang === "lv" ? "Jaunums" : "New"}
            </Badge>
          )}
          {product.featured && (
            <Badge className="bg-foreground text-background font-heading text-[9px] uppercase tracking-widest px-1.5 py-0">
              {lang === "lv" ? "Populārs" : "Popular"}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="font-heading text-sm font-bold uppercase tracking-wide line-clamp-1 transition-colors group-hover:text-accent">
          {product.name[lang]}
        </h3>
        {product.description[lang] && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.description[lang]}</p>
        )}
        {swatches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {swatches.map((s, i) => (
              <span
                key={`${s.name}-${i}`}
                title={s.name}
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: s.hex || "#ccc" }}
              />
            ))}
            {extraColors > 0 && (
              <span className="text-[10px] text-muted-foreground">+{extraColors}</span>
            )}
          </div>
        )}
        <div className="pt-1">
          {hasPrice ? (
            <p className="font-heading text-sm font-black text-accent">
              €{price.toFixed(2)}
              <span className="ml-1 text-[9px] font-normal uppercase tracking-wider text-muted-foreground">
                {lang === "lv" ? "ar PVN" : "incl. VAT"}
              </span>
            </p>
          ) : (
            <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote"}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
