import ervitexWhiteLogo from "@/assets/ervitex-logo-2.svg";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGalleryNavigation } from "@/hooks/useGalleryNavigation";
import { bucketFromName, bucketFromHex, getBucket } from "@/lib/colorBuckets";
import { unproxyUrl } from "@/lib/imageProxy";
import { BrandLogo } from "@/components/BrandLogo";


const VALID_HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Given a color name like "Black/Lime Green" and an optional stored hex,
 * return 1 or 2 display hexes so multi-tone products don't show as a single
 * flat swatch. Falls back to name-based bucket lookup when the stored hex is
 * missing, invalid (some partners store "#Black") or clearly generic.
 */
function displayHexes(name: string, hex?: string | null): string[] {
  const parts = (name || "")
    .split(/[\/&+,]|\s-\s|-|\swith\s/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 1);

  // Resolve every name part to a palette bucket and keep the distinct ones in
  // order, so "Black/Lime Green" or "Navy-White" render as a split circle.
  if (parts.length >= 2) {
    const hexes: string[] = [];
    for (const p of parts) {
      const b = bucketFromName(p);
      if (!b || b === "multi") continue;
      const h = getBucket(b).hex;
      if (!hexes.includes(h)) hexes.push(h);
      if (hexes.length === 2) break;
    }
    if (hexes.length === 2) return hexes;
  }

  const provided = (hex || "").trim();
  // Only trust real hex values — partner feeds sometimes contain "#Black",
  // which CSS ignores and renders as an empty (white) circle.
  if (VALID_HEX.test(provided)) {
    // Sanity check: if provided hex doesn't match the name bucket at all,
    // prefer the name-based hex (e.g. "Lime Green" stored as #000000).
    const nameBucket = bucketFromName(name);
    const hexBucket = bucketFromHex(provided);
    if (nameBucket && nameBucket !== "multi" && hexBucket && nameBucket !== hexBucket) {
      return [getBucket(nameBucket).hex];
    }
    return [provided];
  }
  const nb = bucketFromName(name);
  if (nb === "multi") return ["MULTI"];
  return nb ? [getBucket(nb).hex] : ["#ccc"];
}

/** Background style for one swatch circle (single, two-tone or multicolour). */
function swatchBackground(name: string, hex?: string | null): React.CSSProperties {
  if ((hex || "").startsWith("linear-gradient")) return { background: hex as string };
  const hexes = displayHexes(name, hex);
  if (hexes[0] === "MULTI") return { background: getBucket("multi").hex };
  return hexes[1]
    ? { background: `linear-gradient(90deg, ${hexes[0]} 0 50%, ${hexes[1]} 50% 100%)` }
    : { backgroundColor: hexes[0] };
}




export interface CatalogModelCardProps {
  onClick?: () => void;
  href?: string;
  as?: "button" | "a";
  image: string | null;
  /** Original (unproxied) URL used if the thumbnail fails to load. */
  fallbackImage?: string | null;
  hoverImage?: string | null;
  images?: string[];
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
  /** Full-width black strip below the logo bar (sublimation cards, no code). */
  fullWidthCodeBar?: boolean;
  footer?: ReactNode;
  noImageLabel: string;
  lang?: string;
}

/**
 * Unified product card used by every catalog page (Stanley/Stella, NWG, PF Concept
 * and the mega catalog). Matches the PF Concept design language: white background,
 * portrait 3:4 image, model code chip, brand chip, uniform swatches and price line.
 */
