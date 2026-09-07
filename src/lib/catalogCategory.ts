/**
 * Dažiem piegādātājiem (īpaši NWG) kategorija ir pavisam vispārīga —
 * "Tops", "Bottoms", "Jackets", "Headwear", "Bags", "Clothing".
 * Tāpēc T-krekliem, polo krekliem, vestēm un džemperiem ir viena un tā pati
 * kategorija, un saite "T-krekli" atver arī vestes.
 *
 * Šeit no produkta nosaukuma nolasām īsto apģērba tipu, lai katalogs un
 * izvēlnes saites sakristu.
 */

/** Kategorijas, kuras pašas par sevi neko nepasaka un jāprecizē pēc nosaukuma. */
const COARSE = new Set([
  "tops",
  "top",
  "bottoms",
  "bottom",
  "jackets",
  "jacket",
  "headwear",
  "bags",
  "bag",
  "clothing",
  "accessories",
  "sets",
  "textiles",
  "additional assortment",
  "promotional materials",
]);

export const isCoarseCategory = (raw?: string | null): boolean =>
  !!raw && COARSE.has(raw.trim().toLowerCase());

const has = (n: string, ...words: string[]) => words.some((w) => n.includes(w));

/** Precizē kategoriju pēc produkta nosaukuma. Atgriež `null`, ja nav skaidrs. */
export const categoryFromName = (rawName?: string | null): string | null => {
  const n = (rawName || "").toLowerCase();
  if (!n) return null;

  // --- Apavi un cimdi ---
  if (has(n, "glove", "mitten")) return "Gloves";
  if (has(n, "sock")) return "Socks";
  if (has(n, "shoe", "sneaker", "boot", "sandal")) return "Shoes";

  // --- Cepures, šalles, dvieļi ---
  if (has(n, "beanie", " cap", "cap ", "snapback", "trucker", "bucket hat", " hat", "hat ", "visor", "headband"))
    return "Caps & Hats";
  if (has(n, "scarf", "scarves", "snood", "buff")) return "Scarves";
  if (has(n, "towel", "terry")) return "Towels";
  if (has(n, "blanket", "plaid")) return "Blankets";
  if (has(n, "apron")) return "Aprons";

  // --- Somas ---
  if (has(n, "backpack", "rucksack")) return "Backpacks";
  if (has(n, "tote", "shopper", "shopping bag", "cotton bag", "drawstring")) return "Tote Bags";
  if (has(n, "duffel", "gym bag", "sports bag", "travel bag", "trolley", "suitcase")) return "Sports Bags";
  if (has(n, "bag", "pouch")) return "Bags";

  // --- Bikses / šorti ---
  if (has(n, "short")) return "Shorts";
  if (has(n, "pants", "pant ", "trouser", "tights", "chino", "jeans", "bib", "legging")) return "Trousers";

  // --- Virsjakas un vestes ---
  if (has(n, "vest", "bodywarmer", "gilet", "singlet")) {
    // "Singlet" ir bezpiedurkņu krekls, nevis veste.
    if (has(n, "singlet")) return "T-shirts";
    return "Vests";
  }
  if (has(n, "jacket", "parka", "anorak", "windbreaker", "softshell", "shell ", "coverall", "overall"))
    return "Jackets";

  // --- Topi ---
  if (has(n, "hoodie", "hoody", "hood ")) return "Hoodies";
  if (has(n, "polo", "pique", "piqué")) return "Polos";
  if (has(n, "t-shirt", "tshirt", "tee", "t-krekl", "tank", "jersey", "basic-t", "ice-t")) return "T-shirts";
  if (
    has(
      n,
      "sweatshirt",
      "sweater",
      "halfzip",
      "half zip",
      "1/2 zip",
      "full zip",
      "zip-thru",
      "crewneck",
      "crew neck",
      "roundneck",
      "round neck",
      "rollerneck",
      "r-neck",
      "midlayer",
      "fleece",
      "sherpa",
      "cardigan",
      " hz ",
      "pullover",
    )
  )
    return "Sweaters";
  if (has(n, "shirt", "blouse", "tunic")) return "Shirts";

  return null;
};
