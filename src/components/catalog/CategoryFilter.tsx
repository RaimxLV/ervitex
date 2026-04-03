import { useRef } from "react";
import {
  Shirt,
  ShoppingBag,
  HardHat,
  Dumbbell,
  Baby,
  Umbrella,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Contact,
  SwatchBook,
  CloudSnow,
  ShieldCheck,
  Zap,
  Shield,
  Flame,
  RectangleVertical,
  Sparkles,
  Ribbon,
  Gem,
  Hammer,
  Backpack,
  Droplets,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

// Icon mapping per category slug — each category gets a unique icon
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "t-krekli": <Shirt className="h-5 w-5" />,
  "polo-krekli": <Contact className="h-5 w-5" />,
  "krekli": <Shirt className="h-5 w-5" />,
  "dzemperi-hudiji": <SwatchBook className="h-5 w-5" />,
  "jakas": <CloudSnow className="h-5 w-5" />,
  "virsjakas": <ShieldCheck className="h-5 w-5" />,
  "vestes": <Zap className="h-5 w-5" />,
  "bikses-sorti": <RectangleVertical className="h-5 w-5" />,
  "kleitas-svārki": <Sparkles className="h-5 w-5" />,
  "cepures": <HardHat className="h-5 w-5" />,
  "šalles-lakati": <Ribbon className="h-5 w-5" />,
  "somas": <Backpack className="h-5 w-5" />,
  "aksesuari": <Gem className="h-5 w-5" />,
  "darba-apgerbi": <Hammer className="h-5 w-5" />,
  "sportam": <Dumbbell className="h-5 w-5" />,
  "berni": <Baby className="h-5 w-5" />,
  "lietus-apgerbs": <Umbrella className="h-5 w-5" />,
  "audumu-maisini": <ShoppingBag className="h-5 w-5" />,
  "dvieli": <Droplets className="h-5 w-5" />,
  "priekšauti": <ChefHat className="h-5 w-5" />,
  "softshell": <Shield className="h-5 w-5" />,
  "fleece": <Flame className="h-5 w-5" />,
};

// Group definitions
const GROUPS: { label: Record<string, string>; slugs: string[] }[] = [
  {
    label: { lv: "Apģērbi", en: "Clothing" },
    slugs: [
      "t-krekli", "polo-krekli", "krekli", "dzemperi-hudiji",
      "jakas", "virsjakas", "vestes", "softshell", "fleece",
      "bikses-sorti", "kleitas-svārki", "lietus-apgerbs",
    ],
  },
  {
    label: { lv: "Speciālie", en: "Workwear & Sport" },
    slugs: ["darba-apgerbi", "sportam", "berni"],
  },
  {
    label: { lv: "Aksesuāri", en: "Accessories" },
    slugs: ["cepures", "šalles-lakati", "somas", "aksesuari", "audumu-maisini", "dvieli", "priekšauti"],
  },
];

interface CategoryFilterProps {
  categories: { id: string; name: Record<string, string> }[];
  activeCategory: string;
  onSelect: (slug: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  const { lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  // Build grouped categories — only include categories that exist in DB
  const catMap = new Map(categories.map((c) => [c.id, c]));

  const grouped = GROUPS.map((g) => ({
    label: g.label[lang] || g.label.en,
    cats: g.slugs.map((s) => catMap.get(s)).filter(Boolean) as typeof categories,
  })).filter((g) => g.cats.length > 0);

  // Ungrouped leftovers
  const groupedSlugs = new Set(GROUPS.flatMap((g) => g.slugs));
  const ungrouped = categories.filter((c) => !groupedSlugs.has(c.id));
  if (ungrouped.length > 0) {
    grouped.push({ label: lang === "lv" ? "Citi" : "Other", cats: ungrouped });
  }

  const renderChip = (cat: { id: string; name: Record<string, string> }) => {
    const isActive = activeCategory === cat.id;
    return (
      <button
        key={cat.id}
        onClick={() => onSelect(cat.id)}
        className={cn(
          "group/chip flex items-center gap-2 whitespace-nowrap rounded-sm border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200",
          "font-heading",
          isActive
            ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
            : "border-border bg-card text-card-foreground hover:border-accent hover:text-accent"
        )}
      >
        <span className={cn(
          "transition-colors",
          isActive ? "text-accent-foreground" : "text-muted-foreground group-hover/chip:text-accent"
        )}>
          {CATEGORY_ICONS[cat.id] || <LayoutGrid className="h-5 w-5" />}
        </span>
        {cat.name[lang]}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Mobile: horizontal ribbon ── */}
      <div className="md:hidden">
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            className="absolute -left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md border border-border backdrop-blur"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto px-6 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => onSelect("all")}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-sm border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all font-heading",
                activeCategory === "all"
                  ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
                  : "border-border bg-card text-card-foreground hover:border-accent"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
              {lang === "lv" ? "Visi" : "All"}
            </button>
            {categories.map((cat) => renderChip(cat))}
          </div>
          <button
            onClick={() => scroll(1)}
            className="absolute -right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-md border border-border backdrop-blur"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Desktop: grouped sidebar / grid ── */}
      <div className="hidden md:block space-y-5">
        {/* All button */}
        <button
          onClick={() => onSelect("all")}
          className={cn(
            "flex w-full items-center gap-3 rounded-sm border px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all font-heading",
            activeCategory === "all"
              ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
              : "border-border bg-card text-card-foreground hover:border-accent hover:text-accent"
          )}
        >
          <LayoutGrid className="h-5 w-5" />
          {lang === "lv" ? "Visi produkti" : "All Products"}
        </button>

        {grouped.map((group) => (
          <div key={group.label}>
            <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {group.label}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {group.cats.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={cn(
                      "group/item flex items-center gap-2 rounded-sm border px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider transition-all duration-200 font-heading",
                      isActive
                        ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
                        : "border-border bg-card text-card-foreground hover:border-accent hover:text-accent"
                    )}
                  >
                    <span className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-accent-foreground" : "text-muted-foreground group-hover/item:text-accent"
                    )}>
                      {CATEGORY_ICONS[cat.id] || <LayoutGrid className="h-4 w-4" />}
                    </span>
                    <span className="truncate">{cat.name[lang]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
