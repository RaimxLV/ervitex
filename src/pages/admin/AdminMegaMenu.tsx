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
import { Plus, Trash2, Pencil, RefreshCw, Eye, EyeOff, GripVertical } from "lucide-react";
import {
  MEGA_MENU_SECTIONS,
  SECTION_META,
  buildCategoryHref,
  buildSourceHref,
  type MegaMenuSection,
} from "@/lib/megaMenuConfig";
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

type Section = MegaMenuSection;

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

function SortableRow({
  item,
  onEdit,
  onRemove,
  onToggleActive,
}: {
  item: Item;
  onEdit: (i: Item) => void;
  onRemove: (id: string) => void;
  onToggleActive: (i: Item) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };
  const isSource = SECTION_META[item.section]?.kind === "source";
  const href = isSource
    ? buildSourceHref(item.categories[0] || "")
    : buildCategoryHref(item.categories);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-card ${isDragging ? "shadow-lg" : ""} ${
        item.active ? "" : "opacity-60"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Pārvilkt"
        type="button"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {item.label_lv}
            <span className="ml-2 text-muted-foreground">/ {item.label_en}</span>
          </p>
          {item.auto_added && (
            <span className="rounded-sm bg-accent/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-accent">
              Auto
            </span>
          )}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">
          {isSource ? `ražotāja filtrs: ${item.categories[0] || "—"}` : item.categories.join(" · ")}
        </p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="hidden shrink-0 text-[11px] text-muted-foreground underline-offset-2 hover:underline sm:block"
      >
        Pārbaudīt
      </a>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onToggleActive(item)}
        title={item.active ? "Paslēpt" : "Rādīt"}
      >
        {item.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-50" />}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

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
    items
      .filter((i) => SECTION_META[i.section]?.kind !== "source")
      .forEach((i) => i.categories.forEach((c) => s.add(c)));
    return s;
  }, [items]);

  const missingCategories = useMemo(
    () => dbCategories.filter((c) => !usedCategories.has(c.category)),
    [dbCategories, usedCategories],
  );

  const bySection = useMemo(() => {
    const g = {} as Record<Section, Item[]>;
    MEGA_MENU_SECTIONS.forEach((s) => (g[s.key] = []));
    items.forEach((i) => {
      if (g[i.section]) g[i.section].push(i);
    });
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
      toast({
        title: "Aizpildi visus laukus",
        description: "LV, EN un vismaz viena kategorija/filtrs obligāti",
        variant: "destructive",
      });
      return;
    }
    const payload = {
      section: draft.section as Section,
      label_lv: draft.label_lv!,
      label_en: draft.label_en!,
      categories: cats,
      image_url: null,
      sort_order: draft.sort_order ?? 999,
      active: draft.active ?? true,
      auto_added: false,
    };
    if (draft.id) {
      const { error } = await supabase.from("mega_menu_items").update(payload).eq("id", draft.id);
      if (error)
        return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("mega_menu_items").insert(payload);
      if (error)
        return toast({ title: "Kļūda", description: error.message, variant: "destructive" });
    }
    setDialogOpen(false);
    load();
    toast({ title: "Saglabāts", description: "Izmaiņas uzreiz redzamas mājaslapas izvēlnē." });
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
    const updates = reordered.map((it, idx) => ({ id: it.id, sort_order: (idx + 1) * 10 }));
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

  const syncMissing = async () => {
    if (missingCategories.length === 0) {
      toast({ title: "Nekas jauns", description: "Visas kataloga kategorijas jau ir izvēlnē" });
      return;
    }
    setSyncing(true);
    const maxSort = Math.max(0, ...items.filter((i) => i.section === "promo").map((i) => i.sort_order));
    const rows = missingCategories.map((c, i) => ({
      section: "promo" as Section,
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
      description: `${rows.length} jaunas kategorijas pievienotas sadaļā "Prezentmateriāli" kā neaktīvas — pārvieto un aktivizē pēc vajadzības.`,
    });
    load();
  };

  const activeCount = items.filter((i) => i.active).length;

  return (
    <AdminLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-black uppercase tracking-wider">
              Mega izvēlne
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Šīs sadaļas veido mājaslapas “Katalogs” izvēlni. {activeCount} aktīvi ieraksti no{" "}
              {items.length}.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                load();
                loadDbCategories();
              }}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atsvaidzināt
            </Button>
            <Button onClick={syncMissing} disabled={syncing}>
              <Plus className="mr-2 h-4 w-4" />
              Trūkstošās kategorijas ({missingCategories.length})
            </Button>
          </div>
        </div>

        {MEGA_MENU_SECTIONS.map((meta) => (
          <section key={meta.key} className="rounded-sm border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="font-heading text-sm font-bold uppercase tracking-widest">
                  {meta.lv}
                  <span className="ml-2 text-muted-foreground">
                    ({bySection[meta.key]?.length ?? 0})
                  </span>
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {meta.kind === "source"
                    ? "Ražotāju rinda izvēlnes apakšā — filtrs pēc ražotāja"
                    : `Kolonna “${meta.lv}” — filtrs pēc kategorijas`}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => openNew(meta.key)}>
                <Plus className="mr-2 h-3 w-3" /> Pievienot
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(meta.key, e)}
            >
              <SortableContext
                items={(bySection[meta.key] || []).map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-border">
                  {(bySection[meta.key] || []).length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">Nav ierakstu.</p>
                  )}
                  {(bySection[meta.key] || []).map((item) => (
                    <SortableRow
                      key={item.id}
                      item={item}
                      onEdit={openEdit}
                      onRemove={remove}
                      onToggleActive={toggleActive}
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
                <Label>Sadaļa</Label>
                <Select
                  value={draft.section}
                  onValueChange={(v) => setDraft({ ...draft, section: v as Section })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEGA_MENU_SECTIONS.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.lv}
                      </SelectItem>
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
                <Label>
                  {draft.section === "manufacturers"
                    ? "Ražotāja filtra kods"
                    : "Filtru kategorijas (atdala ar komatu)"}
                </Label>
                <Textarea
                  rows={3}
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  placeholder={
                    draft.section === "manufacturers" ? "stanley-stella" : "T-shirts, Tops"
                  }
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {draft.section === "manufacturers"
                    ? "Pieejamie kodi: stanley-stella, nwg-craft, nwg-clique, nwg-projob, nwg-cutter, pf-elevate, pf-roly, ru, bb, mf, pf"
                    : `Populārākās kategorijas: ${dbCategories
                        .slice(0, 12)
                        .map((c) => c.category)
                        .join(", ")}`}
                </p>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Atcelt
            </Button>
            <Button onClick={save}>Saglabāt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
