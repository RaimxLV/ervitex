import { forwardRef, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { bucketFromName, bucketFromHex, getBucket } from "@/lib/colorBuckets";


/**
 * Given a color name like "Black/Lime Green" and an optional stored hex,
 * return 1 or 2 display hexes so multi-tone products don't show as a single
 * flat swatch. Falls back to name-based bucket lookup when the stored hex is
 * missing or clearly generic.
 */
function displayHexes(name: string, hex?: string | null): string[] {
  const parts = (name || "")
    .split(/[\/&+]|\s-\s/)
    .map((p) => p.trim())
    .filter(Boolean);
  const hexFromName = (n: string): string | null => {
    const b = bucketFromName(n);
    return b ? getBucket(b).hex : null;
  };
  if (parts.length >= 2) {
    const a = hexFromName(parts[0]) || hex || null;
    const b = hexFromName(parts[1]) || hex || null;
    if (a && b && a.toLowerCase() !== b.toLowerCase()) return [a, b];
  }
  const provided = (hex || "").trim();
  if (provided && provided.length >= 4) {
    // Sanity check: if provided hex doesn't match the name bucket at all,
    // prefer the name-based hex (e.g. "Lime Green" stored as #000000).
    const nameBucket = bucketFromName(name);
    const hexBucket = bucketFromHex(provided);
    if (nameBucket && hexBucket && nameBucket !== hexBucket) {
      const fromName = hexFromName(name);
      if (fromName) return [fromName];
    }
    return [provided];
  }
  const fromName = hexFromName(name);
  return fromName ? [fromName] : ["#ccc"];
}


export interface CatalogModelCardProps {
  onClick?: () => void;
  href?: string;
  as?: "button" | "a";
  image: string | null;
  /** Original (unproxied) URL used if the thumbnail fails to load. */
  fallbackImage?: string | null;
  hoverImage?: string | null;
  imageAlt: string;
  /** Above-the-fold cards load immediately instead of lazily. */
  priority?: boolean;
  code?: string | null;
  brandBadge?: string | null;
  topRight?: ReactNode;
  title: string;
  subtitle?: string | null;
  swatches?: { hex: string | null; name: string; active?: boolean; onSelect?: () => void }[];
  extraSwatches?: number;
  price?: ReactNode;
  footer?: ReactNode;
  noImageLabel: string;
}

/**
 * Unified product card used by every catalog page (Stanley/Stella, NWG, PF Concept
 * and the mega catalog). Matches the PF Concept design language: white background,
 * portrait 3:4 image, model code chip, brand chip, uniform swatches and price line.
 */
const CatalogModelCard = forwardRef<HTMLButtonElement, CatalogModelCardProps>(
  (
    { onClick, image, fallbackImage, hoverImage, imageAlt, priority, code, brandBadge, topRight, title, subtitle, swatches, extraSwatches, price, footer, noImageLabel },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [ready, setReady] = useState(false);
    const [hovered, setHovered] = useState(false);
    const triedFallback = useRef(false);
    return (
      <div className="relative h-full">
      {topRight && <div className="absolute right-2 top-2 z-10">{topRight}</div>}
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        className="group flex h-full w-full flex-col overflow-hidden border border-border bg-white text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-white">
          {image ? (
            <>
              {!ready && <div className="absolute inset-0 animate-pulse bg-neutral-100" />}
              <img
                src={image}
                alt={imageAlt}
                loading={priority ? "eager" : "lazy"}
                fetchPriority={priority ? "high" : "auto"}
                decoding="async"
                onLoad={() => setReady(true)}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (fallbackImage && !triedFallback.current && fallbackImage !== image) {
                    triedFallback.current = true;
                    el.src = fallbackImage;
                    return;
                  }
                  setReady(true);
                  el.style.display = "none";
                }}
                className={`absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"} ${hoverImage ? "group-hover:opacity-0" : ""}`}
              />
              {hoverImage && hovered && (
                <img
                  src={hoverImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {noImageLabel}
            </div>
          )}
        </div>


        {(code || brandBadge) && (
          <div className="flex flex-row items-stretch border-t border-border bg-primary text-primary-foreground">
            {code && (
              <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden px-2 py-1 sm:px-3 sm:py-1.5">
                <span
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="truncate font-mono text-[11px] font-bold uppercase tracking-wider select-all cursor-text sm:text-sm"
                >
                  {code}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={copied ? "Nokopēts" : "Kopēt kodu"}
                  title={copied ? "Nokopēts" : "Kopēt kodu"}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    navigator.clipboard?.writeText(code).then(() => {
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1500);
                    });
                  }}
                  className="shrink-0 rounded p-0.5 opacity-70 transition hover:bg-primary-foreground/15 hover:opacity-100"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </span>
              </span>
            )}
            {brandBadge && (
              <span className="flex max-w-[45%] items-center truncate border-l border-primary-foreground/20 px-2 py-1 font-heading text-[9px] font-bold uppercase tracking-wider sm:px-2.5 sm:py-1.5 sm:text-[10px]">
                {brandBadge}
              </span>
            )}
          </div>
        )}


        <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
          <h3 className="line-clamp-2 min-h-[2.1em] font-heading text-[12px] font-bold uppercase leading-tight tracking-wide transition-colors group-hover:text-accent sm:text-sm">
            {title}
          </h3>

          {subtitle && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground sm:line-clamp-2 sm:text-xs">{subtitle}</p>
          )}

          {swatches && swatches.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {swatches.slice(0, 8).map((s, i) => {
                const hexes = displayHexes(s.name, s.hex);
                const primary = hexes[0];
                const secondary = hexes[1];
                const isLightHex = (bg: string) => {
                  const hx = bg.replace("#", "");
                  if (hx.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(hx)) return false;
                  const r = parseInt(hx.slice(0, 2), 16);
                  const g = parseInt(hx.slice(2, 4), 16);
                  const b = parseInt(hx.slice(4, 6), 16);
                  return (r * 299 + g * 587 + b * 114) / 1000 > 225;
                };
                const isLight = isLightHex(primary) && (!secondary || isLightHex(secondary));
                const clickable = !!s.onSelect;
                const bgStyle: React.CSSProperties = secondary
                  ? { background: `linear-gradient(90deg, ${primary} 0 50%, ${secondary} 50% 100%)` }
                  : { backgroundColor: primary };
                return (
                  <span
                    key={`${s.name}-${i}`}
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : -1}
                    title={s.name}
                    aria-label={s.name}
                    onPointerDown={clickable ? (e) => e.stopPropagation() : undefined}
                    onTouchStart={clickable ? (e) => e.stopPropagation() : undefined}
                    onClick={
                      clickable
                        ? (e) => { e.stopPropagation(); e.preventDefault(); s.onSelect!(); }
                        : undefined
                    }
                    className={`inline-block h-6 w-6 rounded-full transition-transform sm:h-4 sm:w-4 ${
                      s.active
                        ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110"
                        : isLight
                          ? "border border-neutral-500"
                          : "border border-black/20"
                    } ${clickable ? "cursor-pointer touch-manipulation hover:scale-110" : ""}`}
                    style={bgStyle}
                  />
                );

              })}
              {extraSwatches && extraSwatches > 0 ? (
                <span className="text-[10px] leading-none text-muted-foreground">+{extraSwatches}</span>
              ) : null}
            </div>
          )}

          <div className="mt-auto pt-1">{price}</div>
          {footer}
        </div>
      </button>
      </div>
    );
  }
);

CatalogModelCard.displayName = "CatalogModelCard";

export default CatalogModelCard;
