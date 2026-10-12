import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export interface ColorOption { code: string; name: string; hex?: string | null; inStock?: boolean; swatchStyle?: CSSProperties }

export function ColorSelector({ colors, value, onChange, disabled = false }: {
  colors: ColorOption[]; value: string | null; onChange: (code: string) => void; disabled?: boolean;
}) {
  return <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3" role="group" aria-label="Krāsa" data-lenis-prevent>
    {colors.map((color) => <Button key={color.code} type="button" variant="outline" disabled={disabled}
      aria-pressed={color.code === value} onClick={() => onChange(color.code)} title={`${color.name} · ${color.code}`}
      className={cn("h-auto min-h-12 min-w-0 justify-start gap-2 rounded-sm px-3 py-2 text-left hover:bg-muted hover:text-foreground",
        color.code === value && "border-accent bg-accent/5 ring-1 ring-accent text-foreground")}>
      <span className="h-6 w-6 shrink-0 rounded-sm border border-border bg-muted" style={color.swatchStyle ?? (color.hex ? { background: color.hex } : undefined)} />
      <span className="min-w-0 flex-1 whitespace-normal break-words text-xs leading-snug font-medium">{color.name}
        <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">{color.code}</span>
      </span>
      {color.code === value && <Check className="h-4 w-4 text-accent" />}
      {color.inStock && <span className="h-2 w-2 shrink-0 rounded-full bg-success" aria-label="Ir noliktavā" />}
    </Button>)}
  </div>;
}