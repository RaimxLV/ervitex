import { expect, it } from "vitest";
import { offerItemsSchema } from "./offerValidation";

const item = { id: "1", source: "ss", productId: "p", qty: 10, unitPrice: 5 };
it("keeps a per-product comment when the offer is saved/sent", () => {
  expect(offerItemsSchema.parse([{ ...item, note: "Logo uz krūtīm" }])[0].note).toBe("Logo uz krūtīm");
});
