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
  ["hoodij", ["hoodie", "hooded", "hoody"]],
  ["hudi", ["hoodie", "hooded", "hoody"]],
  ["mais", ["bag", "drawstring", "gym bag", "sack"]],
  ["krekl", ["shirt", "tshirt"]],
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
  ["prieksaut", ["apron"]],
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
  // Apģērbs
  ["bluz", ["blouse", "shirt"]],
  ["tunik", ["tunic"]],
  ["kleit", ["dress"]],
  ["svark", ["skirt"]],
  ["topi", ["top", "tank"]],
  ["maik", ["tank", "singlet", "vest top", "tshirt"]],
  ["bezpiedurkn", ["sleeveless", "tank", "singlet"]],
  ["garpiedurkn", ["long sleeve", "ls"]],
  ["isopiedurkn", ["short sleeve"]],
  ["piedurkn", ["sleeve"]],
  ["rapc", ["zip", "full zip", "zip thru"]],
  ["rapsi", ["zip"]],
  ["lietusjak", ["rain", "waterproof", "shell"]],
  ["lietusmetel", ["rain", "poncho", "coat"]],
  ["metel", ["coat", "parka"]],
  ["paltrak", ["coat", "parka"]],
  ["kombinezon", ["coverall", "overall", "bib"]],
  ["puskombinezon", ["bib"]],
  ["dzinsi", ["jeans", "denim"]],
  ["dzins", ["jeans", "denim"]],
  ["legin", ["legging", "tights"]],
  ["zekbiks", ["tights"]],
  ["termoverl", ["base layer", "thermal", "baselayer"]],
  ["apaksvel", ["base layer", "underwear", "boxer", "brief"]],
  ["bokser", ["boxer"]],
  ["peldkostim", ["swim"]],
  ["halat", ["bathrobe", "robe"]],
  ["pidzam", ["pyjama", "pajama"]],
  ["uniform", ["uniform", "tunic", "workwear"]],
  ["formas", ["uniform", "workwear"]],
  ["vaver", ["work", "workwear"]],
  ["pavar", ["chef", "kitchen", "apron"]],
  ["virtuv", ["chef", "kitchen", "apron"]],
  ["medic", ["medical", "care", "scrub", "tunic"]],
  ["skolen", ["kids", "junior", "school"]],
  ["zidain", ["baby", "infant", "bib"]],
  ["mazul", ["baby", "infant"]],
  ["unisex", ["unisex"]],
  ["silt", ["warm", "thermal", "fleece", "padded", "insulated", "winter"]],
  ["ziem", ["winter", "padded", "insulated", "thermal"]],
  ["vasar", ["summer", "light"]],
  ["udensnecaurlaid", ["waterproof", "rain", "shell"]],
  ["vejjak", ["windbreaker", "wind"]],
  ["softsel", ["softshell"]],
  ["pukjak", ["padded", "down", "puffer", "quilted"]],
  ["dunu", ["down", "puffer"]],
  ["adit", ["knit", "beanie"]],
  // Galvassegas un aksesuāri
  ["adiren", ["beanie", "knit"]],
  ["kapuc", ["hood"]],
  ["galvass", ["cap", "hat", "beanie", "headwear"]],
  ["panam", ["bucket hat", "hat"]],
  ["saulsarg", ["visor", "sun"]],
  ["galvassait", ["headband"]],
  ["lakat", ["bandana", "scarf"]],
  ["kaklasait", ["tie"]],
  ["josta", ["belt"]],
  ["siks", ["belt", "strap", "lanyard"]],
  ["atslegu", ["key", "keyring", "lanyard"]],
  ["piespraud", ["pin", "badge"]],
  ["nozim", ["badge", "pin"]],
  ["ielap", ["patch"]],
  ["rokassprad", ["wristband", "bracelet"]],
  // Somas
  ["rokassom", ["handbag", "bag"]],
  ["plecu", ["shoulder", "messenger", "crossbody"]],
  ["jostassom", ["waist bag", "belt bag", "bum bag", "hip"]],
  ["datorsom", ["laptop", "computer"]],
  ["portatv", ["laptop"]],
  ["cela", ["travel", "duffel", "trolley"]],
  ["celojum", ["travel", "duffel", "trolley", "suitcase"]],
  ["koferis", ["suitcase", "trolley", "luggage"]],
  ["kofer", ["suitcase", "trolley", "luggage"]],
  ["iepirkum", ["shopping", "shopper", "tote"]],
  ["auduma", ["cotton bag", "tote", "canvas"]],
  ["vesas", ["laundry"]],
  ["kosmetik", ["cosmetic", "toiletry", "wash bag"]],
  ["maks", ["wallet", "purse", "pouch"]],
  ["seif", ["safe"]],
  ["vacin", ["case", "pouch", "box"]],
  ["vac", ["case", "cover", "pouch"]],
  ["penal", ["pencil case"]],
  ["dzesej", ["cooler", "cool bag"]],
  ["termosom", ["cooler", "cool bag", "thermo"]],
  // Mājai un birojam
  ["dvielis", ["towel"]],
  ["vann", ["bath", "towel", "robe"]],
  ["pludmal", ["beach"]],
  ["spilv", ["pillow", "cushion"]],
  ["sega", ["blanket", "duvet"]],
  ["galdaut", ["tablecloth"]],
  ["salvet", ["napkin"]],
  ["glaz", ["glass"]],
  ["tase", ["cup", "mug"]],
  ["kafij", ["coffee", "mug", "cup"]],
  ["tej", ["tea"]],
  ["udens", ["water", "bottle"]],
  ["dzeramp", ["bottle", "drinkware"]],
  ["termokruz", ["thermo", "travel mug", "tumbler"]],
  ["lunch", ["lunch", "food"]],
  ["pusdien", ["lunch", "food container", "lunch box"]],
  ["trauk", ["container", "box", "dish"]],
  ["pildspalv", ["pen"]],
  ["zimul", ["pencil"]],
  ["kladi", ["notebook", "notepad"]],
  ["klad", ["notebook", "notepad"]],
  ["piezim", ["notebook", "notepad", "sticky"]],
  ["kalendar", ["calendar"]],
  ["datorpel", ["mouse"]],
  ["pele", ["mouse"]],
  ["austin", ["headphone", "earphone", "earbud", "headset"]],
  ["skalrun", ["speaker"]],
  ["lader", ["charger", "power bank", "powerbank"]],
  ["akumulator", ["power bank", "powerbank", "battery"]],
  ["kabel", ["cable"]],
  ["zibatmin", ["usb", "flash"]],
  ["lukturi", ["torch", "flashlight", "lamp"]],
  ["lampa", ["lamp", "light"]],
  ["instrument", ["tool"]],
  ["nazis", ["knife"]],
  ["naz", ["knife"]],
  ["pulkst", ["watch", "clock"]],
  ["saulesbril", ["sunglasses"]],
  ["bril", ["glasses", "sunglasses"]],
  ["rotal", ["toy", "plush"]],
  ["mikstais", ["plush", "teddy"]],
  ["lacit", ["teddy", "bear"]],
  ["bumb", ["ball"]],
  ["frisb", ["frisbee"]],
  ["spel", ["game"]],
  ["auto", ["car"]],
  ["velo", ["bike", "bicycle", "cycling"]],
  ["skrien", ["running"]],
  ["golf", ["golf"]],
  ["slepo", ["ski"]],
  ["slep", ["ski"]],
  ["kalnu", ["ski", "outdoor"]],
  ["parg", ["hiking", "outdoor"]],
  ["telts", ["tent"]],
  ["grill", ["bbq", "grill"]],
  ["darz", ["garden"]],
  ["dzivniek", ["pet", "dog"]],
  ["sun", ["dog", "pet"]],
  ["suns", ["dog"]],
  ["dzivnieku", ["pet"]],
  ["dava", ["gift"]],
  ["davan", ["gift", "set"]],
  ["komplekt", ["set", "kit"]],
  ["ziemassvetk", ["christmas", "xmas"]],
  // Materiāli un īpašības
  ["poliester", ["polyester"]],
  ["vilna", ["wool", "merino"]],
  ["vilnas", ["wool", "merino"]],
  ["merin", ["merino"]],
  ["lin", ["linen"]],
  ["bambus", ["bamboo"]],
  ["parstradat", ["recycled"]],
  ["ekolog", ["organic", "recycled", "eco"]],
  ["atstarojos", ["reflective", "hi vis"]],
  ["redzamib", ["hi vis", "visibility"]],
  ["signal", ["hi vis", "visibility"]],
  ["izturig", ["heavy", "durable"]],
  ["viegl", ["light", "lightweight"]],
  ["biez", ["heavy", "heavyweight"]],
  ["oversize", ["oversized", "oversize", "relaxed"]],
  ["plat", ["oversized", "wide", "relaxed"]],
  ["piegul", ["fitted", "slim"]],
  ["krasa", ["colour", "color"]],
  // Krāsas
  ["melns", ["black"]],
  ["meln", ["black"]],
  ["balt", ["white"]],
  ["pelek", ["grey", "gray", "heather"]],
  ["sarkan", ["red"]],
  ["zil", ["blue", "navy"]],
  ["tumsi zil", ["navy"]],
  ["zal", ["green"]],
  ["dzelten", ["yellow"]],
  ["oranz", ["orange"]],
  ["roz", ["pink"]],
  ["violet", ["purple", "violet"]],
  ["brun", ["brown"]],
  ["bez", ["beige", "sand"]],
  ["bord", ["burgundy", "bordeaux", "maroon"]],
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
  source?: string;
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
  const isStella = it.source === "ss" || normalizeSearch(it.brand).replace(/ /g, "") === "stanleystella";
  if (/^\d+$/.test(pq.raw)) {
    // Precīza visa koda ciparu daļa (169 → STTU169), nekad apakšvirkne (14169) vai nosaukums.
    // Saīsinājums tikai UTT GI/GIB/GIL četru/piecu ciparu tokeniem ar nulles atlikumu.
    const code = codeParts(it.id, it.source);
    if (!code || !digitsMatch(it, code, pq.raw)) return 0;
    return 10000 + (isStella ? 3000 : 0);
  }
  let score = 0;

  const idCompact = p.id.replace(/ /g, "");
  const rc = it.source?.trim().toLowerCase() === "ru" ? codeParts(it.id, it.source) : null;
  if (idCompact === pq.compact || (rc && pq.compact === `${rc.prefix}${rc.digits}`)) score += 2000;
  else if (idCompact.startsWith(pq.compact) && pq.compact.length >= 3) score += 800;

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
  return score > 0 && isStella ? score + 3000 : score;
};

