import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/0df6b6e1-15d2-4f73-abb0-dfdd6c396b46";

interface Supplier {
  id: number;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  country: string;
  address: string | null;
  website: string | null;
  currency: string;
  notes: string | null;
  is_active: boolean;
  products_count: number;
  created_at: string;
}

const EMPTY = {
  name: "", contact_name: "", phone: "", email: "",
  country: "Китай", address: "", website: "",
  currency: "CNY", notes: "", is_active: true,
};

const CURRENCIES = ["CNY", "USD", "EUR", "RUB"];
const COUNTRIES = ["Китай", "США", "Германия", "Япония", "Южная Корея", "Тайвань", "Россия", "Другое"];

const CURRENCY_COLORS: Record<string, string> = {
  CNY: "#f59e0b", USD: "#10b981", EUR: "#3b82f6", RUB: "#a855f7",
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const [deactivateId, setDeactivateId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const q = new URLSearchParams(search ? { search } : {});
    const res = await fetch(`${API}?${q}`);
    const data = await res.json();
    setSuppliers(data.suppliers || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditItem(null); setForm({ ...EMPTY }); setModalOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditItem(s);
    setForm({
      name: s.name, contact_name: s.contact_name || "", phone: s.phone || "",
      email: s.email || "", country: s.country || "Китай", address: s.address || "",
      website: s.website || "", currency: s.currency || "CNY",
      notes: s.notes || "", is_active: s.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Укажите название", false); return; }
    setSaving(true);
    const url = editItem ? `${API}?id=${editItem.id}` : API;
    const res = await fetch(url, {
      method: editItem ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { showToast(data.error || "Ошибка", false); return; }
    showToast(editItem ? "Поставщик обновлён" : "Поставщик добавлен");
    setModalOpen(false);
    load();
  };

  const handleDeactivate = async (id: number) => {
    const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Поставщик деактивирован"); load(); }
    else showToast("Ошибка", false);
    setDeactivateId(null);
  };

  const visible = suppliers.filter(s => showInactive ? true : s.is_active);
  const activeCount = suppliers.filter(s => s.is_active).length;

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in px-5 py-3 rounded-xl font-exo text-sm font-semibold"
          style={{ background: toast.ok ? "rgba(0,255,255,0.12)" : "rgba(255,0,80,0.12)", border: `1px solid ${toast.ok ? "#00ffff" : "#ff0050"}`, color: toast.ok ? "#00ffff" : "#ff6080" }}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-orbitron text-2xl sm:text-3xl font-black gradient-text">ПОСТАВЩИКИ</h1>
            <p className="font-exo text-gray-500 text-sm mt-1">
              Активных: <span className="neon-text-cyan font-bold">{activeCount}</span>
              <span className="text-gray-700 mx-2">·</span>
              Всего: <span className="text-gray-400">{total}</span>
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient">
            <Icon name="Plus" size={16} /> ДОБАВИТЬ
          </button>
        </div>

        {/* Search + toggle */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Поиск поставщика..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
              style={{ background: "#0d1117", border: "1px solid #1e2535" }} />
          </div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-exo text-sm transition-all"
            style={{
              border: `1px solid ${showInactive ? "rgba(168,85,247,0.4)" : "#1e2535"}`,
              background: showInactive ? "rgba(168,85,247,0.08)" : "transparent",
              color: showInactive ? "#a855f7" : "#6b7280",
            }}>
            <Icon name={showInactive ? "Eye" : "EyeOff"} size={14} />
            {showInactive ? "Все" : "Только активные"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {CURRENCIES.map(cur => {
            const count = suppliers.filter(s => s.currency === cur && s.is_active).length;
            const totalGoods = suppliers.filter(s => s.currency === cur && s.is_active)
              .reduce((sum, s) => sum + (s.products_count || 0), 0);
            return (
              <div key={cur} className="glass-card rounded-xl p-4" style={{ border: `1px solid ${CURRENCY_COLORS[cur]}25` }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-orbitron text-sm font-black" style={{ color: CURRENCY_COLORS[cur] }}>{cur}</span>
                  <span className="font-exo text-xs text-gray-600">{count} поставщ.</span>
                </div>
                <div className="font-exo text-xs text-gray-500">{totalGoods} товаров</div>
              </div>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5 animate-pulse" style={{ height: 80 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16">
            <Icon name="Building2" size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="font-orbitron text-sm text-gray-600">Поставщиков нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map(s => (
              <div key={s.id}
                className={`glass-card rounded-xl p-5 transition-all ${s.is_active ? "glass-card-hover" : "opacity-50"}`}
                style={{ border: s.is_active ? "1px solid #1e2535" : "1px dashed #1e2535" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  {/* Left */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-orbitron font-black text-sm"
                      style={{
                        background: s.is_active ? `${CURRENCY_COLORS[s.currency] || "#6b7280"}20` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${s.is_active ? `${CURRENCY_COLORS[s.currency] || "#6b7280"}40` : "#1e2535"}`,
                        color: CURRENCY_COLORS[s.currency] || "#6b7280",
                      }}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-exo font-bold text-white">{s.name}</h3>
                        <span className="px-2 py-0.5 rounded-full font-orbitron text-xs"
                          style={{ background: `${CURRENCY_COLORS[s.currency] || "#6b7280"}15`, color: CURRENCY_COLORS[s.currency] || "#6b7280", border: `1px solid ${CURRENCY_COLORS[s.currency] || "#6b7280"}30` }}>
                          {s.currency}
                        </span>
                        {s.country && (
                          <span className="font-exo text-xs text-gray-600">🌏 {s.country}</span>
                        )}
                        {!s.is_active && (
                          <span className="px-2 py-0.5 rounded-full font-exo text-xs text-gray-600"
                            style={{ border: "1px solid #1e2535" }}>Неактивен</span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {s.contact_name && (
                          <span className="font-exo text-xs text-gray-500 flex items-center gap-1">
                            <Icon name="User" size={11} className="text-gray-700" /> {s.contact_name}
                          </span>
                        )}
                        {s.phone && (
                          <span className="font-exo text-xs text-gray-500 flex items-center gap-1">
                            <Icon name="Phone" size={11} className="text-gray-700" /> {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="font-exo text-xs text-gray-500 flex items-center gap-1">
                            <Icon name="Mail" size={11} className="text-gray-700" /> {s.email}
                          </span>
                        )}
                        {s.website && (
                          <span className="font-exo text-xs text-gray-500 flex items-center gap-1">
                            <Icon name="Globe" size={11} className="text-gray-700" /> {s.website}
                          </span>
                        )}
                      </div>

                      {s.notes && (
                        <p className="font-exo text-xs text-gray-600 mt-1 line-clamp-1">{s.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right mr-2">
                      <div className="font-orbitron text-lg font-black neon-text-cyan">{s.products_count}</div>
                      <div className="font-exo text-xs text-gray-600">товаров</div>
                    </div>
                    <button onClick={() => openEdit(s)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-purple-500/10"
                      style={{ border: "1px solid #1e2535" }}>
                      <Icon name="Pencil" size={13} className="text-purple-400" />
                    </button>
                    {s.is_active && (
                      <button onClick={() => setDeactivateId(s.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
                        style={{ border: "1px solid #1e2535" }}>
                        <Icon name="PowerOff" size={13} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-lg rounded-2xl animate-fade-in mb-8"
            style={{ background: "#0a0e18", border: "1px solid #1e2535" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1e2535" }}>
              <h2 className="font-orbitron text-sm font-black gradient-text">
                {editItem ? "Редактировать поставщика" : "Новый поставщик"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Основное */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full" style={{ background: "#00ffff" }} />
                <span className="font-orbitron text-xs font-bold neon-text-cyan tracking-wider">ОСНОВНОЕ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Название *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Shenzhen Electronics Co." autoFocus
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Страна</label>
                  <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer"
                    style={{ background: "#060810", border: "1px solid #1e2535" }}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Валюта</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer"
                    style={{ background: "#060810", border: "1px solid #1e2535" }}>
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Контакты */}
              <div className="flex items-center gap-2 mb-1 mt-2">
                <div className="w-1 h-4 rounded-full" style={{ background: "#a855f7" }} />
                <span className="font-orbitron text-xs font-bold text-purple-400 tracking-wider">КОНТАКТЫ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Контактное лицо</label>
                  <input type="text" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                    placeholder="Ли Вэй"
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Телефон / WeChat</label>
                  <input type="text" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+86 138 0000 0000"
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="supplier@example.com"
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
                <div>
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Сайт / Магазин</label>
                  <input type="text" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    placeholder="1688.com/shop/..."
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-exo text-xs text-gray-500 mb-1 block">Адрес</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Shenzhen, Guangdong, China"
                    className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                    style={{ background: "#060810", border: "1px solid #1e2535" }} />
                </div>
              </div>

              {/* Заметки */}
              <div>
                <label className="font-exo text-xs text-gray-500 mb-1 block">Заметки</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Условия оплаты, минимальная партия, особенности..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none resize-none"
                  style={{ background: "#060810", border: "1px solid #1e2535" }} />
              </div>

              {/* Активен */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className="w-10 h-6 rounded-full transition-all flex-shrink-0 relative"
                  style={{ background: form.is_active ? "linear-gradient(135deg,#00ffff,#a855f7)" : "#1e2535" }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: form.is_active ? "22px" : "4px" }} />
                </div>
                <span className="font-exo text-sm text-gray-400">Активный поставщик</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#1e2535" }}>
              <button onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-exo text-sm text-gray-500 hover:text-white transition-all"
                style={{ border: "1px solid #1e2535" }}>Отмена</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-50">
                {saving ? <><Icon name="Loader" size={14} className="animate-spin" /> Сохраняем...</> : <><Icon name="Save" size={14} /> Сохранить</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirm */}
      {deactivateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
            style={{ background: "#0a0e18", border: "1px solid rgba(255,160,0,0.3)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,160,0,0.1)", border: "1px solid rgba(255,160,0,0.3)" }}>
              <Icon name="PowerOff" size={20} className="text-orange-400" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-white text-center mb-2">Деактивировать поставщика?</h3>
            <p className="font-exo text-xs text-gray-500 text-center mb-6">
              Поставщик останется в базе, но будет скрыт из активных. Товары не изменятся.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivateId(null)}
                className="flex-1 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: "1px solid #1e2535" }}>Отмена</button>
              <button onClick={() => handleDeactivate(deactivateId)}
                className="flex-1 py-2.5 rounded-xl font-orbitron text-sm font-bold text-white"
                style={{ background: "rgba(255,160,0,0.2)", border: "1px solid rgba(255,160,0,0.4)" }}>Деактивировать</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
