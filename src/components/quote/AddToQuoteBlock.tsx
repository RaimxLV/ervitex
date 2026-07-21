import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check } from "lucide-react";
import { useQuoteCart } from "@/hooks/useQuoteCart";
import { useLanguage } from "@/i18n/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  source: string;
  productId: string;
  name: string;
  code: string;
  brand: string | null;
  image: string | null;
  colorCode: string | null;
  colorName: string | null;
  colorHex: string | null;
  sizes: string[];
}

const AddToQuoteBlock = ({ source, productId, name, code, brand, image, colorCode, colorName, colorHex, sizes }: Props) => {
  const { add } = useQuoteCart();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const initial = sizes.length ? Object.fromEntries(sizes.map((s) => [s, 0])) : { "-": 0 };
  const [qtyBySize, setQtyBySize] = useState<Record<string, number>>(initial);
  const [added, setAdded] = useState(false);

  // Reset when color/product changes
  const key = `${productId}-${colorCode}-${sizes.join(",")}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setQtyBySize(sizes.length ? Object.fromEntries(sizes.map((s) => [s, 0])) : { "-": 0 });
    setAdded(false);
  }

  const totalRequested = Object.values(qtyBySize).reduce((a, b) => a + b, 0);

  const handleAdd = () => {
    const entries = sizes.length
      ? sizes.filter((s) => (qtyBySize[s] || 0) > 0).map((s) => ({ size: s, qty: qtyBySize[s] }))
      : (qtyBySize["-"] || 0) > 0 ? [{ size: null, qty: qtyBySize["-"] }] : [];
    if (entries.length === 0) {
      toast({ title: lang === "lv" ? "Norādi vismaz vienu skaitu" : "Enter at least one quantity", variant: "destructive" });
      return;
    }
    for (const e of entries) {
      add({
        source, productId, name, code, brand, image,
        colorCode, colorName, colorHex,
        size: e.size, qty: e.qty,
      });
    }
    setAdded(true);
    toast({ title: lang === "lv" ? "Pievienots pieprasījumam" : "Added to request" });
    setQtyBySize(sizes.length ? Object.fromEntries(sizes.map((s) => [s, 0])) : { "-": 0 });
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
      <p className="font-heading text-sm font-bold uppercase tracking-wider">
        {lang === "lv" ? "Skaits pēc izmēra" : "Quantity by size"}
      </p>
      {sizes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {sizes.map((s) => (
            <label key={s} className="flex flex-col items-center rounded border border-border bg-background p-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{s}</span>
              <Input
                type="number"
                min={0}
                inputMode="numeric"
                value={qtyBySize[s] || ""}
                onChange={(e) => setQtyBySize({ ...qtyBySize, [s]: Math.max(0, parseInt(e.target.value) || 0) })}
                className="mt-1 h-8 w-full border-0 bg-transparent p-0 text-center text-sm font-semibold focus-visible:ring-0"
                placeholder="0"
              />
            </label>
          ))}
        </div>
      ) : (
        <Input
          type="number"
          min={0}
          value={qtyBySize["-"] || ""}
          onChange={(e) => setQtyBySize({ "-": Math.max(0, parseInt(e.target.value) || 0) })}
          placeholder={lang === "lv" ? "Skaits" : "Quantity"}
        />
      )}
      <Button
        type="button"
        onClick={handleAdd}
        disabled={totalRequested === 0}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs uppercase tracking-widest"
      >
        {added ? <><Check className="mr-2 h-4 w-4" />{lang === "lv" ? "Pievienots" : "Added"}</> : <><Plus className="mr-2 h-4 w-4" />{lang === "lv" ? `Pievienot pieprasījumam${totalRequested ? ` (${totalRequested} gab.)` : ""}` : `Add to request${totalRequested ? ` (${totalRequested} pcs)` : ""}`}</>}
      </Button>
    </div>
  );
};

export default AddToQuoteBlock;
