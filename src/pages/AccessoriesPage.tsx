import { useMemo, useState } from "react";
import { ACC_CATS } from "@/data/demo";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { FilterChip, Spinner } from "@/components/ui";

export default function AccessoriesPage() {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const { data, loading } = useProducts({ kind: "accessory" });

  const toggleCat = (c: string) => setSelectedCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const filtered = useMemo(() => {
    let acc = data ?? [];
    if (selectedCats.length) acc = acc.filter(a => a.category && selectedCats.includes(a.category));
    return acc;
  }, [data, selectedCats]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Каталог</p>
        <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27]">Кукольные аксессуары</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip label="Все" active={selectedCats.length === 0} onClick={() => setSelectedCats([])} />
        {ACC_CATS.map(c => <FilterChip key={c} label={c} active={selectedCats.includes(c)} onClick={() => toggleCat(c)} />)}
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="font-['Jost'] text-sm text-[#8B7B6E]">Найдено: {filtered.length} товаров</p>
      </div>

      {loading ? <Spinner /> : <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>}
    </div>
  );
}
