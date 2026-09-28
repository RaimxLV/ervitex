import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSIGNEES, assigneeBySlug } from "@/data/assignees";
import logo from "@/assets/ervitex-logo-2.svg";

const AssignPage = () => {
  const { token } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const [slug, setSlug] = useState(params.get("kam") || "");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [emailed, setEmailed] = useState(true);
  const [assignedName, setAssignedName] = useState("");
  const person = assigneeBySlug(slug);

  const assign = async () => {
    if (!token || !person) return;
    setState("busy");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quote-action?token=${token}&action=assign:${person.slug}&format=json`,
      );
      const out = (await res.json().catch(() => null)) as { ok?: boolean; emailed?: boolean; alreadyAssigned?: boolean; assignee?: { name?: string } } | null;
      if (out?.alreadyAssigned) {
        setAssignedName(out.assignee?.name || "projektu vadītājai");
        setState("done");
        return;
      }
      if (!res.ok || !out?.ok) throw new Error();
      setEmailed(out.emailed !== false);
      setAssignedName(person.name);
      setState("done");
    } catch {
      setState("error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-card p-6">
        <img src={logo} alt="Ervitex" className="mb-6 h-7" />
        {state === "done" ? (
          <div className="space-y-2">
            <h1 className="flex items-center gap-2 font-heading text-xl font-black uppercase">
              <CheckCircle2 className="h-5 w-5 text-accent" /> Nodots: {assignedName || person?.name}
            </h1>
            {!emailed && <p className="text-sm text-destructive">E-pasts neaizgāja uz {person?.email}</p>}
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="font-heading text-xl font-black uppercase">Nodot pieprasījumu</h1>
            <div className="grid grid-cols-2 gap-2">
              {ASSIGNEES.map((a) => (
                <Button key={a.slug} variant={a.slug === slug ? "default" : "outline"} onClick={() => setSlug(a.slug)}>
                  {a.name}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={assign} disabled={!person || state === "busy"}>
              {state === "busy" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {person ? `Nodot: ${person.name}` : "Nodot"}
            </Button>
            {state === "error" && <p className="text-sm text-destructive">Neizdevās nodot</p>}
          </div>
        )}
      </div>
    </main>
  );
};

export default AssignPage;
