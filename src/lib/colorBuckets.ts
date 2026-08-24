// Universal color bucket mapping used across Stanley/Stella, NWG and PF Concept.
// Maps any HEX color code to one of 14 human-friendly color families so the
// user can filter across all three catalogs using a single consistent palette.

export type ColorBucketKey =
  | "black"
  | "white"
  | "gray"
  | "beige"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "navy"
  | "purple"
  | "pink"
  | "multi";

export interface ColorBucket {
  key: ColorBucketKey;
  lv: string;
  en: string;
  hex: string; // swatch representation
}

export const COLOR_BUCKETS: ColorBucket[] = [
  { key: "black",  lv: "Melns",       en: "Black",  hex: "#111111" },
  { key: "white",  lv: "Balts",       en: "White",  hex: "#FFFFFF" },
  { key: "gray",   lv: "Pelēks",      en: "Gray",   hex: "#9CA3AF" },
  { key: "beige",  lv: "Bēšs",        en: "Beige",  hex: "#D9C7A7" },
  { key: "brown",  lv: "Brūns",       en: "Brown",  hex: "#7A4E2D" },
  { key: "red",    lv: "Sarkans",     en: "Red",    hex: "#DC2626" },
  { key: "orange", lv: "Oranžs",      en: "Orange", hex: "#F97316" },
  { key: "yellow", lv: "Dzeltens",    en: "Yellow", hex: "#FACC15" },
  { key: "green",  lv: "Zaļš",        en: "Green",  hex: "#16A34A" },
  { key: "blue",   lv: "Zils",        en: "Blue",   hex: "#2563EB" },
  { key: "navy",   lv: "Tumši zils",  en: "Navy",   hex: "#1E3A8A" },
  { key: "purple", lv: "Violets",     en: "Purple", hex: "#7C3AED" },
  { key: "pink",   lv: "Rozā",        en: "Pink",   hex: "#EC4899" },
  { key: "multi",  lv: "Krāsains",    en: "Multi",  hex: "linear-gradient(90deg,#ef4444,#eab308,#22c55e,#3b82f6)" },
];

const BUCKET_BY_KEY = new Map(COLOR_BUCKETS.map((b) => [b.key, b]));
export const getBucket = (k: ColorBucketKey) => BUCKET_BY_KEY.get(k)!;

const clean = (h?: string | null): string | null => {
  if (!h) return null;
  const s = h.trim().replace(/^#/, "").toLowerCase();
  if (s.length === 3) return s.split("").map((c) => c + c).join("");
  if (s.length === 6 && /^[0-9a-f]{6}$/.test(s)) return s;
  return null;
};

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
    case g: h = ((b - r) / d + 2); break;
    case b: h = ((r - g) / d + 4); break;
  }
  return [h * 60, s * 100, l * 100];
};

/** Map a HEX (with or without #) to one of the 14 color buckets. */
export function bucketFromHex(hex?: string | null): ColorBucketKey | null {
  const c = clean(hex);
  if (!c) return null;
  const [r, g, b] = hexToRgb(c);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Neutrals first
  if (l >= 92) return "white";
  if (l <= 8) return "black";
  if (s <= 10) {
    if (l <= 25) return "black";
    if (l >= 80) return "white";
    return "gray";
  }

  // Beige / brown (warm low-sat browns/tans)
  if ((h >= 20 && h <= 45) && s <= 45 && l >= 55) return "beige";
  if ((h >= 15 && h <= 40) && l <= 45) return "brown";

  // Hue-based
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return l <= 40 ? "brown" : "orange";
  if (h < 65) return "yellow";
  if (h < 170) return "green";
  if (h < 200) return l <= 30 ? "navy" : "blue";
  if (h < 250) return l <= 30 ? "navy" : "blue";
  if (h < 290) return "purple";
  if (h < 335) return "pink";
  return "red";
}

// Name-based hints for colors that arrive without hex (or with a wrong hex).
const NAME_PATTERNS: [RegExp, ColorBucketKey][] = [
  [/multi|mix|assort|print|melang|melir|marm|floral|camo|stripe|check|plaid|jacquard/i, "multi"],
  [/navy|marine|indig|dark ?blue|nakts/i, "navy"],
  [/turquois|teal|petrol|aqua|sky|light ?blue|cyan|zils|blue|bleu|blau|azzur|kobalt|cobalt|royal|denim|jean/i, "blue"],
  [/black|noir|schwarz|nero|melns|anthrac|onyx|coal|carbon|jet/i, "black"],
  [/white|blanc|weiss|bianco|balts|ivory|natural|ecru|cream|off ?white|off-white|snow|vanilla|bone|chalk|milk/i, "white"],
  [/gr[ae]y|gris|grigio|pelēk|silver|charcoal|graphit|slate|shadow|steel|ash/i, "gray"],
  [/beige|sand|tan|khaki|camel|stone|linen|nude|cappucc|latte|oat|straw|putty|wheat|biscuit|taupe|clay|dune|desert/i, "beige"],
  [/brown|marron|bruin|braun|brūn|mocha|chocolate|espresso|cocoa|coffee|hazel|walnut|toffee|caramel|tabak|chestnut/i, "brown"],
  [/red|rouge|rot|rosso|sarkan|crimson|scarlet|burgund|wine|cherry|maroon|carmine|ruby|brick/i, "red"],
  [/orang|oran[žz]|coral|salmon|apricot|peach|rust|amber|tangerine|terracot/i, "orange"],
  [/yellow|jaun|jaune|gelb|giallo|dzelten|mustard|gold|lemon|ochre|ocher|canary|corn/i, "yellow"],
  [/green|vert|gr[üu]n|verde|zaļ|olive|khaki green|mint|sage|forest|emerald|jade|lime|hunter|moss|pistach|army/i, "green"],
  [/purple|violet|viole?ts?|lilac|lavender|mauve|plum|aubergin|orchid|grape/i, "purple"],
  [/pink|rose|rosa|roz[āa]|fuchsia|magenta|blush|candy/i, "pink"],

];

export function bucketFromName(name?: string | null): ColorBucketKey | null {
  if (!name) return null;
  for (const [re, k] of NAME_PATTERNS) if (re.test(name)) return k;
  return null;
}

/** Combined: prefer HEX, fall back to name hint. */
export function bucketOf(hex?: string | null, name?: string | null): ColorBucketKey | null {
  return bucketFromHex(hex) ?? bucketFromName(name);
}
