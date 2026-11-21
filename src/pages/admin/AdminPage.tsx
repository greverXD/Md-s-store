import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/admin", label: "Заказы", end: true },
  { to: "/admin/analytics", label: "Аналитика" },
  { to: "/admin/products", label: "Товары" },
];

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <p className="eyebrow">Администратор</p>
      <h1 className="font-['Gilda_Display'] text-4xl text-[#3A2E27] mb-8">Админ-панель</h1>
      <nav className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className="px-5 py-2 rounded-full font-['Jost'] text-sm font-medium border transition-all"
            style={({ isActive }) => ({
              background: isActive ? "#3A2E27" : "#fff", color: isActive ? "#fff" : "#8B7B6E",
              borderColor: isActive ? "#3A2E27" : "rgba(186,162,138,0.3)",
            })}>
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
