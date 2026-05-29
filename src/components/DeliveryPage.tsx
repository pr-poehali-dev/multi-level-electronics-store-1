import { useState } from "react";
import Icon from "@/components/ui/icon";

const carriers = [
  {
    id: "cdek",
    name: "СДЭК",
    logo: "🟡",
    desc: "Крупнейшая логистическая компания России",
    price: "от 200 ₽",
    time: "2–5 рабочих дней",
    features: ["Отслеживание онлайн", "Пункты выдачи по всей РФ", "Доставка до двери", "SMS-уведомления"],
    color: "#00ffff",
  },
  {
    id: "boxberry",
    name: "Boxberry",
    logo: "🟠",
    desc: "Сеть из 34 000+ пунктов выдачи",
    price: "от 180 ₽",
    time: "3–6 рабочих дней",
    features: ["34 000+ пунктов", "Онлайн-трекинг", "Возврат товаров", "Страхование груза"],
    color: "#f97316",
  },
  {
    id: "pochta",
    name: "Почта России",
    logo: "🔵",
    desc: "Доставка в любой уголок России",
    price: "от 100 ₽",
    time: "5–14 рабочих дней",
    features: ["Доставка в любой город", "Самые низкие тарифы", "Уведомление о прибытии", "42 000+ отделений"],
    color: "#3b82f6",
  },
  {
    id: "dhl",
    name: "DHL Express",
    logo: "🔴",
    desc: "Экспресс-доставка от мирового лидера",
    price: "от 500 ₽",
    time: "1–3 рабочих дня",
    features: ["Экспресс-доставка", "Международные отправления", "Приоритетная обработка", "Гарантия сроков"],
    color: "#ef4444",
  },
  {
    id: "courier",
    name: "Курьер",
    logo: "⚡",
    desc: "Доставка в день заказа или на следующий день",
    price: "от 350 ₽",
    time: "1–2 рабочих дня",
    features: ["Доставка до двери", "Выбор времени", "Оплата при получении", "Примерка перед оплатой"],
    color: "#a855f7",
  },
];

const faq = [
  { q: "Как отследить мой заказ?", a: "После отправки заказа вы получите трек-номер на указанную почту. Отслеживание доступно на сайте транспортной компании или в разделе «Мои заказы»." },
  { q: "Можно ли получить товар в пункте выдачи?", a: "Да, при выборе СДЭК или Boxberry вы можете выбрать удобный пункт выдачи на карте при оформлении заказа." },
  { q: "Что если товар повреждён при доставке?", a: "Откажитесь принимать посылку и сообщите нам. Мы организуем повторную отправку или вернём деньги в течение 3 рабочих дней." },
  { q: "Есть ли бесплатная доставка?", a: "Да! При заказе от 10 000 ₽ доставка через СДЭК или Boxberry бесплатна. При заказе от 50 000 ₽ — любым способом." },
];

export default function DeliveryPage() {
  const [selected, setSelected] = useState("cdek");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">ДОСТАВКА</h1>
          <p className="font-exo text-gray-500">Выберите удобный способ получения заказа</p>
        </div>

        {/* Free delivery banner */}
        <div className="glass-card rounded-xl p-5 mb-8 flex items-center gap-4" style={{ border: "1px solid rgba(0,255,255,0.2)", background: "rgba(0,255,255,0.03)" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)" }}>
            <Icon name="Gift" size={20} className="text-cyan-400" />
          </div>
          <div>
            <div className="font-orbitron text-sm font-bold text-white">Бесплатная доставка</div>
            <div className="font-exo text-xs text-gray-500 mt-0.5">При заказе от 10 000 ₽ — СДЭК/Boxberry бесплатно · От 50 000 ₽ — любым способом</div>
          </div>
        </div>

        {/* Carriers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {carriers.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`glass-card rounded-xl p-5 text-left transition-all duration-200 ${selected === c.id ? "" : "glass-card-hover"}`}
              style={selected === c.id ? { border: `1px solid ${c.color}`, boxShadow: `0 0 20px ${c.color}20` } : {}}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl">{c.logo}</span>
                  <h3 className="font-orbitron text-sm font-bold text-white mt-1">{c.name}</h3>
                </div>
                {selected === c.id && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: c.color }}>
                    <Icon name="Check" size={12} className="text-black" />
                  </div>
                )}
              </div>
              <p className="font-exo text-xs text-gray-500 mb-3">{c.desc}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="font-orbitron text-sm font-bold" style={{ color: c.color }}>{c.price}</span>
                <span className="font-exo text-xs text-gray-500">{c.time}</span>
              </div>
              <ul className="space-y-1">
                {c.features.map(f => (
                  <li key={f} className="flex items-center gap-2 font-exo text-xs text-gray-400">
                    <Icon name="Check" size={12} style={{ color: c.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Track order */}
        <div className="glass-card rounded-xl p-6 mb-12" style={{ border: "1px solid #1e2535" }}>
          <h2 className="font-orbitron text-lg font-black gradient-text mb-4">ОТСЛЕДИТЬ ЗАКАЗ</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Введите номер заказа или трек-номер..."
              className="flex-1 px-4 py-3 rounded-xl font-exo text-sm text-white outline-none"
              style={{ background: "#0d1117", border: "1px solid #1e2535" }}
            />
            <button className="px-6 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient">
              Найти
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-orbitron text-2xl font-black gradient-text mb-6">ЧАСТЫЕ ВОПРОСЫ</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-exo font-semibold text-white text-sm">{item.q}</span>
                  <Icon name={openFaq === i ? "ChevronUp" : "ChevronDown"} size={16} className="text-gray-500 flex-shrink-0 ml-4" />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="font-exo text-sm text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
