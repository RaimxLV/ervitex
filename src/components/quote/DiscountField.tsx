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
      <Input
        type="number"
        min={0}
        step="0.01"
        inputMode="decimal"
        disabled={disabled}
        value={value?.value ? String(value.value) : ""}
        placeholder="0"
        onChange={(e) => {
          const n = Number(e.target.value.replace(",", "."));
          set(n > 0 ? { type, value: n } : null);
        }}
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
            onClick={() => set(value ? { ...value, type: t } : null, true)}
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
