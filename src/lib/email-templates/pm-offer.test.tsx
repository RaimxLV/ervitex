import React from "react";
import { render } from "@react-email/render";
import { expect, it } from "vitest";
import { PmOfferEmail } from "./pm-offer";
import { offerEmailData } from "../offerEmailData";
import { money, offerTotals, type Offer } from "../offer";
const offer: Offer = { id: "synthetic", token: "0123456789abcdef0123456789abcdef", title: "Sintētisks piedāvājums", client_name: "<script>alert(1)</script>", client_company: null, client_email: "synthetic@example.invalid", client_phone: null, note: "<img src=x onerror=alert(1)>", status: "sent", vat_rate: 21, created_at: "", updated_at: "", pm_name: "Ilona", pm_email: "ilona@ervitex.lv", items: [{ id: "one", source: "ss", productId: "STTU169", name: "Krekls", code: "STTU169", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 50, unitPrice: 12, discountPercent: 10, prints: [{ method: "DTF", price: 2, mode: "unit", scope: "order" }] }] };
it("email financial data uses same totals VAT and undiscounted order prints", async () => {
  const totals = offerTotals(offer.items, 21); const data = offerEmailData(offer);
  expect(totals.net).toBe(640); expect(totals.vat).toBe(134.4); expect(totals.gross).toBe(774.4);
  expect(data.gross).toBe(money(774.4)); expect(data.note).toContain("DTF");
  const html = await render(<PmOfferEmail {...data} />);
  expect(html).not.toContain("<script>"); expect(html).not.toContain("<img src=x"); expect(html).toContain("&lt;script&gt;");
  expect(data.url).toBe("https://www.ervitex.lv/piedavajums/0123456789abcdef0123456789abcdef"); expect(data.pmEmail).toBe("ilona@ervitex.lv");
});
it("English uses identical financial totals and escapes untrusted recipient data", async () => {
  const data = offerEmailData(offer, "en");
  expect(data.gross).toBe(money(774.4)); expect(data.lang).toBe("en");
  const html = await render(<PmOfferEmail {...data} />);
  expect(html).not.toContain("<script>"); expect(html).toContain("&lt;script&gt;");
});