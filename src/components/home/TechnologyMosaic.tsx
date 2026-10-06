import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { prepareGalleryImage } from "@/lib/galleryImages";

type Photo = { src: string; alt: string };
type Content = { kind: "photo"; photo: Photo } | { kind: "color"; color: number };
type Tile = { id: number; wide?: boolean; tall?: boolean; color?: number };
const colors = ["mosaic-red", "mosaic-white", "mosaic-orange", "mosaic-lime", "mosaic-turquoise"];
// The selected composition: four rows, panoramic and square tiles, one double-height anchor.
const initialTiles: Tile[] = [
  { id: 0, wide: true }, { id: 1, color: 0 }, { id: 2 }, { id: 3, wide: true, color: 1 },
  { id: 4, color: 2 }, { id: 5, wide: true }, { id: 6, color: 3 }, { id: 7, wide: true, tall: true },
  { id: 8 }, { id: 9, color: 4 }, { id: 10, wide: true },
  { id: 11, wide: true, color: 0 }, { id: 12 }, { id: 13, color: 2 }, { id: 14, wide: true, color: 3 },
];
const randomDelay = () => 5000 + Math.random() * 8500;

function MosaicTile({ tile, photos, active, reduced }: { tile: Tile; photos: Photo[]; active: boolean; reduced: boolean }) {
  const [content, setContent] = useState<Content>(() => ({ kind: "color", color: tile.color ?? tile.id % colors.length }));
  const current = useRef(content);

  useEffect(() => {
    if (tile.color !== undefined || !photos.length) return;
    let cancelled = false;
    const photo = photos[tile.id % photos.length];
    void prepareGalleryImage(photo.src).then(() => {
      if (cancelled) return;
      const next: Content = { kind: "photo", photo };
      current.current = next;
      setContent(next);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [photos, tile.id, tile.color]);

  useEffect(() => {
    if (!active || reduced || !photos.length) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => { timer = setTimeout(change, randomDelay()); };
    const change = async () => {
      let next: Content;
      if (Math.random() < 0.26 && current.current.kind !== "color") {
        next = { kind: "color", color: Math.floor(Math.random() * colors.length) };
      } else {
        const available = photos.filter((photo) => current.current.kind !== "photo" || photo.src !== current.current.photo.src);
        const photo = available[Math.floor(Math.random() * available.length)];
        if (!photo) { schedule(); return; }
        try { await prepareGalleryImage(photo.src); } catch { if (!cancelled) schedule(); return; }
        next = { kind: "photo", photo };
      }
      if (cancelled) return;
      current.current = next;
      setContent(next);
      schedule();
    };
    schedule();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [active, reduced, photos]);

  const key = content.kind === "photo" ? content.photo.src : `color-${content.color}`;
  return (
    <motion.div layout={reduced ? false : "position"} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className={`mosaic-tile ${tile.wide ? "mosaic-tile-wide" : ""} ${tile.tall ? "mosaic-tile-tall" : ""}`} data-mosaic-tile={tile.id}>
      <AnimatePresence initial={false}>
        <motion.div key={key} className={`mosaic-content ${content.kind === "color" ? colors[content.color] : ""}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.65, ease: "easeInOut" }}>
          {content.kind === "photo" && <img src={content.photo.src} alt={content.photo.alt} loading="eager" decoding="async" className="h-full w-full object-cover" />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

export default function TechnologyMosaic() {
  const { lang } = useLanguage();
  const reduced = Boolean(useReducedMotion());
  const section = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(!document.hidden);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tiles, setTiles] = useState(initialTiles);

  useEffect(() => {
    const node = section.current;
    if (!node) return;
    const preload = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setNear(true); }, { rootMargin: "1000px" });
    const viewport = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    preload.observe(node);
    viewport.observe(node);
    const onVisibility = () => setForeground(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => { preload.disconnect(); viewport.disconnect(); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    import("@/data/technologies").then(({ techs }) => {
      // Interleave shuffled technology galleries so every technique participates in the first frame.
      const groups = techs.map((tech) => tech.images.map((src) => ({ src, alt: tech.name[lang] })).sort(() => Math.random() - 0.5));
      const mixed: Photo[] = [];
      const seen = new Set<string>();
      for (let i = 0; i < Math.max(...groups.map((group) => group.length)); i++) {
        for (const group of groups) {
          const photo = group[i];
          if (photo && !seen.has(photo.src)) { seen.add(photo.src); mixed.push(photo); }
        }
      }
      if (!cancelled) setPhotos(mixed);
    });
    return () => { cancelled = true; };
  }, [near, lang]);

  const active = visible && foreground;
  useEffect(() => {
    if (!active || reduced || !photos.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setTiles((previous) => {
          const next = [...previous];
          // Swap adjacent square/panoramic tiles while keeping the double-height anchor stable.
          const candidates = next.flatMap((tile, i) => i < next.length - 1 && !tile.tall && !next[i + 1].tall && Boolean(tile.wide) !== Boolean(next[i + 1].wide) ? [i] : []);
          const index = candidates[Math.floor(Math.random() * candidates.length)];
          if (index !== undefined) [next[index], next[index + 1]] = [next[index + 1], next[index]];
          return next;
        });
        schedule();
      }, 11000 + Math.random() * 7000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [active, reduced, photos]);

  return (
    <section ref={section} className="technology-mosaic" aria-label={lang === "lv" ? "Apdrukas un izšūšanas galerija" : "Printing and embroidery gallery"}>
      <div className="mosaic-grid">
        {tiles.map((tile) => photos.length
          ? <MosaicTile key={`${lang}-${tile.id}`} tile={tile} photos={photos} active={active} reduced={reduced} />
          : <div key={tile.id} className={`mosaic-tile ${tile.wide ? "mosaic-tile-wide" : ""} ${tile.tall ? "mosaic-tile-tall" : ""} ${tile.color !== undefined ? colors[tile.color] : ""}`} aria-hidden="true" />)}
      </div>
    </section>
  );
}