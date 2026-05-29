import Icon from "@/components/ui/icon";

interface HomePageProps {
  setCurrentPage: (page: string) => void;
}

const features = [
  { icon: "Zap", title: "Быстрая доставка", desc: "СДЭК, Boxberry, Почта России и другие партнёры", color: "#00ffff" },
  { icon: "Shield", title: "Официальная гарантия", desc: "До 3 лет на всю технику от производителя", color: "#a855f7" },
  { icon: "RotateCcw", title: "Возврат 30 дней", desc: "Без вопросов вернём деньги или обменяем", color: "#ff00aa" },
  { icon: "Headphones", title: "Поддержка 24/7", desc: "Опытные консультанты всегда на связи", color: "#39ff14" },
];

const categories = [
  { icon: "Smartphone", name: "Смартфоны", count: "340+ товаров", gradient: "from-cyan-500 to-blue-600" },
  { icon: "Laptop", name: "Ноутбуки", count: "180+ товаров", gradient: "from-purple-500 to-pink-600" },
  { icon: "Tablet", name: "Планшеты", count: "95+ товаров", gradient: "from-pink-500 to-red-500" },
  { icon: "Headphones", name: "Аудио", count: "220+ товаров", gradient: "from-green-400 to-cyan-500" },
  { icon: "Gamepad2", name: "Игровые", count: "150+ товаров", gradient: "from-yellow-500 to-orange-500" },
  { icon: "Watch", name: "Умные часы", count: "80+ товаров", gradient: "from-indigo-500 to-purple-600" },
];

const hotDeals = [
  { name: "iPhone 15 Pro Max", brand: "Apple", price: "134 990", oldPrice: "149 990", rating: 4.9, reviews: 328, badge: "Хит" },
  { name: "Galaxy S24 Ultra", brand: "Samsung", price: "109 990", oldPrice: "124 990", rating: 4.8, reviews: 215, badge: "-12%" },
  { name: "MacBook Pro 14\"", brand: "Apple", price: "189 990", oldPrice: null, rating: 5.0, reviews: 89, badge: "Новинка" },
  { name: "AirPods Pro 2", brand: "Apple", price: "24 990", oldPrice: "29 990", rating: 4.7, reviews: 512, badge: "-16%" },
];

export default function HomePage({ setCurrentPage }: HomePageProps) {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center grid-bg overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#00ffff" }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "#a855f7" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-2xl" style={{ background: "#ff00aa" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-exo" style={{ border: "1px solid #1e2535", background: "rgba(0,255,255,0.05)", color: "#00ffff" }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Более 1000 товаров в наличии
          </div>

          <h1 className="font-orbitron text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="gradient-text">TECHNOVA</span>
            <br />
            <span className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">магазин электроники</span>
          </h1>

          <p className="font-exo text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Топовые гаджеты по лучшим ценам. Официальная гарантия, быстрая доставка по всей России через СДЭК, Boxberry и другие сервисы.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage("catalog")}
              className="px-8 py-4 rounded-lg font-orbitron font-bold text-sm tracking-wider btn-gradient animate-glow-pulse"
            >
              ПЕРЕЙТИ В КАТАЛОГ
            </button>
            <button
              onClick={() => setCurrentPage("delivery")}
              className="px-8 py-4 rounded-lg font-orbitron font-bold text-sm tracking-wider btn-neon-cyan"
            >
              УСЛОВИЯ ДОСТАВКИ
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: "1000+", label: "Товаров" },
              { value: "50K+", label: "Клиентов" },
              { value: "4.9★", label: "Рейтинг" },
              { value: "24ч", label: "Доставка" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-orbitron text-2xl font-black neon-text-cyan">{stat.value}</div>
                <div className="font-exo text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <Icon name="ChevronDown" size={24} className="text-gray-600" />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass-card rounded-xl p-5 glass-card-hover flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                <Icon name={f.icon} size={20} style={{ color: f.color }} />
              </div>
              <div>
                <h3 className="font-orbitron text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="font-exo text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-3">КАТЕГОРИИ</h2>
            <p className="font-exo text-gray-500">Найдите именно то, что вам нужно</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setCurrentPage("catalog")}
                className="glass-card rounded-xl p-5 glass-card-hover text-center group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon name={cat.icon} size={24} className="text-white" />
                </div>
                <div className="font-orbitron text-xs font-bold text-white mb-1">{cat.name}</div>
                <div className="font-exo text-xs text-gray-600">{cat.count}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Hot deals */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">ГОРЯЧИЕ ПРЕДЛОЖЕНИЯ</h2>
              <p className="font-exo text-gray-500">Лучшие цены сегодня</p>
            </div>
            <button onClick={() => setCurrentPage("catalog")} className="hidden sm:flex items-center gap-2 font-exo text-sm neon-text-cyan hover:opacity-80 transition-opacity">
              Все товары <Icon name="ArrowRight" size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {hotDeals.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Delivery banner */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-12 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(0,255,255,0.08), rgba(168,85,247,0.08))", border: "1px solid #1e2535" }}>
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-white mb-3">ДОСТАВКА ПО ВСЕЙ России</h2>
                <p className="font-exo text-gray-400 max-w-md">Работаем с СДЭК, Boxberry, Почтой России и DHL. Выберите удобный способ при оформлении заказа.</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {["СДЭК", "Boxberry", "Почта России", "DHL"].map(name => (
                    <span key={name} className="px-3 py-1 rounded-full font-exo text-xs text-white" style={{ border: "1px solid #1e2535", background: "rgba(255,255,255,0.05)" }}>{name}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => setCurrentPage("delivery")} className="px-8 py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider btn-gradient flex-shrink-0">
                ПОДРОБНЕЕ
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface Product {
  name: string;
  brand: string;
  price: string;
  oldPrice: string | null;
  rating: number;
  reviews: number;
  badge: string | null;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden glass-card-hover group">
      <div className="relative aspect-square flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d1117, #1a1f2e)" }}>
        <Icon name="Package" size={64} className="text-gray-700" />
        {product.badge && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-orbitron font-bold text-black" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
            {product.badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="font-exo text-xs text-gray-500 mb-1">{product.brand}</div>
        <h3 className="font-exo font-semibold text-white text-sm mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-xs">★</span>
          <span className="font-exo text-xs text-gray-400">{product.rating} ({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-orbitron font-bold text-white">{product.price} ₽</span>
          {product.oldPrice && <span className="font-exo text-xs text-gray-600 line-through">{product.oldPrice} ₽</span>}
        </div>
        <button className="w-full py-2 rounded-lg text-xs font-orbitron font-bold btn-neon-cyan">
          В КОРЗИНУ
        </button>
      </div>
    </div>
  );
}