import { forwardRef, useState } from "react";
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
  hoverImage?: string | null;
  imageAlt: string;
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
    { onClick, image, hoverImage, imageAlt, code, brandBadge, topRight, title, subtitle, swatches, extraSwatches, price, footer, noImageLabel },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="group flex h-full flex-col overflow-hidden border border-border bg-white text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-white">
          {image ? (
            <>
              <img
                src={image}
                alt={imageAlt}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                className={`absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-500 ${hoverImage ? "group-hover:opacity-0" : ""}`}
              />
              {hoverImage && (
                <img
                  src={hoverImage}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {noImageLabel}
            </div>
          )}
          {topRight}
        </div>

        {(code || brandBadge) && (
          <div className="flex flex-col items-stretch border-t border-border bg-primary text-primary-foreground sm:flex-row">
            {code && (
              <span className="flex flex-1 items-center gap-1.5 overflow-hidden px-3 py-1.5">
                <span
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="truncate font-mono text-xs font-bold uppercase tracking-wider select-all cursor-text sm:text-sm"
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
              <span className="flex items-center border-t border-primary-foreground/20 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-wider sm:border-l sm:border-t-0 sm:px-2.5 sm:py-1.5">
                {brandBadge}
              </span>
            )}
          </div>
        )}


        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-1 font-heading text-sm font-bold uppercase tracking-wide transition-colors group-hover:text-accent">
            {title}
          </h3>
          {subtitle && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
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
                    onClick={
                      clickable
                        ? (e) => { e.stopPropagation(); s.onSelect!(); }
                        : undefined
                    }
                    className={`inline-block h-4 w-4 rounded-full transition-transform ${
                      s.active
                        ? "ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110"
                        : isLight
                          ? "border border-neutral-500"
                          : "border border-black/20"
                    } ${clickable ? "cursor-pointer hover:scale-110" : ""}`}
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
    );
  }
);

CatalogModelCard.displayName = "CatalogModelCard";

export default CatalogModelCard;
