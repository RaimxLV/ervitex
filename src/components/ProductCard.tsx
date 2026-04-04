import { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
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
  "bottle green": "#006A4E", "kelly green": "#008000", "french navy": "#001F3F",
  "bright royal": "#4169E1", "classic red": "#DC143C", "dark olive": "#556B2F",
  aqua: "#00CED1", stone: "#A0937D", convoy: "#808080", graphite: "#4B5563",
  sapphire: "#0F52BA", emerald: "#047857", cobalt: "#0047AB", azure: "#007FFF",
  wine: "#722F37", indigo: "#4B0082", cyan: "#06B6D4", mint: "#98FB98",
  fuchsia: "#D946EF", chocolate: "#5C3317", petrol: "#005F6B", ash: "#B2BEB5",
  carbon: "#333333", slate: "#708090", frost: "#E1E8ED", lemon: "#FDE047",
  // Malfini / Clique numeric codes
  "00": "#FFFFFF", "01": "#000000", "02": "#1B2A4A", "04": "#DC2626",
  "05": "#6B7280", "06": "#2563EB", "07": "#16A34A", "08": "#EAB308",
  "09": "#EA580C", "10": "#7F1D1D", "11": "#A3A06C", "12": "#F5F0E8",
  "13": "#78350F", "14": "#EC4899", "15": "#7C3AED", "16": "#1D4ED8",
  "17": "#374151", "18": "#9CA3AF", "19": "#4B5563", "20": "#D1D5DB",
  "21": "#D4C5A9", "22": "#C2B280", "23": "#6B7234", "24": "#0D9488",
  "25": "#84CC16", "26": "#F97316", "27": "#D97706", "28": "#94A3B8",
  "29": "#800000", "30": "#006A4E", "31": "#008000", "32": "#001F3F",
  "33": "#4169E1", "34": "#DC143C", "35": "#556B2F", "36": "#808080",
  "44": "#0F52BA", "55": "#047857", "67": "#0047AB", "70": "#007FFF",
  "71": "#722F37", "80": "#4B0082", "90": "#333333", "95": "#D1D5DB",
  // Extended common names
  "hi-vis yellow": "#DFFF00", "hi-vis orange": "#FF6600", "fluorescent": "#CCFF00",
  "sky blue": "#87CEEB", "sky": "#87CEEB", "powder blue": "#B0C4DE",
  "baby blue": "#89CFF0", "midnight": "#191970", "midnight blue": "#191970",
  "dark navy": "#0A1128", "deep navy": "#0A1128", "ocean": "#006994",
  "army green": "#4B5320", "army": "#4B5320", "military green": "#4B5320",
  "forest green": "#228B22", "forest": "#228B22", "moss": "#8A9A5B",
  "rust": "#B7410E", "brick": "#CB4154", "terracotta": "#E2725B",
  "plum": "#8E4585", "lavender": "#B57EDC", "lilac": "#C8A2C8",
  "peach": "#FFCBA4", "apricot": "#FBCEB1", "salmon": "#FA8072",
  "heather grey": "#9CA3AF", "heather gray": "#9CA3AF", "marl grey": "#9CA3AF",
  "anthracite": "#383838", "dark anthracite": "#2C2C2C",
  "off white": "#FAF9F6", "ecru": "#C2B280", "vanilla": "#F3E5AB",
  "camel": "#C19A6B", "tan": "#D2B48C", "taupe": "#483C32",
  "deep black": "#000000", "jet black": "#000000", "pure white": "#FFFFFF",
  "snow white": "#FFFAFA", "signal red": "#DC2626", "fire red": "#B22222",
  "dark red": "#8B0000", "bright red": "#FF0000",
};

function getHexForColor(name: string, hexCode?: string | null): string | null {
  if (hexCode) return hexCode;
  const lower = name.toLowerCase().trim();
  // Direct match
  if (COLOR_NAME_TO_HEX[lower]) return COLOR_NAME_TO_HEX[lower];
  // Try to find a color word inside compound names like "108F Black"
  for (const [key, hex] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (lower.includes(key)) return hex;
  }
  return null;
}

const MAX_SWATCHES = 6;
const THUMB_SIZE = "h-8 w-8 sm:h-9 sm:w-9";

interface ExtendedProduct extends Product {
  colorHexCodes?: (string | null)[];
  colorImageUrls?: (string | null)[];
}

