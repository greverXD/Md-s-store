import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, BookOpen, PlayCircle } from "lucide-react";
import { DIY_CATS } from "@/data/demo";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, FilterChip, Spinner, StockTabs, matchesStock, type StockFilter } from "@/components/ui";

const ICONS = [Scissors, BookOpen, PlayCircle];
const INTRO: Record<string, string> = {
  "Наборы для шитья": "Всё необходимое в одной коробке: выкройка, ткани, волосы, наполнитель и пошаговая инструкция.",
  "Выкройки": "Проверенные лекала кукол и одежды в натуральную величину. Электронные выкройки пришлём на почту.",
  "Мастер-классы": "Видеоуроки и личные занятия с мастером: от раскроя до росписи лица.",
};

const STEPS = [
  ["Выберите", "набор, выкройку или мастер-класс"],
  ["Получите", "материалы по почте или доступ к уроку"],
  ["Шейте", "по подробной инструкции в своём темпе"],
  ["Спрашивайте", "мастер ответит на вопросы и поможет"],
];

export default function DiyPage() {
  const { data, loading } = useProducts({ kind: "diy" });
  const [cat, setCat] = useState<string | null>(null);
  const [stock, setStock] = useState<StockFilter>("all");

  const items = useMemo(
    () => (data ?? []).filter(p => (!cat || p.category === cat) && matchesStock(p.inStock, stock)),
    [data, cat, stock],
  );

  return (
    <div>
      <section className="py-16 px-4 sm:px-6 lg:px-12" style={{ background: "#F0E8DF" }}>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-12">
            <p className="eyebrow">Творчество</p>
            <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27] leading-tight mb-5">Сшить куклу своими руками</h1>
            <p className="font-['Jost'] font-light text-[#8B7B6E] text-lg leading-relaxed">
              Хотите создать свою первую куклу? Я подготовила наборы, выкройки и мастер-классы, с которыми справится даже новичок.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {DIY_CATS.map((c, i) => {
              const Icon = ICONS[i % ICONS.length];
              const active = cat === c;
              return (
                <button key={c} onClick={() => setCat(active ? null : c)}
                  className="card p-6 text-left transition-all duration-200 hover:-translate-y-0.5 border"
                  style={{ borderColor: active ? "#B8975A" : "transparent" }}>
                  <Icon size={22} className="text-[#B8975A] mb-4" strokeWidth={1.5} />
                  <h3 className="font-['Gilda_Display'] text-xl text-[#3A2E27] mb-2">{c}</h3>
                  <p className="font-['Jost'] font-light text-sm text-[#8B7B6E] leading-relaxed">{INTRO[c] ?? ""}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(([t, d], i) => (
            <div key={t}>
              <p className="font-['Gilda_Display'] text-3xl text-[#B8975A]/60 mb-2">0{i + 1}</p>
              <p className="font-['Jost'] font-medium text-[#3A2E27]">{t}</p>
              <p className="font-['Jost'] font-light text-sm text-[#8B7B6E]">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-8">
        <div className="flex flex-col gap-4 mb-8">
          <StockTabs value={stock} onChange={setStock} />
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Все" active={!cat} onClick={() => setCat(null)} />
            {DIY_CATS.map(c => <FilterChip key={c} label={c} active={cat === c} onClick={() => setCat(cat === c ? null : c)} />)}
          </div>
        </div>
        <p className="font-['Jost'] text-sm text-[#8B7B6E] mb-6">Найдено: {items.length} товаров</p>
        {loading ? <Spinner /> : items.length === 0 ? (
          <EmptyState title="Скоро здесь появятся новинки" text="Напишите мастеру, если хотите набор или урок под ваш запрос."
            action={<Link to="/about" className="btn-outline">О мастере</Link>} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
