import { Printer } from "lucide-react";
import { printStatusLabel } from "@/lib/requestPresentation";
import { requestPrintStatus } from "@/lib/requestDetails";

export default function RequestPrintStatus({ method }: { method?: string | null }) {
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${requestPrintStatus(method) === "required" ? "text-accent" : "text-muted-foreground"}`}><Printer className="h-4 w-4 shrink-0" />{printStatusLabel(method)}</span>;
}