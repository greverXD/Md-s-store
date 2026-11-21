import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  count: number;
  total: number;
  addProduct: (p: Product) => void;
  addCustom: (item: Omit<Extract<CartItem, { type: "custom" }>, "key" | "qty" | "type">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  lastAdded: number;
}

const Ctx = createContext<CartState | null>(null);
const STORAGE_KEY = "doll-cart-v1";

function load(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);
  const [lastAdded, setLastAdded] = useState(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* приватный режим */ }
  }, [items]);

  const addProduct = (p: Product) => {
    setItems(prev => {
      const found = prev.find(i => i.type === "product" && i.productId === p.id);
      if (found) return prev.map(i => i === found ? { ...i, qty: Math.min(i.qty + 1, 20) } : i);
      return [...prev, { key: `p-${p.id}`, type: "product", productId: p.id, name: p.name, price: p.price, image: p.image, qty: 1 }];
    });
    setLastAdded(Date.now());
  };

  const addCustom: CartState["addCustom"] = item => {
    setItems(prev => [...prev, { ...item, type: "custom", qty: 1, key: `c-${Date.now()}` }]);
    setLastAdded(Date.now());
  };

  const value: CartState = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    addProduct,
    addCustom,
    setQty: (key, qty) => setItems(prev => prev.map(i => i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, 20)) } : i)),
    remove: key => setItems(prev => prev.filter(i => i.key !== key)),
    clear: () => setItems([]),
    lastAdded,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside CartProvider");
  return v;
}