const ProductCard = ({ product }: { product: ExtendedProduct }) => {
  const { lang } = useLanguage();

  // Build slide images: product images + unique color variant images
  const slideImages = useMemo(() => {
    const imgs = [...product.images];
    const imgSet = new Set(imgs);
    product.colorImageUrls?.forEach((url) => {
      if (url && !imgSet.has(url)) {
        imgs.push(url);
        imgSet.add(url);
      }
    });
    return imgs.length > 0 ? imgs : ["/placeholder.svg"];
  }, [product.images, product.colorImageUrls]);

  const hasMultipleSlides = slideImages.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: hasMultipleSlides,
    dragFree: false,
    active: hasMultipleSlides,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Color swatches
  const swatches = product.colors.slice(0, MAX_SWATCHES).map((color, i) => ({
    name: color,
    hex: getHexForColor(color, product.colorHexCodes?.[i]),
    imageUrl: product.colorImageUrls?.[i] || null,
  }));
  const extraColors = Math.max(0, product.colors.length - MAX_SWATCHES);

  // Click swatch → scroll to matching slide
  const handleSwatchClick = useCallback((e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = swatches[idx]?.imageUrl;
    if (url && emblaApi) {
      const slideIdx = slideImages.indexOf(url);
      if (slideIdx >= 0) emblaApi.scrollTo(slideIdx);
    }
  }, [swatches, slideImages, emblaApi]);

  const price = product.retailPrice;
  const hasPrice = price && price > 0;

  // Cap pagination dots for cards with many images
  const maxDots = 8;
  const showDots = hasMultipleSlides && slideImages.length <= maxDots;

  return (
    <div className="group relative flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        {/* Carousel Image Area */}
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="h-full w-full" ref={emblaRef}>
            <div className="flex h-full">
              {slideImages.map((src, i) => (
                <div key={i} className="relative h-full min-w-0 flex-[0_0_100%]">
                  <img
                    src={src}
                    alt={`${product.name[lang]} ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Badges */}
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
            {product.new && (
              <Badge className="bg-accent text-accent-foreground font-heading text-[8px] sm:text-[10px] uppercase tracking-widest shadow-lg px-1.5 sm:px-2">
                {lang === "lv" ? "Jaunums" : "New"}
              </Badge>
            )}
            {product.featured && (
              <Badge className="bg-foreground text-background font-heading text-[8px] sm:text-[10px] uppercase tracking-widest shadow-lg px-1.5 sm:px-2">
                {lang === "lv" ? "Populārs" : "Popular"}
              </Badge>
            )}
          </div>

          {/* Desktop hover arrows */}
          {hasMultipleSlides && isHovered && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-1.5 top-1/2 z-10 -translate-y-1/2 hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition-opacity hover:bg-background"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Pagination dots — only if ≤ maxDots slides */}
          {showDots && (
            <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 flex gap-1">
              {slideImages.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "block rounded-full transition-all duration-200",
                    i === selectedIndex
                      ? "h-1.5 w-4 bg-accent"
                      : "h-1.5 w-1.5 bg-background/60"
                  )}
                />
              ))}
            </div>
          )}

          {/* Progress bar for many slides */}
          {hasMultipleSlides && !showDots && (
            <div className="absolute bottom-2 left-3 right-3 z-10">
              <div className="h-0.5 w-full rounded-full bg-background/30">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-200"
                  style={{ width: `${((selectedIndex + 1) / slideImages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Hover CTA — desktop only */}
          <div className="absolute bottom-6 left-0 right-0 hidden items-center justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 sm:flex">
            <span className="flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-lg font-heading">
              {lang === "lv" ? "Apskatīt" : "View"} <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
          {product.brand && (
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              {product.brand}
            </span>
          )}
          <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wide text-foreground transition-colors duration-200 group-hover:text-accent line-clamp-2 leading-tight">
            {product.name[lang]}
          </h3>
          {hasPrice ? (
            <p className="font-heading text-sm sm:text-base font-black text-accent">
              €{price.toFixed(2)}
              <span className="ml-1 text-[9px] sm:text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                {lang === "lv" ? "ar PVN" : "incl. VAT"}
              </span>
            </p>
          ) : (
            <p className="font-heading text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {lang === "lv" ? "Cena pēc pieprasījuma" : "Request quote"}
            </p>
          )}
        </div>
      </Link>

      {/* Variant thumbnails */}
      {swatches.length > 0 && (
        <div className="flex items-center gap-1 pt-1.5 sm:gap-1.5">
          {swatches.map((swatch, idx) => {
            const isActive = selectedIndex >= 0 && swatch.imageUrl && slideImages[selectedIndex] === swatch.imageUrl;
            const thumbSrc = swatch.imageUrl || (swatch.hex ? null : null);
            return (
              <button
                key={`${swatch.name}-${idx}`}
                title={swatch.name}
                onClick={(e) => handleSwatchClick(e, idx)}
                className={cn(
                  THUMB_SIZE,
                  "rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-110",
                  isActive
                    ? "ring-2 ring-accent ring-offset-1 ring-offset-background shadow-md"
                    : "ring-1 ring-border/40"
                )}
              >
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={swatch.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : swatch.hex ? (
                  <span
                    className="block h-full w-full"
                    style={{ backgroundColor: swatch.hex }}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-muted text-[7px] font-bold text-muted-foreground">
                    {swatch.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
          {extraColors > 0 && (
            <span className="ml-0.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
              +{extraColors}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
