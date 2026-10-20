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

/** Krāsas vārdi faila nosaukumā kā secīgi veseli tokeni ("red" neatbilst "classic-red"). */
export function bbImageMentionsColor(url: string, color: string): boolean {
  const want = color.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!want.length) return false;
  const t = bbFileTokens(url);
  for (let i = 0; i + want.length <= t.length; i++) {
    if (want.every((w, j) => t[i + j] === w) && (i === 0 || !["classic", "bright", "light", "dark", "french", "oxford", "olive", "bottle", "sky", "pastel", "vintage", "off", "graphite", "oyster", "powder", "fluorescent", "kelly", "lime", "surf", "heather", "natural"].includes(t[i - 1]))) return true;
  }
  return false;
}
