import { Link } from "react-router-dom";
import { clearConsent } from "@/lib/consent";

const sections = [
  { to: "/dolls", label: "Авторские куклы" },
  { to: "/clothes", label: "Одежда для кукол" },
  { to: "/accessories", label: "Аксессуары" },
  { to: "/diy", label: "Сшить куклу своими руками" },
  { to: "/builder", label: "Конструктор образа" },
  { to: "/about", label: "О мастере" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t py-14 px-6 lg:px-12" style={{ borderColor: "rgba(186,162,138,0.2)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="font-['Gilda_Display'] text-xl text-[#3A2E27] mb-3">Кукольный Дом</p>
          <p className="font-['Jost'] font-light text-sm text-[#8B7B6E] leading-relaxed max-w-sm">
            Авторские текстильные куклы и одежда для коллекционных кукол. Ручная работа, натуральные ткани.
          </p>
        </div>
        <div>
          <p className="font-['Jost'] font-medium text-sm text-[#3A2E27] tracking-wide mb-4">Разделы</p>
          <div className="flex flex-col gap-2">
            {sections.map(s => (
              <Link key={s.to} to={s.to} className="text-sm font-['Jost'] text-[#8B7B6E] hover:text-[#B8975A] transition-colors">{s.label}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="font-['Jost'] font-medium text-sm text-[#3A2E27] tracking-wide mb-4">Контакты</p>
          <p className="font-['Jost'] text-sm text-[#8B7B6E]">@kukoldniy_dom</p>
          <p className="font-['Jost'] text-sm text-[#8B7B6E] mt-1">hello@kukolniydom.ru</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t flex flex-col sm:flex-row gap-3 justify-between sm:items-center" style={{ borderColor: "rgba(186,162,138,0.2)" }}>
        <p className="font-['Jost'] text-xs text-[#8B7B6E]">© {new Date().getFullYear()} Кукольный Дом. Все права защищены.</p>
        <div className="flex gap-5">
          <Link to="/privacy" className="font-['Jost'] text-xs text-[#8B7B6E] hover:text-[#B8975A]">Политика конфиденциальности</Link>
          <button onClick={clearConsent}
            className="font-['Jost'] text-xs text-[#8B7B6E] hover:text-[#B8975A]">Настройки cookies</button>
        </div>
      </div>
    </footer>
  );
}
