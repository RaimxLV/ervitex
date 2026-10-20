import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

/** Quantity input with always-visible up/down stepper buttons. */
export function QtyStepper({ value, min = 0, ariaLabel, onChange, className = "", disabled = false }: {
  value: number | undefined; min?: number; ariaLabel: string;
  onChange: (qty: number) => void; className?: string;
  disabled?: boolean;
}) {
  const { lang } = useLanguage();
  const t = (lv: string, en: string) => lang === "lv" ? lv : en;
  const current = value ?? min;
  const step = (delta: number) => onChange(Math.max(min, current + delta));
  return <div className={`relative ${className}`}>
    <Input disabled={disabled} type="number" min={min} inputMode="numeric" aria-label={ariaLabel} value={value ?? ""} placeholder="0"
      className="h-10 pr-7 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      onChange={(e) => onChange(Math.max(min, Math.floor(Number(e.target.value) || 0)))} />
    <div className="absolute inset-y-0 right-0 flex w-7 flex-col overflow-hidden rounded-r-md border-l border-border bg-muted/60" role="group" aria-label={t("Skaits", "Quantity")}>
      <button disabled={disabled} type="button" aria-label={t("Palielināt", "Increase")} tabIndex={-1} onClick={() => step(1)}
        className="flex flex-1 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground">
        <ChevronUp className="h-3 w-3" />
      </button>
      <span className="h-px w-full bg-border" />
      <button disabled={disabled} type="button" aria-label={t("Samazināt", "Decrease")} tabIndex={-1} onClick={() => step(-1)}
        className="flex flex-1 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground">
        <ChevronDown className="h-3 w-3" />
      </button>
    </div>
  </div>;
}
