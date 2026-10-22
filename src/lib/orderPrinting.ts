import type { OfferItem } from "./offer";

export type OfferPrint = NonNullable<OfferItem["prints"]>[number];
export const getOrderPrints = (items: OfferItem[]) => items.flatMap((i) => (i.prints || []).filter((p) => p.scope === "order"));
export const setOrderPrints = (items: OfferItem[], prints: OfferPrint[]): OfferItem[] => items.map((item, index) => ({
  ...item,
  prints: [...(item.prints || []).filter((p) => p.scope !== "order"), ...(index === 0 ? prints.map((p) => ({ ...p, scope: "order" as const })) : [])],
}));
export const removeOfferItem = (items: OfferItem[], id: string) => setOrderPrints(items.filter((i) => i.id !== id), getOrderPrints(items));
export const itemHasPrinting = (item: OfferItem, orderPrints: OfferPrint[]) =>
  orderPrints.length > 0 || (item.prints || []).some((p) => p.scope !== "order");
export const orderPrintingNet = (items: OfferItem[]) => {
  const qty = items.reduce((sum, item) => sum + item.qty, 0);
  return Math.round(getOrderPrints(items).reduce((sum, p) => sum + (Number(p.price) || 0) * (p.mode === "total" ? 1 : qty), 0) * 100) / 100;
};