import { useState } from "react";
import officePhoto from "@/assets/ervitex-birojs.png.asset.json";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

// Coordinates trace the individual panes in the original 1200 × 560 photo.
const windowContours = [
  "164,357 175,355 175,405 164,407",
  "188,351 200,349 200,396 188,398",
  "220,345 232,343 232,392 220,394",
  "261,341 273,339 273,385 261,387",
  "295,334 307,332 307,383 295,385",
  "329,328 341,326 341,381 329,383",
  "365,324 376,322 376,380 365,382",
  "431,312 447,310 447,365 431,367",
  "477,305 494,302 494,362 477,364",
  "525,298 543,295 543,359 525,361",
  "575,290 595,287 595,354 575,357",
  "628,284 651,281 651,349 628,352",
];
const doorContour = "199,432 237,431 237,498 198,498";
const clipContour = (points: string) => `polygon(${points.split(" ").map((point) => {
  const [x, y] = point.split(",").map(Number);
  return `${x / 12}% ${y / 5.6}%`;
}).join(", ")})`;

const HausmanaKvartalsMap = ({ className = "h-[320px] sm:h-[420px]" }: { className?: string }) => {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? selected;
  const entrance = lang === "lv" ? "Ieeja D" : "Entrance D";
  const windows = lang === "lv" ? "Ervitex · 2. stāvs" : "Ervitex · 2nd floor";

  return (
    <div className={`office-photo relative w-full overflow-hidden bg-card ${className}`} data-active={active ?? "none"}>
      <div className="office-photo-scene">
        <img
          src={officePhoto.url}
          alt={lang === "lv" ? "Hausmaņa biroji ar Ervitex D ieeju un otrā stāva logiem" : "Hausmana offices with the Ervitex entrance D and second-floor windows"}
          width={1200}
          height={560}
          className="absolute inset-0 block h-full w-full"
          loading="lazy"
          decoding="async"
        />
        <svg viewBox="0 0 1200 560" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            {/* Tight bright core plus a wide soft spill, with a roomy region so the
                blur is never clipped by the shape's own bounding box. */}
            <filter id="office-glow" x="-600%" y="-250%" width="1300%" height="600%" colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="wide" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="tight" />
              <feMerge>
                <feMergeNode in="wide" />
                <feMergeNode in="tight" />
              </feMerge>
            </filter>
          </defs>
          <g className="office-glow-layer">
            {windowContours.map((points, index) => <polygon
              key={points}
              className="office-glow"
              filter="url(#office-glow)"
              style={{ animationDelay: `${index * 0.32}s` }}
              data-lit={active === `window-${index}`}
              points={points}
            />)}
            <polygon className="office-glow office-entrance-glow" filter="url(#office-glow)" data-lit={active === "entrance"} points={doorContour} />
          </g>
          <g className="office-core-layer">
            {windowContours.map((points, index) => <polygon
              key={points}
              className="office-outline office-window-outline"
              style={{ animationDelay: `${index * 0.32}s` }}
              data-lit={active === `window-${index}`}
              points={points}
            />)}
            <polygon className="office-outline office-entrance-outline" data-lit={active === "entrance"} points={doorContour} />
          </g>
        </svg>
        {windowContours.map((points, index) => <Button
          key={points}
          variant="ghost"
          className="office-region"
          style={{ clipPath: clipContour(points) }}
          aria-label={`${windows} · ${lang === "lv" ? "logs" : "window"} ${index + 1}`}
          aria-pressed={selected === `window-${index}`}
          onMouseEnter={() => setHovered(`window-${index}`)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(`window-${index}`)}
          onBlur={() => setHovered(null)}
          onClick={() => setSelected(selected === `window-${index}` ? null : `window-${index}`)}
        />)}
        <Button
          variant="ghost"
          className="office-region"
          style={{ clipPath: clipContour(doorContour) }}
          aria-label={entrance}
          aria-pressed={selected === "entrance"}
          onMouseEnter={() => setHovered("entrance")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("entrance")}
          onBlur={() => setHovered(null)}
          onClick={() => setSelected(selected === "entrance" ? null : "entrance")}
        />
      </div>
      <span className="office-label office-entrance-label" aria-hidden="true"><span className="office-door-letter">D</span><span>{lang === "lv" ? "Ieeja birojam" : "Office entrance"}</span></span>
    </div>
  );
};

export default HausmanaKvartalsMap;
