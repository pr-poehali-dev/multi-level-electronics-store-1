import { useState } from "react";
import Icon from "@/components/ui/icon";

const contacts = [
  { icon: "Phone", label: "Телефон", value: "+7 (800) 555-35-35", sub: "Бесплатно, ежедневно 9:00–21:00", color: "#00ffff" },
  { icon: "Mail", label: "Email", value: "support@technova.ru", sub: "Ответ в течение 2 часов", color: "#a855f7" },
  { icon: "MessageCircle", label: "Telegram", value: "@technova_support", sub: "Быстрая поддержка", color: "#3b82f6" },
  { icon: "MapPin", label: "Адрес", value: "Москва, ул. Тверская, 15", sub: "Шоурум: пн-вс 10:00–20:00", color: "#ff00aa" },
];

export default function ContactsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-orbitron text-3xl sm:text-4xl font-black gradient-text mb-2">КОНТАКТЫ</h1>
          <p className="font-exo text-gray-500">Мы всегда готовы помочь — выберите удобный способ связи</p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contacts.map(c => (
            <div key={c.label} className="glass-card rounded-xl p-5 glass-card-hover">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                <Icon name={c.icon} size={18} style={{ color: c.color }} />
              </div>
              <div className="font-exo text-xs text-gray-500 mb-1">{c.label}</div>
              <div className="font-exo font-semibold text-white text-sm mb-1">{c.value}</div>
              <div className="font-exo text-xs text-gray-600">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass-card rounded-xl p-6" style={{ border: "1px solid #1e2535" }}>
            <h2 className="font-orbitron text-lg font-black gradient-text mb-6">НАПИСАТЬ НАМ</h2>

            {sent ? (
              <div className="text-center py-8 animate-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)" }}>
                  <Icon name="CheckCircle" size={32} className="text-cyan-400" />
                </div>
                <h3 className="font-orbitron text-sm font-bold text-white mb-2">Сообщение отправлено!</h3>
                <p className="font-exo text-sm text-gray-500 mb-4">Мы ответим вам в течение 2 часов в рабочее время.</p>
                <button onClick={() => setSent(false)} className="px-6 py-2 rounded-xl font-exo text-sm btn-neon-cyan">Написать ещё</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-exo text-xs text-gray-500 mb-1 block">Имя *</label>
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Ваше имя" className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
                  </div>
                  <div>
                    <label className="font-exo text-xs text-gray-500 mb-1 block">Телефон</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="+7 (___) ___-__-__" className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
                  </div>
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="your@email.com" className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Тема</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer" style={{ background: "#0d1117", border: "1px solid #1e2535" }}>
                    <option value="">Выберите тему</option>
                    <option>Вопрос по заказу</option>
                    <option>Доставка и получение</option>
                    <option>Возврат товара</option>
                    <option>Гарантийный случай</option>
                    <option>Другое</option>
                  </select>
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Сообщение *</label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Опишите ваш вопрос..." rows={4} className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none resize-none" style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider btn-gradient">
                  ОТПРАВИТЬ СООБЩЕНИЕ
                </button>
              </form>
            )}
          </div>

          {/* Work hours + map placeholder */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold neon-text-cyan mb-4 tracking-wider">РЕЖИМ РАБОТЫ</h2>
              <div className="space-y-3">
                {[
                  { days: "Пн–Пт", time: "09:00 – 21:00", active: true },
                  { days: "Суббота", time: "10:00 – 20:00", active: true },
                  { days: "Воскресенье", time: "10:00 – 19:00", active: false },
                ].map(s => (
                  <div key={s.days} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="font-exo text-sm text-gray-300">{s.days}</span>
                    <span className={`font-orbitron text-sm font-bold ${s.active ? "neon-text-cyan" : "text-gray-500"}`}>{s.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="font-orbitron text-sm font-bold neon-text-cyan mb-4 tracking-wider">МЕССЕНДЖЕРЫ</h2>
              <div className="space-y-3">
                {[
                  { name: "Telegram", handle: "@technova_support", icon: "MessageCircle", color: "#3b82f6" },
                  { name: "WhatsApp", handle: "+7 (800) 555-35-35", icon: "Phone", color: "#39ff14" },
                  { name: "ВКонтакте", handle: "vk.com/technova", icon: "Users", color: "#a855f7" },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}20` }}>
                      <Icon name={m.icon} size={16} style={{ color: m.color }} />
                    </div>
                    <div>
                      <div className="font-exo text-sm font-semibold text-white">{m.name}</div>
                      <div className="font-exo text-xs text-gray-500">{m.handle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(0,255,255,0.05), rgba(168,85,247,0.05))" }}>
              <Icon name="MapPin" size={32} className="text-cyan-400 mx-auto mb-3" />
              <div className="font-orbitron text-sm font-bold text-white mb-1">Шоурум в Москве</div>
              <div className="font-exo text-xs text-gray-500">ул. Тверская, 15, м. Тверская</div>
              <div className="font-exo text-xs text-gray-600 mt-2">Можно приехать, посмотреть и потрогать товар</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
