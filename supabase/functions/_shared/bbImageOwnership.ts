// Beechfield/Bagbase/Quadra/Westford Mill attēlu piederība. Kopija: src/lib/bbImageOwnership.ts (testi salīdzina abas).
// Fails pieder modelim tikai tad, ja faila nosaukumā ir VESELS koda tokens (b15 ≠ b15c, b67 ≠ b673).
export function bbFileTokens(url: string): string[] {
  const name = decodeURIComponent((url.split("?")[0].split("/").pop() || "")).toLowerCase();
  return name.split(/[^a-z0-9]+/).filter(Boolean);
}

export function bbImageBelongsToStyle(url: string, styleCode: string): boolean {
  const code = styleCode.trim().toLowerCase();
  return !!code && bbFileTokens(url).includes(code);
}

const GENERIC_COLOUR_WORDS = new Set(["white","black","navy","red","blue","green","grey","gray","yellow","orange","pink","purple","brown","burgundy","royal","sky","khaki","beige","cream","natural","olive","charcoal","silver","gold","sand","stone","lime","fuchsia","turquoise","teal","maroon","bottle","heather","graphite","oxford","french","classic","light","dark","bright","fluorescent","off"]);

const colourTokens = (c: string) => c.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Assigns a model-level file to exactly one of the model's AUTHORITATIVE colours, or null.
 * The colour segment must start right after the exact model-code token; the longest full colour
 * (token sequence or compact form) wins; a following colour word ("black_white" when the model
 * has no "Black/White") makes it ambiguous → null. Never guesses.
 */
export function bbAssignImageColor(url: string, styleCode: string, modelColours: string[]): string | null {
  const t = bbFileTokens(url);
  const at = t.indexOf(styleCode.trim().toLowerCase());
  if (at < 0) return null;
  const seg = t.slice(at + 1);
  const firstWords = new Set(modelColours.map((c) => colourTokens(c)[0]).filter(Boolean));
  let best: { name: string; len: number } | null = null;
  for (const name of modelColours) {
    const want = colourTokens(name);
    if (!want.length) continue;
    const len = want.every((w, j) => seg[j] === w) ? want.length : seg[0] === want.join("") ? 1 : 0;
    if (len && (!best || want.length > colourTokens(best.name).length)) best = { name, len };
  }
  if (!best) return null;
  const next = seg[best.len];
  if (next && (GENERIC_COLOUR_WORDS.has(next) || firstWords.has(next))) return null;
  return best.name;
}
