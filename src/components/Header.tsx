import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Авторские куклы", to: "/dolls" },
  { label: "Одежда", to: "/clothes" },
  { label: "Аксессуары", to: "/accessories" },
  { label: "Конструктор образа", to: "/builder" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const { count, lastAdded } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!lastAdded) return;
    setToast(true);
    const t = setTimeout(() => setToast(false), 2200);
    return () => clearTimeout(t);
  }, [lastAdded]);

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({ color: isActive ? "#B8975A" : "#8B7B6E" });

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b" style={{ borderColor: "rgba(186,162,138,0.2)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-['Gilda_Display'] text-[#3A2E27] tracking-wide">Кукольный Дом</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} style={linkStyle}
              className="text-sm font-['Jost'] font-medium tracking-wide transition-colors duration-200 relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 group-hover:w-full transition-all duration-300" style={{ background: "#B8975A" }} />
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <Link to="/admin" title="Админ-панель" className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B7B6E] hover:text-[#B8975A] transition-colors">
              <Shield size={17} />
            </Link>
          )}
          <Link to={user ? "/account" : "/login"} title={user ? "Личный кабинет" : "Войти"}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#8B7B6E] hover:text-[#B8975A] transition-colors">
            <User size={17} />
          </Link>
          <Link to="/cart" title="Корзина" className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#8B7B6E] hover:text-[#B8975A] transition-colors">
            <ShoppingCart size={17} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-['Jost'] font-medium flex items-center justify-center"
                style={{ background: "#B8975A", color: "#fff" }}>{count}</span>
            )}
          </Link>
          <button className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-[#8B7B6E]"
            onClick={() => setMenuOpen(v => !v)} aria-label="Меню">
            {menuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t px-6 py-4 flex flex-col gap-4" style={{ borderColor: "rgba(186,162,138,0.2)" }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} style={linkStyle} className="text-sm font-['Jost'] font-medium text-left">{l.label}</NavLink>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed top-20 right-4 z-50 card px-5 py-3 text-sm font-['Jost'] text-[#3A2E27] flex items-center gap-3">
          Добавлено в корзину
          <Link to="/cart" className="text-[#B8975A] font-medium">Открыть</Link>
        </div>
      )}
    </header>
  );
}
