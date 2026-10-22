/**
 * Canonical color-name -> hex mapping used as a swatch fallback when the
 * supplier provides no hex/swatch image (e.g. all Russell variants).
 * Only existing canonical hex values are reused for new names — never
 * invent a hex for a supplier colour.
 */
export const NAME_HEX_MAP: Record<string, string> = {
  black: "#000000", jetblack: "#000000", deepblack: "#000000", offblack: "#1a1a1a",
  white: "#ffffff", offwhite: "#f5f2ea", cream: "#f5efe0", natural: "#efe7d2", ecru: "#e8ddc4", ivory: "#fffff0",
  grey: "#8a8a8a", gray: "#8a8a8a", lightgrey: "#c9c9c9", lightgray: "#c9c9c9",
  darkgrey: "#4a4a4a", darkgray: "#4a4a4a", heathergrey: "#b0b0b0", melangegrey: "#a0a0a0",
  charcoal: "#3f3f3f", anthracite: "#333333", graphite: "#3a3a3a", silver: "#c0c0c0", titanium: "#c0c0c0",
  red: "#e11d48", darkred: "#8b0000", burgundy: "#6d0f1a", wine: "#722f37", cardinal: "#c41e3a", port: "#722f37",
  pink: "#ec4899", lightpink: "#f9c9d6", hotpink: "#ff69b4", fuchsia: "#d3287d", magenta: "#c8117a", rose: "#e75480", coral: "#ff7f50",
  orange: "#f97316", darkorange: "#c2410c", peach: "#ffcba4",
  yellow: "#eab308", lightyellow: "#fff59d", gold: "#d4af37", mustard: "#c9a94a",
  green: "#16a34a", darkgreen: "#14532d", lightgreen: "#8bc34a", limegreen: "#a3e635", lime: "#a3e635",
  olive: "#6b8e23", forest: "#228b22", kellygreen: "#4cbb17", bottlegreen: "#0b3d20", mint: "#98d8b1", khaki: "#c3b091", army: "#4b5320",
  blue: "#2563eb", lightblue: "#93c5fd", darkblue: "#1e3a8a", navy: "#1e3a8a", royalblue: "#1e40af",
  brightroyal: "#1e40af", lightoxford: "#93c5fd",
  skyblue: "#87ceeb", sky: "#87ceeb", brightsky: "#87ceeb", aqua: "#40e0d0",
  turquoise: "#40e0d0", teal: "#0d9488", petrol: "#0d5c63", cobalt: "#0047ab",
  purple: "#7c3aed", violet: "#8b5cf6", lavender: "#b399d4", plum: "#8e4585", lilac: "#c8a2c8",
  brown: "#78350f", darkbrown: "#4a2c17", lightbrown: "#a0522d", chocolate: "#5d3a1a", mocha: "#78350f",
  tan: "#d2b48c", camel: "#c19a6b", sand: "#c2b280", beige: "#d6c9a8", stone: "#a99a86",
  denim: "#556b8d", indigo: "#4b0082",
  sportheather: "#b0b0b0",
  transparent: "#f4f4f4", multi: "#d0d0d0", multicolor: "#d0d0d0", assorted: "#d0d0d0",
};

export const canonName = (n?: string | null) => (n || "").toLowerCase().replace(/[^a-z]/g, "");

const cleanHexLocal = (h?: string | null) =>
  h && /^#?[0-9a-fA-F]{6}$/.test(h.trim()) ? h.trim() : null;

/** Resolve a display hex, preferring supplier value, otherwise a canonical color-name mapping */
export const resolveHex = (hex?: string | null, name?: string | null): string => {
  const clean = cleanHexLocal(hex);
  if (clean) return clean;
  const key = canonName(name);
  if (key && NAME_HEX_MAP[key]) return NAME_HEX_MAP[key];
  // try longest-substring match for compound names like "heather melange grey"
  if (key) {
    const found = Object.keys(NAME_HEX_MAP)
      .filter((k) => key.includes(k))
      .sort((a, b) => b.length - a.length)[0];
    if (found) return NAME_HEX_MAP[found];
  }
  return "#e5e5e5";
};

/**
 * Multi-tone colours ("Black/Yellow", "Navy/White") must show both tones,
 * otherwise every combination renders as a single flat (often black) circle.
 * Returns 1 or 2 hexes.
 */
export const resolveHexParts = (hex?: string | null, name?: string | null): string[] => {
  const parts = (name || "")
    .split(/[\/|&+]|\s-\s/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    const hexes = parts
      .slice(0, 3)
      .map((p) => {
        const key = canonName(p);
        if (key && NAME_HEX_MAP[key]) return NAME_HEX_MAP[key];
        const found = Object.keys(NAME_HEX_MAP)
          .filter((k) => key.includes(k))
          .sort((a, b) => b.length - a.length)[0];
        return found ? NAME_HEX_MAP[found] : null;
      })
      .filter((h): h is string => !!h);
    const uniq = Array.from(new Set(hexes.map((h) => h.toLowerCase())));
    if (uniq.length >= 2) return uniq.slice(0, 2);
  }
  return [resolveHex(hex, name)];
};
