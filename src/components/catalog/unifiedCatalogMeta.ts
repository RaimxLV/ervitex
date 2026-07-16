export type CatalogSource = "ss" | "nwg" | "pf" | "bb";

export const SOURCE_META: Record<CatalogSource, { label: string; href: string; code: string }> = {
  ss: { label: "Stanley/Stella", href: "/stanley-stella", code: "S/S" },
  nwg: { label: "New Wave Group", href: "/nwg", code: "NWG" },
  pf: { label: "PF Concept", href: "/pf-concept", code: "PFC" },
  bb: { label: "Beechfield Brands", href: "/beechfield-brands", code: "BB" },
};
