import { useState } from "react";
import Icon from "@/components/ui/icon";

const reviews = [
  { id: 1, name: "Алексей М.", rating: 5, product: "iPhone 15 Pro Max", date: "15 мая 2026", text: "Отличный магазин! Заказал в пятницу вечером, в воскресенье уже получил через СДЭК. Товар в идеальном состоянии, оригинальная упаковка. Очень доволен!", avatar: "А" },
  { id: 2, name: "Марина К.", rating: 5, product: "Sony WH-1000XM5", date: "12 мая 2026", text: "Давно хотела эти наушники. Цена оказалась лучшей в интернете. Доставка быстрая, консультант помог с выбором. Буду возвращаться!", avatar: "М" },
  { id: 3, name: "Дмитрий П.", rating: 4, product: "MacBook Pro 14\"", date: "8 мая 2026", text: "Всё хорошо, единственное — хотелось бы более подробные фото товара на сайте. Но в целом доволен покупкой и сервисом.", avatar: "Д" },
  { id: 4, name: "Ольга С.", rating: 5, product: "Samsung Galaxy S24 Ultra", date: "3 мая 2026", text: "Уже третья покупка в этом магазине. Каждый раз всё на высшем уровне. Отдельное спасибо менеджерам за быстрые ответы!", avatar: "О" },
  { id: 5, name: "Иван Т.", rating: 5, product: "AirPods Pro 2", date: "28 апреля 2026", text: "Пришли быстро, всё запечатано, гарантийный талон на месте. Качество товара превосходное. Рекомендую!", avatar: "И" },
  { id: 6, name: "Екатерина Л.", rating: 4, product: "ASUS ROG Zephyrus G16", date: "20 апреля 2026", text: "Ноутбук-зверь! Доставили через DHL за 2 дня. Единственный минус — упаковка немного помялась при транспортировке, но сам ноутбук целый.", avatar: "Е" },
];

const stats = [
  { stars: 5, count: 847, pct: 78 },
  { stars: 4, count: 198, pct: 18 },
  { stars: 3, count: 43, pct: 4 },
  { stars: 2, count: 0, pct: 0 },
  { stars: 1, count: 0, pct: 0 },
];

export default function ReviewsPage() {
  const [filter, setFilter] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">ОТЗЫВЫ</h1>
            <p className="font-exo text-gray-500">Мнения наших покупателей</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="px-6 py-3 rounded-xl font-orbitron text-sm font-bold btn-neon-cyan">
            + НАПИСАТЬ ОТЗЫВ
          </button>
        </div>

        {/* Overall rating */}
        <div className="glass-card rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center flex-shrink-0">
            <div className="font-orbitron text-7xl font-black gradient-text">4.9</div>
            <div className="flex justify-center gap-1 mt-2 mb-1">
              {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-xl">★</span>)}
            </div>
            <div className="font-exo text-xs text-gray-500">1 088 отзывов</div>
          </div>
          <div className="flex-1 w-full">
            {stats.map(s => (
              <div key={s.stars} className="flex items-center gap-3 mb-2">
                <span className="font-exo text-xs text-gray-500 w-4">{s.stars}</span>
                <span className="text-yellow-400 text-xs">★</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1e2535" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.pct}%`, background: "linear-gradient(90deg, #00ffff, #a855f7)" }} />
                </div>
                <span className="font-exo text-xs text-gray-500 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write review form */}
        {showForm && (
          <div className="glass-card rounded-xl p-6 mb-8 animate-fade-in" style={{ border: "1px solid rgba(0,255,255,0.2)" }}>
            <h3 className="font-orbitron text-sm font-bold neon-text-cyan mb-4">ВАШ ОТЗЫВ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Ваше имя" className="px-4 py-3 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
              <input type="text" placeholder="Название товара" className="px-4 py-3 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
            </div>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} className="text-2xl text-yellow-400 hover:scale-110 transition-transform">★</button>
              ))}
            </div>
            <textarea placeholder="Расскажите о вашем опыте..." rows={4} className="w-full px-4 py-3 rounded-xl font-exo text-sm text-white outline-none resize-none mb-4" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
            <div className="flex gap-3">
              <button className="px-6 py-2 rounded-xl font-orbitron text-sm font-bold btn-gradient">Отправить</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl font-exo text-sm text-gray-500 hover:text-white transition-colors" style={{ border: "1px solid #1e2535" }}>Отмена</button>
            </div>
          </div>
        )}

        {/* Filter by rating */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[0, 5, 4, 3].map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-4 py-2 rounded-full font-exo text-sm transition-all ${filter === r ? "text-black font-bold" : "text-gray-400 hover:text-white"}`}
              style={filter === r ? { background: "linear-gradient(135deg, #00ffff, #a855f7)" } : { border: "1px solid #1e2535" }}
            >
              {r === 0 ? "Все" : `${r} ★`}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="glass-card rounded-xl p-5 glass-card-hover animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm text-black" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)" }}>
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <div className="flex items-center gap-3">
                      <span className="font-exo font-semibold text-white text-sm">{review.name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-xs ${s <= review.rating ? "text-yellow-400" : "text-gray-700"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <span className="font-exo text-xs text-gray-600">{review.date}</span>
                  </div>
                  <div className="font-exo text-xs text-gray-600 mb-2">Товар: {review.product}</div>
                  <p className="font-exo text-sm text-gray-300 leading-relaxed">{review.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
