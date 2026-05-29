import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import ImportModal from "@/components/ImportModal";

const API_URL = "https://functions.poehali.dev/6bba6e36-932e-4957-ae83-49a5849b6081";
const CAT_URL = "https://functions.poehali.dev/f1fa8190-72a9-41b5-9c0c-58a339d81932";

interface FlatCategory { id: number; name: string; parent_id: number | null; }

interface Product {
  id?: number;
  kod_kitay: string;
  naimenovanie: string;
  artikul: string;
  shtrikhkod: string;
  zakup_tsena_yuan: number;
  kurs_yuan: number;
  tsena_dostavki: number;
  ves_tovara: number;
  gabarity_upakovki: string;
  kurs_dollara: number;
  stavka_kg: number;
  stavka_kub: number;
  sebestoimost: number;
  fifo: number;
  lifo: number;
  prodazh_tsena_roznitsa: number;
  prodazh_tsena_opt: number;
  kolichestvo: number;
  ostatok: number;
  summa: number;
  zakazano: number;
  otgruzheno: number;
  vozvrat_postavshchiku: number;
  vozvrat_ot_pokupatelya: number;
  tsvet: string;
  category_id: number | null;
}

const EMPTY: Product = {
  kod_kitay: "", naimenovanie: "", artikul: "", shtrikhkod: "",
  zakup_tsena_yuan: 0, kurs_yuan: 0, tsena_dostavki: 0, ves_tovara: 0,
  gabarity_upakovki: "", kurs_dollara: 0, stavka_kg: 0, stavka_kub: 0,
  sebestoimost: 0, fifo: 0, lifo: 0, prodazh_tsena_roznitsa: 0,
  prodazh_tsena_opt: 0, kolichestvo: 0, ostatok: 0, summa: 0,
  zakazano: 0, otgruzheno: 0, vozvrat_postavshchiku: 0,
  vozvrat_ot_pokupatelya: 0, tsvet: "", category_id: null,
};

const FIELD_GROUPS = [
  {
    label: "Идентификация",
    color: "#00ffff",
    fields: [
      { key: "kod_kitay", label: "Код товара (Китай)", type: "text" },
      { key: "naimenovanie", label: "Наименование *", type: "text", required: true },
      { key: "artikul", label: "Артикул", type: "text" },
      { key: "shtrikhkod", label: "Штрихкод", type: "text" },
      { key: "tsvet", label: "Цвет", type: "text" },
    ],
  },
  {
    label: "Закупка и логистика",
    color: "#a855f7",
    fields: [
      { key: "zakup_tsena_yuan", label: "Закупочная цена (¥)", type: "number" },
      { key: "kurs_yuan", label: "Курс юаня", type: "number" },
      { key: "tsena_dostavki", label: "Цена доставки (₽)", type: "number" },
      { key: "ves_tovara", label: "Вес товара (кг)", type: "number" },
      { key: "gabarity_upakovki", label: "Габариты упаковки", type: "text" },
      { key: "kurs_dollara", label: "Курс доллара", type: "number" },
      { key: "stavka_kg", label: "Ставка за кг", type: "number" },
      { key: "stavka_kub", label: "Ставка за куб", type: "number" },
    ],
  },
  {
    label: "Себестоимость",
    color: "#ff00aa",
    fields: [
      { key: "sebestoimost", label: "Себестоимость (₽)", type: "number" },
      { key: "fifo", label: "ФИФО (₽)", type: "number" },
      { key: "lifo", label: "ЛИФО (₽)", type: "number" },
      { key: "prodazh_tsena_roznitsa", label: "Цена розница (₽)", type: "number" },
      { key: "prodazh_tsena_opt", label: "Цена опт (₽)", type: "number" },
    ],
  },
  {
    label: "Движение товара",
    color: "#39ff14",
    fields: [
      { key: "kolichestvo", label: "Количество", type: "number" },
      { key: "ostatok", label: "Остаток", type: "number" },
      { key: "summa", label: "Сумма (₽)", type: "number" },
      { key: "zakazano", label: "Заказано", type: "number" },
      { key: "otgruzheno", label: "Отгружено", type: "number" },
      { key: "vozvrat_postavshchiku", label: "Возврат поставщику", type: "number" },
      { key: "vozvrat_ot_pokupatelya", label: "Возврат от покупателя", type: "number" },
    ],
  },
];

