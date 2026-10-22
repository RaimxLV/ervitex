/** Reuse collators instead of constructing one for every sort comparison. */
const codeCollator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const nameCollators = {
  lv: new Intl.Collator("lv", { sensitivity: "base" }),
  en: new Intl.Collator("en", { sensitivity: "base" }),
};

export const compareCatalogCodes = (a: string, b: string) => codeCollator.compare(a, b);
export const compareCatalogNames = (a: string, b: string, lang: "lv" | "en") => nameCollators[lang].compare(a, b);