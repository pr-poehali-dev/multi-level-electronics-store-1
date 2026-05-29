import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Slider } from "@/components/ui/slider";

const PRODUCTS_URL = "https://functions.poehali.dev/6bba6e36-932e-4957-ae83-49a5849b6081";
const CAT_URL = "https://functions.poehali.dev/f1fa8190-72a9-41b5-9c0c-58a339d81932";

const sortOptions = ["По умолчанию", "Сначала дешевле", "Сначала дороже"];

interface ApiProduct {
  id: number;
  naimenovanie: string;
  artikul: string | null;
  tsvet: string | null;
  prodazh_tsena_roznitsa: number;
  prodazh_tsena_opt: number;
  sebestoimost: number;
  kolichestvo: number;
  ostatok: number;
  category_id: number | null;
  photo_url: string | null;
}

interface FlatCategory { id: number; name: string; parent_id: number | null; }

interface CatalogPageProps {
  addToCart: (product: { id: number; name: string; price: number }) => void;
}

export default function CatalogPage({ addToCart }: CatalogPageProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<FlatCategory[]>([]);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState([0, 250000]);
  const [sortBy, setSortBy] = useState("По умолчанию");
  const [filterOpen, setFilterOpen] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 24;

  const [addedIds, setAddedIds] = useState<number[]>([]);

  // Загрузка категорий
  useEffect(() => {
    fetch(CAT_URL)
      .then(r => r.json())
      .then(d => setCategories(d.flat || []));
  }, []);

  // Загрузка товаров
  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      limit: String(limit),
      offset: String(page * limit),
      ...(search ? { search } : {}),
      ...(selectedCategoryId ? { category_id: String(selectedCategoryId) } : {}),
    });
    const res = await fetch(`${PRODUCTS_URL}?${q}`);
    const data = await res.json();
    setProducts(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, selectedCategoryId, page]);

  useEffect(() => { load(); }, [load]);

  // Клиентская фильтрация по цене и сортировка
  const filtered = products
    .filter(p => {
      const price = Number(p.prodazh_tsena_roznitsa) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    })
    .sort((a, b) => {
      const pa = Number(a.prodazh_tsena_roznitsa) || 0;
      const pb = Number(b.prodazh_tsena_roznitsa) || 0;
      if (sortBy === "Сначала дешевле") return pa - pb;
      if (sortBy === "Сначала дороже") return pb - pa;
      return 0;
    });

  const handleAdd = (p: ApiProduct) => {
    addToCart({ id: p.id, name: p.naimenovanie, price: Number(p.prodazh_tsena_roznitsa) || 0 });
    setAddedIds(prev => [...prev, p.id]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== p.id)), 1500);
  };

  const selectCategory = (id: number | null) => {
    setSelectedCategoryId(id);
    setPage(0);
  };

  const resetFilters = () => {
    setSelectedCategoryId(null);
    setPriceRange([0, 250000]);
    setSearch("");
    setPage(0);
  };

  const pages = Math.ceil(total / limit);

  // Дерево: корневые + дочерние
  const rootCats = categories.filter(c => !c.parent_id);
  const childCats = (parentId: number) => categories.filter(c => c.parent_id === parentId);

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-1">КАТАЛОГ</h1>
          <p className="font-exo text-gray-500 text-sm">
            {loading ? "Загружаем..." : `${total} товаров найдено`}
            {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) && (
              <span className="ml-2 font-semibold" style={{ color: "#a855f7" }}>
                в «{categories.find(c => c.id === selectedCategoryId)?.name}»
              </span>
            )}
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text" placeholder="Поиск товаров..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl font-exo text-sm text-white outline-none transition-all"
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
          {/* Sidebar */}
          {filterOpen && (
            <aside className="w-60 flex-shrink-0 animate-fade-in space-y-4">

              {/* Категории */}
              <div className="glass-card rounded-xl p-4">
                <h3 className="font-orbitron text-xs font-bold neon-text-cyan mb-3 tracking-wider">КАТЕГОРИЯ</h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => selectCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg font-exo text-sm transition-all flex items-center justify-between ${!selectedCategoryId ? "neon-text-cyan bg-cyan-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <span>Все категории</span>
                    <span className="font-orbitron text-xs opacity-60">{total}</span>
                  </button>

                  {rootCats.map(cat => (
                    <div key={cat.id}>
                      <button
                        onClick={() => selectCategory(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg font-exo text-sm transition-all flex items-center gap-2 ${selectedCategoryId === cat.id ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                      >
                        <Icon name="Folder" size={12} style={{ color: selectedCategoryId === cat.id ? "#a855f7" : "#4b5563" }} />
                        {cat.name}
                      </button>
                      {/* Подкатегории */}
                      {childCats(cat.id).map(child => (
                        <button
                          key={child.id}
                          onClick={() => selectCategory(child.id)}
                          className={`w-full text-left pl-8 pr-3 py-1.5 rounded-lg font-exo text-xs transition-all flex items-center gap-2 ${selectedCategoryId === child.id ? "text-cyan-400 bg-cyan-500/10" : "text-gray-600 hover:text-gray-300 hover:bg-white/5"}`}
                        >
                          <Icon name="CornerDownRight" size={10} className="flex-shrink-0 text-gray-700" />
                          {child.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Цена */}
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

              {/* Сбросить */}
              {(selectedCategoryId || priceRange[0] > 0 || priceRange[1] < 250000 || search) && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 rounded-xl font-exo text-sm text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  style={{ border: "1px solid #1e2535" }}
                >
                  <Icon name="X" size={13} /> Сбросить фильтры
                </button>
              )}
            </aside>
          )}

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card rounded-xl overflow-hidden">
                    <div className="aspect-square animate-pulse" style={{ background: "#1a1f2e" }} />
                    <div className="p-4 space-y-2">
                      <div className="h-3 rounded animate-pulse" style={{ background: "#1e2535", width: "60%" }} />
                      <div className="h-4 rounded animate-pulse" style={{ background: "#1e2535" }} />
                      <div className="h-4 rounded animate-pulse" style={{ background: "#1e2535", width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="SearchX" size={48} className="text-gray-700 mx-auto mb-4" />
                <p className="font-orbitron text-gray-600 mb-2">Ничего не найдено</p>
                <p className="font-exo text-gray-700 text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
                <button onClick={resetFilters} className="mt-4 px-6 py-2 rounded-xl font-exo text-sm btn-neon-cyan">
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(p => {
                    const price = Number(p.prodazh_tsena_roznitsa) || 0;
                    const catName = p.category_id ? categories.find(c => c.id === p.category_id)?.name : null;
                    const isAdded = addedIds.includes(p.id);

                    return (
                      <div key={p.id} className="glass-card rounded-xl overflow-hidden glass-card-hover group">
                        {/* Image */}
                        <div className="relative aspect-square flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #0d1117, #1a1f2e)" }}>
                          {p.photo_url
                            ? <img src={p.photo_url} alt={p.naimenovanie} className="w-full h-full object-cover" />
                            : <Icon name="Package" size={64} className="text-gray-800" />
                          }
                          {catName && (
                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-exo text-xs"
                              style={{ background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", color: "#a855f7" }}>
                              {catName}
                            </div>
                          )}
                          {p.ostatok !== null && Number(p.ostatok) <= 3 && Number(p.ostatok) > 0 && (
                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full font-exo text-xs text-orange-300"
                              style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.3)" }}>
                              Осталось {p.ostatok}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          {p.artikul && <div className="font-exo text-xs text-gray-600 mb-1">{p.artikul}</div>}
                          <h3 className="font-exo font-semibold text-white text-sm mb-3 line-clamp-2">{p.naimenovanie}</h3>

                          <div className="flex items-center gap-2 mb-3">
                            {price > 0
                              ? <span className="font-orbitron font-bold text-white">{price.toLocaleString()} ₽</span>
                              : <span className="font-exo text-sm text-gray-600">Цена по запросу</span>
                            }
                            {p.tsvet && (
                              <span className="flex items-center gap-1 ml-auto">
                                <span className="w-3 h-3 rounded-full border border-gray-700" style={{ background: p.tsvet }} />
                                <span className="font-exo text-xs text-gray-600">{p.tsvet}</span>
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAdd(p)}
                            disabled={price === 0}
                            className={`w-full py-2 rounded-lg text-xs font-orbitron font-bold transition-all disabled:opacity-40 ${isAdded ? "text-black" : "btn-neon-cyan"}`}
                            style={isAdded ? { background: "linear-gradient(135deg, #00ffff, #a855f7)" } : {}}
                          >
                            {isAdded ? "✓ ДОБАВЛЕНО" : price === 0 ? "НЕТ ЦЕНЫ" : "В КОРЗИНУ"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-white/5"
                      style={{ border: "1px solid #1e2535" }}>
                      <Icon name="ChevronLeft" size={16} className="text-gray-400" />
                    </button>
                    {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
                      <button key={i} onClick={() => setPage(i)}
                        className="w-9 h-9 rounded-lg font-orbitron text-xs font-bold transition-all"
                        style={page === i ? { background: "linear-gradient(135deg,#00ffff,#a855f7)", color: "#000" } : { border: "1px solid #1e2535", color: "#6b7280" }}>
                        {i + 1}
                      </button>
                    ))}
                    <button disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all hover:bg-white/5"
                      style={{ border: "1px solid #1e2535" }}>
                      <Icon name="ChevronRight" size={16} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
