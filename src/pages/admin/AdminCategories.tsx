import { useEffect, useState, type ReactNode } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { categoryOrderUpdates, moveCategory } from "@/lib/categoryOrder";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, X, GripVertical, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

function SortableCategory({ cat, disabled, children }: { cat: CategoryRow; disabled: boolean; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id, disabled });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-sm border border-border bg-card p-2 sm:p-4 ${isDragging ? "relative z-10 ring-2 ring-accent shadow-lg" : "hover:bg-muted/30"}`}>
      <Button ref={setActivatorNodeRef} type="button" variant="ghost" size="icon" disabled={disabled}
        {...attributes} {...listeners} aria-label={`Pārvietot: ${cat.name_lv}`} title={`Pārvietot: ${cat.name_lv}`}
        className="shrink-0 cursor-grab touch-none text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-5 w-5" />
      </Button>
      {children}
    </div>
  );
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [savedCategories, setSavedCategories] = useState<CategoryRow[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: "", name_lv: "", name_en: "", description_lv: "", description_en: "", image: "", sort_order: 0 });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const orderChanged = categories.some((cat, index) => cat.id !== savedCategories[index]?.id);
  const orderDisabled = savingOrder || adding || editing !== null;

  const fetchData = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("id");
    if (error) {
      toast({ title: "Neizdevās ielādēt kategorijas", description: error.message, variant: "destructive" });
      return;
    }
    setCategories(data || []);
    setSavedCategories(data || []);
  };
  useEffect(() => { fetchData(); }, []);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (orderDisabled || !over) return;
    setCategories(current => moveCategory(current, String(active.id), String(over.id)));
  };

  const saveOrder = async () => {
    if (orderDisabled || !orderChanged) return;
    setSavingOrder(true);
    try {
      const updates = categoryOrderUpdates(categories);
      const results = await Promise.all(updates.map(update => supabase.from("categories")
        .update({ sort_order: update.sort_order }).eq("id", update.id).select("id, sort_order")));
      const failed = results.find((result, index) => result.error || result.data?.length !== 1
        || result.data[0]?.sort_order !== updates[index]?.sort_order);
      if (failed) throw new Error(failed.error?.message || "Secību neizdevās saglabāt pilnībā. Saraksts tiks pārlādēts.");
      const saved = categories.map((cat, index) => ({ ...cat, sort_order: (index + 1) * 10 }));
      setCategories(saved);
      setSavedCategories(saved);
      toast({ title: "Kategoriju secība saglabāta" });
    } catch (error) {
      toast({ title: "Neizdevās saglabāt secību", description: error instanceof Error ? error.message : "Mēģiniet vēlreiz.", variant: "destructive" });
      await fetchData();
    } finally {
      setSavingOrder(false);
    }
  };

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
        <div className="flex flex-wrap items-center gap-2">
        {orderChanged && <>
          <Button onClick={saveOrder} disabled={orderDisabled}>
            {savingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Saglabāt secību
          </Button>
          <Button variant="outline" disabled={savingOrder} onClick={() => setCategories(savedCategories)}><X className="mr-2 h-4 w-4" /> Atcelt</Button>
        </>}
        {!adding && (
          <Button disabled={savingOrder || orderChanged} onClick={() => { setAdding(true); setEditing(null); setForm({ slug: "", name_lv: "", name_en: "", description_lv: "", description_en: "", image: "", sort_order: 0 }); }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest">
            <Plus className="mr-2 h-4 w-4" /> Pievienot kategoriju
          </Button>
        )}
        </div>
      </div>

      {adding && <div className="mt-6">{renderForm()}</div>}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={categories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
      <div className="mt-6 space-y-2">
        {categories.map(cat => (
          <div key={cat.id}>
            {editing === cat.id ? renderForm() : (
              <SortableCategory cat={cat} disabled={orderDisabled}>
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  {cat.image && <img src={cat.image} alt="" className="h-10 w-10 rounded-sm object-cover" />}
                  <div className="min-w-0 break-words">
                    <p className="font-medium text-foreground">{cat.name_lv}</p>
                    <p className="break-all text-xs text-muted-foreground">{cat.name_en} · {cat.slug}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" disabled={savingOrder || orderChanged} aria-label={`Rediģēt: ${cat.name_lv}`} onClick={() => startEdit(cat)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={savingOrder || orderChanged} aria-label={`Dzēst: ${cat.name_lv}`}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Dzēst kategoriju?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Vai tiešām vēlaties dzēst "{cat.name_lv}"? Visi kategorijas produkti zaudēs savu kategoriju.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Atcelt</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Dzēst</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SortableCategory>
            )}
          </div>
        ))}
      </div>
      </SortableContext>
      </DndContext>
    </AdminLayout>
  );
};

export default AdminCategories;
