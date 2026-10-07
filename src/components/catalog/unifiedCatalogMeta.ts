export type CatalogSource = "ss" | "nwg" | "pf" | "bb" | "mf" | "ru" | "utt";

export const SOURCE_META: Record<CatalogSource, { label: string; href: string; code: string }> = {
  ss: { label: "Stanley/Stella", href: "/stanley-stella", code: "S/S" },
  nwg: { label: "Craft / Clique / ProJob / Cutter & Buck", href: "/nwg", code: "BR" },
  pf: { label: "PF Concept", href: "/pf-concept", code: "PFC" },
  bb: { label: "Beechfield Brands", href: "/beechfield-brands", code: "BB" },
  mf: { label: "Malfini", href: "/malfini", code: "MF" },
  ru: { label: "Russell", href: "/catalog?source=ru", code: "RU" },
  utt: { label: "Gildan / Kariban / Regatta", href: "/catalog?source=utt", code: "UTT" },
};
