import { useState } from "react";
import officePhoto from "@/assets/ervitex-birojs.png.asset.json";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const HausmanaKvartalsMap = ({ className = "h-[320px] sm:h-[420px]" }: { className?: string }) => {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<"entrance" | "windows" | null>(null);
  const [hovered, setHovered] = useState<"entrance" | "windows" | null>(null);
  const active = hovered ?? selected;
  const entrance = lang === "lv" ? "D ieeja" : "Entrance D";
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
          <polygon className="office-outline office-windows-outline" points="154,347 665,267 665,369 154,405" />
          <path className="office-outline office-entrance-outline" d="M186 413 L259 409 L259 516 L183 516 Z" />
        </svg>
        <Button
          variant="ghost"
          className="office-region office-windows-region"
          aria-label={windows}
          aria-pressed={selected === "windows"}
          onMouseEnter={() => setHovered("windows")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("windows")}
          onBlur={() => setHovered(null)}
          onClick={() => setSelected(selected === "windows" ? null : "windows")}
        />
        <Button
          variant="ghost"
          className="office-region office-entrance-region"
          aria-label={entrance}
          aria-pressed={selected === "entrance"}
          onMouseEnter={() => setHovered("entrance")}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered("entrance")}
          onBlur={() => setHovered(null)}
          onClick={() => setSelected(selected === "entrance" ? null : "entrance")}
        />
        <span className="office-label office-windows-label" aria-hidden="true"><span className="office-marker-dot" />{windows}</span>
        <span className="office-label office-entrance-label" aria-hidden="true"><span className="office-door-letter">D</span>{lang === "lv" ? "ieeja" : "entrance"}</span>
      </div>
    </div>
  );
};

export default HausmanaKvartalsMap;
