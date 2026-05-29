import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";

const brands = ["Все", "Apple", "Samsung", "Sony", "Xiaomi", "ASUS", "Lenovo", "Huawei", "OnePlus"];
const categories = ["Все", "Смартфоны", "Ноутбуки", "Планшеты", "Аудио", "Игровые", "Умные часы"];
const sortOptions = ["По популярности", "Сначала дешевле", "Сначала дороже", "По рейтингу", "Новинки"];

const products = [
  { id: 1, name: "iPhone 15 Pro Max 256GB", brand: "Apple", category: "Смартфоны", price: 134990, rating: 4.9, reviews: 328, badge: "Хит", tags: ["5G", "Face ID", "ProMotion"] },
  { id: 2, name: "Galaxy S24 Ultra 512GB", brand: "Samsung", category: "Смартфоны", price: 109990, oldPrice: 124990, rating: 4.8, reviews: 215, badge: "-12%", tags: ["5G", "S Pen", "200MP"] },
  { id: 3, name: "MacBook Pro 14\" M3 Pro", brand: "Apple", category: "Ноутбуки", price: 189990, rating: 5.0, reviews: 89, badge: "Новинка", tags: ["M3 Pro", "18ч работы", "Liquid Retina"] },
  { id: 4, name: "AirPods Pro 2", brand: "Apple", category: "Аудио", price: 24990, oldPrice: 29990, rating: 4.7, reviews: 512, badge: "-16%", tags: ["ANC", "Spatial Audio"] },
  { id: 5, name: "Sony WH-1000XM5", brand: "Sony", category: "Аудио", price: 29990, oldPrice: 34990, rating: 4.9, reviews: 743, badge: null, tags: ["ANC", "30ч работы", "Hi-Res"] },
  { id: 6, name: "Xiaomi 14 Ultra", brand: "Xiaomi", category: "Смартфоны", price: 89990, rating: 4.7, reviews: 156, badge: "Новинка", tags: ["Leica", "5G", "HyperOS"] },
  { id: 7, name: "ASUS ROG Zephyrus G16", brand: "ASUS", category: "Ноутбуки", price: 219990, rating: 4.8, reviews: 67, badge: null, tags: ["RTX 4090", "240Hz", "Gaming"] },
  { id: 8, name: "iPad Pro 12.9\" M4", brand: "Apple", category: "Планшеты", price: 159990, rating: 4.9, reviews: 234, badge: "Хит", tags: ["M4", "OLED", "Apple Pencil"] },
  { id: 9, name: "Samsung Galaxy Watch 7", brand: "Samsung", category: "Умные часы", price: 34990, oldPrice: 39990, rating: 4.6, reviews: 189, badge: "-12%", tags: ["HealthMonitor", "GPS"] },
  { id: 10, name: "OnePlus 12", brand: "OnePlus", category: "Смартфоны", price: 69990, rating: 4.6, reviews: 98, badge: null, tags: ["Hasselblad", "100W", "5G"] },
  { id: 11, name: "Lenovo ThinkPad X1 Carbon", brand: "Lenovo", category: "Ноутбуки", price: 179990, rating: 4.7, reviews: 45, badge: null, tags: ["Core Ultra", "IPS", "Лёгкий"] },
  { id: 12, name: "Sony PlayStation 5", brand: "Sony", category: "Игровые", price: 59990, rating: 4.9, reviews: 892, badge: "Хит", tags: ["4K", "120fps", "DualSense"] },
];

interface CatalogPageProps {
  addToCart: (product: { id: number; name: string; price: number }) => void;
}