/** Ja vaicājums precīzi sakrīt ar preces kodu, atgriež tikai tās preces; citādi null. */
export const exactCodeHits = <T extends Searchable>(items: T[], pq: PreparedQuery | null): Set<T> | null => {
  // Tikai cipari ("169") var būt vairāku ražotāju kodos — rāda visus līdzīgos.
  if (!pq || pq.compact.length < 3 || /^\d+$/.test(pq.compact)) return null;
  const hits = new Set<T>();
  for (const it of items) {
    const rc = it.source?.trim().toLowerCase() === "ru" ? codeParts(it.id, it.source) : null;
    if (prepare(it).id.replace(/ /g, "") === pq.compact || (rc && pq.compact === `${rc.prefix}${rc.digits}`)) hits.add(it);
  }
  return hits.size ? hits : null;
};

/**
 * Saīsinājums pēc avota/prefiksa/tokena metadatiem, ne konkrētu preču ID saraksta.
 * Tikai UTT GI/GIB/GIL: četru ciparu vaicājums, piecu ciparu tokens, nulles atlikums.
 */
const NUMERIC_SHORTHAND_RULE = { source: "utt", prefixes: new Set(["gi", "gib", "gil"]), queryLength: 4, tokenLength: 5 };

/**
 * Ciparu vaicājuma atbilstība koda ciparu daļai: tikai precīza sakritība
 * (169 → STTU169) vai dokumentētais 6400 saīsinājums. Sākuma nulles saglabājas:
 * "167" neatbilst "0167".
 */
