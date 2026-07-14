import { forwardRef } from "react";
import type { ReactNode } from "react";

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
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className="group flex h-full flex-col overflow-hidden border border-border bg-card text-left transition-colors hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
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
          {code && (
            <span className="absolute left-2 top-2 bg-primary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary-foreground">
              {code}
            </span>
          )}
          {brandBadge && (
            <span className="absolute right-2 top-2 bg-background/90 px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider">
              {brandBadge}
            </span>
          )}
          {topRight}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-1 font-heading text-sm font-bold uppercase tracking-wide transition-colors group-hover:text-accent">
            {title}
          </h3>
          {subtitle && (
            <p className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {swatches && swatches.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {swatches.slice(0, 8).map((s, i) => {
                const bg = s.hex && s.hex.length >= 4 ? s.hex : "#ccc";
                const clickable = !!s.onSelect;
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
                    className={`h-4 w-4 rounded-full border transition-transform ${
                      s.active ? "border-foreground scale-125 ring-1 ring-foreground/30" : "border-border"
                    } ${clickable ? "cursor-pointer hover:scale-110" : ""}`}
                    style={{ backgroundColor: bg }}
                  />
                );
              })}
              {extraSwatches && extraSwatches > 0 ? (
                <span className="text-[10px] text-muted-foreground">+{extraSwatches}</span>
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
