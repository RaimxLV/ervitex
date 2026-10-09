import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, Save, Upload } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { prepareTeamPhoto } from "@/lib/teamPhoto";
import vilnisPhoto from "@/assets/team/vilnis-lacis.webp";
import eriksPhoto from "@/assets/team/eriks-lacis.webp";
import lauraPhoto from "@/assets/team/laura-daukste.webp";
import ilonaPhoto from "@/assets/team/ilona-romanovska.webp";
import santaPhoto from "@/assets/team/santa-zvaigzne.webp";
import justinePhoto from "@/assets/team/justine-strunka.webp";
import evitaPhoto from "@/assets/team/evita-nesterova.webp";

type PhotoSettings = {
  slug: string;
  zoom: number;
  position_x: number;
  position_y: number;
  photo_url?: string | null;
};

const people = [
  { slug: "vilnis", name: "Vilnis Lācis", photo: vilnisPhoto },
  { slug: "eriks", name: "Ēriks Lācis", photo: eriksPhoto },
  { slug: "laura", name: "Laura Daukšte", photo: lauraPhoto },
  { slug: "ilona", name: "Ilona Romanovska", photo: ilonaPhoto },
  { slug: "santa", name: "Santa Zvaigzne", photo: santaPhoto },
  { slug: "justine", name: "Justīne Strunka", photo: justinePhoto },
  { slug: "evita", name: "Evita Ņesterova", photo: evitaPhoto },
];

const defaults = (slug: string): PhotoSettings => ({ slug, zoom: 1, position_x: 50, position_y: 50 });

export default function AdminTeamPhotos() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, PhotoSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, Blob>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const previewRefs = useRef<Record<string, string>>({});
  useEffect(() => () => Object.values(previewRefs.current).forEach(URL.revokeObjectURL), []);

  const selectPhoto = async (slug: string, file?: File) => {
    if (!file) return;
    setSaving(slug);
    try {
      const blob = await prepareTeamPhoto(file);
      if (previewRefs.current[slug]) URL.revokeObjectURL(previewRefs.current[slug]);
      const url = URL.createObjectURL(blob);
      previewRefs.current[slug] = url;
      setPreviews((current) => ({ ...current, [slug]: url }));
      setPending((current) => ({ ...current, [slug]: blob }));
      setSettings((current) => ({ ...current, [slug]: { ...(current[slug] ?? defaults(slug)), zoom: 1, position_x: 50, position_y: 50 } }));
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Neizdevās ielādēt foto", variant: "destructive" });
    } finally { setSaving(null); }
  };

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("team_photo_settings").select("*");
      if (error) {
        toast({ title: "Neizdevās ielādēt", description: error.message, variant: "destructive" });
      }
      const next: Record<string, PhotoSettings> = {};
      people.forEach(({ slug }) => { next[slug] = defaults(slug); });
      data?.forEach((row) => { next[row.slug] = { ...row, zoom: Number(row.zoom), position_x: Number(row.position_x), position_y: Number(row.position_y) }; });
      setSettings(next);
      setLoading(false);
    };
    load();
  }, [toast]);

  const change = (slug: string, key: "zoom" | "position_x" | "position_y", value: number) => {
    setSettings((current) => ({
      ...current,
      [slug]: { ...(current[slug] ?? defaults(slug)), [key]: value },
    }));
  };

  const save = async (slug: string) => {
    const value = settings[slug];
    if (!value) return;
    setSaving(slug);
    let uploadedPath: string | null = null;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Pieslēdzies vēlreiz");
      const { data: allowed, error: roleError } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (roleError || !allowed) throw new Error("Nav atļauts");
      let photo_url = value.photo_url ?? null;
      if (pending[slug]) {
        uploadedPath = `team/${slug}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from("product-images").upload(uploadedPath, pending[slug], { contentType: "image/webp", cacheControl: "31536000" });
        if (error) { uploadedPath = null; throw error; }
        photo_url = supabase.storage.from("product-images").getPublicUrl(uploadedPath).data.publicUrl;
      }
      const next = { ...value, photo_url };
      const { error } = await supabase.from("team_photo_settings").upsert({ ...next, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSettings((current) => ({ ...current, [slug]: next }));
      setPending((current) => { const next = { ...current }; delete next[slug]; return next; });
      setPreviews((current) => { const next = { ...current }; delete next[slug]; return next; });
      if (previewRefs.current[slug]) { URL.revokeObjectURL(previewRefs.current[slug]); delete previewRefs.current[slug]; }
      toast({ title: "Foto saglabāts" });
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("product-images").remove([uploadedPath]);
      toast({ title: "Neizdevās saglabāt", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally { setSaving(null); }
  };

  if (loading) {
    return <AdminLayout><div className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <h1 className="font-heading text-xl font-black uppercase text-foreground sm:text-2xl">Komandas foto</h1>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => {
          const value = settings[person.slug] ?? defaults(person.slug);
          return (
            <article key={person.slug} aria-label={person.name} className="overflow-hidden rounded-sm border border-border bg-card">
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={previews[person.slug] || value.photo_url || person.photo}
                  alt={person.name}
                  className="h-full w-full max-w-none object-cover"
                  style={{
                    transform: `translate(${(value.position_x - 50) * 0.5}%, ${(value.position_y - 50) * 0.5}%) scale(${value.zoom})`,
                  }}
                />
              </div>

              <div className="space-y-5 p-4">
                <h2 className="font-heading text-sm font-bold uppercase text-foreground">{person.name}</h2>

                <input id={`photo-${person.slug}`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" disabled={saving !== null} onChange={(event) => { void selectPhoto(person.slug, event.target.files?.[0]); event.target.value = ""; }} />
                <Button variant="outline" className="w-full" disabled={saving !== null} onClick={() => document.getElementById(`photo-${person.slug}`)?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Nomainīt foto
                </Button>
                {pending[person.slug] && <p className="text-xs text-accent">Jauns foto — nav saglabāts</p>}

                <label className="block space-y-2">
                  <span className="flex justify-between text-xs text-muted-foreground"><span>Pietuvinājums</span><span>{Math.round(value.zoom * 100)}%</span></span>
                  <Slider disabled={saving !== null} min={1} max={2} step={0.01} value={[value.zoom]} onValueChange={([v]) => change(person.slug, "zoom", v)} />
                </label>
                <label className="block space-y-2">
                  <span className="flex justify-between text-xs text-muted-foreground"><span>Pa kreisi / pa labi</span><span>{Math.round(value.position_x)}%</span></span>
                  <Slider disabled={saving !== null} min={0} max={100} step={1} value={[value.position_x]} onValueChange={([v]) => change(person.slug, "position_x", v)} />
                </label>
                <label className="block space-y-2">
                  <span className="flex justify-between text-xs text-muted-foreground"><span>Uz augšu / uz leju</span><span>{Math.round(value.position_y)}%</span></span>
                  <Slider disabled={saving !== null} min={0} max={100} step={1} value={[value.position_y]} onValueChange={([v]) => change(person.slug, "position_y", v)} />
                </label>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => save(person.slug)} disabled={saving !== null}>
                    {saving === person.slug ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Saglabāt
                  </Button>
                  <Button variant="outline" size="icon" disabled={saving !== null} aria-label="Atjaunot sākuma novietojumu" title="Atjaunot sākuma novietojumu" onClick={() => setSettings((current) => ({ ...current, [person.slug]: { ...current[person.slug], ...defaults(person.slug) } }))}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </AdminLayout>
  );
}