export const digitsMatch = (item: Searchable, code: { prefix: string; digits: string; suffix: string }, queryDigits: string): boolean =>
  code.digits === queryDigits ||
  (typeof item.source === "string" && item.source.trim().toLowerCase() === NUMERIC_SHORTHAND_RULE.source &&
    NUMERIC_SHORTHAND_RULE.prefixes.has(code.prefix) &&
    queryDigits.length === NUMERIC_SHORTHAND_RULE.queryLength && code.digits.length === NUMERIC_SHORTHAND_RULE.tokenLength &&
    code.digits.startsWith(queryDigits) && /^0+$/.test(code.digits.slice(queryDigits.length)));

/** Koda daļas: burtu prefikss + viena ciparu grupa + burtu sufikss (STTU169 → sttu/169/""). */
export const codeParts = (id?: string | null, source?: string | null): { prefix: string; digits: string; suffix: string } | null => {
  // Russell kanoniskais kods 0R<cipari><dzimums>0 (0R957M0 → r/957/m), lai "957" un "R957" atrastu modeli.
  if (typeof source === "string" && source.trim().toLowerCase() === "ru") {
    const r = normalizeSearch(id).replace(/ /g, "").match(/^0r(\d+)([a-z])0$/);
    if (r) return { prefix: "r", digits: r[1], suffix: r[2] };
  }
  const m = normalizeSearch(id).match(/^([a-z]*) ?(\d+)(?: ?([a-z]+))?$/);
  return m ? { prefix: m[1], digits: m[2], suffix: m[3] || "" } : null;
};

