export type MegaMenuSection =
  | "tops"
  | "outerwear"
  | "bottoms"
  | "workwear"
  | "headwear"
  | "bags"
  | "drinkware"
  | "promo"
  | "manufacturers";

export interface MegaMenuSectionMeta {
  key: MegaMenuSection;
  lv: string;
  en: string;
  /** Teksts "visi ..." saitei kolonnas apakšā */
  allLv: string;
  allEn: string;
  /** Ražotāju sadaļa lieto `?source=`, pārējās `?category=` */
  kind: "category" | "source";
}

/** Sadaļas tādā secībā, kā tās parādās mega izvēlnē. */
export const MEGA_MENU_SECTIONS: MegaMenuSectionMeta[] = [
  { key: "tops", lv: "Topi", en: "Tops", allLv: "Visi topi", allEn: "All tops", kind: "category" },
  {
    key: "outerwear",
    lv: "Virsjakas un vestes",
    en: "Jackets & vests",
    allLv: "Visas virsjakas",
    allEn: "All jackets",
    kind: "category",
  },
  {
    key: "bottoms",
    lv: "Bikses un šorti",
    en: "Bottoms",
    allLv: "Visas bikses",
    allEn: "All bottoms",
    kind: "category",
  },
  {
    key: "workwear",
    lv: "Darba apģērbs",
    en: "Workwear",
    allLv: "Viss darba apģērbs",
    allEn: "All workwear",
    kind: "category",
  },
  {
    key: "headwear",
    lv: "Cepures un tekstils",
    en: "Headwear & textiles",
    allLv: "Visas cepures",
    allEn: "All headwear",
    kind: "category",
  },
  {
    key: "bags",
    lv: "Somas un aksesuāri",
    en: "Bags & accessories",
    allLv: "Visas somas",
    allEn: "All bags & accessories",
    kind: "category",
  },
  {
    key: "drinkware",
    lv: "Krūzes un pudeles",
    en: "Drinkware",
    allLv: "Visas krūzes un pudeles",
    allEn: "All drinkware",
    kind: "category",
  },
  {
    key: "promo",
    lv: "Prezentmateriāli",
    en: "Promo & gifts",
    allLv: "Visi prezentmateriāli",
    allEn: "All promo & gifts",
    kind: "category",
  },
  {
    key: "manufacturers",
    lv: "Ražotāji",
    en: "Manufacturers",
    allLv: "Visi ražotāji",
    allEn: "All manufacturers",
    kind: "source",
  },
];

export const SECTION_META: Record<MegaMenuSection, MegaMenuSectionMeta> = Object.fromEntries(
  MEGA_MENU_SECTIONS.map((s) => [s.key, s]),
) as Record<MegaMenuSection, MegaMenuSectionMeta>;

/** Kolonnu izkārtojums desktopā (4 kolonnas, ražotāji atsevišķā rindā). */
export const MEGA_MENU_COLUMNS: MegaMenuSection[][] = [
  ["tops", "outerwear"],
  ["bottoms", "workwear"],
  ["headwear", "bags"],
  ["drinkware", "promo"],
];

export const buildCategoryHref = (cats: string[]) =>
  `/catalog?category=${encodeURIComponent(cats.join(","))}`;

export const buildSourceHref = (token: string) => `/catalog?source=${encodeURIComponent(token)}`;
