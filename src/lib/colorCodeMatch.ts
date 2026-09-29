/**
 * Krāsu kodu saskaņošana starp kataloga krāsām un cenu tabulas krāsu kodiem.
 * Katrs piegādātājs glabā kodus savā formātā:
 *  - SS:  katalogs "STSU273C0021L" (garš SKU), cenas "C002"
 *  - NWG: katalogs "0201030-99", cenas "99"
 *  - MF:  katalogs "3072500" (stils 307 + krāsa 25 + "00"), cenas "25"
 *  - PF/BB/RU: kodi sakrīt tieši vai pēc nosaukuma
 */

const norm = (s?: string | null) => (s ?? "").toString().trim().toLowerCase();

/** Visi iespējamie cenu tabulas atslēgu varianti dotajam kataloga krāsas kodam. */
export function colorCodeCandidates(code?: string | null): string[] {
  const c = norm(code);
  if (!c) return [];
  const out: string[] = [c];
  const dash = c.lastIndexOf("-");
  if (dash > 0 && dash < c.length - 1) out.push(c.slice(dash + 1)); // NWG sufikss
  const m = c.match(/c(\d{3,4})/i); // SS SKU -> C002
  if (m) out.push(`c${m[1].toLowerCase()}`);
  if (/^\d{3}/.test(c) && c.length >= 5) out.push(c.slice(3, 5)); // MF vidējā daļa
  return [...new Set(out)];
}

/** Vai divi krāsu kodi (jebkurā piegādātāja formātā) apzīmē vienu krāsu. */
export function colorCodeMatches(a?: string | null, b?: string | null): boolean {
  const ca = colorCodeCandidates(a);
  if (!ca.length) return false;
  const cb = new Set(colorCodeCandidates(b));
  return ca.some((x) => cb.has(x));
}
