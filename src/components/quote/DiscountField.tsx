import { DecimalInput } from "@/components/ui/decimal-input";
import { Input } from "@/components/ui/input";
import type { Discount } from "@/lib/worksheet";

interface Props {
  value: Discount | null;
  onChange: (d: Discount | null) => void;
  onCommit?: (d: Discount | null) => void;
  disabled?: boolean;
}

/** Atlaides lauks: skaitlis + pārslēgs % / €. */
const DiscountField = ({ value, onChange, onCommit, disabled }: Props) => {
  const type = value?.type || "percent";
  const set = (next: Discount | null, commit = false) => {
    onChange(next);
    if (commit) onCommit?.(next);
  };
  return (
    <div className="flex items-center gap-2">
      <DecimalInput disabled={disabled} value={value?.value || null}
        placeholder="0"
        onValueChange={(n) => set({ type, value: n && n > 0 ? n : 0 })}
        onBlur={() => onCommit?.(value)}
        className="h-9 w-24 text-right tabular-nums"
        aria-label="Atlaide"
      />
      <div className="flex overflow-hidden rounded-sm border border-border">
        {(["percent", "amount"] as const).map((t) => (
          <button
            key={t}
            type="button"
            disabled={disabled}
            onClick={() => set({ type: t, value: value?.value || 0 }, true)}
            className={`h-9 w-9 text-sm font-bold transition-colors ${
              type === t ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={type === t}
          >
            {t === "percent" ? "%" : "€"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscountField;
