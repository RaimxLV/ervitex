import { useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
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
}

const CatalogFiltersSidebar = ({ sections, onClearAll, className, heading }: Props) => {
  const { lang } = useLanguage();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [searchByKey, setSearchByKey] = useState<Record<string, string>>({});

  const t = useMemo(
    () => ({
      filters: heading ?? (lang === "lv" ? "Filtri" : "Filters"),
      clear: lang === "lv" ? "Notīrīt" : "Clear",
      searchIn: lang === "lv" ? "Meklēt" : "Search",
      empty: lang === "lv" ? "Nav opciju" : "No options",
    }),
    [lang, heading]
  );

  const totalSelected = sections.reduce((sum, s) => sum + s.selected.size, 0);
  const visible = sections.filter((s) => s.items.length > 0);
  if (visible.length === 0) return null;

  return (
    <aside className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wider">
          {t.filters}
        </h2>
        {totalSelected > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-[11px] uppercase tracking-wider text-muted-foreground underline-offset-4 hover:underline"
          >
            {t.clear} ({totalSelected})
          </button>
        )}
      </div>

      <div className="divide-y divide-border rounded-sm border border-border bg-card">
        {visible.map((section) => {
          const isCollapsed = !!collapsed[section.key];
          const search = searchByKey[section.key] || "";
          const filtered = search
            ? section.items.filter((i) =>
                i.label.toLowerCase().includes(search.toLowerCase())
              )
            : section.items;
          const showSearch = section.items.length > 6;

          return (
            <div key={section.key} className="p-3">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [section.key]: !c[section.key] }))
                }
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={!isCollapsed}
              >
                <span className="font-heading text-xs font-bold uppercase tracking-wider">
                  {section.title}
                  {section.selected.size > 0 && (
                    <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground">
                      {section.selected.size}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    isCollapsed && "-rotate-90"
                  )}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-3 space-y-2">
                  {showSearch && (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) =>
                          setSearchByKey((s) => ({
                            ...s,
                            [section.key]: e.target.value,
                          }))
                        }
                        placeholder={`${t.searchIn} ${section.title.toLowerCase()}…`}
                        className="h-7 pl-7 pr-7 text-xs"
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

                  <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {filtered.length === 0 && (
                      <li className="text-[11px] text-muted-foreground">
                        {t.empty}
                      </li>
                    )}
                    {filtered.map((it) => {
                      const val = it.value ?? it.label;
                      const isSelected = section.selected.has(val);
                      return (
                        <li key={val}>
                          <label className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-0.5 text-sm hover:bg-muted">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => section.onToggle(val)}
                              aria-label={it.label}
                            />
                            <span
                              className={cn(
                                "flex-1 truncate",
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default CatalogFiltersSidebar;
