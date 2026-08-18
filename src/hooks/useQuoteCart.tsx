import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";

export interface QuoteCartItem {
  id: string; // unique per line (product + color + size)
  source: string; // ss / nwg / pf / bb / mf
  productId: string;
  name: string;
  code: string;
  brand: string | null;
  image: string | null;
  colorCode: string | null;
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  qty: number;
  /** Unit price, VAT excluded (from catalog at time of adding) */
  unitPrice?: number | null;
}


interface Ctx {
  items: QuoteCartItem[];
  add: (item: Omit<QuoteCartItem, "id"> & { id?: string }) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  totalQty: number;
}

const QuoteCartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "ervitex:quote-cart:v1";

export const QuoteCartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<QuoteCartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add: Ctx["add"] = (item) => {
    const id = item.id || `${item.source}-${item.productId}-${item.colorCode || "x"}-${item.size || "x"}-${Date.now()}`;
    setItems((prev) => {
      // merge if same product/color/size already exists
      const match = prev.find(
        (p) => p.productId === item.productId && p.colorCode === item.colorCode && p.size === item.size,
      );
      if (match) {
        return prev.map((p) => (p.id === match.id ? { ...p, qty: p.qty + item.qty } : p));
      }
      return [...prev, { ...item, id }];
    });
  };

  const remove: Ctx["remove"] = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const updateQty: Ctx["updateQty"] = (id, qty) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)));
  const clear = () => setItems([]);

  const totalQty = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <QuoteCartContext.Provider value={{ items, add, remove, updateQty, clear, totalQty }}>
      {children}
    </QuoteCartContext.Provider>
  );
};

export const useQuoteCart = () => {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used within QuoteCartProvider");
  return ctx;
};
