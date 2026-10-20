import { z } from "zod";

const amount = z.number().finite().min(0).max(100000);
export const offerItemsSchema = z.array(z.object({
  id: z.string().min(1), source: z.string().min(1), productId: z.string().min(1),
  qty: z.number().int().min(1).max(100000),
  size: z.string().max(100).nullable().optional(), colorName: z.string().max(300).nullable().optional(),
  unitPrice: amount.nullable(), discountPercent: z.number().finite().min(0).max(100).nullable().optional(),
  prints: z.array(z.object({ method: z.string().min(1).max(300), placement: z.string().max(300).nullable().optional(), price: amount.nullable(), mode: z.enum(["unit", "total"]).optional(), scope: z.enum(["item", "order"]).optional() })).max(50).optional(),
}).passthrough()).max(300);

/** Drafts may contain unresolved prices; sending a priced offer may not. */
export function validateOfferForSend(offer: { items: unknown; vat_rate: number; discount?: unknown }) {
  const items = offerItemsSchema.min(1).parse(offer.items);
  z.number().finite().min(0).max(100).parse(offer.vat_rate);
  if (offer.discount) z.discriminatedUnion("type", [z.object({ type: z.literal("percent"), value: z.number().finite().min(0).max(100) }), z.object({ type: z.literal("amount"), value: z.number().finite().min(0).max(1000000) })]).parse(offer.discount);
  if (items.some((item) => item.unitPrice === null || item.prints?.some((print) => print.price === null))) throw new Error("Pārbaudi preču un apdrukas cenas pirms nosūtīšanas");
  return items;
}