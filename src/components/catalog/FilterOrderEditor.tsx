import { useState } from "react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SECTIONS_ORDER_KEY } from "@/lib/filterOrder";
import type { FilterOrderMap } from "@/hooks/useFilterOrder";

export interface EditableSection {
  key: string;
  title: string;
  items: { value: string; label: string }[];
  /** Nested second level (e.g. brands under a manufacturer), keyed by parent value. */
  nestedItems?: Record<string, { value: string; label: string }[]>;
}

interface Props {
  sections: EditableSection[];
  onSave: (next: FilterOrderMap) => Promise<unknown>;
  onClose: () => void;
}

const Row = ({ id, children, className }: { id: string; children: React.ReactNode; className?: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-md border border-border bg-card", isDragging && "relative z-10 shadow-lg ring-1 ring-accent", className)}
    >
      <button type="button" {...attributes} {...listeners} aria-label="Pārvilkt" className="cursor-grab touch-none p-1.5 text-muted-foreground hover:text-accent active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
};

const FilterOrderEditor = ({ sections: initial, onSave, onClose }: Props) => {
  const [sections, setSections] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const moveSections = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setSections((s) => arrayMove(s, s.findIndex((x) => x.key === e.active.id), s.findIndex((x) => x.key === e.over!.id)));
  };
  const moveItems = (key: string) => (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setSections((s) => s.map((sec) => sec.key !== key ? sec : {
      ...sec,
      items: arrayMove(sec.items, sec.items.findIndex((i) => i.value === e.active.id), sec.items.findIndex((i) => i.value === e.over!.id)),
    }));
  };

  const save = async () => {
    setSaving(true);
    const next: FilterOrderMap = { [SECTIONS_ORDER_KEY]: sections.map((s) => s.key) };
    for (const s of sections) next[s.key] = s.items.map((i) => i.value);
    const err = await onSave(next);
    setSaving(false);
    if (!err) onClose();
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveSections}>
        <SortableContext items={sections.map((s) => s.key)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((s) => (
              <div key={s.key}>
                <Row id={s.key} className="pr-2">
                  <button type="button" onClick={() => setOpen(open === s.key ? null : s.key)} className="flex flex-1 items-center justify-between py-3 text-left">
                    <span className="font-heading text-xs font-bold uppercase tracking-[0.15em]">{s.title}</span>
                    {open === s.key ? <ChevronDown className="h-4 w-4 text-accent" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </Row>
                {open === s.key && (
                  <div className="ml-4 mt-1 max-h-80 space-y-1 overflow-y-auto overscroll-contain border-l border-border pl-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveItems(s.key)}>
                      <SortableContext items={s.items.map((i) => i.value)} strategy={verticalListSortingStrategy}>
                        {s.items.map((i) => (
                          <Row key={i.value} id={i.value}>
                            <span className="truncate py-1.5 pr-2 text-sm">{i.label}</span>
                          </Row>
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex gap-2">
        <Button onClick={save} disabled={saving} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold uppercase tracking-wider">
          {saving ? "Saglabā…" : "Saglabāt secību"}
        </Button>
        <Button variant="outline" onClick={onClose} className="text-xs font-bold uppercase tracking-wider">Atcelt</Button>
      </div>
    </div>
  );
};

export default FilterOrderEditor;
