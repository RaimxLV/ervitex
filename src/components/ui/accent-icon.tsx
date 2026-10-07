import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type AccentIconProps = {
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  inline?: boolean;
  className?: string;
};

/** Public informational icons; compact icons keep contact rows and controls stable. */
export function AccentIcon({ icon: Icon, inline = false, className }: AccentIconProps) {
  if (inline) {
    return <Icon className={cn("h-5 w-5 shrink-0 text-accent", className)} strokeWidth={1.5} />;
  }
  return (
    <span aria-hidden="true" className={cn("inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent", className)}>
      <Icon className="h-6 w-6" strokeWidth={1.5} />
    </span>
  );
}