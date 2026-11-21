import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight, RefreshCw, Save, X } from "lucide-react";
import { DOLL_META, DOLL_TYPES } from "@/data/demo";
import { useOutfitItems } from "@/lib/catalog";
import { fmt } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { DollSVG } from "@/components/DollSVG";
import { Spinner } from "@/components/ui";
import type { DollType, OutfitItem, OutfitZone } from "@/lib/types";

const SAVE_KEY = "saved-outfit-v1";

export default function BuilderPage() {
  const [dollType, setDollType] = useState<DollType | null>(null);
  const [outfit, setOutfit] = useState<Partial<Record<OutfitZone, OutfitItem>>>({});
  const [saved, setSaved] = useState(false);
  const allItems = useOutfitItems(dollType);
  const { addCustom } = useCart();
  const navigate = useNavigate();

  // Восстановить сохранённый образ для выбранной куклы
  useEffect(() => {
    if (!dollType || !allItems) return;
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(`${SAVE_KEY}-${dollType}`) ?? "[]");
      const restored: Partial<Record<OutfitZone, OutfitItem>> = {};
      for (const it of allItems) if (ids.includes(it.id)) restored[it.zone] = it;
      setOutfit(restored);
    } catch { /* ignore */ }
  }, [dollType, allItems]);
  const [catIndices, setCatIndices] = useState<Record<string, number>>({});

  const selectItem = (zone: OutfitZone, item: OutfitItem) => {
    setOutfit(prev => {
      const next = { ...prev };
      if (zone === "body") { delete next.top; delete next.bottom; }
      if (zone === "top" || zone === "bottom") { delete next.body; }
      next[zone] = item;
      return next;
    });
  };

  const removeZone = (zone: OutfitZone) => setOutfit(prev => { const n = { ...prev }; delete n[zone]; return n; });

  const totalPrice = Object.values(outfit).reduce((s, o) => s + (o?.price || 0), 0);

  const prevItem = (cat: string, items: OutfitItem[]) => {
    const cur = catIndices[cat] || 0;
    const next = (cur - 1 + items.length) % items.length;
    setCatIndices(prev => ({ ...prev, [cat]: next }));
  };
  const nextItem = (cat: string, items: OutfitItem[]) => {
    const cur = catIndices[cat] || 0;
    const next = (cur + 1) % items.length;
    setCatIndices(prev => ({ ...prev, [cat]: next }));
  };

  const clearOutfit = () => { setOutfit({}); setCatIndices({}); };

  if (!dollType) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Интерактивный раздел</p>
          <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27] mb-4">Соберите образ своей куклы</h1>
          <p className="font-['Jost'] font-light text-[#8B7B6E]">Выберите тип куклы и начните создавать образ</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOLL_TYPES.map(type => {
            const meta = DOLL_META[type];
            return (
              <button
                key={type}
                onClick={() => { clearOutfit(); setDollType(type); }}
                className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,46,39,0.15)] hover:-translate-y-1"
                style={{ background: meta.bg }}
              >
                <div className="absolute inset-x-0 bottom-0 h-44 overflow-hidden opacity-60">
                  <img src={meta.img} alt={meta.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="relative z-10 p-7 min-h-[240px] sm:min-h-[300px]">
                  <h3 className="font-['Gilda_Display'] text-xl text-[#3A2E27] leading-tight mb-2">{meta.shortLabel}</h3>
                  <p className="font-['Jost'] text-xs text-[#8B7B6E]">{meta.desc}</p>
                  <div className="absolute bottom-6 left-7 flex items-center gap-2 text-[#B8975A] font-['Jost'] text-sm font-medium">
                    <span>Создать образ</span>
                    <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!allItems) return <Spinner />;

  // Группируем вещи гардероба по категориям в порядке sort
  const items: Record<string, OutfitItem[]> = {};
  for (const it of allItems) (items[it.category] ??= []).push(it);
  const cats = Object.keys(items);

  const outfitEntries = Object.entries(outfit).filter(([, v]) => v != null) as [OutfitZone, OutfitItem][];

  const addToCart = () => {
    addCustom({
      dollType,
      name: `Кукла на заказ · ${DOLL_META[dollType].shortLabel}`,
      price: totalPrice,
      outfit: outfitEntries.map(([zone, it]) => ({ zone, itemId: it.id, name: it.name, color: it.color, price: it.price })),
    });
    navigate("/cart");
  };

  const saveOutfit = () => {
    try { localStorage.setItem(`${SAVE_KEY}-${dollType}`, JSON.stringify(outfitEntries.map(([, it]) => it.id))); } catch { /* ignore */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => { setDollType(null); clearOutfit(); }} className="text-sm font-['Jost'] text-[#8B7B6E] hover:text-[#B8975A] transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Назад
        </button>
        <span className="text-[#8B7B6E]">/</span>
        <span className="font-['Jost'] text-sm text-[#3A2E27] font-medium">{DOLL_META[dollType].shortLabel}</span>
      </div>

      <h1 className="font-['Gilda_Display'] text-3xl text-[#3A2E27] mb-10">Конструктор образа</h1>

      <div className="flex gap-8 items-start flex-col lg:flex-row">
        {/* Doll preview */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-24 rounded-3xl p-6 flex flex-col items-center"
            style={{ background: DOLL_META[dollType].bg, boxShadow: "0 4px 32px rgba(58,46,39,0.1)" }}>
            <div className="w-36 h-60 sm:w-48 sm:h-80">
              <DollSVG outfit={outfit} dollType={dollType} />
            </div>

            {outfitEntries.length > 0 ? (
              <div className="mt-6 w-full space-y-2">
                {outfitEntries.map(([zone, item]) => (
                  <div key={zone} className="flex items-center justify-between text-xs font-['Jost']">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border border-white/50" style={{ background: item.color }} />
                      <span className="text-[#3A2E27]">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#B8975A]">{fmt(item.price)}</span>
                      <button onClick={() => removeZone(zone)} className="text-[#8B7B6E] hover:text-red-400 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 mt-3 flex justify-between font-['Jost'] font-medium text-sm"
                  style={{ borderColor: "rgba(186,162,138,0.3)" }}>
                  <span className="text-[#3A2E27]">Итого</span>
                  <span className="text-[#B8975A]">{fmt(totalPrice)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-xs font-['Jost'] text-[#8B7B6E] text-center">Добавьте вещи из гардероба</p>
            )}

            <div className="mt-5 w-full space-y-2">
              <button
                disabled={outfitEntries.length === 0}
                className="w-full py-2.5 rounded-xl text-sm font-['Jost'] font-medium transition-all duration-200 disabled:opacity-40"
                style={{ background: "#B8975A", color: "#fff" }}
                onClick={addToCart}
              >
                Заказать куклу
              </button>
              <div className="flex gap-2">
                <button
                  onClick={clearOutfit}
                  className="flex-1 py-2.5 rounded-xl text-xs font-['Jost'] font-medium border flex items-center justify-center gap-1.5 transition-all duration-200 hover:border-[#8B7B6E]"
                  style={{ borderColor: "rgba(186,162,138,0.4)", color: "#8B7B6E" }}
                >
                  <RefreshCw size={11} /> Очистить
                </button>
                <button
                  onClick={saveOutfit}
                  disabled={outfitEntries.length === 0}
                  className="flex-1 py-2.5 rounded-xl text-xs font-['Jost'] font-medium border flex items-center justify-center gap-1.5 transition-all duration-200 hover:border-[#B8975A] hover:text-[#B8975A] disabled:opacity-40"
                  style={{ borderColor: "rgba(186,162,138,0.4)", color: "#8B7B6E" }}
                >
                  {saved ? <><Check size={11} /> Сохранено</> : <><Save size={11} /> Сохранить</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category selectors */}
        <div className="flex-1 w-full space-y-4 pb-24 lg:pb-0">
          {cats.map(cat => {
            const catItems = items[cat];
            if (!catItems || catItems.length === 0) return null;
            const idx = catIndices[cat] || 0;
            const item = catItems[idx];
            const zone = item.zone;
            const isSelected = outfit[zone]?.id === item.id;

            return (
              <div key={cat} className="bg-white rounded-2xl p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4"
                style={{ boxShadow: "0 2px 16px rgba(58,46,39,0.06)" }}>
                <div className="w-full sm:w-24 shrink-0">
                  <p className="font-['Jost'] text-xs font-medium text-[#8B7B6E] uppercase tracking-wider">{cat}</p>
                </div>

                <button onClick={() => prevItem(cat, catItems)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-[#8B7B6E] hover:text-[#B8975A] hover:border-[#B8975A] transition-all shrink-0"
                  style={{ borderColor: "rgba(186,162,138,0.4)" }}>
                  <ChevronLeft size={14} />
                </button>

                <div className="flex-1 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: item.color, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-['Jost'] font-medium text-sm text-[#3A2E27] truncate">{item.name}</p>
                    <p className="font-['Jost'] text-xs text-[#B8975A]">{fmt(item.price)}</p>
                  </div>
                </div>

                <button onClick={() => nextItem(cat, catItems)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-[#8B7B6E] hover:text-[#B8975A] hover:border-[#B8975A] transition-all shrink-0"
                  style={{ borderColor: "rgba(186,162,138,0.4)" }}>
                  <ChevronRight size={14} />
                </button>

                <button
                  onClick={() => isSelected ? removeZone(zone) : selectItem(zone, item)}
                  className="px-4 py-2 rounded-xl text-xs font-['Jost'] font-medium transition-all duration-200 shrink-0"
                  style={{
                    background: isSelected ? "#B8975A" : "#FAF7F2",
                    color: isSelected ? "#fff" : "#8B7B6E",
                    border: "1px solid",
                    borderColor: isSelected ? "#B8975A" : "rgba(186,162,138,0.4)",
                  }}
                >
                  {isSelected ? "Снять" : "Надеть"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* На телефоне итог и кнопка всегда под рукой */}
      {outfitEntries.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t px-4 py-3 flex items-center gap-3"
          style={{ borderColor: "rgba(186,162,138,0.3)" }}>
          <div className="flex-1">
            <p className="text-xs font-['Jost'] text-[#8B7B6E]">{outfitEntries.length} вещ. · итого</p>
            <p className="font-['Jost'] font-medium text-[#B8975A]">{fmt(totalPrice)}</p>
          </div>
          <button onClick={addToCart} className="btn-primary">Заказать куклу</button>
        </div>
      )}
    </div>
  );
}
