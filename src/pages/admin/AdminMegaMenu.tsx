import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";
import { resolveMenuImage } from "@/lib/megaMenuImages";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Section = "apparel" | "bags" | "promo" | "promo_link";

interface Item {
  id: string;
  section: Section;
  label_lv: string;
  label_en: string;
  categories: string[];
  image_url: string | null;
  sort_order: number;
  active: boolean;
  auto_added: boolean;
}

const SECTION_LABELS: Record<Section, string> = {
  apparel: "Apģērbi (ar bildēm)",
  bags: "Somas un ceļojumi (ar bildēm)",
  promo: "Prezentmateriāli (ar bildēm)",
  promo_link: "Prezentmateriāli (teksta saraksts)",
};

const emptyDraft = (section: Section): Partial<Item> => ({
  section,
  label_lv: "",
  label_en: "",
  categories: [],
  image_url: null,
  active: true,
  sort_order: 999,
  auto_added: false,
});

export default function AdminMegaMenu() {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ category: string; count: number }[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Item> | null>(null);
  const [categoriesInput, setCategoriesInput] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mega_menu_items")
      .select("*")
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    setItems((data as Item[]) || []);
    setLoading(false);
  };

  const loadDbCategories = async () => {
    const { data } = await supabase
      .schema("private" as any)
      .from("catalog_items_mv" as any)
      .select("category")
      .not("category", "is", null)
      .limit(5000);
    const counts: Record<string, number> = {};
    ((data as any[]) || []).forEach((r) => {
      const c = (r.category || "").trim();
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    setDbCategories(
      Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
    );
  };

  useEffect(() => {
    load();
    loadDbCategories();
  }, []);

  const usedCategories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((i) => i.categories.forEach((c) => s.add(c)));
    return s;
  }, [items]);

  const missingCategories = useMemo(
    () => dbCategories.filter((c) => !usedCategories.has(c.category)),
    [dbCategories, usedCategories],
  );

  const bySection = useMemo(() => {
    const g: Record<Section, Item[]> = { apparel: [], bags: [], promo: [], promo_link: [] };
    items.forEach((i) => g[i.section].push(i));
    return g;
  }, [items]);

  const openNew = (section: Section) => {
    setDraft(emptyDraft(section));
    setCategoriesInput("");
    setDialogOpen(true);
  };

  const openEdit = (item: Item) => {
    setDraft({ ...item });
    setCategoriesInput(item.categories.join(", "));
    setDialogOpen(true);
  };

  const save = async () => {
    if (!draft) return;
    const cats = categoriesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!draft.label_lv || !draft.label_en || cats.length === 0) {
      toast({ title: "Aizpildi visus laukus", description: "LV, EN, kategorijas obligāti", variant: "destructive" });
      return;
    }
    const payload = {
      section: draft.section as Section,
      label_lv: draft.label_lv!,
      label_en: draft.label_en!,
      categories: cats,
      image_url: draft.image_url ?? null,
      sort_order: draft.sort_order ?? 999,
      active: draft.active ?? true,
      auto_added: false,
    };
    if (draft.id) {
      const { error } = await supabase.from("mega_menu_items").update(payload).eq("id", draft.id);
      if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("mega_menu_items").insert(payload);
      if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    }
    setDialogOpen(false);
    load();
    toast({ title: "Saglabāts" });
  };

  const remove = async (id: string) => {
    if (!confirm("Dzēst šo ierakstu?")) return;
    const { error } = await supabase.from("mega_menu_items").delete().eq("id", id);
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    load();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (section: Section, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const list = bySection[section];
    const oldIndex = list.findIndex((i) => i.id === active.id);
    const newIndex = list.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(list, oldIndex, newIndex);
    // Reassign sort_order sequentially (10, 20, 30, ...)
    const updates = reordered.map((it, idx) => ({ id: it.id, sort_order: (idx + 1) * 10 }));
    // Optimistic update
    setItems((prev) => {
      const map = new Map(updates.map((u) => [u.id, u.sort_order]));
      return prev.map((it) => (map.has(it.id) ? { ...it, sort_order: map.get(it.id)! } : it));
    });
    await Promise.all(
      updates.map((u) =>
        supabase.from("mega_menu_items").update({ sort_order: u.sort_order }).eq("id", u.id),
      ),
    );
  };

  const toggleActive = async (item: Item) => {
    await supabase.from("mega_menu_items").update({ active: !item.active }).eq("id", item.id);
    load();
  };

  const uploadImage = async (item: Item, file: File) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `mega-menu/${item.id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) return toast({ title: "Augšupielādes kļūda", description: error.message, variant: "destructive" });
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    await supabase.from("mega_menu_items").update({ image_url: data.publicUrl }).eq("id", item.id);
    load();
    toast({ title: "Bilde augšupielādēta" });
  };

  const syncMissing = async () => {
    if (missingCategories.length === 0) {
      toast({ title: "Nekas jauns", description: "Visas kategorijas jau ir izvēlnē" });
      return;
    }
    setSyncing(true);
    const maxSort = Math.max(0, ...items.filter((i) => i.section === "promo_link").map((i) => i.sort_order));
    const rows = missingCategories.map((c, i) => ({
      section: "promo_link" as Section,
      label_lv: c.category,
      label_en: c.category,
      categories: [c.category],
      sort_order: maxSort + (i + 1) * 10,
      active: false,
      auto_added: true,
    }));
    const { error } = await supabase.from("mega_menu_items").insert(rows);
    setSyncing(false);
    if (error) return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    toast({
      title: "Pievienotas",
      description: `${rows.length} jaunas kategorijas pievienotas kā neaktīvas — aktivizē un pārkārto pēc vajadzības.`,
    });
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-black uppercase tracking-wider">Mega izvēlne</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sakārto kataloga mega izvēlni — sekcijas, secība, nosaukumi, bildes.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { load(); loadDbCategories(); }} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atsvaidzināt
            </Button>
            <Button onClick={syncMissing} disabled={syncing}>
              <Plus className="mr-2 h-4 w-4" />
              Sinhronizēt trūkstošās ({missingCategories.length})
            </Button>
          </div>
        </div>

        {(["apparel", "bags", "promo", "promo_link"] as Section[]).map((section) => (
          <section key={section} className="rounded-sm border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-heading text-sm font-bold uppercase tracking-widest">
                {SECTION_LABELS[section]}
                <span className="ml-2 text-muted-foreground">({bySection[section].length})</span>
              </h2>
              <Button size="sm" variant="outline" onClick={() => openNew(section)}>
                <Plus className="mr-2 h-3 w-3" /> Pievienot
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(section, e)}
            >
              <SortableContext
                items={bySection[section].map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-border">
                  {bySection[section].length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">Nav ierakstu.</p>
                  )}
                  {bySection[section].map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={openEdit}
                      onRemove={remove}
                      onToggleActive={toggleActive}
                      onUploadImage={uploadImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </section>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Rediģēt" : "Pievienot"} ierakstu</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div>
                <Label>Sekcija</Label>
                <Select
                  value={draft.section}
                  onValueChange={(v) => setDraft({ ...draft, section: v as Section })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["apparel", "bags", "promo", "promo_link"] as Section[]).map((s) => (
                      <SelectItem key={s} value={s}>{SECTION_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nosaukums LV</Label>
                  <Input
                    value={draft.label_lv || ""}
                    onChange={(e) => setDraft({ ...draft, label_lv: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Nosaukums EN</Label>
                  <Input
                    value={draft.label_en || ""}
                    onChange={(e) => setDraft({ ...draft, label_en: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Filtru kategorijas (atdala ar komatu)</Label>
                <Textarea
                  rows={3}
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  placeholder="T-shirts, Tops"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Ieteikumi (top no filtriem): {dbCategories.slice(0, 12).map((c) => c.category).join(", ")}
                </p>
              </div>
              <div>
                <Label>Bildes URL (neobligāts)</Label>
                <Input
                  value={draft.image_url || ""}
                  onChange={(e) => setDraft({ ...draft, image_url: e.target.value })}
                  placeholder="https://... vai atstāj tukšu un augšupielādē pēc saglabāšanas"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Aktīvs (redzams izvēlnē)</Label>
                <Switch
                  id="active"
                  checked={draft.active ?? true}
                  onCheckedChange={(v) => setDraft({ ...draft, active: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Atcelt</Button>
            <Button onClick={save}>Saglabāt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
