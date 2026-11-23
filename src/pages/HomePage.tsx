import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DOLL_META, DOLL_TYPES } from "@/data/demo";
import { useProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { GoldDivider } from "@/components/ui";

export default function HomePage() {
  const navigate = useNavigate();
  const { data } = useProducts({ kind: "doll" });
  const featured = (data ?? []).filter(p => p.isNew).concat((data ?? []).filter(p => !p.isNew)).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[70vh] lg:min-h-[88vh]">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop&auto=format"
          alt="Авторские текстильные куклы"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/90 via-[#FAF7F2]/60 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center min-h-[70vh] lg:min-h-[88vh] py-16">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-6">
              Авторский handmade
            </p>
            <h1 className="font-['Gilda_Display'] text-[#3A2E27] leading-[1.1] mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Куклы, в которых живёт душа мастера
            </h1>
            <p className="font-['Jost'] font-light text-[#8B7B6E] text-lg leading-relaxed mb-10 max-w-md">
              Каждая кукла создаётся вручную — с любовью, терпением и вниманием к деталям. Это не просто игрушка, это маленькая история.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/dolls")}
                className="px-8 py-3.5 rounded-xl font-['Jost'] font-medium text-sm tracking-wide transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: "#B8975A", color: "#fff" }}
              >
                Смотреть кукол
              </button>
              <button
                onClick={() => navigate("/builder")}
                className="px-8 py-3.5 rounded-xl font-['Jost'] font-medium text-sm tracking-wide border transition-all duration-200 hover:border-[#B8975A] hover:text-[#B8975A]"
                style={{ borderColor: "rgba(186,162,138,0.4)", color: "#8B7B6E" }}
              >
                Конструктор образа
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Каталог</p>
          <h2 className="font-['Gilda_Display'] text-4xl text-[#3A2E27]">Разделы магазина</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOLL_TYPES.map(type => {
            const meta = DOLL_META[type];
            return (
              <button
                key={type}
                onClick={() => type === "textile" ? navigate("/dolls") : navigate(`/clothes/${type}`)}
                className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,46,39,0.15)] hover:-translate-y-1`}
                style={{ background: meta.bg }}
              >
                <div className="absolute right-0 bottom-0 w-32 h-40 sm:w-48 sm:h-56 opacity-60 overflow-hidden">
                  <img src={meta.img} alt={meta.label} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[200px] sm:min-h-[280px]">
                  <div>
                    <h3 className="font-['Gilda_Display'] text-2xl text-[#3A2E27] leading-tight mb-2">{meta.label}</h3>
                    <p className="font-['Jost'] text-sm text-[#8B7B6E]">{meta.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8975A] font-['Jost'] text-sm font-medium mt-8">
                    <span>Перейти</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => navigate("/accessories")}
            className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,46,39,0.15)] hover:-translate-y-1"
            style={{ background: "#EEE4D8" }}
          >
            <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[200px] sm:min-h-[280px]">
              <div>
                <h3 className="font-['Gilda_Display'] text-2xl text-[#3A2E27] leading-tight mb-2">Кукольные аксессуары</h3>
                <p className="font-['Jost'] text-sm text-[#8B7B6E]">Игрушки, сумочки, венки, декор и многое другое</p>
              </div>
              <div className="flex items-center gap-2 text-[#B8975A] font-['Jost'] text-sm font-medium mt-8">
                <span>Перейти</span>
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </button>
          <button
            onClick={() => navigate("/diy")}
            className="group relative overflow-hidden rounded-2xl text-left transition-all duration-300 hover:shadow-[0_12px_40px_rgba(58,46,39,0.15)] hover:-translate-y-1"
            style={{ background: "#E9E0EC" }}
          >
            <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[200px] sm:min-h-[280px]">
              <div>
                <h3 className="font-['Gilda_Display'] text-2xl text-[#3A2E27] leading-tight mb-2">Сшить куклу своими руками</h3>
                <p className="font-['Jost'] text-sm text-[#8B7B6E]">Наборы для шитья, выкройки и мастер-классы</p>
              </div>
              <div className="flex items-center gap-2 text-[#B8975A] font-['Jost'] text-sm font-medium mt-8">
                <span>Перейти</span>
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </div>
          </button>
        </div>
      </section>

      <GoldDivider />

      {/* Featured dolls */}
      <section className="py-10 pb-24 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-3">Новинки</p>
            <h2 className="font-['Gilda_Display'] text-4xl text-[#3A2E27]">Только появились</h2>
          </div>
          <button
            onClick={() => navigate("/dolls")}
            className="hidden sm:flex items-center gap-2 text-sm font-['Jost'] font-medium text-[#B8975A] hover:gap-3 transition-all duration-200"
          >
            Все куклы <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* About strip */}
      <section className="py-20 px-4 sm:px-6 lg:px-12" style={{ background: "#F0E8DF" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] uppercase font-['Jost'] font-medium text-[#B8975A] mb-4">О нас</p>
          <h2 className="font-['Gilda_Display'] text-3xl lg:text-5xl text-[#3A2E27] leading-tight mb-6">
            Каждая кукла — <em style={{ fontStyle: "italic" }}>маленькая вселенная</em>
          </h2>
          <p className="font-['Jost'] font-light text-[#8B7B6E] text-lg leading-relaxed max-w-2xl mx-auto">
            Мы создаём авторских текстильных кукол и шьём наряды для коллекционных кукол с 2018 года. Каждое изделие — ручная работа, натуральные ткани, любовь к деталям.
          </p>
          <button onClick={() => navigate("/about")}
            className="mt-8 inline-flex items-center gap-2 text-sm font-['Jost'] font-medium text-[#B8975A] hover:gap-3 transition-all duration-200">
            Познакомиться с мастером <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
