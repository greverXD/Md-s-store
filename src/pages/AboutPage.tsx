import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ABOUT } from "@/data/about";
import { GoldDivider } from "@/components/ui";

export default function AboutPage() {
  const navigate = useNavigate();
  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="rounded-3xl overflow-hidden bg-[#F5EEE6] aspect-[4/5] max-h-[640px]">
          <img src={ABOUT.photo} alt="Мастер за работой" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="eyebrow">О мастере</p>
          <h1 className="font-['Gilda_Display'] text-4xl lg:text-5xl text-[#3A2E27] leading-tight mb-6">{ABOUT.greeting}</h1>
          <p className="font-['Jost'] font-light text-[#8B7B6E] text-lg leading-relaxed mb-6">{ABOUT.intro}</p>
          {ABOUT.story.map((t, i) => (
            <p key={i} className="font-['Jost'] font-light text-[#3A2E27] leading-relaxed mb-4">{t}</p>
          ))}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {ABOUT.facts.map(f => (
              <div key={f.label} className="card px-3 py-4 text-center">
                <p className="font-['Gilda_Display'] text-2xl text-[#B8975A]">{f.value}</p>
                <p className="font-['Jost'] text-xs text-[#8B7B6E] mt-1">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-12" style={{ background: "#F0E8DF" }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="font-['Gilda_Display'] text-3xl lg:text-4xl text-[#3A2E27] text-center mb-10">Как я работаю</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {ABOUT.principles.map(p => (
              <div key={p.title} className="card p-7">
                <div className="w-8 h-px bg-[#B8975A] mb-5" />
                <h3 className="font-['Gilda_Display'] text-xl text-[#3A2E27] mb-3">{p.title}</h3>
                <p className="font-['Jost'] font-light text-sm text-[#8B7B6E] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="font-['Gilda_Display'] italic text-2xl lg:text-3xl text-[#3A2E27] leading-snug">«{ABOUT.quote}»</p>
        <GoldDivider />
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate("/dolls")} className="btn-primary px-8 py-3.5">Смотреть кукол</button>
          <button onClick={() => navigate("/diy")} className="btn-outline px-8 py-3.5 flex items-center gap-2">
            Сшить куклу своими руками <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
