import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { readCatalogCache } from "@/lib/catalogCache";
import { createRowsLoader, type HeaderSearchRow } from "@/lib/headerSearchRows";
import { prepareQuery, searchMatches } from "@/lib/catalogSearch";
import { thumbUrl } from "@/lib/imageProxy";
import { useLanguage } from "@/i18n/LanguageContext";

type Row = HeaderSearchRow;

/** Galvenās izvēlnes meklētāja rezultātu skaits (bija 8). */
export const MENU_RESULT_LIMIT = 7;

const READ_TIMEOUT_MS = 20000;
const rowsLoader = createRowsLoader({
  readCache: async () => {
    const cached = await readCatalogCache("all");
    return cached && !cached.stale ? { items: cached.entry.items as unknown[], prices: cached.entry.prices as unknown[] } : null;
  },
  fetchPage: async (table, cols, order, from, to, withCount) => {
    const r = await supabase.from(table as any).select(cols, withCount ? { count: "exact" } : undefined)
      .order(order).range(from, to).abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS));
    return { data: r.data as unknown[] | null, error: r.error, count: r.count };
  },
  fetchRemnants: async () => {
    const r = await supabase.from("catalog_remnants" as any).select("source,style_code").range(0, 4999).abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS));
    return { data: r.data as unknown[] | null, error: r.error };
  },
});

/** Sīktēlu kandidāti: katram tā paša ieraksta attēlam proxy, tad oriģināls; bez dublikātiem. */
export function thumbCandidates(srcs: (string | null | undefined)[]): string[] {
  const out: string[] = [];
  for (const src of srcs) {
    if (!src) continue;
    for (const u of [thumbUrl(src, 120) || src, src]) if (!out.includes(u)) out.push(u);
  }
  return out;
}

/** Sīktēls: galvenais attēls (proxy → oriģināls), tad tā paša modeļa otrais attēls, tad neitrāls lauks. */
function SearchThumb({ srcs }: { srcs: (string | null | undefined)[] }) {
  const list = useMemo(() => thumbCandidates(srcs), [srcs.join("|")]);
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(0), [list]);
  const current = list[stage];
  if (!current) return null;
  return <img src={current} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain"
    onError={() => setStage((s) => s + 1)} />;
}

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
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const ensureLoaded = (force = false) => {
    // Failed loads retry only via the Retry button, never on every focus.
    if (status === "loading" || status === "ready" || (status === "error" && !force)) return;
    setStatus("loading");
    rowsLoader.load().then((r) => { setRows(r); setStatus("ready"); }, () => setStatus("error"));
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
          {status === "error" ? (
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-muted-foreground" role="alert">
              <span>{lang === "lv" ? "Neizdevās ielādēt preces" : "Could not load products"}</span>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => ensureLoaded(true)}
                className="shrink-0 font-bold text-accent hover:underline">{lang === "lv" ? "Mēģināt vēlreiz" : "Retry"}</button>
            </div>
          ) : status !== "ready" ? (
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
                      {(r.image_url || r.hover_image_url) && <SearchThumb srcs={[r.image_url, r.hover_image_url]} />}
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
