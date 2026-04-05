import { Ruler, SwatchBook } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ColorSwatchSelector, { type ColorVariant } from "./ColorSwatchSelector";

interface ProductSpecsProps {
  material?: string;
  sizes: string[];
  colors: ColorVariant[];
  minOrder?: number;
  onColorSelect: (color: ColorVariant) => void;
}

const ICON_STROKE = 1.2;

const ProductSpecs = ({ material, sizes, colors, minOrder, onColorSelect }: ProductSpecsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 rounded-sm border border-border p-5">
      {material && (
        <div className="flex items-start gap-3">
          <SwatchBook className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={ICON_STROKE} />
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              {t("product.material")}
            </p>
            <p className="text-sm text-muted-foreground">{material}</p>
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div className="flex items-start gap-3">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-accent" strokeWidth={ICON_STROKE} />
          <div>
            <p className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
              {t("product.sizes")}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <span key={s} className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <ColorSwatchSelector colors={colors} onColorSelect={onColorSelect} />

      {minOrder && (
        <p className="text-sm text-muted-foreground">
          {t("product.minOrder")}:{" "}
          <span className="font-medium text-foreground">
            {minOrder} {t("product.pieces")}
          </span>
        </p>
      )}
    </div>
  );
};

export default ProductSpecs;