const familyKey = (it: Searchable, c: { prefix: string; digits: string; suffix: string }) =>
  `${it.source || ""}|${c.prefix}|${c.suffix}|${c.digits.length}`;

/** Maksimālais blakus kodu attālums un skaits uz vienu precīzo preci. */
export const NEIGHBOR_DISTANCE = 5;
export const NEIGHBOR_LIMIT = 4;

export interface SearchMatches<T> {
  exact: T[];
  /** Līdzīgi kodi: tikai pirmās precīzās preces piegādātāja un prefiksa saime. */
  related: T[];
  all: Set<T>;
}

const cmpScored = <T extends Searchable>(a: { item: T; score: number }, b: { item: T; score: number }) =>
  b.score - a.score ||
  a.item.id.localeCompare(b.item.id, "en", { numeric: true, sensitivity: "base" }) ||
  (a.item.source || "").localeCompare(b.item.source || "", "en");

/** Vienota atlase un stabila secība galvenās izvēlnes un kataloga meklētājiem. */
export const searchMatches = <T extends Searchable>(items: T[], pq: PreparedQuery | null): SearchMatches<T> => {
  if (!pq) return { exact: items, related: [], all: new Set(items) };
  const hits = exactCodeHits(items, pq);
  const exact = items
    .map((item) => ({ item, score: searchScore(item, pq) }))
    .filter(({ item, score }) => (hits ? hits.has(item) : score > 0))
    .sort(cmpScored)
    .map(({ item }) => item);
  const related: T[] = [];
  const anchor = exact[0];
  const ac = anchor && codeParts(anchor.id, anchor.source);
  // Līdzīgos kodus rāda tikai tad, ja vaicājuma cipari precīzi sakrīt ar enkura koda cipariem
  // (169 → STTU169 kaimiņi; saīsinājumam 6400 → GI64000 kaimiņu nav).
  const isCodeQuery = ac && (/^\d+$/.test(pq.raw) ? pq.raw.length >= 3 && ac.digits === pq.raw : (pq.compact === `${ac.prefix}${ac.digits}${ac.suffix}` || (anchor.source === "ru" && pq.compact === `${ac.prefix}${ac.digits}`)));
  if (anchor && ac && isCodeQuery) {
    // Tikai pirmās precīzās preces piegādātājs + prefikss nosaka līdzīgos kodus.
    const family = familyKey(anchor, ac);
    const exactSet = new Set(exact);
    const target = Number(ac.digits);
    items
      .flatMap((item) => {
        if (exactSet.has(item)) return [];
        const c = codeParts(item.id, item.source);
        if (!c || familyKey(item, c) !== family) return [];
        const d = Math.abs(Number(c.digits) - target);
        return d > 0 && d <= NEIGHBOR_DISTANCE ? [{ item, d }] : [];
      })
      .sort((x, y) => x.d - y.d || x.item.id.localeCompare(y.item.id, "en", { numeric: true, sensitivity: "base" }))
      .slice(0, NEIGHBOR_LIMIT)
      .forEach(({ item }) => related.push(item));
  }
  return { exact, related, all: new Set([...exact, ...related]) };
};

export const rankedSearchResults = <T extends Searchable>(items: T[], pq: PreparedQuery | null): T[] => {
  if (!pq) return items;
  const { exact, related } = searchMatches(items, pq);
  return [...exact, ...related];
};

/** Filtru meklēšana: LV/EN atslēgvārdi ("priekšauts" → Aprons, "T-krekls" → T-shirts). */
export const keywordMatch = (text: string, query: string): boolean => {
  const pq = prepareQuery(query);
  if (!pq) return true;
  const hay = ` ${normalizeSearch(text)} ${normalizeSearch(text).replace(/ /g, "")}`;
  return pq.tokens.every(({ token, terms }) =>
    hay.includes(token) || terms.some((t) => hay.includes(t)) || (token.length >= 5 && hay.includes(token.slice(0, -2))),
  );
};
