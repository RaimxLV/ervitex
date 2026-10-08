/**
 * Kataloga meklēšana: LV/EN sinonīmi, bez garumzīmēm, daļēji vārdi,
 * rezultātu vērtēšana, lai precīzākā prece ir pirmā.
 */

export const normalizeSearch = (s?: string | null): string =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\bt (shirt|krekl)/g, "t$1")
    .trim();

/** LV/EN saknes → termini, kas parādās preču nosaukumos/kategorijās. */
const SYNONYMS: [string, string[]][] = [
  ["tkrekl", ["tshirt", "tee", "t shirts"]],
  ["tshirt", ["tshirt", "tee"]],
  ["polo", ["polo", "pique"]],
  ["krekl", ["shirt", "blouse", "tshirt", "polo"]],
  ["vest", ["vest", "bodywarmer", "gilet"]],
  ["biks", ["pants", "trouser", "chino", "jeans", "legging", "shorts"]],
  ["sort", ["shorts"]],
  ["dzemper", ["sweat", "sweater", "crewneck", "hoodie", "fleece", "zip", "cardigan"]],
  ["sviter", ["sweater", "sweat", "knit", "cardigan"]],
  ["hudij", ["hoodie", "hooded", "hoody"]],
  ["kapuc", ["hoodie", "hooded", "hood"]],
  ["jak", ["jacket", "parka", "softshell", "anorak", "windbreaker", "shell", "coat"]],
  ["virsjak", ["jacket", "parka", "coat"]],
  ["flis", ["fleece"]],
  ["cepur", ["cap", "hat", "beanie", "snapback", "trucker"]],
  ["kepk", ["cap", "snapback", "trucker"]],
  ["mugursom", ["backpack", "rucksack"]],
  ["som", ["bag", "backpack", "tote", "shopper", "pouch"]],
  ["dviel", ["towel"]],
  ["cimd", ["glove", "mitten"]],
  ["zek", ["sock"]],
  ["sall", ["scarf", "snood"]],
  ["priekssaut", ["apron"]],
  ["lietussarg", ["umbrella"]],
  ["kruz", ["mug", "cup"]],
  ["pudel", ["bottle"]],
  ["termos", ["thermo", "vacuum", "flask"]],
  ["pled", ["blanket"]],
  ["apav", ["shoe", "sneaker", "boot"]],
  ["darba", ["work", "projob", "hi vis"]],
  ["atstarot", ["hi vis", "reflective", "visibility"]],
  ["berni", ["kids", "junior", "baby"]],
  ["bern", ["kids", "junior", "baby"]],
  ["sieviet", ["women", "woman", "ladies", "lady"]],
  ["viriet", ["men", "man"]],
  ["organisk", ["organic"]],
  ["kokvilna", ["cotton"]],
  ["sport", ["sport", "active", "training", "running"]],
];

const expand = (token: string): string[] => {
  const out = [token];
  if (token.length < 3) return out;
  for (const [stem, terms] of SYNONYMS) {
    if (token.startsWith(stem) || (token.length >= 3 && stem.startsWith(token))) out.push(...terms);
  }
  return out;
};

interface Searchable {
  id: string;
  name?: string | null;
  brand?: string | null;
  category?: string | null;
  group_name?: string | null;
}

interface Prepared {
  id: string;
  name: string;
  meta: string;
  all: string;
}

const cache = new WeakMap<object, Prepared>();
const prepare = (it: Searchable): Prepared => {
  let p = cache.get(it);
  if (!p) {
    const id = normalizeSearch(it.id);
    const name = normalizeSearch(it.name);
    const meta = normalizeSearch(`${it.brand || ""} ${it.category || ""} ${it.group_name || ""}`);
    p = { id, name, meta, all: ` ${id} ${name} ${meta} ${id.replace(/ /g, "")}` };
    cache.set(it, p);
  }
  return p;
};

export interface PreparedQuery {
  raw: string;
  compact: string;
  tokens: { token: string; terms: string[] }[];
}

export const prepareQuery = (q: string): PreparedQuery | null => {
  const raw = normalizeSearch(q);
  if (!raw) return null;
  return {
    raw,
    compact: raw.replace(/ /g, ""),
    tokens: raw.split(" ").map((token) => ({ token, terms: expand(token) })),
  };
};

/** 0 = neatbilst. Lielāks = precīzāk. */
export const searchScore = (it: Searchable, pq: PreparedQuery | null): number => {
  if (!pq) return 1;
  const p = prepare(it);
  let score = 0;

  const idCompact = p.id.replace(/ /g, "");
  if (idCompact === pq.compact) score += 2000;
  else if (idCompact.startsWith(pq.compact) && pq.compact.length >= 3) score += 800;
  else if (/^\d{2,}$/.test(pq.compact)) {
    // Tikai cipari: "169" → STTU169 (precīza ciparu grupa augstāk par daļēju)
    const groups: string[] = idCompact.match(/\d+/g) ?? [];
    if (groups.includes(pq.compact)) score += 1500;
    else if (groups.some((g) => g.startsWith(pq.compact))) score += 700;
    else if (idCompact.includes(pq.compact)) score += 400;
  }

  if (p.name === pq.raw) score += 1000;
  else if (p.name.startsWith(pq.raw)) score += 500;
  else if (` ${p.name}`.includes(` ${pq.raw}`)) score += 300;

  for (const { token, terms } of pq.tokens) {
    let best = 0;
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const direct = i === 0;
      const w = direct ? 1 : 0.8;
      if (` ${p.name}`.includes(` ${term}`)) best = Math.max(best, 120 * w);
      else if (p.name.includes(term)) best = Math.max(best, 70 * w);
      else if (` ${p.meta}`.includes(` ${term}`)) best = Math.max(best, 60 * w);
      else if (p.all.includes(term)) best = Math.max(best, 40 * w);
    }
    // Neliela drukas kļūda / locījums: "vestes" → "vest"
    if (!best && token.length >= 5) {
      const stem = token.slice(0, -2);
      if (p.all.includes(stem)) best = 25;
    }
    if (!best) return 0;
    score += best;
  }
  return score;
};

/** Ja vaicājums precīzi sakrīt ar preces kodu, atgriež tikai tās preces; citādi null. */
export const exactCodeHits = <T extends Searchable>(items: T[], pq: PreparedQuery | null): Set<T> | null => {
  if (!pq || pq.compact.length < 3) return null;
  const hits = new Set<T>();
  for (const it of items) if (prepare(it).id.replace(/ /g, "") === pq.compact) hits.add(it);
  return hits.size ? hits : null;
};
