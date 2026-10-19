import { describe, expect, it } from "vitest";
import { requestBillingSchema, requestPrintStatus } from "./requestDetails";

describe("request details", () => {
  it("preserves bank details and normalizes account numbers", () => {
    expect(requestBillingSchema.parse({ bank: "Swedbank", iban: "lv80 bank 0000 4351 9500 1", bic: "habalv22" })).toEqual({ bank: "Swedbank", iban: "LV80BANK0000435195001", bic: "HABALV22" });
  });
  it("keeps bank details optional", () => expect(requestBillingSchema.safeParse({}).success).toBe(true));
  it("rejects malformed bank details", () => expect(requestBillingSchema.safeParse({ iban: "not-an-account" }).success).toBe(false));
  it("reports consultation as printing required", () => expect(requestPrintStatus("consult")).toBe("required"));
  it("does not infer printing from an unspecified method", () => expect(requestPrintStatus("")).toBe("unspecified"));
  it("reports explicit no-print choice", () => expect(requestPrintStatus("none")).toBe("none"));
});