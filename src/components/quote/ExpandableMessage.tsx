import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ExpandableMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false);
  return <div><p className={`whitespace-pre-wrap break-words text-sm text-muted-foreground ${expanded ? "" : "line-clamp-4"}`}>{message}</p>{message.length > 300 && <Button type="button" size="sm" variant="ghost" className="mt-1 px-0" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Rādīt mazāk" : "Lasīt visu"}</Button>}</div>;
}