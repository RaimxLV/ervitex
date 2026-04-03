import { Search, ArrowUpDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";

interface CatalogToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeSort: string;
  onSortChange: (val: string) => void;
  activeTech: string;
  onTechChange: (val: string) => void;
  activeBrand: string;
  onBrandChange: (val: string) => void;
  brands: string[];
  printingTechs: string[];
  resultCount: number;
}

export default function CatalogToolbar({
  search, onSearchChange,
  activeSort, onSortChange,
  activeTech, onTechChange,
  activeBrand, onBrandChange,
  brands, printingTechs, resultCount,
}: CatalogToolbarProps) {
  const { lang } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center text-accent">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder={lang === "lv" ? "Meklēt produktus..." : "Search products..."}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 border-border bg-card pl-10 pr-10 text-sm font-medium placeholder:text-muted-foreground/60 focus-visible:ring-accent"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={activeSort} onValueChange={onSortChange}>
          <SelectTrigger className="h-11 w-full border-border bg-card sm:w-48">
            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{lang === "lv" ? "Jaunākie" : "Newest"}</SelectItem>
            <SelectItem value="name-asc">{lang === "lv" ? "Nosaukums A-Z" : "Name A-Z"}</SelectItem>
            <SelectItem value="name-desc">{lang === "lv" ? "Nosaukums Z-A" : "Name Z-A"}</SelectItem>
            <SelectItem value="price-asc">{lang === "lv" ? "Cena: zemākā" : "Price: Low"}</SelectItem>
            <SelectItem value="price-desc">{lang === "lv" ? "Cena: augstākā" : "Price: High"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter chips: Tech + Brand */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tech */}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mr-1">
          {lang === "lv" ? "Tehnoloģija:" : "Tech:"}
        </span>
        {printingTechs.map((tech) => (
          <Button
            key={tech}
            variant="outline"
            size="sm"
            onClick={() => onTechChange(activeTech === tech ? "" : tech)}
            className={`h-7 rounded-sm px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTech === tech
                ? "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
                : "border-border bg-card hover:border-accent hover:text-accent"
            }`}
          >
            {tech}
          </Button>
        ))}

        <div className="mx-2 h-4 w-px bg-border" />

        {/* Brand */}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mr-1">
          {lang === "lv" ? "Ražotājs:" : "Brand:"}
        </span>
        {brands.map((brand) => (
          <Button
            key={brand}
            variant="outline"
            size="sm"
            onClick={() => onBrandChange(activeBrand === brand ? "" : brand)}
            className={`h-7 rounded-sm px-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeBrand === brand
                ? "border-accent bg-accent text-accent-foreground hover:bg-accent/90"
                : "border-border bg-card hover:border-accent hover:text-accent"
            }`}
          >
            {brand}
          </Button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground">
        {resultCount} {lang === "lv" ? "produkti" : "products"}
      </p>
    </div>
  );
}
