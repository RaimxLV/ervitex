import { Link } from "@/lib/router-compat";
import { ArrowLeft, ClipboardList, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateOfferButton } from "./CreateOfferButton";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function OfferWorkspace({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  return <div className="public-readable min-h-screen bg-muted/30 py-4 sm:py-8">
    <div className="mx-auto max-w-[1440px] px-3 sm:px-6">
      <nav aria-label="Piedāvājumi" className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm"><Link to="/catalog"><ArrowLeft className="h-4 w-4" /><Store className="h-4 w-4" /> Katalogs</Link></Button>
        {isAdmin && <div className="flex flex-wrap gap-2"><Button asChild variant="outline" size="sm"><Link to="/offers"><ClipboardList className="h-4 w-4" /> Mani piedāvājumi</Link></Button><CreateOfferButton compact /></div>}
      </nav>
      <main className="min-w-0 bg-card px-4 py-6 sm:p-8">{children}</main>
    </div>
  </div>;
}