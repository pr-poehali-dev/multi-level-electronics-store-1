import Icon from "@/components/ui/icon";

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer className="border-t mt-8" style={{ borderColor: "#1e2535", background: "rgba(6,8,16,0.9)" }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
                <span className="text-black font-orbitron font-black text-xs">TN</span>
              </div>
              <span className="font-orbitron font-bold text-lg neon-text-cyan">TECHNOVA</span>
            </div>
            <p className="font-exo text-xs text-gray-600 leading-relaxed mb-4">Официальный интернет-магазин электроники с доставкой по всей России.</p>
            <div className="flex gap-2">
              {[
                { icon: "MessageCircle", color: "#3b82f6" },
                { icon: "Users", color: "#a855f7" },
                { icon: "Phone", color: "#39ff14" },
              ].map((s, i) => (
                <button key={i} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  <Icon name={s.icon} size={14} style={{ color: s.color }} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">МАГАЗИН</h4>
            <ul className="space-y-2">
              {[["catalog", "Каталог"], ["delivery", "Доставка"], ["about", "О компании"], ["reviews", "Отзывы"]].map(([page, label]) => (
                <li key={page}>
                  <button onClick={() => setCurrentPage(page)} className="font-exo text-xs text-gray-500 hover:text-white transition-colors">{label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">ПОКУПАТЕЛЯМ</h4>
            <ul className="space-y-2">
              {["Как сделать заказ", "Условия оплаты", "Возврат товара", "Гарантия", "Программа лояльности"].map(item => (
                <li key={item}>
                  <button className="font-exo text-xs text-gray-500 hover:text-white transition-colors text-left">{item}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">КОНТАКТЫ</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Phone" size={12} className="text-gray-600" />
                <span className="font-exo text-xs text-gray-500">+7 (800) 555-35-35</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Mail" size={12} className="text-gray-600" />
                <span className="font-exo text-xs text-gray-500">support@technova.ru</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={12} className="text-gray-600" />
                <span className="font-exo text-xs text-gray-500">Пн–Вс: 9:00–21:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: "#1e2535" }}>
          <span className="font-exo text-xs text-gray-700">© 2026 TechNova. Все права защищены.</span>
          <div className="flex gap-4">
            {["Политика конфиденциальности", "Публичная оферта", "Реквизиты"].map(item => (
              <button key={item} className="font-exo text-xs text-gray-700 hover:text-gray-500 transition-colors">{item}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
