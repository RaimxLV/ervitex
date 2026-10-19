import { z } from "zod";

const text = z.string().trim().max(300).optional();
export const requestBillingSchema = z.object({
  company: text, regNo: text, vatNo: text, address: text, delivery: text,
  bank: text,
  iban: z.string().transform((v) => v.replace(/\s/g, "").toUpperCase()).refine((v) => !v || /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v), "Nederīgs IBAN" ).optional(),
  bic: z.string().trim().transform((v) => v.toUpperCase()).refine((v) => !v || /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v), "Nederīgs SWIFT/BIC").optional(),
});

export const requestPrintStatus = (method: string | null | undefined) =>
  method === "none" ? "none" : method ? "required" : "unspecified";