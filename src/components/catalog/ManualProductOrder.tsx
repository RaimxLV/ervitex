import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyOrder } from "@/lib/filterOrder";
import { MANUAL_PRODUCT_ORDER_KEY } from "@/lib/teamSportswear";
import type { FilterOrderMap } from "@/hooks/useFilterOrder";
import { useToast } from "@/hooks/use-toast";

type Item = { id: string; name_lv: string; image?: string | null; product_images?: { url: string }[] };
function OrderRow({ item, index, count, move }: { item: Item; index: number; count: number; move: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 border border-border bg-card p-2 ${isDragging ? "relative z-10 ring-2 ring-accent" : ""}`}>
    <Button ref={setActivatorNodeRef} variant="ghost" size="icon" className="shrink-0 cursor-grab touch-none active:cursor-grabbing" aria-label={`Pārvilkt ${item.name_lv}`} {...attributes} {...listeners}><GripVertical className="h-4 w-4" /></Button>
    <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">{index + 1}</span>
    {(item.image || item.product_images?.[0]?.url) && <img src={item.image || item.product_images?.[0]?.url} alt="" className="h-10 w-10 shrink-0 bg-muted object-contain" loading="lazy" />}
    <span className="min-w-0 flex-1 text-sm font-medium">{item.name_lv}</span>
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Uz augšu" aria-label={`${item.name_lv} uz augšu`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp className="h-4 w-4" /></Button>
    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="Uz leju" aria-label={`${item.name_lv} uz leju`} disabled={index === count - 1} onClick={() => move(index, index + 1)}><ArrowDown className="h-4 w-4" /></Button>
  </div>;
}

export default function ManualProductOrder({ products, order, save, onClose }: { products: Item[]; order: string[] | undefined; save: (next: FilterOrderMap) => Promise<{ message: string } | null>; onClose: () => void }) {
  const [items, setItems] = useState(() => applyOrder(products, order, p => p.id));
  const [saving, setSaving] = useState(false);
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
function GridTile({ item, index, count, move }: { item: Item; index: number; count: number; move: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const img = item.image || item.product_images?.[0]?.url;
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}
    aria-label={`Pārvilkt ${item.name_lv}`}
    className={`relative flex cursor-grab touch-none select-none flex-col border border-border bg-card active:cursor-grabbing ${isDragging ? "z-20 opacity-90 shadow-2xl ring-2 ring-accent" : "hover:border-foreground"}`}>
    <span className="absolute left-2 top-2 z-10 flex h-8 min-w-8 items-center justify-center bg-primary px-2 text-sm font-bold tabular-nums text-primary-foreground">{index + 1}</span>
    <span className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center bg-background/90 text-foreground"><GripVertical className="h-4 w-4" /></span>
    <div className="aspect-[3/4] w-full bg-muted">{img && <img src={img} alt="" draggable={false} className="h-full w-full object-cover" />}</div>
    <div className="flex items-center gap-1 border-t border-border p-2">
      <span className="min-w-0 flex-1 truncate text-xs font-semibold uppercase">{item.name_lv}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`${item.name_lv} pa kreisi`} disabled={index === 0} onPointerDown={e => e.stopPropagation()} onClick={() => move(index, index - 1)}><ArrowUp className="h-4 w-4 -rotate-90" /></Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`${item.name_lv} pa labi`} disabled={index === count - 1} onPointerDown={e => e.stopPropagation()} onClick={() => move(index, index + 1)}><ArrowDown className="h-4 w-4 -rotate-90" /></Button>
    </div>
  </div>;
}

/** In-place catalog ordering: admins drag the real card grid instead of a hidden list. */
export function ManualProductGridOrder({ products, order, save, onClose }: { products: Item[]; order: string[] | undefined; save: (next: FilterOrderMap) => Promise<{ message: string } | null>; onClose: () => void }) {
  const [items, setItems] = useState(() => applyOrder(products, order, p => p.id));
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
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
    <div className="sticky top-20 z-30 flex flex-wrap items-center justify-between gap-3 border border-foreground bg-background p-3 shadow-lg">
      <span className="text-sm font-bold uppercase">Pārvelc kartītes vajadzīgajā secībā</span>
      <div className="flex gap-2"><Button variant="outline" onClick={onClose} disabled={saving}>Atcelt</Button><Button variant="destructive" onClick={saveOrder} disabled={saving}>{saving ? "Saglabā…" : "Saglabāt secību"}</Button></div>
    </div>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={dragEnd}>
      <SortableContext items={items.map(p => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">{items.map((item, index) => <GridTile key={item.id} item={item} index={index} count={items.length} move={move} />)}</div>
      </SortableContext>
    </DndContext>
  </div>;
}
