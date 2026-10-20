const rigaDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Riga", year: "numeric", month: "2-digit", day: "2-digit" });

/** Kalendāro dienu starpība Rīgas laikā (nevis 24h periodi): vakardienas pieprasījums = 1. */
export const rigaCalendarDaysSince = (iso: string, now: Date = new Date()): number => {
  const day = (d: Date) => Date.parse(`${rigaDate.format(d)}T00:00:00Z`);
  return Math.max(0, Math.round((day(now) - day(new Date(iso))) / 86_400_000));
};
