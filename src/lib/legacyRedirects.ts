/** Vecās www.ervitex.lv (Joomla/VirtueMart) adreses → jaunās lapas. Pastāvīgas 301 pārvirzes SEO vērtības saglabāšanai. */
const cat = (...c: string[]) => `/catalog?category=${encodeURIComponent(c.join(","))}`;

const SECTION_MAP: Record<string, string> = {
  "t-krekli": cat("T-shirts", "T-Shirts"),
  pletkrekli: cat("Shirts", "Shirts & Knitwear"),
  "polo-krekli": cat("Polos"),
  dzemperi: cat("Hoodies", "Sweats & Hoodies", "Sweaters"),
  "flisa-jakas": cat("Fleeces", "Polar Fleece"),
  cepures: cat("Caps & Hats"),
  adijumi: cat("Sweaters", "Shirts & Knitwear"),
  somas: cat("Bags", "Tote Bags", "Drawstring Bags", "Backpacks"),
  "audumu-maisini": cat("Tote Bags"),
  aksesuari: cat("Accessories", "Gloves", "Towels", "Wallets & Card Wallets", "Scarves"),
  termovela: "/catalog?q=termo",
  berniem: "/catalog?gender=Kids%2CBaby",
  sportam: cat("Sporta formas sublimācija"),
  virsjakas: cat("Jackets", "Jackets & Windbreakers", "Windbreakers"),
  vestes: cat("Vests"),
  "darba-apgerbi": cat("Workwear", "Coverall", "Hospitality & Care Wear"),
  bikses: cat("Trousers"),
  kruzes: cat("Mugs"),
  lietussargi: cat("Umbrellas", "Stick Umbrellas"),
  kontakti: "/contact",
  "par-mums": "/about",
  sietspiede: "/tehnologijas/sietspiede",
  izsusana: "/tehnologijas/izsusana",
  sublimacija: "/tehnologijas/sublimacija",
  termodruka: "/tehnologijas/termodruka",
  "9-uncategorised": "/",
};

const SUBCATEGORY_MAP: Record<string, string> = {
  "somas/mugursomas": cat("Backpacks"),
  "somas/sporta-somas": cat("Sports Bags", "Sport & Gym Bags"),
  "somas/datorsomas": cat("Laptop & Tablet Bags", "Business Bags"),
  "somas/pleca-somas": cat("Messenger & Shoulder Bags"),
  "somas/dokumentu-somas": cat("Conference Bags", "Business Bags"),
  "somas/auduma-somas-maisini": cat("Tote Bags"),
  "somas/celojuma-somas": cat("Travel Bags", "Trolleys & Suitcases"),
  "aksesuari/cimdi": cat("Gloves"),
  "aksesuari/dvieli": cat("Towels"),
  "aksesuari/macini": cat("Wallets & Card Wallets"),
  "aksesuari/salles-un-lakati": cat("Scarves"),
};

/** `rest` = daļa pēc "/index.php/" bez query. */
export function legacyTarget(rest: string): string {
  const parts = rest.split("/").filter(Boolean).map((p) => decodeURIComponent(p).toLowerCase());
  if (parts.length === 0) return "/";
  const [section, ...sub] = parts;
  if (section === "shop") {
    const i = sub.findIndex((s) => s === "manufacturer" || s === "manufacturers");
    if (i >= 0 && sub[i + 1]) return `/catalog?q=${encodeURIComponent(sub[i + 1].replace(/-/g, " "))}`;
    return "/catalog";
  }
  const target = SUBCATEGORY_MAP[`${section}/${sub[0] ?? ""}`] ?? SECTION_MAP[section];
  if (!target) return "/catalog";
  const child = sub[0] ?? "";
  const gender = child.startsWith("bernu-") ? "Kids,Baby"
    : /^(?:viriesu-|vririesu-)/.test(child) ? "Men,Unisex"
    : child.startsWith("sieviesu-") ? "Women,Unisex" : null;
  return gender && target.startsWith("/catalog?")
    ? `${target}&gender=${encodeURIComponent(gender)}` : target;
}
