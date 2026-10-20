// Beechfield-group product pages leak footer legal/nav links into the feature list.
// Exact-match only, so genuine certifications (e.g. "Fair Wear member") are kept.
const BB_FOOTER_LINKS = new Set([
  "full terms and conditions",
  "modern slavery statement",
  "privacy statement",
  "sitemap",
]);

export function stripBbFooterLinks(items: string[]): string[] {
  return items.filter((i) => !BB_FOOTER_LINKS.has(String(i ?? "").trim().toLowerCase()));
}
