import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type AccentIconProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  inline?: boolean;
  tone?: "accent" | "blue" | "cyan" | "emerald" | "slate";
  className?: string;
};

const tones = {
  accent: "bg-accent/10 text-accent group-hover:bg-accent/15",
  blue: "bg-value-blue-soft text-value-blue group-hover:bg-value-blue/15",
  cyan: "bg-value-cyan-soft text-value-cyan group-hover:bg-value-cyan/15",
  emerald: "bg-value-emerald-soft text-value-emerald group-hover:bg-value-emerald/15",
  slate: "bg-value-slate-soft text-value-slate group-hover:bg-value-slate/15",
};
const inlineTones = { accent: "text-accent", blue: "text-value-blue", cyan: "text-value-cyan", emerald: "text-value-emerald", slate: "text-value-slate" };

/** Public informational icons; compact icons keep contact rows and controls stable. */
export function AccentIcon({ icon: Icon, inline = false, tone = "accent", className }: AccentIconProps) {
  if (inline) {
    return <Icon aria-hidden="true" className={cn("h-5 w-5 shrink-0", inlineTones[tone], className)} strokeWidth={1.5} />;
  }
  return (
    <span aria-hidden="true" className={cn("inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px] transition-colors duration-300", tones[tone], className)}>
      <Icon className="h-6 w-6" strokeWidth={1.5} />
    </span>
  );
}