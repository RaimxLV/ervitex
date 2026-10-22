import { arrayMove } from "@dnd-kit/sortable";

/** Reorder existing identities only; category content is never changed. */
export function moveCategory<T extends { id: string }>(rows: T[], activeId: string, overId: string): T[] {
  const from = rows.findIndex(row => row.id === activeId);
  const to = rows.findIndex(row => row.id === overId);
  if (from < 0 || to < 0 || from === to) return rows;
  return arrayMove(rows, from, to);
}

export function categoryOrderUpdates(rows: { id: string; sort_order: number | null }[]) {
  return rows.flatMap((row, index) => row.sort_order === (index + 1) * 10
    ? []
    : [{ id: row.id, sort_order: (index + 1) * 10 }]);
}