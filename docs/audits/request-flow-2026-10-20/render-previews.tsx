// Offline only: no send helper, API call, or real client data.
import React from "react";
import { render } from "@react-email/render";
import { writeFileSync } from "node:fs";
import { PmOfferEmail } from "../../../src/lib/email-templates/pm-offer";
import { offerEmailData } from "../../../src/lib/offerEmailData";
import type { Offer } from "../../../src/lib/offer";

const offer: Offer = { id: "synthetic", token: "0123456789abcdef0123456789abcdef", title: "Sintētisks piedāvājums", client_name: "Testa klients <script>alert(1)</script>", client_company: null, client_email: "synthetic@example.invalid", client_phone: null, note: "Izdomāti dati — nekas netiek nosūtīts.", status: "sent", vat_rate: 21, created_at: "", updated_at: "", pm_name: "Ilona", pm_email: "ilona@ervitex.lv", items: [{ id: "line", source: "ss", productId: "STTU169", name: "Komandas krekls", code: "STTU169", brand: null, image: null, colorName: "Black", colorHex: null, size: "M", qty: 50, unitPrice: 12, discountPercent: 10, prints: [{ method: "DTF", placement: "Priekšpuse", price: 2, mode: "unit", scope: "order" }] }] };
writeFileSync(new URL("./offer-preview.html", import.meta.url), await render(<PmOfferEmail {...offerEmailData(offer)} />));
writeFileSync(new URL("./offer-en-preview.html", import.meta.url), await render(<PmOfferEmail {...offerEmailData(offer, "en")} />));
console.log("Synthetic offer rendered offline; no sending.");