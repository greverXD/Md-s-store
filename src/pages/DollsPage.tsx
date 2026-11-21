import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { COLLECTIONS, EYE_COLORS, HAIR_COLORS, HEIGHTS } from "@/data/demo";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { Notice, Spinner } from "@/components/ui";

export default function DollsPage() {
  const { data, loading, error } = useProducts({ kind: "doll", dollType: "textile" });
  const [section, setSection] = useState("В наличии");
  const [selectedHeights, setSelectedHeights] = useState<string[]>([]);
  const [selectedHair, setSelectedHair] = useState<string[]>([]);
  const [selectedEyes, setSelectedEyes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const sections = ["В наличии", "На заказ", "Коллекции", "Новинки"];

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let dolls = data ?? [];
    if (section === "В наличии") dolls = dolls.filter(d => d.inStock);
    else if (section === "На заказ") dolls = dolls.filter(d => !d.inStock);
    else if (section === "Коллекции") dolls = dolls.filter(d => d.collection);
    else if (section === "Новинки") dolls = dolls.filter(d => d.isNew);
    if (selectedHeights.length) dolls = dolls.filter(d => d.height && selectedHeights.includes(d.height));
    if (selectedHair.length) dolls = dolls.filter(d => d.hairColor && selectedHair.includes(d.hairColor));
    if (selectedEyes.length) dolls = dolls.filter(d => d.eyeColor && selectedEyes.includes(d.eyeColor));
    if (selectedCollections.length) dolls = dolls.filter(d => d.collection && selectedCollections.includes(d.collection));
    return dolls;
  }, [data, section, selectedHeights, selectedHair, selectedEyes, selectedCollections]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Каталог</p>
        <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27]">Авторские текстильные куклы</h1>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className="px-5 py-2 rounded-full font-['Jost'] text-sm font-medium transition-all duration-200"
            style={{
              background: section === s ? "#3A2E27" : "#fff",
              color: section === s ? "#fff" : "#8B7B6E",
              border: "1px solid",
              borderColor: section === s ? "#3A2E27" : "rgba(186,162,138,0.3)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-8 flex-col lg:flex-row">
        {/* Filter sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-60 shrink-0`}>
          <div className="lg:sticky lg:top-24 space-y-8 grid grid-cols-2 gap-6 lg:block">
            <FilterGroup title="Рост куклы" options={HEIGHTS} selected={selectedHeights} onToggle={v => toggleArr(selectedHeights, v, setSelectedHeights)} />
            <FilterGroup title="Цвет волос" options={HAIR_COLORS} selected={selectedHair} onToggle={v => toggleArr(selectedHair, v, setSelectedHair)} />
            <FilterGroup title="Цвет глаз" options={EYE_COLORS} selected={selectedEyes} onToggle={v => toggleArr(selectedEyes, v, setSelectedEyes)} />
            <FilterGroup title="Коллекция" options={COLLECTIONS} selected={selectedCollections} onToggle={v => toggleArr(selectedCollections, v, setSelectedCollections)} />
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="font-['Jost'] text-sm text-[#8B7B6E]">Найдено: {filtered.length} кукол</p>
            <button
              className="lg:hidden flex items-center gap-2 text-sm font-['Jost'] font-medium text-[#8B7B6E]"
              onClick={() => setShowFilters(v => !v)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
              Фильтры
            </button>
          </div>
          {loading ? <Spinner /> : error ? <Notice kind="error">Не удалось загрузить каталог: {error}</Notice> : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-['Gilda_Display'] text-2xl text-[#3A2E27] mb-3">Ничего не найдено</p>
              <p className="font-['Jost'] text-[#8B7B6E]">Попробуйте изменить фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, options, selected, onToggle }: { title: string; options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <h4 className="font-['Jost'] font-medium text-[#3A2E27] text-sm tracking-wide mb-3">{title}</h4>
      <div className="flex flex-col gap-2">
        {options.map(o => {
          const on = selected.includes(o);
          return (
            <label key={o} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="checkbox" className="sr-only" checked={on} onChange={() => onToggle(o)} />
              <span className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                style={{ borderColor: on ? "#B8975A" : "rgba(186,162,138,0.5)", background: on ? "#B8975A" : "#fff" }}>
                {on && <Check size={10} color="#fff" />}
              </span>
              <span className="font-['Jost'] text-sm text-[#8B7B6E] group-hover:text-[#3A2E27] transition-colors">{o}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
