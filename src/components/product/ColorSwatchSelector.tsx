import { useState } from "react";
import { Palette } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export interface ColorVariant {
  name: string;
  hex?: string;
  imageUrl?: string;
}

interface ColorSwatchSelectorProps {
  colors: ColorVariant[];
  onColorSelect: (color: ColorVariant) => void;
}

const ColorSwatchSelector = ({ colors, onColorSelect }: ColorSwatchSelectorProps) => {
  const { t } = useLanguage();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  if (colors.length === 0) return null;

  const handleSelect = (color: ColorVariant) => {
    setSelectedColor(color.name);
    onColorSelect(color);
  };

  return (
    <div className="flex items-start gap-3">
      <Palette className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="w-full">
        <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
          {t("product.colors")}
          {selectedColor && (
            <span className="ml-2 font-normal normal-case tracking-normal text-muted-foreground">
              — {selectedColor}
            </span>
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleSelect(color)}
              title={color.name}
              className={`group relative h-8 w-8 rounded-full border-2 transition-all duration-200 ${
                selectedColor === color.name
                  ? "border-accent scale-110 shadow-md"
                  : "border-border hover:border-accent/60 hover:scale-105"
              }`}
            >
              {color.hex ? (
                <span
                  className="block h-full w-full rounded-full"
                  style={{ backgroundColor: color.hex }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-[8px] font-bold uppercase text-muted-foreground">
                  {color.name.slice(0, 2)}
                </span>
              )}
              {/* Tooltip */}
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                {color.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorSwatchSelector;
