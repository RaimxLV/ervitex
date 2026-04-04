import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface CategoryRow {
  id: string;
  slug: string;
  name_lv: string;
  name_en: string;
  description_lv: string | null;
  description_en: string | null;
  image: string | null;
  sort_order: number | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", name_lv: "", name_en: "", description_lv: "", description_en: "", image: "", sort_order: 0 });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };
  useEffect(() => { fetchData(); }, []);

  const startEdit = (cat: CategoryRow) => {
    setEditing(cat.id);
    setForm({ slug: cat.slug, name_lv: cat.name_lv, name_en: cat.name_en, description_lv: cat.description_lv || "", description_en: cat.description_en || "", image: cat.image || "", sort_order: cat.sort_order || 0 });
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.name_lv.trim() || !form.name_en.trim()) {
      toast({ title: "Slug un nosaukumi ir obligāti", variant: "destructive" }); return;
    }
    if (editing) {
      const { error } = await supabase.from("categories").update(form).eq("id", editing);
      if (error) { toast({ title: "Kļūda", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("categories").insert(form);
      if (error) { toast({ title: "Kļūda", description: error.message, variant: "destructive" }); return; }
    }
    setEditing(null); setAdding(false);
    setForm({ slug: "", name_lv: "", name_en: "", description_lv: "", description_en: "", image: "", sort_order: 0 });
    fetchData();
    toast({ title: editing ? "Kategorija atjaunināta" : "Kategorija izveidota" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Vai tiešām dzēst šo kategoriju?")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
    toast({ title: "Kategorija dzēsta" });
  };

  const renderForm = () => (
    <div className="rounded-sm border border-accent/30 bg-accent/5 p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label className="text-xs uppercase tracking-wider">Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="piem. tshirts" /></div>
        <div><Label className="text-xs uppercase tracking-wider">Nosaukums (LV)</Label><Input value={form.name_lv} onChange={e => setForm({...form, name_lv: e.target.value})} /></div>
        <div><Label className="text-xs uppercase tracking-wider">Nosaukums (EN)</Label><Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} /></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label className="text-xs uppercase tracking-wider">Attēla URL</Label><Input value={form.image} onChange={e => setForm({...form, image: e.target.value})} /></div>
        <div><Label className="text-xs uppercase tracking-wider">Kārtošanas secība</Label><Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} /></div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90"><Save className="mr-1 h-3 w-3" /> Saglabāt</Button>
        <Button size="sm" variant="outline" onClick={() => { setEditing(null); setAdding(false); }}><X className="mr-1 h-3 w-3" /> Atcelt</Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-wide text-foreground">Kategorijas</h1>
        {!adding && (
          <Button onClick={() => { setAdding(true); setEditing(null); setForm({ slug: "", name_lv: "", name_en: "", description_lv: "", description_en: "", image: "", sort_order: 0 }); }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
            <Plus className="mr-2 h-4 w-4" /> Pievienot kategoriju
          </Button>
        )}
      </div>

      {adding && <div className="mt-6">{renderForm()}</div>}

      <div className="mt-6 space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            {editing === cat.id ? renderForm() : (
              <div className="flex items-center justify-between rounded-sm border border-border p-4 hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  {cat.image && <img src={cat.image} alt="" className="h-10 w-10 rounded-sm object-cover" />}
                  <div>
                    <p className="font-medium text-foreground">{cat.name_lv}</p>
                    <p className="text-xs text-muted-foreground">{cat.name_en} · {cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
