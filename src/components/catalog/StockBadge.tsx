import { PackageCheck } from "lucide-react";
import { toggleStockFlag } from "@/hooks/useStockFlags";

/** Šaura josla bildes apakšā — nemaina kartītes izmēru. */
export const StockRibbon = ({ lang }: { lang: string }) => (
  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex items-center justify-center gap-1.5 bg-success py-1 font-heading text-[11px] font-bold uppercase tracking-widest text-success-foreground">
    <PackageCheck className="h-3.5 w-3.5" />
    {lang === "lv" ? "Ir noliktavā" : "In stock"}
  </div>
);

/** Admina slēdzis: viens klikšķis ieslēdz/izslēdz. */
export const StockToggle = ({ source, id, on }: { source: string; id: string; on: boolean }) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStockFlag(source, id); }}
    onPointerDown={(e) => e.stopPropagation()}
    title={on ? "Noņemt: ir noliktavā" : "Atzīmēt: ir noliktavā"}
    aria-pressed={on}
    className={`flex h-8 items-center gap-1 rounded-full border px-2.5 text-[11px] font-bold uppercase tracking-wide shadow-sm transition-colors ${
      on ? "border-success bg-success text-success-foreground" : "border-border bg-card text-muted-foreground hover:border-success hover:text-foreground"
    }`}
  >
    <PackageCheck className="h-3.5 w-3.5" />
    {on ? "Noliktavā" : "Noliktava"}
  </button>
);
