import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, Check, Search, SlidersHorizontal, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface FilterSection {
  /** Stable key (e.g. "brand", "category") */
  key: string;
  /** Localized section title */
  title: string;
  /** Items. `value` optional — if omitted, `label` is used both to display and toggle. `swatch` renders a color circle. */
  items: { label: string; count: number; value?: string; swatch?: string | null }[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  /** When true, section behaves as single-select (radio-like) */
  single?: boolean;
  /** Optional: hide count numbers */
  hideCounts?: boolean;
}

interface Props {
  sections: FilterSection[];
  onClearAll?: () => void;
  className?: string;
  /** Optional heading override; defaults to "Filtri / Filters" */
  heading?: string;
  /** Hide the internal header (title + clear all). Useful when the drawer already renders a title. */
  hideHeader?: boolean;
}

const CatalogFiltersSidebar = ({ sections, onClearAll, className, heading, hideHeader }: Props) => {
  const { lang } = useLanguage();
  const isMobile = useIsMobile();
  // On mobile, all sections default to collapsed. On desktop, all open.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    if (isMobile) {
      const initial: Record<string, boolean> = {};
      sections.forEach((s) => { initial[s.key] = true; });
      setCollapsed(initial);
    }
    setInitialized(true);
  }, [isMobile, sections, initialized]);
  const [searchByKey, setSearchByKey] = useState<Record<string, string>>({});

  const t = useMemo(
    () => ({
      filters: heading ?? (lang === "lv" ? "Filtri" : "Filters"),
      clear: lang === "lv" ? "Notīrīt visu" : "Clear all",
      searchIn: lang === "lv" ? "Meklēt" : "Search",
      empty: lang === "lv" ? "Nav opciju" : "No options",
    }),
    [lang, heading]
  );

  const totalSelected = sections.reduce((sum, s) => sum + s.selected.size, 0);
  const visible = sections.filter((s) => s.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <aside className={cn("space-y-3", className)}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" />
            <h2 className="font-heading text-[11px] font-bold uppercase tracking-[0.18em]">
              {t.filters}
            </h2>
            {totalSelected > 0 && (
              <span className="rounded-full bg-accent px-2 py-[1px] text-[10px] font-bold text-accent-foreground">
                {totalSelected}
              </span>
            )}
          </div>
          {totalSelected > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition hover:text-accent"
            >
              {t.clear}
            </button>
          )}
        </div>
      )}


      {/* Sections */}
      <div className="space-y-2">
        {visible.map((section) => {
          const isCollapsed = !!collapsed[section.key];
          const search = searchByKey[section.key] || "";
          const filtered = search
            ? section.items.filter((i) =>
                i.label.toLowerCase().includes(search.toLowerCase())
              )
            : section.items;
          const showSearch = section.items.length > 8;
          const isColor = section.key === "color";

          return (
            <div
              key={section.key}
              className={cn(
                "overflow-hidden rounded-lg border border-border bg-card transition-shadow",
                !isCollapsed && "shadow-[0_1px_0_0_hsl(var(--border)),0_8px_24px_-16px_rgba(0,0,0,0.15)]"
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [section.key]: !c[section.key] }))
                }
                className="group flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-muted/40"
                aria-expanded={!isCollapsed}
              >
                <span className="flex items-center gap-2">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-[0.15em]">
                    {section.title}
                  </span>
                  {section.selected.size > 0 && (
                    <span className="rounded-full bg-accent px-1.5 py-[1px] text-[9px] font-bold text-accent-foreground">
                      {section.selected.size}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors group-hover:border-accent group-hover:text-accent"
                >
                  {isCollapsed ? <Plus className="h-3.5 w-3.5" strokeWidth={2.5} /> : <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isCollapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"
                )}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 px-4 pb-4">
                    {showSearch && !isColor && (
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={search}
                          onChange={(e) =>
                            setSearchByKey((s) => ({
                              ...s,
                              [section.key]: e.target.value,
                            }))
                          }
                          placeholder={`${t.searchIn} ${section.title.toLowerCase()}…`}
                          className="h-8 rounded-md pl-8 pr-7 text-xs"
                        />
                        {search && (
                          <button
                            type="button"
                            onClick={() =>
                              setSearchByKey((s) => ({ ...s, [section.key]: "" }))
                            }
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}

                    {isColor ? (
                      // Color swatch grid — no scroll, everything visible
                      <div className="grid grid-cols-2 gap-1.5">
                        {filtered.length === 0 && (
                          <p className="col-span-2 text-[11px] text-muted-foreground">
                            {t.empty}
                          </p>
                        )}
                        {filtered.map((it) => {
                          const val = it.value ?? it.label;
                          const isSelected = section.selected.has(val);
                          const sw = it.swatch;
                          const isGradient = !!sw && sw.includes("gradient");
                          const isLight = !!sw && !isGradient && /^#([efEF][0-9a-fA-F]{5}|[fF]{3})$/.test(sw);
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => section.onToggle(val)}
                              aria-pressed={isSelected}
                              title={`${it.label} (${it.count})`}
                              className={cn(
                                "group/chip flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition",
                                isSelected
                                  ? "border-accent bg-accent/5 shadow-sm"
                                  : "border-border hover:border-foreground/30 hover:bg-muted/60"
                              )}
                            >
                              <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
                                <span
                                  aria-hidden
                                  className={cn(
                                    "h-5 w-5 rounded-full ring-1 ring-inset",
                                    isLight ? "ring-neutral-400" : "ring-black/15"
                                  )}
                                  style={
                                    isGradient
                                      ? { backgroundImage: sw as string }
                                      : { backgroundColor: sw || "transparent" }
                                  }
                                />
                                {isSelected && (
                                  <Check
                                    className={cn(
                                      "absolute h-3 w-3",
                                      isLight ? "text-black" : "text-white"
                                    )}
                                    strokeWidth={3}
                                  />
                                )}
                              </span>
                              <span
                                className={cn(
                                  "flex-1 truncate text-[11px]",
                                  isSelected && "font-semibold"
                                )}
                              >
                                {it.label}
                              </span>
                              {!section.hideCounts && (
                                <span className="text-[9px] tabular-nums text-muted-foreground">
                                  {it.count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <ul
                        className={cn(
                          "space-y-0.5 pr-1",
                          filtered.length > 10 && "max-h-72 overflow-y-auto"
                        )}
                      >
                        {filtered.length === 0 && (
                          <li className="text-[11px] text-muted-foreground">
                            {t.empty}
                          </li>
                        )}
                        {filtered.map((it) => {
                          const val = it.value ?? it.label;
                          const isSelected = section.selected.has(val);
                          const sw = it.swatch;
                          const isGradient = !!sw && sw.includes("gradient");
                          const isLight = !!sw && !isGradient && /^#([efEF][0-9a-fA-F]{5}|[fF]{3})$/.test(sw);
                          return (
                            <li key={val}>
                              <label
                                className={cn(
                                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition",
                                  isSelected ? "bg-accent/5" : "hover:bg-muted/60"
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => section.onToggle(val)}
                                  aria-label={it.label}
                                  className="h-3.5 w-3.5"
                                />
                                {sw && (
                                  <span
                                    aria-hidden
                                    className={cn(
                                      "inline-block h-4 w-4 shrink-0 rounded-full",
                                      isLight ? "border border-neutral-500" : "border border-black/20"
                                    )}
                                    style={isGradient ? { backgroundImage: sw } : { backgroundColor: sw }}
                                  />
                                )}
                                <span
                                  className={cn(
                                    "flex-1 truncate text-[12px]",
                                    isSelected && "font-semibold"
                                  )}
                                  title={it.label}
                                >
                                  {it.label}
                                </span>
                                {!section.hideCounts && (
                                  <span className="text-[10px] tabular-nums text-muted-foreground">
                                    {it.count}
                                  </span>
                                )}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default CatalogFiltersSidebar;
