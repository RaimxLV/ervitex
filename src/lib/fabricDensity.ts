/** Only areal fabric mass is grammage; product/parcel mass in g or kg is not. */
export const hasFabricGrammage = (value: string) => /\b\d+(?:[.,]\d+)?\s*(?:g\s*\/\s*m\s*(?:²|2|\^2)|gsm\b|g\s*·\s*m\s*[−-]2)/i.test(value);

const densityLabel = /^(?:fabric\s+weight|weight|grammage|fabric\s+density|(?:auduma\s+)?svars|(?:auduma\s+)?blīvums)\s*:?[\s]*$/i;
export function fabricSpecLabel(label: string, value: string, lang: "lv" | "en") {
  return hasFabricGrammage(value) && densityLabel.test(label.trim())
    ? lang === "lv" ? "Blīvums" : "Fabric weight"
    : label;
}

/** Normalize source and cached translations at display time without changing units or real mass. */
export function normalizeFabricText(text: string, lang: "lv" | "en") {
  if (lang !== "lv") return text;
  return text.replace(/\b(?:fabric\s+weight|weight|grammage|(?:auduma\s+)?svars)(\s*[:=–—-]?\s*\d+(?:[.,]\d+)?(?:\s*[-–/]\s*\d+(?:[.,]\d+)?)?\s*(?:g\s*\/\s*m\s*(?:²|2|\^2)|gsm\b|g\s*·\s*m\s*[−-]2))/gi,
    (_match, value: string) => `Blīvums${value}`);
}