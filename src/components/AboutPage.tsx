import Icon from "@/components/ui/icon";

const team = [
  { name: "Артём Волков", role: "Генеральный директор", emoji: "👨‍💼" },
  { name: "Мария Соколова", role: "Директор по продажам", emoji: "👩‍💼" },
  { name: "Игорь Чернов", role: "Технический эксперт", emoji: "👨‍💻" },
  { name: "Анна Петрова", role: "Руководитель сервиса", emoji: "👩‍🔧" },
];

const milestones = [
  { year: "2018", text: "Основание компании TechNova в Москве" },
  { year: "2019", text: "Открытие первого офлайн-шоурума" },
  { year: "2021", text: "Запуск интернет-магазина, 10 000 клиентов" },
  { year: "2023", text: "Расширение до 30 городов России" },
  { year: "2025", text: "50 000+ довольных покупателей" },
  { year: "2026", text: "Новая платформа и международная доставка" },
];

const values = [
  { icon: "Shield", title: "Честность", desc: "Только официальные поставки, никаких серых схем", color: "#00ffff" },
  { icon: "Zap", title: "Скорость", desc: "Обрабатываем заказы в течение 2 часов", color: "#a855f7" },
  { icon: "Star", title: "Качество", desc: "Тщательный контроль каждого товара перед отправкой", color: "#ff00aa" },
  { icon: "Users", title: "Клиент прежде всего", desc: "NPS 87 — наши клиенты рекомендуют нас друзьям", color: "#39ff14" },
];

export default function AboutPage() {
  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl sm:text-5xl font-black gradient-text mb-4">О КОМПАНИИ</h1>
          <p className="font-exo text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            TechNova — это команда энтузиастов технологий, которая с 2018 года помогает людям выбирать лучшую электронику по честным ценам.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: "50K+", label: "Клиентов", color: "#00ffff" },
            { value: "1000+", label: "Товаров", color: "#a855f7" },
            { value: "4.9★", label: "Рейтинг", color: "#ff00aa" },
            { value: "8 лет", label: "На рынке", color: "#39ff14" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-5 text-center glass-card-hover">
              <div className="font-orbitron text-2xl sm:text-3xl font-black mb-1" style={{ color: s.color, textShadow: `0 0 20px ${s.color}60` }}>{s.value}</div>
              <div className="font-exo text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="font-orbitron text-2xl font-black gradient-text text-center mb-8">НАШИ ЦЕННОСТИ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(v => (
              <div key={v.title} className="glass-card rounded-xl p-6 glass-card-hover flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${v.color}15`, border: `1px solid ${v.color}40` }}>
                  <Icon name={v.icon} size={22} style={{ color: v.color }} />
                </div>
                <div>
                  <h3 className="font-orbitron text-sm font-bold text-white mb-2">{v.title}</h3>
                  <p className="font-exo text-sm text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="font-orbitron text-2xl font-black gradient-text text-center mb-8">ИСТОРИЯ</h2>
          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, #00ffff, #a855f7, #ff00aa)" }} />
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex items-center gap-6 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:text-right" : "sm:text-left"} pl-12 sm:pl-0`}>
                    <div className="glass-card rounded-xl p-4 inline-block text-left">
                      <div className="font-orbitron text-sm font-black neon-text-cyan mb-1">{m.year}</div>
                      <div className="font-exo text-sm text-gray-300">{m.text}</div>
                    </div>
                  </div>
                  <div className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center z-10" style={{ background: "linear-gradient(135deg, #00ffff, #a855f7)", boxShadow: "0 0 12px rgba(0,255,255,0.5)" }}>
                    <div className="w-3 h-3 rounded-full bg-black" />
                  </div>
                  <div className="flex-1 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="font-orbitron text-2xl font-black gradient-text text-center mb-8">КОМАНДА</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {team.map(member => (
              <div key={member.name} className="glass-card rounded-xl p-5 text-center glass-card-hover">
                <div className="text-4xl mb-3">{member.emoji}</div>
                <div className="font-exo font-semibold text-white text-sm mb-1">{member.name}</div>
                <div className="font-exo text-xs text-gray-500">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