const CatalogModelCard = forwardRef<HTMLElement, CatalogModelCardProps>(
    (
    { onClick, as, href, image, fallbackImage, hoverImage, images, imageAlt, priority, code, brandBadge, topRight, title, subtitle, swatches, extraSwatches, price, fullWidthCodeBar, footer, noImageLabel, lang = "lv" },
    ref
  ) => {
    const [copied, setCopied] = useState(false);
    const [ready, setReady] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [hoverFailed, setHoverFailed] = useState(false);
    const [hoverReady, setHoverReady] = useState(false);
    const baseImageRef = useRef<HTMLImageElement | null>(null);
    const triedFallback = useRef(false);
    const triedHoverFallback = useRef(false);
    const frames = [...new Set([image, ...(images || []), hoverImage].filter((src): src is string => Boolean(src)))];
    const [interacted, setInteracted] = useState(false);
    const gallery = useGalleryNavigation(frames, 1, interacted);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const suppressClickUntil = useRef(0);
    const showHover = gallery.index === 0 && !!hoverImage && !hoverFailed && hoverReady;
    useEffect(() => {
      setReady(Boolean(baseImageRef.current?.complete && baseImageRef.current.naturalWidth > 0));
      setHoverReady(false);
      setHoverFailed(false);
      triedFallback.current = false;
      triedHoverFallback.current = false;
    }, [image, hoverImage]);
    // Kā saite: parastais klikšķis atver šeit, Ctrl/Cmd/vidējais klikšķis atver jaunā cilnē.
    const asLink = as === "a" && !!href;
    const Tag = asLink ? "a" : "button";
    const handleClick = (e: React.MouseEvent) => {
      if (Date.now() < suppressClickUntil.current) { e.preventDefault(); e.stopPropagation(); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      onClick?.();
    };
    return (
      <div className="relative h-full">
      {topRight && <div className="absolute right-2 top-2 z-10">{topRight}</div>}
      <Tag
        ref={ref as React.Ref<any>}
        {...(asLink ? { href } : { type: "button" as const })}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        className="group flex h-full w-full flex-col overflow-hidden border border-border bg-white text-left transition-colors hover:border-accent focus:outline-hidden focus:ring-2 focus:ring-accent"
      >
        <div className="relative aspect-[3/4] w-full shrink-0 touch-pan-y overflow-hidden bg-card"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            if (!touch) return;
            touchStart.current = { x: touch.clientX, y: touch.clientY };
            setInteracted(true);
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            const touch = event.changedTouches[0];
            if (!start || !touch || frames.length < 2) return;
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;
            if (Math.abs(dx) < 30 || Math.abs(dx) <= Math.abs(dy) * 1.3) return;
            suppressClickUntil.current = Date.now() + 500;
            gallery.move(dx < 0 ? 1 : -1);
          }}
          onTouchCancel={() => { touchStart.current = null; }}>
          {image ? (
            <>
              {!ready && <div className="absolute inset-0 animate-pulse bg-neutral-100" />}
              <img
                ref={baseImageRef}
                src={frames[gallery.index] || image}
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
                className={`absolute inset-0 h-full w-full object-contain p-2 ${ready ? "opacity-100" : "opacity-0"} ${showHover ? "group-hover:opacity-0" : ""}`}
              />
              {hoverImage && hovered && !hoverFailed && (
                <img
                  src={hoverImage}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setHoverReady(true)}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    const raw = unproxyUrl(hoverImage);
                    if (raw && raw !== el.src && !triedHoverFallback.current) {
                      triedHoverFallback.current = true;
                      el.src = raw;
                      return;
                    }
                    setHoverFailed(true);
                  }}
                  className={`absolute inset-0 h-full w-full object-contain p-2 opacity-0 ${showHover ? "group-hover:opacity-100" : ""}`}
                />
              )}
            </>

          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {noImageLabel}
            </div>
          )}
        </div>

        {!fullWidthCodeBar && (code || brandBadge) && (
          <div className="catalog-card-media flex flex-row items-stretch border-t border-border">
            {code && (
                 <span className="flex min-w-0 shrink items-center gap-1.5 bg-primary px-1.5 py-1 text-primary-foreground sm:shrink-0 sm:px-3 sm:py-1.5">
                <span
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                   className="codebar-code whitespace-nowrap font-mono font-bold uppercase select-all cursor-text"
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
                  className="hidden shrink-0 rounded p-0.5 opacity-70 transition hover:bg-primary-foreground/15 hover:opacity-100 sm:block"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </span>
              </span>
            )}
            {brandBadge && (
               <span className="flex min-w-0 flex-1 items-center justify-end overflow-hidden">
                <BrandLogo brand={brandBadge} className="h-7 w-[72px] max-w-full sm:h-9 sm:w-28" />
              </span>
            )}
          </div>
        )}
        {fullWidthCodeBar && (
          <div className="catalog-card-media flex h-9 w-full items-center justify-end border-t border-border bg-primary px-2 sm:h-12 sm:px-3">
            <img src={ervitexWhiteLogo} alt="Ervitex" className="h-5 w-auto max-w-[70%] object-contain sm:h-7" loading="lazy" decoding="async" />
          </div>
        )}


        <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
          <h3 className="line-clamp-2 min-h-[2.3em] font-heading text-[11px] font-bold uppercase leading-[1.15] tracking-normal transition-colors group-hover:text-accent sm:text-sm sm:leading-tight sm:tracking-wide">
            {title}
          </h3>

          {subtitle && (
             <p className="line-clamp-1 text-[10px] text-muted-foreground sm:line-clamp-2 sm:text-xs">{subtitle}</p>
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
                const bgStyle: React.CSSProperties = swatchBackground(s.name, s.hex);

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
                        ? (e) => { e.stopPropagation(); e.preventDefault(); s.onSelect?.(); }
                        : undefined
                    }
                     className={`inline-block h-5 w-5 rounded-full transition-transform sm:h-4 sm:w-4 ${
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
      </Tag>
      {frames.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[3/4] sm:hidden">
          <div className="absolute inset-x-1 bottom-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1">
            <Button type="button" variant="outline" size="icon" aria-label={lang === "lv" ? "Iepriekšējais attēls" : "Previous image"} title={lang === "lv" ? "Iepriekšējais attēls" : "Previous image"}
              className="pointer-events-auto h-8 w-8 rounded-full border-border/70 bg-card/95 text-foreground"
              onClick={() => { setInteracted(true); gallery.move(-1); }}><ChevronLeft /></Button>
            <span className="mx-auto rounded-full bg-card/95 px-2 py-1 text-[10px] tabular-nums text-muted-foreground" aria-live="polite">{gallery.index + 1} / {frames.length}</span>
            <Button type="button" variant="outline" size="icon" aria-label={lang === "lv" ? "Nākamais attēls" : "Next image"} title={lang === "lv" ? "Nākamais attēls" : "Next image"}
              className="pointer-events-auto h-8 w-8 rounded-full border-border/70 bg-card/95 text-foreground"
              onClick={() => { setInteracted(true); gallery.move(1); }}><ChevronRight /></Button>
          </div>
        </div>
      )}
      </div>
    );
  }
);

CatalogModelCard.displayName = "CatalogModelCard";

export default CatalogModelCard;
