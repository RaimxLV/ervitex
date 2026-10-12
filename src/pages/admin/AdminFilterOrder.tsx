import { useEffect, useState } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical, Loader2, RotateCcw, Save } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFilterOrder } from "@/hooks/useFilterOrder";
import { applyOrder } from "@/lib/filterOrder";
import { MANUFACTURERS } from "@/lib/manufacturers";

type M = { key: string; label: string };

const Row = ({ m, index, total, move }: { m: M; index: number; total: number; move: (from: number, to: number) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.key });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-md border border-border bg-card px-2 py-2 ${isDragging ? "relative z-10 shadow-lg ring-1 ring-accent" : ""}`}
    >
      <button type="button" {...attributes} {...listeners} aria-label="Pārvilkt" className="cursor-grab touch-none p-1.5 text-muted-foreground hover:text-accent active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 text-right font-mono text-xs text-muted-foreground">{index + 1}.</span>
      <span className="flex-1 text-sm font-medium">{m.label}</span>
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={index === 0} onClick={() => move(index, index - 1)} aria-label="Uz augšu">
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" disabled={index === total - 1} onClick={() => move(index, index + 1)} aria-label="Uz leju">
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

const AdminFilterOrder = () => {
  const { order, ready, save } = useFilterOrder();
  const { toast } = useToast();
  const [list, setList] = useState<M[]>(MANUFACTURERS);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (ready) setList(applyOrder(MANUFACTURERS, order.source, (m) => m.key));
  }, [ready, order.source]);

  const move = (from: number, to: number) => setList((l) => arrayMove(l, from, to));
  const onDragEnd = (e: DragEndEvent) => {
    const a = String(e.active.id), o = e.over ? String(e.over.id) : null;
    if (!o || a === o) return;
    setList((l) => arrayMove(l, l.findIndex((m) => m.key === a), l.findIndex((m) => m.key === o)));
  };

  const onSave = async () => {
    setSaving(true);
    const err = await save({ source: list.map((m) => m.key) });
    setSaving(false);
    toast(err ? { title: "Neizdevās saglabāt", description: err.message, variant: "destructive" } : { title: "Secība saglabāta" });
  };

  const onReset = async () => {
    setSaving(true);
    const { error } = await supabase.from("catalog_filter_order").delete().eq("key", "source");
    setSaving(false);
    if (error) return toast({ title: "Neizdevās", description: error.message, variant: "destructive" });
    setList(MANUFACTURERS);
    toast({ title: "Atjaunota sākotnējā secība" });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-heading text-2xl font-bold uppercase tracking-wide">Filtri — ražotāju secība</h1>
        {!ready ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={list.map((m) => m.key)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {list.map((m, i) => <Row key={m.key} m={m} index={i} total={list.length} move={move} />)}
              </div>
            </SortableContext>
          </DndContext>
        )}
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={saving || !ready} className="flex-1">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Saglabāt secību
          </Button>
          <Button variant="outline" onClick={onReset} disabled={saving}>
            <RotateCcw className="mr-2 h-4 w-4" />Sākotnējā
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFilterOrder;
