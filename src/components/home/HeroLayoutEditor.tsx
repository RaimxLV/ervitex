import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { DEFAULT_HERO_LAYOUT, HeroLayout, resetHeroLayout, saveHeroLayout } from "./heroLayout";

type Props = {
  layout: HeroLayout;
  setLayout: (l: HeroLayout) => void;
  selected: string | null;
  setSelected: (id: string | null) => void;
};

const LABELS: Record<string, string> = {
  jacket: "Jaka",
  pants: "Bikses",
  hoodie: "Hoodijs",
  tee: "T-krekls",
  sneaker: "Apavi",
};

/** Dev-only visual arranger for the hero parallax objects (open hero with ?hero-edit=1). */
const HeroLayoutEditor = ({ layout, setLayout, selected, setSelected }: Props) => {
  const [open, setOpen] = useState(true);
  const ids = Object.keys(DEFAULT_HERO_LAYOUT);
  const cur = selected ? layout[selected] : null;

  const patch = (key: string, value: number | "top" | "bottom") => {
    if (!selected) return;
    setLayout({ ...layout, [selected]: { ...layout[selected], [key]: value } as HeroLayout[string] });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-border bg-background/95 p-4 text-foreground shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="font-heading text-xs font-bold uppercase">Parallax izkārtojums</span>
        <button className="text-xs text-muted-foreground underline" onClick={() => setOpen((o) => !o)}>
          {open ? "Aizvērt" : "Atvērt"}
        </button>
      </div>

      {open && (
        <>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Velc objektus ar peli. Zemāk maini izmēru, slāni un rotāciju.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {ids.map((id) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`rounded border px-2 py-1 text-[11px] ${
                  selected === id ? "border-accent bg-accent/15 text-foreground" : "border-border text-muted-foreground"
                }`}
              >
                {LABELS[id] ?? id}
              </button>
            ))}
          </div>

          {cur && selected && (
            <div className="mt-4 space-y-3">
              <Field label={`Izmērs ${Math.round(cur.width)}vw`}>
                <Slider value={[cur.width]} min={5} max={70} step={1} onValueChange={([v]) => patch("width", v)} />
              </Field>
              <Field label={`Slānis (z) ${cur.z}`}>
                <Slider value={[cur.z]} min={1} max={60} step={1} onValueChange={([v]) => patch("z", v)} />
              </Field>
              <Field label={`Rotācija ${cur.rotate}°`}>
                <Slider value={[cur.rotate]} min={-30} max={30} step={1} onValueChange={([v]) => patch("rotate", v)} />
              </Field>
              <Field label={`No labās ${cur.right.toFixed(1)}%`}>
                <Slider value={[cur.right]} min={-20} max={80} step={0.5} onValueChange={([v]) => patch("right", v)} />
              </Field>
              <Field label={`${cur.anchor === "top" ? "No augšas" : "No apakšas"} ${cur.y.toFixed(1)}%`}>
                <Slider value={[cur.y]} min={-20} max={80} step={0.5} onValueChange={([v]) => patch("y", v)} />
              </Field>
              <button
                className="text-[11px] text-muted-foreground underline"
                onClick={() => patch("anchor", cur.anchor === "top" ? "bottom" : "top")}
              >
                Pārslēgt piesaisti ({cur.anchor === "top" ? "→ apakša" : "→ augša"})
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => {
                saveHeroLayout(layout);
                toast.success("Izkārtojums saglabāts šai pārlūkprogrammai");
              }}
            >
              Saglabāt
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[11px]"
              onClick={() => {
                navigator.clipboard?.writeText(JSON.stringify(layout, null, 2));
                toast.success("JSON nokopēts — atsūti to man, lai ieliktu kodā visiem");
              }}
            >
              Kopēt JSON
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[11px]"
              onClick={() => {
                resetHeroLayout();
                setLayout(DEFAULT_HERO_LAYOUT);
                toast.success("Atjaunots sākotnējais izkārtojums");
              }}
            >
              Atiestatīt
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</div>
    {children}
  </div>
);

export default HeroLayoutEditor;
