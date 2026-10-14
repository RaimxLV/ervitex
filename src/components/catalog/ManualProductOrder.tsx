import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyOrder } from "@/lib/filterOrder";
import { MANUAL_PRODUCT_ORDER_KEY } from "@/lib/teamSportswear";
import { useFilterOrder } from "@/hooks/useFilterOrder";
import { useToast } from "@/hooks/use-toast";

type Item = { id: string; name_lv: string };
function OrderRow({ item, index, count, move }: { item: Item; index: number; count: number; move: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 border border-border bg-card p-2 ${isDragging ? "relative z-10 ring-2 ring-accent" : ""}`}>
    <Button variant="ghost" size="icon" className="shrink-0 cursor-grab touch-none" aria-label={`Pārvilkt ${item.name_lv}`} {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></Button>
    <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">{index + 1}</span>
    <span className="min-w-0 flex-1 text-sm font-medium">{item.name_lv}</span>
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Uz augšu" aria-label={`${item.name_lv} uz augšu`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp className="h-4 w-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Uz leju" aria-label={`${item.name_lv} uz leju`} disabled={index === count - 1} onClick={() => move(index, index + 1)}><ArrowDown className="h-4 w-4" /></Button>
  </div>;
}

export default function ManualProductOrder({ products, order, onClose }: { products: Item[]; order: string[] | undefined; onClose: () => void }) {
  const [items, setItems] = useState(() => applyOrder(products, order, p => p.id));
  const [saving, setSaving] = useState(false);
  const { save } = useFilterOrder();
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const move = (from: number, to: number) => setItems(cur => arrayMove(cur, from, to));
  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex(p => p.id === active.id), to = items.findIndex(p => p.id === over.id);
    if (from >= 0 && to >= 0) move(from, to);
  };
  const saveOrder = async () => {
    setSaving(true);
    const error = await save({ [MANUAL_PRODUCT_ORDER_KEY]: items.map(p => p.id) });
    setSaving(false);
    if (error) toast({ title: "Neizdevās saglabāt", description: error.message, variant: "destructive" });
    else { toast({ title: "Kartīšu secība saglabāta" }); onClose(); }
  };
  return <div className="space-y-4">
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}><SortableContext items={items.map(p => p.id)} strategy={verticalListSortingStrategy}><div className="space-y-2">{items.map((item, index) => <OrderRow key={item.id} item={item} index={index} count={items.length} move={move} />)}</div></SortableContext></DndContext>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Atcelt</Button><Button onClick={saveOrder} disabled={saving}>{saving ? "Saglabā…" : "Saglabāt secību"}</Button></div>
  </div>;
}