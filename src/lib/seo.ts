/** Shared per-route SEO metadata. Canonical host is always www.ervitex.lv. */
export const SITE = "https://www.ervitex.lv";

const years = () => new Date().getFullYear() - 1998;

export const DEFAULT_TITLE = "Ervitex — apģērbu vairumtirdzniecība un apdruka Rīgā";
export const defaultDesc = () =>
  `SIA Ervitex — reklāmas apģērbu un tekstila vairumtirdzniecība ar sietspiedi, DTF, izšūšanu, sublimāciju un termodruku. ${years()}+ gadu pieredze, birojs Rīgā.`;

export type PageMeta = { title: string; desc: string; noindex?: boolean };

export const TECH_NAMES: Record<string, string> = {
  sietspiede: "Sietspiede",
  dtf: "DTF druka",
  izsusana: "Izšūšana",
  sublimacija: "Sublimācija",
  termodruka: "Termodruka",
};

export function pageMeta(path: string): PageMeta {
  const d = defaultDesc();
  const map: Record<string, PageMeta> = {
    "/": { title: DEFAULT_TITLE, desc: d },
    "/catalog": { title: "Katalogs — 7000+ apģērbu un aksesuāru modeļu | Ervitex", desc: "T-krekli, hūdiji, polo, jakas, darba apģērbs un aksesuāri no Stanley/Stella, NWG, PF Concept, Malfini un Beechfield. Cenas ar PVN, apdruka pēc pieprasījuma." },
    "/about": { title: `Par Ervitex — ${years()}+ gadu pieredze tekstila apdrukā`, desc: "Ervitex stāsts, tehnoloģijas un kvalitātes principi. Vairumtirdzniecība un profesionāla apģērbu apdruka Rīgā." },
    "/contact": { title: "Kontakti — Ervitex birojs un T-Bode veikali Rīgā", desc: "Braslas iela 29, Rīga. Tālr. +371 67543384, birojs@ervitex.lv. Projektu vadītāji, darba laiks un T-Bode veikalu adreses." },
    "/stanley-stella": { title: "Stanley/Stella — organiskās kokvilnas apģērbi | Ervitex", desc: "Oficiālais Stanley/Stella izplatītājs Latvijā. Organiskās kokvilnas T-krekli, hūdiji un somas apdrukai." },
    "/nwg": { title: "Clique, Craft, ProJob, Cutter & Buck | Ervitex", desc: "New Wave Group zīmolu reklāmas, sporta un darba apģērbi ar apdruku vai izšuvumu." },
    "/pf-concept": { title: "PF Concept — reklāmas preces un apģērbi | Ervitex", desc: "PF Concept apģērbi, somas un reklāmas preces ar logo apdruku." },
    "/beechfield-brands": { title: "Beechfield, Bagbase, Quadra — cepures un somas | Ervitex", desc: "Cepures, somas un aksesuāri ar izšuvumu vai apdruku." },
    "/malfini": { title: "Malfini — darba un reklāmas apģērbi | Ervitex", desc: "Malfini T-krekli, polo un darba apģērbi apdrukai vairumā." },
    "/services": { title: "Apdrukas pakalpojumi | Ervitex", desc: d },
    "/privacy": { title: "Privātuma politika | Ervitex", desc: "SIA Ervitex privātuma politika." },
    "/terms": { title: "Lietošanas noteikumi | Ervitex", desc: "SIA Ervitex lietošanas noteikumi." },
    "/request": { title: "Pieprasījums | Ervitex", desc: d, noindex: true },
    "/login": { title: "Ieiet | Ervitex", desc: d, noindex: true },
  };
  if (map[path]) return map[path];
  if (path.startsWith("/tehnologijas/")) {
    const slug = path.split("/")[2] ?? "";
    const name = TECH_NAMES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    return { title: `${name} — apdrukas tehnoloģija | Ervitex`, desc: `${name}: apģērbu apdruka Rīgā — priekšrocības, minimālais daudzums un piemēri. Ervitex.` };
  }
  return { title: DEFAULT_TITLE, desc: d, noindex: true };
}

/** Route head() for a content page: title, description, OG/Twitter, canonical, LV/EN alternates. */
export function pageHead(path: string, override?: Partial<PageMeta>) {
  const m = { ...pageMeta(path), ...override };
  const url = SITE + path;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.desc },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.desc },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.desc },
      ...(m.noindex ? [{ name: "googlebot", content: "noindex, nofollow" }] : []),
    ],
    links: m.noindex
      ? []
      : [
          { rel: "canonical", href: url },
          { rel: "alternate", hrefLang: "lv", href: url },
          { rel: "alternate", hrefLang: "x-default", href: url },
        ],
  };
}

/** head() for private pages (offers, lists, admin): never indexed. */
export const privateHead = (title = "Ervitex") => ({
  meta: [
    { title },
    { name: "robots", content: "noindex, nofollow" },
    { name: "googlebot", content: "noindex, nofollow" },
  ],
});