export default function CatalogPage({ addToCart }: CatalogPageProps) {
  const [selectedBrand, setSelectedBrand] = useState("Все");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [priceRange, setPriceRange] = useState([0, 250000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("По популярности");
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(true);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const filtered = products
    .filter(p => selectedBrand === "Все" || p.brand === selectedBrand)
    .filter(p => selectedCategory === "Все" || p.category === selectedCategory)
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => p.rating >= minRating)
    .filter(p => search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Сначала дешевле") return a.price - b.price;
      if (sortBy === "Сначала дороже") return b.price - a.price;
      if (sortBy === "По рейтингу") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  const handleAdd = (p: typeof products[0]) => {
    addToCart({ id: p.id, name: p.name, price: p.price });
    setAddedIds(prev => [...prev, p.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== p.id)), 1500);
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">КАТАЛОГ</h1>
          <p className="font-exo text-gray-500">{filtered.length} товаров найдено</p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl font-exo text-sm text-white outline-none focus:neon-border-cyan transition-all"
              style={{ background: "#0d1117", border: "1px solid #1e2535" }}
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-4 py-3 rounded-xl font-exo text-sm text-white outline-none cursor-pointer"
            style={{ background: "#0d1117", border: "1px solid #1e2535" }}
          >
            {sortOptions.map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-exo text-sm transition-all"
            style={{ background: filterOpen ? "rgba(0,255,255,0.1)" : "#0d1117", border: `1px solid ${filterOpen ? "#00ffff" : "#1e2535"}`, color: filterOpen ? "#00ffff" : "#9ca3af" }}
          >
            <Icon name="SlidersHorizontal" size={16} />
            Фильтры
          </button>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          {filterOpen && (
            <aside className="w-64 flex-shrink-0 animate-fade-in space-y-6">
              {/* Category */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">КАТЕГОРИЯ</h3>
                <div className="space-y-1">
                  {categories.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-exo text-sm transition-all ${selectedCategory === c ? "neon-text-cyan bg-cyan-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">БРЕНД</h3>
                <div className="flex flex-wrap gap-2">
                  {brands.map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1 rounded-full font-exo text-xs transition-all ${selectedBrand === b ? "text-black font-bold" : "text-gray-400 hover:text-white"}`}
                      style={selectedBrand === b ? { background: "linear-gradient(135deg, #00ffff, #a855f7)" } : { border: "1px solid #1e2535" }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">ЦЕНА</h3>
                <Slider
                  min={0} max={250000} step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-3"
                />
                <div className="flex justify-between font-exo text-xs text-gray-400">
                  <span>{priceRange[0].toLocaleString()} ₽</span>
                  <span>{priceRange[1].toLocaleString()} ₽</span>
                </div>
              </div>

              {/* Rating */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">РЕЙТИНГ</h3>
                <div className="space-y-1">
                  {[0, 4, 4.5, 4.7, 4.9].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-exo text-sm transition-all flex items-center gap-2 ${minRating === r ? "neon-text-cyan bg-cyan-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <span className="text-yellow-400">{"★".repeat(Math.ceil(r))}</span>
                      <span>{r === 0 ? "Любой" : `от ${r}`}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSelectedBrand("Все"); setSelectedCategory("Все"); setPriceRange([0, 250000]); setMinRating(0); setSearch(""); }}
                className="w-full py-2 rounded-xl font-exo text-sm text-gray-500 hover:text-white transition-all"
                style={{ border: "1px solid #1e2535" }}
              >
                Сбросить фильтры
              </button>
            </aside>
          )}

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="SearchX" size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="font-orbitron text-gray-600">Ничего не найдено</p>
                <p className="font-exo text-gray-700 text-sm mt-2">Попробуйте изменить фильтры</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <div key={product.id} className="glass-card rounded-xl overflow-hidden glass-card-hover group">
                    <div className="relative aspect-square flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0d1117, #1a1f2e)" }}>
                      <Icon name="Package" size={72} className="text-gray-800" />
                      {product.badge && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-orbitron font-bold text-black" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
                          {product.badge}
                        </div>
                      )}
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(168,85,247,0.2)", border: "1px solid #a855f7" }}>
                        <Icon name="Heart" size={14} className="text-purple-400" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="font-exo text-xs text-gray-500 mb-1">{product.brand} · {product.category}</div>
                      <h3 className="font-exo font-semibold text-white text-sm mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded font-exo text-xs text-gray-500" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e2535" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="font-exo text-xs text-gray-400">{product.rating} ({product.reviews} отзывов)</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-orbitron font-bold text-white">{product.price.toLocaleString()} ₽</span>
                        {product.oldPrice && <span className="font-exo text-xs text-gray-600 line-through">{product.oldPrice.toLocaleString()} ₽</span>}
                      </div>
                      <button
                        onClick={() => handleAdd(product)}
                        className={`w-full py-2 rounded-lg text-xs font-orbitron font-bold transition-all ${addedIds.includes(product.id) ? "text-black" : "btn-neon-cyan"}`}
                        style={addedIds.includes(product.id) ? { background: "linear-gradient(135deg, #00ffff, #a855f7)" } : {}}
                      >
                        {addedIds.includes(product.id) ? "✓ ДОБАВЛЕНО" : "В КОРЗИНУ"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
