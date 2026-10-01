import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://raimxlv.github.io/ervitex";
const DEFAULT_TITLE = "Ervitex — apģērbu vairumtirdzniecība un apdruka Rīgā";
const DEFAULT_DESC =
  "SIA Ervitex — reklāmas apģērbu un tekstila vairumtirdzniecība ar sietspiedi, DTF, izšūšanu, sublimāciju un termodruku. 28+ gadu pieredze, birojs Rīgā.";

type Meta = { title: string; desc: string; noindex?: boolean };

const STATIC: Record<string, Meta> = {
  "/": { title: DEFAULT_TITLE, desc: DEFAULT_DESC },
  "/catalog": { title: "Katalogs — 6000+ apģērbu un aksesuāru modeļu | Ervitex", desc: "T-krekli, hūdiji, polo, jakas, darba apģērbs un aksesuāri no Stanley/Stella, NWG, PF Concept, Malfini un Beechfield. Cenas ar PVN, apdruka pēc pieprasījuma." },
  "/about": { title: "Par Ervitex — 28+ gadu pieredze tekstila apdrukā", desc: "Ervitex stāsts, tehnoloģijas un kvalitātes principi. Vairumtirdzniecība un profesionāla apģērbu apdruka Rīgā." },
  "/contact": { title: "Kontakti — Ervitex birojs un T-Bode veikali Rīgā", desc: "Braslas iela 29, Rīga. Tālr. +371 67543384, birojs@ervitex.lv. Projektu vadītāji, darba laiks un T-Bode veikalu adreses." },
  "/request": { title: "Pieprasījums | Ervitex", desc: DEFAULT_DESC, noindex: true },
  "/stanley-stella": { title: "Stanley/Stella — organiskās kokvilnas apģērbi | Ervitex", desc: "Oficiālais Stanley/Stella izplatītājs Latvijā. Organiskās kokvilnas T-krekli, hūdiji un somas apdrukai." },
  "/nwg": { title: "Clique, Craft, ProJob, Cutter & Buck | Ervitex", desc: "New Wave Group zīmolu reklāmas, sporta un darba apģērbi ar apdruku vai izšuvumu." },
  "/pf-concept": { title: "PF Concept — reklāmas preces un apģērbi | Ervitex", desc: "PF Concept apģērbi, somas un reklāmas preces ar logo apdruku." },
  "/beechfield-brands": { title: "Beechfield, Bagbase, Quadra — cepures un somas | Ervitex", desc: "Cepures, somas un aksesuāri ar izšuvumu vai apdruku." },
  "/malfini": { title: "Malfini — darba un reklāmas apģērbi | Ervitex", desc: "Malfini T-krekli, polo un darba apģērbi apdrukai vairumā." },
  "/privacy": { title: "Privātuma politika | Ervitex", desc: "SIA Ervitex privātuma politika." },
  "/terms": { title: "Lietošanas noteikumi | Ervitex", desc: "SIA Ervitex lietošanas noteikumi." },
  "/login": { title: "Ieiet | Ervitex", desc: DEFAULT_DESC, noindex: true },
};

const PRIVATE = [/^\/admin/, /^\/saraksts\//, /^\/piedavajums\//, /^\/assign/];

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Per-route title, description, canonical and robots for SPA navigation. */
const RouteSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let meta: Meta = STATIC[pathname] ?? { title: DEFAULT_TITLE, desc: DEFAULT_DESC };
    if (pathname.startsWith("/tehnologijas/")) {
      const slug = pathname.split("/")[2] ?? "";
      const name = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
      meta = { title: `${name} — apdrukas tehnoloģija | Ervitex`, desc: `${name} apģērbu apdruka Rīgā: priekšrocības, minimālais daudzums un piemēri. Ervitex.` };
    }
    // Product pages set their own title once data loads; keep a sensible default.
    if (pathname.startsWith("/catalog/item/") && !document.title.includes("|")) {
      meta = { title: "Prece | Ervitex katalogs", desc: STATIC["/catalog"].desc };
    }
    const noindex = meta.noindex || PRIVATE.some((r) => r.test(pathname));

    if (!pathname.startsWith("/catalog/item/")) document.title = meta.title;
    setMeta("name", "description", meta.desc);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.desc);
    setMeta("property", "og:url", SITE + pathname);
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.desc);
    if (noindex) setMeta("name", "googlebot", "noindex, nofollow");
    else document.head.querySelector('meta[name="googlebot"]')?.remove();

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = SITE + (pathname === "/" ? "/" : pathname);
  }, [pathname]);

  return null;
};

export default RouteSeo;
