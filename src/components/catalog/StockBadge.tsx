import { PackageCheck } from "lucide-react";
import { toggleStockFlag } from "@/hooks/useStockFlags";
import { useAuth } from "@/hooks/useAuth";

/** Kompakta noliktavas atzīme, kas pārklājas ar attēlu un nemaina kartītes augstumu. */
export const StockRibbon = ({ lang }: { lang: string }) => (
  <div className="pointer-events-none absolute inset-x-2 bottom-2 z-[2] flex h-7 items-center justify-center gap-1.5 border border-success bg-card/90 px-3 font-heading text-[10px] font-bold uppercase text-success backdrop-blur-sm">
    <PackageCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
    {lang === "lv" ? "Ir noliktavā" : "In stock"}
  </div>
);

/** Admina slēdzis: viens klikšķis ieslēdz/izslēdz. */
export const StockToggle = ({ source, id, on }: { source: string; id: string; on: boolean }) => {
  const { isAdmin, loading } = useAuth();
  if (loading || !isAdmin) return null;

  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggleStockFlag(source, id); }}
      onPointerDown={(e) => e.stopPropagation()}
      title={on ? "Noņemt: ir noliktavā" : "Atzīmēt: ir noliktavā"}
      aria-label={on ? "Noņemt noliktavas atzīmi" : "Atzīmēt kā noliktavā"}
      aria-pressed={on}
      className={`flex h-7 items-center gap-1 border px-2 text-[10px] font-bold uppercase transition-colors ${
        on ? "border-success bg-card text-success" : "border-border bg-card text-muted-foreground hover:border-success hover:text-success"
      }`}
    >
      <PackageCheck className="h-3 w-3" />
      {on ? "Noliktavā" : "Atzīmēt"}
    </button>
  );
};