const TABLE_COLS = [
  { key: "id", label: "ID", w: "60px" },
  { key: "naimenovanie", label: "Наименование", w: "200px" },
  { key: "artikul", label: "Артикул", w: "100px" },
  { key: "category_id", label: "Категория", w: "130px" },
  { key: "tsvet", label: "Цвет", w: "80px" },
  { key: "prodazh_tsena_roznitsa", label: "Розница ₽", w: "100px" },
  { key: "prodazh_tsena_opt", label: "Опт ₽", w: "90px" },
  { key: "kolichestvo", label: "Кол-во", w: "70px" },
  { key: "ostatok", label: "Остаток", w: "70px" },
];

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({
      limit: String(limit),
      offset: String(page * limit),
      ...(search ? { search } : {}),
      ...(filterCategoryId ? { category_id: filterCategoryId } : {}),
    });
    const res = await fetch(`${API_URL}?${q}`);
    const data = await res.json();
    setProducts(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, page, filterCategoryId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch(CAT_URL).then(r => r.json()).then(d => setCategories(d.flat || []));
  }, []);

  const openCreate = () => { setEditProduct(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setForm({ ...p }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditProduct(null); };

  const handleSave = async () => {
    if (!form.naimenovanie.trim()) { showToast("Укажите наименование товара", "err"); return; }
    setSaving(true);
    const isEdit = !!editProduct?.id;
    const res = await fetch(isEdit ? `${API_URL}?id=${editProduct!.id}` : API_URL, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      showToast(isEdit ? "Товар обновлён" : "Товар добавлен");
      closeModal();
      load();
    } else {
      showToast("Ошибка сохранения", "err");
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Товар удалён"); load(); }
    else showToast("Ошибка удаления", "err");
    setDeleteId(null);
  };

  const setField = (key: string, value: string | number) => setForm(f => ({ ...f, [key]: value }));

  const pages = Math.ceil(total / limit);

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in px-5 py-3 rounded-xl font-exo text-sm font-semibold shadow-lg"
          style={{ background: toast.type === "ok" ? "rgba(0,255,255,0.15)" : "rgba(255,0,80,0.15)", border: `1px solid ${toast.type === "ok" ? "#00ffff" : "#ff0050"}`, color: toast.type === "ok" ? "#00ffff" : "#ff6080" }}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-orbitron text-2xl sm:text-3xl font-black gradient-text">УПРАВЛЕНИЕ ТОВАРАМИ</h1>
            <p className="font-exo text-gray-500 text-sm mt-1">Всего товаров: <span className="neon-text-cyan font-bold">{total}</span></p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron text-sm font-bold btn-neon-cyan"
            >
              <Icon name="FileUp" size={16} /> ИМПОРТ
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient">
              <Icon name="Plus" size={16} /> ДОБАВИТЬ ТОВАР
            </button>
          </div>
        </div>

        {/* Search + Category filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text" placeholder="Поиск по названию, артикулу, коду..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
              style={{ background: "#0d1117", border: "1px solid #1e2535" }}
            />
          </div>
          <div className="relative">
            <Icon name="FolderTree" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <select
              value={filterCategoryId}
              onChange={e => { setFilterCategoryId(e.target.value); setPage(0); }}
              className="pl-9 pr-4 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer"
              style={{
                background: "#0d1117",
                border: `1px solid ${filterCategoryId ? "rgba(168,85,247,0.5)" : "#1e2535"}`,
                color: filterCategoryId ? "#a855f7" : "#9ca3af",
                minWidth: 200,
              }}
            >
              <option value="">Все категории</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.parent_id ? `  └ ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>
          {filterCategoryId && (
            <button
              onClick={() => { setFilterCategoryId(""); setPage(0); }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-exo text-xs text-gray-400 hover:text-white transition-all flex-shrink-0"
              style={{ border: "1px solid #1e2535" }}
            >
              <Icon name="X" size={12} /> Сбросить
            </button>
          )}
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden mb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e2535", background: "rgba(0,255,255,0.03)" }}>
                  {TABLE_COLS.map(c => (
                    <th key={c.key} style={{ width: c.w }} className="px-4 py-3 font-orbitron text-xs font-bold neon-text-cyan tracking-wider whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-orbitron text-xs font-bold neon-text-cyan tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #0d1117" }}>
                      {TABLE_COLS.map(c => (
                        <td key={c.key} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: "#1e2535", width: "70%" }} />
                        </td>
                      ))}
                      <td className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: "#1e2535", width: 60 }} /></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS.length + 1} className="px-4 py-16 text-center">
                      <Icon name="PackageSearch" size={40} className="text-gray-700 mx-auto mb-3" />
                      <p className="font-orbitron text-sm text-gray-600">Товары не найдены</p>
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid #0d1117" }}>
                      {TABLE_COLS.map(c => (
                        <td key={c.key} className="px-4 py-3 font-exo text-sm text-gray-300 whitespace-nowrap">
                          {c.key === "id"
                            ? <span className="font-orbitron text-xs text-gray-600">#{p[c.key as keyof Product]}</span>
                            : c.key.includes("tsena") || c.key === "sebestoimost"
                            ? <span className="font-orbitron text-xs neon-text-cyan">{Number(p[c.key as keyof Product] || 0).toLocaleString()} ₽</span>
                            : c.key === "tsvet" && p.tsvet
                            ? <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full border border-gray-700 inline-block" style={{ background: p.tsvet }} />
                                <span className="text-xs text-gray-400">{p.tsvet}</span>
                              </span>
                            : c.key === "category_id"
                            ? (() => {
                                const cat = categories.find(c2 => c2.id === p.category_id);
                                return cat
                                  ? <span className="px-2 py-0.5 rounded-full font-exo text-xs" style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}>{cat.name}</span>
                                  : <span className="text-gray-700 text-xs">—</span>;
                              })()
                            : <span className="truncate max-w-[200px] block">{String(p[c.key as keyof Product] ?? "—")}</span>
                          }
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-cyan-500/10" style={{ border: "1px solid #1e2535" }}>
                            <Icon name="Pencil" size={13} className="text-cyan-400" />
                          </button>
                          <button onClick={() => setDeleteId(p.id!)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10" style={{ border: "1px solid #1e2535" }}>
                            <Icon name="Trash2" size={13} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
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
      </div>

      {/* Modal form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-3xl rounded-2xl animate-fade-in" style={{ background: "#0a0e18", border: "1px solid #1e2535" }}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1e2535" }}>
              <h2 className="font-orbitron text-base font-black gradient-text">
                {editProduct ? `Редактировать #${editProduct.id}` : "Новый товар"}
              </h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {FIELD_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full" style={{ background: group.color }} />
                    <h3 className="font-orbitron text-xs font-bold tracking-wider" style={{ color: group.color }}>{group.label.toUpperCase()}</h3>
                  </div>
                  {/* Селект категории — только в группе Идентификация */}
                  {group.label === "Идентификация" && (
                    <div className="mb-3">
                      <label className="font-exo text-xs text-gray-500 mb-1 block">Категория</label>
                      <select
                        value={form.category_id ?? ""}
                        onChange={e => setField("category_id", e.target.value === "" ? null as unknown as number : Number(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer transition-all"
                        style={{ background: "#060810", border: "1px solid #1e2535" }}
                        onFocus={e => e.target.style.borderColor = group.color}
                        onBlur={e => e.target.style.borderColor = "#1e2535"}
                      >
                        <option value="">— Без категории —</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.parent_id ? `  └ ${c.name}` : c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.fields.map(f => (
                      <div key={f.key}>
                        <label className="font-exo text-xs text-gray-500 mb-1 block">{f.label}</label>
                        <input
                          type={f.type}
                          step={f.type === "number" ? "any" : undefined}
                          value={String(form[f.key as keyof Product] ?? "")}
                          onChange={e => setField(f.key, f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none transition-all"
                          style={{ background: "#060810", border: "1px solid #1e2535" }}
                          onFocus={e => e.target.style.borderColor = group.color}
                          onBlur={e => e.target.style.borderColor = "#1e2535"}
                        />
                        {f.key === "tsvet" && form.tsvet && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-4 h-4 rounded border border-gray-700" style={{ background: form.tsvet }} />
                            <span className="font-exo text-xs text-gray-600">Предпросмотр цвета</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "#1e2535" }}>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-exo text-sm text-gray-500 hover:text-white transition-all" style={{ border: "1px solid #1e2535" }}>
                Отмена
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-50">
                {saving ? <><Icon name="Loader" size={14} className="animate-spin" /> Сохранение...</> : <><Icon name="Save" size={14} /> Сохранить</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-scale-in" style={{ background: "#0a0e18", border: "1px solid rgba(255,0,80,0.3)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,0,80,0.1)", border: "1px solid rgba(255,0,80,0.3)" }}>
              <Icon name="Trash2" size={20} className="text-red-400" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-white text-center mb-2">Удалить товар?</h3>
            <p className="font-exo text-xs text-gray-500 text-center mb-6">Это действие нельзя отменить</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all" style={{ border: "1px solid #1e2535" }}>Отмена</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl font-orbitron text-sm font-bold text-white" style={{ background: "rgba(255,0,80,0.2)", border: "1px solid rgba(255,0,80,0.4)" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onDone={() => { load(); showToast("Импорт завершён!"); }}
        />
      )}
    </div>
  );
}