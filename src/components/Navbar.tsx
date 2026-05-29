import { useState } from "react";
import Icon from "@/components/ui/icon";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  cartCount: number;
}

const navLinks = [
  { id: "home", label: "Главная" },
  { id: "catalog", label: "Каталог" },
  { id: "delivery", label: "Доставка" },
  { id: "reviews", label: "Отзывы" },
  { id: "about", label: "О нас" },
  { id: "contacts", label: "Контакты" },
];

export default function Navbar({ currentPage, setCurrentPage, cartCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "rgba(6,8,16,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1e2535" }}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button onClick={() => setCurrentPage("home")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
            <span className="text-black font-orbitron font-black text-xs">TN</span>
          </div>
          <span className="font-orbitron font-bold text-lg neon-text-cyan hidden sm:block">TECHNOVA</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setCurrentPage(link.id)}
              className={`px-3 py-2 rounded text-sm font-exo font-medium transition-all duration-200 ${
                currentPage === link.id
                  ? "neon-text-cyan bg-cyan-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage("cart")}
            className="relative p-2 rounded transition-all hover:bg-white/5"
          >
            <Icon name="ShoppingCart" size={22} className={cartCount > 0 ? "text-cyan-400" : "text-gray-400"} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black font-orbitron"
                style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentPage("admin")}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded text-sm font-exo font-medium transition-all duration-200 ${
              currentPage === "admin" ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon name="LayoutDashboard" size={16} />
            Админ
          </button>
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded text-sm font-exo font-semibold btn-neon-cyan">
            <Icon name="User" size={16} />
            Войти
          </button>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={22} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade-in" style={{ background: "rgba(6,8,16,0.95)" }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { setCurrentPage(link.id); setMenuOpen(false); }}
              className={`block w-full text-left px-3 py-3 rounded mb-1 font-exo transition-all ${
                currentPage === link.id ? "neon-text-cyan bg-cyan-500/10" : "text-gray-400"
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { setCurrentPage("admin"); setMenuOpen(false); }}
            className={`block w-full text-left px-3 py-3 rounded mb-1 font-exo transition-all ${
              currentPage === "admin" ? "text-purple-400 bg-purple-500/10" : "text-gray-400"
            }`}
          >
            Админ-панель
          </button>
        </div>
      )}
    </nav>
  );
}