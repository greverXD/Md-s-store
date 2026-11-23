import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { CLOTHING_CATS, DOLL_META, DOLL_TYPES } from "@/data/demo";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { FilterChip, Spinner, StockTabs, matchesStock, type StockFilter } from "@/components/ui";
import type { DollType } from "@/lib/types";

export default function ClothesPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const dollType = DOLL_TYPES.includes(type as DollType) ? (type as DollType) : null;
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [stock, setStock] = useState<StockFilter>("all");
  useEffect(() => { setSelectedCats([]); setStock("all"); }, [dollType]);
  const { data, loading } = useProducts({ kind: "clothing", dollType: dollType ?? undefined });

  const toggleCat = (c: string) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  if (!dollType) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Каталог одежды</p>
          <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27] mb-4">Для какой куклы?</h1>
          <p className="font-['Jost'] font-light text-[#8B7B6E]">Выберите тип куклы, чтобы увидеть подходящую одежду</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DOLL_TYPES.map(type => {
            const meta = DOLL_META[type];
            return (
              <button
                key={type}
                onClick={() => navigate(`/clothes/${type}`)}
                className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,46,39,0.15)] hover:-translate-y-1"
                style={{ background: meta.bg }}
              >
                <div className="absolute inset-x-0 bottom-0 h-48 overflow-hidden opacity-70">
                  <img src={meta.img} alt={meta.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="relative z-10 p-7 min-h-[240px] sm:min-h-[320px]">
                  <h3 className="font-['Gilda_Display'] text-xl text-[#3A2E27] leading-tight mb-2">{meta.shortLabel}</h3>
                  <p className="font-['Jost'] text-xs text-[#8B7B6E]">{meta.desc}</p>
                  <div className="absolute bottom-6 left-7 flex items-center gap-2 text-[#B8975A] font-['Jost'] text-sm font-medium">
                    <span>Выбрать</span>
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

  const meta = DOLL_META[dollType];
  const cats = CLOTHING_CATS[dollType];
  const all = data ?? [];
  const byCat = selectedCats.length ? all.filter(p => p.category && selectedCats.includes(p.category)) : all;
  const products = byCat.filter(p => matchesStock(p.inStock, stock));
  const counts = { all: byCat.length, in: byCat.filter(p => p.inStock).length, order: byCat.filter(p => !p.inStock).length };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => navigate("/clothes")} className="text-sm font-['Jost'] text-[#8B7B6E] hover:text-[#B8975A] transition-colors flex items-center gap-1">
          <ChevronLeft size={14} /> Назад
        </button>
        <span className="text-[#8B7B6E]">/</span>
        <span className="font-['Jost'] text-sm text-[#3A2E27] font-medium">{meta.label}</span>
      </div>

      <h1 className="font-['Gilda_Display'] text-4xl text-[#3A2E27] mb-8">{meta.label}</h1>

      {/* Подразделы: в наличии / на заказ */}
      <div className="mb-6">
        <StockTabs value={stock} onChange={setStock} counts={data ? counts : undefined} />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10">
        <FilterChip label="Все" active={selectedCats.length === 0} onClick={() => setSelectedCats([])} />
        {cats.map(c => <FilterChip key={c} label={c} active={selectedCats.includes(c)} onClick={() => toggleCat(c)} />)}
      </div>

      <div className="flex items-center justify-between mb-6">
        <p className="font-['Jost'] text-sm text-[#8B7B6E]">Найдено: {products.length} товаров</p>
      </div>

      {loading ? <Spinner /> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>}
    </div>
  );
}
