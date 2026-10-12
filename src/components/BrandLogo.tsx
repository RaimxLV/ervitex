import { findBrandLogo } from "@/lib/brandLogos";
import { cn } from "@/lib/utils";
export const BrandLogo = ({ brand, className }: { brand: string; className?: string }) => {
  const logo = findBrandLogo(brand);
  if (!logo) return <span className={cn("truncate font-heading text-[10px] font-bold uppercase", className)} title={brand}>{brand}</span>;
  return <span className={cn("catalog-card-media inline-flex h-8 w-24 shrink-0 items-center justify-center px-2 py-1 sm:w-28", className)} title={brand}>
    <img src={logo.src} alt={brand} className="h-full w-full object-contain" loading="lazy" decoding="async" />
  </span>;
};
