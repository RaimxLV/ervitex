import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { readCatalogCache } from "@/lib/catalogCache";
import { categoryFromName, isCoarseCategory } from "@/lib/catalogCategory";
import { prepareQuery, searchMatches } from "@/lib/catalogSearch";
import { thumbUrl } from "@/lib/imageProxy";
import { useLanguage } from "@/i18n/LanguageContext";

interface Row {
  source: string;
  id: string;
  name: string | null;
  brand: string | null;
  category: string | null;
  group_name: string | null;
  image_url?: string | null;
}

/** Galvenās izvēlnes meklētāja rezultātu skaits (bija 8). */
export const MENU_RESULT_LIMIT = 7;

let loadPromise: Promise<Row[]> | null = null;

const loadRows = (): Promise<Row[]> => {
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    let items: Row[] = [];
    let prices: any[] = [];
    const cached = await readCatalogCache("all");
    if (cached && !cached.stale) {
      items = cached.entry.items as Row[];
      prices = cached.entry.prices as any[];
    } else {
      const STEP = 1000;
      const fetchAll = async (table: string, cols: string, order: string) => {
        const first = await supabase.from(table as any).select(cols, { count: "exact" }).order(order).range(0, STEP - 1);
        let rows = (first.data || []) as any[];
        const total = first.count ?? rows.length;
        const offs: number[] = [];
        for (let f = STEP; f < total; f += STEP) offs.push(f);
        const rest = await Promise.all(
          offs.map((f) => supabase.from(table as any).select(cols).order(order).range(f, f + STEP - 1)),
        );
        for (const r of rest) rows = rows.concat((r.data || []) as any[]);
        return rows;
      };
      [items, prices] = await Promise.all([
        fetchAll("catalog_items", "source,id,name,brand,category,group_name,image_url", "id"),
        fetchAll("catalog_price_ranges", "source,style_code,min_price", "style_code"),
      ]);
    }
    const priced = new Set(
      prices.filter((p) => Number(p.min_price) > 0).map((p) => `${p.source}:${p.style_code}`),
    );
    const { data: rem } = await supabase.from("catalog_remnants" as any).select("source,style_code").range(0, 4999);
    const remnants = new Set(((rem || []) as any[]).map((r) => `${r.source}:${r.style_code}`));
    return items
      .filter((it) => it?.id && it.name && !remnants.has(`${it.source}:${it.id}`) && (it.source === "etx" || priced.has(`${it.source}:${it.id}`)))
      .map((it) => ({
        ...it,
        category:
          !it.category || isCoarseCategory(it.category) ? categoryFromName(it.name) || it.category : it.category,
      }));
  })().catch(() => {
    loadPromise = null;
    return [];
  });
  return loadPromise;
};

interface Props {
  onDone?: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  onEmptyBlur?: () => void;
  /** Mobiļajā izvēlnē: rezultāti atveras plūsmā zem ievades, nevis pāri izvēlnei. */
  inline?: boolean;
  onOutside?: () => void;
}

export default function HeaderSearch({ onDone, autoFocus, className, inputClassName, onEmptyBlur, inline, onOutside }: Props) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const ensureLoaded = () => {
    if (!rows.length) void loadRows().then(setRows);
  };

  useEffect(() => {
    if (autoFocus) ensureLoaded();
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
        onOutside?.();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { results, firstRelated } = useMemo(() => {
    const pq = prepareQuery(value);
    if (!pq || !rows.length) return { results: [] as Row[], firstRelated: -1 };
    const m = searchMatches(rows, pq);
    const exact = m.exact.slice(0, MENU_RESULT_LIMIT);
    const related = m.related.slice(0, Math.max(0, MENU_RESULT_LIMIT - exact.length));
    return { results: [...exact, ...related], firstRelated: related.length ? exact.length : -1 };
  }, [value, rows]);

  const finish = () => {
    setValue("");
    setOpen(false);
    setActive(-1);
    onDone?.();
  };

  const goAll = () => {
    const q = value.trim();
    if (!q) return;
    navigate(`/catalog?q=${encodeURIComponent(q)}`);
    finish();
  };

  const goItem = (r: Row) => {
    navigate(`/catalog/item/${r.source}/${encodeURIComponent(r.id)}`);
    finish();
  };

  return (
    <div ref={boxRef} className={`relative ${className || ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && results[active]) goItem(results[active]);
          else goAll();
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" strokeWidth={1.5} />
        <Input
          value={value}
          autoFocus={autoFocus}
          onFocus={() => {
            ensureLoaded();
            setOpen(true);
          }}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onBlur={() => {
            if (!value) onEmptyBlur?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
              onDone?.();
            }
          }}
          placeholder={lang === "lv" ? "Meklēt: vestes, bikses, kods…" : "Search: vests, pants, code…"}
          className={`pl-9 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 ${inputClassName || ""}`}
          aria-autocomplete="list"
        />
      </form>

      {open && value.trim() && (
        <div
          className={`flex max-h-[min(70vh,calc(100dvh-6rem))] flex-col overflow-hidden rounded-sm border border-border bg-background text-foreground shadow-xl ${
            inline ? "mt-2" : "absolute left-0 right-0 top-full z-50 mt-1"
          }`}
        >
          {!rows.length ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">{lang === "lv" ? "Ielādē…" : "Loading…"}</p>
          ) : results.length ? (
            <ul role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {results.map((r, i) => (
                <li key={`${r.source}:${r.id}`}>
                  {i === firstRelated && (
                    <p className="border-t border-border px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "lv" ? "Līdzīgi kodi" : "Similar codes"}
                    </p>
                  )}
                  <Link
                    to={`/catalog/item/${r.source}/${encodeURIComponent(r.id)}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      finish();
                    }}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      i === active ? "bg-muted" : "hover:bg-muted"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
                      {r.image_url && (
                        <img src={thumbUrl(r.image_url, 120) || r.image_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.brand ? `${r.brand} · ` : ""}{r.id}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">{lang === "lv" ? "Nekas nav atrasts" : "Nothing found"}</p>
          )}
          <Link
            to={`/catalog?q=${encodeURIComponent(value.trim())}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              finish();
            }}
            className="flex w-full shrink-0 items-center justify-between border-t border-border px-4 py-2.5 text-sm font-bold text-accent hover:bg-muted"
          >
            {lang === "lv" ? "Visi rezultāti katalogā" : "All results in catalog"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
