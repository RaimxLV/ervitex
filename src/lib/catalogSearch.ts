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
  let score = 0;

  const idCompact = p.id.replace(/ /g, "");
  const digitsOnly = /^\d{2,}$/.test(pq.compact);
  if (idCompact === pq.compact) score += digitsOnly ? 1500 : 2000;
  else if (idCompact.startsWith(pq.compact) && pq.compact.length >= 3) score += 800;
  else if (digitsOnly) {
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
  const isStella = it.source === "ss" || normalizeSearch(it.brand).replace(/ /g, "") === "stanleystella";
  return score > 0 && isStella ? score + 3000 : score;
};

/** Ja vaicājums precīzi sakrīt ar preces kodu, atgriež tikai tās preces; citādi null. */
export const exactCodeHits = <T extends Searchable>(items: T[], pq: PreparedQuery | null): Set<T> | null => {
  // Tikai cipari ("169") var būt vairāku ražotāju kodos — rāda visus līdzīgos.
  if (!pq || pq.compact.length < 3 || /^\d+$/.test(pq.compact)) return null;
  const hits = new Set<T>();
  for (const it of items) if (prepare(it).id.replace(/ /g, "") === pq.compact) hits.add(it);
  return hits.size ? hits : null;
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
