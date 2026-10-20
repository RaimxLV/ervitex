import { Button } from "@/components/ui/button";
import { pendingText, rejectedText, newRequestText } from "@/hooks/usePendingRequest";

/** Saved-request banner; when rejected it is permanent until the user explicitly starts a new request. */
export function PendingRequestNotice({ locked, rejected, lang, onNew, children, className = "" }: { locked: boolean; rejected: boolean; lang: string; onNew: () => void; children?: React.ReactNode; className?: string }) {
  if (!locked) return null;
  return (
    <div role="status" className={`space-y-2 text-sm ${rejected ? "text-destructive" : "text-muted-foreground"} ${className}`}>
      <p>{rejected ? rejectedText(lang) : pendingText(lang)}</p>
      {children}
      {rejected && <Button type="button" variant="outline" size="sm" onClick={onNew}>{newRequestText(lang)}</Button>}
    </div>
  );
}
