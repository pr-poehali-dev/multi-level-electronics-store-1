import Icon from "@/components/ui/icon";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface CartPageProps {
  cart: CartItem[];
  updateQty: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  setCurrentPage: (page: string) => void;
}

export default function CartPage({ cart, updateQty, removeItem, setCurrentPage }: CartPageProps) {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(0,255,255,0.05)", border: "1px solid #1e2535" }}>
            <Icon name="ShoppingCart" size={40} className="text-gray-700" />
          </div>
          <h2 className="font-orbitron text-2xl font-black text-gray-600 mb-3">Корзина пуста</h2>
          <p className="font-exo text-gray-600 mb-6">Добавьте товары из каталога</p>
          <button onClick={() => setCurrentPage("catalog")} className="px-8 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient">
            ПЕРЕЙТИ В КАТАЛОГ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">КОРЗИНА</h1>
          <p className="font-exo text-gray-500">{count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Items */}
          <div className="flex-1 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="glass-card rounded-xl p-4 flex items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0d1117, #1a1f2e)", border: "1px solid #1e2535" }}>
                  <Icon name="Package" size={28} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-exo font-semibold text-white text-sm line-clamp-1">{item.name}</h3>
                  <p className="font-orbitron text-sm font-bold neon-text-cyan mt-1">{item.price.toLocaleString()} ₽</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                    style={{ border: "1px solid #1e2535", color: "#9ca3af" }}
                  >
                    <Icon name="Minus" size={14} />
                  </button>
                  <span className="w-8 text-center font-orbitron font-bold text-white text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                    style={{ border: "1px solid #1e2535", color: "#9ca3af" }}
                  >
                    <Icon name="Plus" size={14} />
                  </button>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-orbitron font-bold text-white text-sm">{(item.price * item.qty).toLocaleString()} ₽</div>
                  <button onClick={() => removeItem(item.id)} className="mt-1 text-gray-600 hover:text-red-400 transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="glass-card rounded-xl p-6 sticky top-20">
              <h3 className="font-orbitron text-sm font-bold neon-text-cyan mb-4 tracking-wider">ИТОГО</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between font-exo text-sm text-gray-400">
                  <span>Товары ({count} шт.)</span>
                  <span>{total.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between font-exo text-sm text-gray-400">
                  <span>Доставка</span>
                  <span className="text-green-400">Бесплатно</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center mb-6">
                <span className="font-orbitron text-sm font-bold text-white">Итого</span>
                <span className="font-orbitron text-xl font-black neon-text-cyan">{total.toLocaleString()} ₽</span>
              </div>

              {/* Delivery select */}
              <div className="mb-4">
                <label className="font-exo text-xs text-gray-500 mb-2 block">Способ доставки</label>
                <select className="w-full px-3 py-2 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }}>
                  <option>СДЭК — от 200 ₽ (2-5 дней)</option>
                  <option>Boxberry — от 180 ₽ (3-6 дней)</option>
                  <option>Почта России — от 100 ₽ (5-14 дней)</option>
                  <option>DHL — от 500 ₽ (1-3 дня)</option>
                  <option>Курьер — от 350 ₽ (1-2 дня)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="font-exo text-xs text-gray-500 mb-2 block">Промокод</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Введите код" className="flex-1 px-3 py-2 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
                  <button className="px-3 py-2 rounded-xl font-orbitron text-xs btn-neon-cyan">OK</button>
                </div>
              </div>

              <button className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider btn-gradient">
                ОФОРМИТЬ ЗАКАЗ
              </button>
              <p className="font-exo text-xs text-gray-600 text-center mt-3">Нажимая кнопку, вы соглашаетесь с условиями оферты</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
