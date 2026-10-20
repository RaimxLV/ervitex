import { expect, it } from "vitest";
import { rigaCalendarDaysSince } from "./rigaDays";

it("19.10 18:57 Riga request is 'yesterday' on 20.10 13:55 Riga, though <24h passed", () => {
  expect(rigaCalendarDaysSince("2026-10-19T15:57:32Z", new Date("2026-10-20T10:55:00Z"))).toBe(1);
});
it("crossing Riga midnight changes the day even minutes apart", () => {
  expect(rigaCalendarDaysSince("2026-10-19T20:59:00Z", new Date("2026-10-19T21:01:00Z"))).toBe(1);
  expect(rigaCalendarDaysSince("2026-10-19T21:01:00Z", new Date("2026-10-19T21:30:00Z"))).toBe(0);
});
it("counts across DST change (25.10.2026)", () => {
  expect(rigaCalendarDaysSince("2026-10-24T10:00:00Z", new Date("2026-10-26T10:00:00Z"))).toBe(2);
});
