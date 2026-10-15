/** Vecās www.ervitex.lv (Joomla/VirtueMart) adreses → jaunās lapas. Pastāvīgas 301 pārvirzes SEO vērtības saglabāšanai. */
const cat = (...c: string[]) => `/catalog?category=${encodeURIComponent(c.join(","))}`;

const SECTION_MAP: Record<string, string> = {
  "t-krekli": cat("T-shirts", "T-Shirts"),
  pletkrekli: cat("T-shirts", "T-Shirts"),
  "polo-krekli": cat("Polos"),
  dzemperi: cat("Hoodies", "Sweats & Hoodies", "Sweaters"),
  "flisa-jakas": cat("Fleeces", "Polar Fleece"),
  cepures: cat("Caps & Hats"),
  adijumi: cat("Caps & Hats", "Scarves"),
  somas: cat("Bags", "Tote Bags", "Drawstring Bags", "Backpacks"),
  sportam: cat("Sporta formas sublimācija"),
  virsjakas: cat("Jackets", "Jackets & Windbreakers", "Windbreakers"),
  vestes: cat("Vests"),
  "darba-apgerbi": cat("Workwear", "Coverall", "Hospitality & Care Wear"),
  bikses: cat("Trousers"),
  kruzes: cat("Mugs"),
  lietussargi: "/catalog?q=lietussargs",
  kontakti: "/contact",
  "par-mums": "/about",
  sietspiede: "/tehnologijas/sietspiede",
  izsusana: "/tehnologijas/izsusana",
  sublimacija: "/tehnologijas/sublimacija",
  termodruka: "/tehnologijas/termodruka",
  "9-uncategorised": "/",
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
  return SECTION_MAP[section] ?? "/catalog";
}
