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
};

function getHexForColor(name: string, hexCode?: string | null): string | null {
  if (hexCode) return hexCode;
  return COLOR_NAME_TO_HEX[name.toLowerCase().trim()] || null;
}

const MAX_SWATCHES = 6;

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

          {/* Pagination dots */}
          {hasMultipleSlides && (
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
          {hasPrice && (
            <p className="font-heading text-sm sm:text-base font-black text-accent">
              €{price.toFixed(2)}
              <span className="ml-1 text-[9px] sm:text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                {lang === "lv" ? "ar PVN" : "incl. VAT"}
              </span>
            </p>
          )}
        </div>
      </Link>

      {/* Color swatches */}
      {swatches.length > 0 && (
        <div className="flex items-center gap-1 pt-1 sm:gap-1.5">
          {swatches.map((swatch, idx) => (
            <button
              key={swatch.name}
              title={swatch.name}
              onClick={(e) => handleSwatchClick(e, idx)}
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border shadow-sm transition-transform duration-200 hover:scale-125",
                swatch.hex
                  ? "border-border/50"
                  : "border-border bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/40"
              )}
              style={swatch.hex ? { backgroundColor: swatch.hex } : undefined}
            />
          ))}
          {extraColors > 0 && (
            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground">+{extraColors}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
