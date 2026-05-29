import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/f1fa8190-72a9-41b5-9c0c-58a339d81932";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
  products_count: number;
  children: Category[];
}

const EMPTY_FORM = { name: "", slug: "", parent_id: "" as string | number, sort_order: 0 };

export default function CategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch(API);
    const data = await res.json();
    setTree(data.categories || []);
    setFlat(data.flat || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = (parentId?: number) => {
    setEditCat(null);
    setForm({ ...EMPTY_FORM, parent_id: parentId ?? "" });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug || "", parent_id: cat.parent_id ?? "", sort_order: cat.sort_order });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast("Укажите название", false); return; }
    setSaving(true);
    const payload = {
      ...form,
      parent_id: form.parent_id === "" ? null : Number(form.parent_id),
    };
    const url = editCat ? `${API}?id=${editCat.id}` : API;
    const res = await fetch(url, {
      method: editCat ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { showToast(data.error || "Ошибка", false); return; }
    showToast(editCat ? "Категория обновлена" : "Категория добавлена");
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Категория удалена"); load(); }
    else showToast("Ошибка удаления", false);
    setDeleteId(null);
  };

  const renderTree = (cats: Category[], depth = 0) =>
    cats.map(cat => (
      <div key={cat.id}>
        <div
          className="flex items-center gap-3 py-3 px-4 transition-colors hover:bg-white/[0.02] group"
          style={{ paddingLeft: `${16 + depth * 28}px`, borderBottom: "1px solid #0d1117" }}
        >
          {/* Indent indicator */}
          {depth > 0 && (
            <div className="flex-shrink-0 flex items-center gap-1">
              {Array.from({ length: depth }).map((_, i) => (
                <div key={i} className="w-px h-5" style={{ background: "#1e2535" }} />
              ))}
              <Icon name="CornerDownRight" size={12} className="text-gray-700 flex-shrink-0" />
            </div>
          )}

          {/* Icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: depth === 0 ? "rgba(0,255,255,0.08)" : "rgba(168,85,247,0.08)", border: `1px solid ${depth === 0 ? "rgba(0,255,255,0.2)" : "rgba(168,85,247,0.2)"}` }}>
            <Icon name={depth === 0 ? "FolderOpen" : "Folder"} size={14}
              style={{ color: depth === 0 ? "#00ffff" : "#a855f7" }} />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className="font-exo font-semibold text-sm text-white">{cat.name}</span>
            {cat.slug && <span className="font-exo text-xs text-gray-600 ml-2">/{cat.slug}</span>}
          </div>

          {/* Products count */}
          <div className="flex-shrink-0">
            <span className="px-2 py-0.5 rounded-full font-orbitron text-xs"
              style={{ background: cat.products_count > 0 ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.03)", color: cat.products_count > 0 ? "#00ffff" : "#4b5563", border: `1px solid ${cat.products_count > 0 ? "rgba(0,255,255,0.2)" : "#1e2535"}` }}>
              {cat.products_count} товаров
            </span>
          </div>

          {/* Sort order */}
          <span className="font-exo text-xs text-gray-700 w-6 text-center flex-shrink-0">#{cat.sort_order}</span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={() => openCreate(cat.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-cyan-500/10 transition-all" title="Добавить подкатегорию"
              style={{ border: "1px solid #1e2535" }}>
              <Icon name="FolderPlus" size={12} className="text-cyan-400" />
            </button>
            <button onClick={() => openEdit(cat)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-purple-500/10 transition-all"
              style={{ border: "1px solid #1e2535" }}>
              <Icon name="Pencil" size={12} className="text-purple-400" />
            </button>
            <button onClick={() => setDeleteId(cat.id)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all"
              style={{ border: "1px solid #1e2535" }}>
              <Icon name="Trash2" size={12} className="text-red-400" />
            </button>
          </div>
        </div>
        {cat.children?.length > 0 && renderTree(cat.children, depth + 1)}
      </div>
    ));

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen">
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in px-5 py-3 rounded-xl font-exo text-sm font-semibold shadow-lg"
          style={{ background: toast.ok ? "rgba(0,255,255,0.12)" : "rgba(255,0,80,0.12)", border: `1px solid ${toast.ok ? "#00ffff" : "#ff0050"}`, color: toast.ok ? "#00ffff" : "#ff6080" }}>
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-orbitron text-2xl sm:text-3xl font-black gradient-text">КАТЕГОРИИ</h1>
            <p className="font-exo text-gray-500 text-sm mt-1">
              Всего: <span className="neon-text-cyan font-bold">{flat.length}</span> категорий
            </p>
          </div>
          <button onClick={() => openCreate()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient flex-shrink-0">
            <Icon name="Plus" size={16} /> ДОБАВИТЬ
          </button>
        </div>

        {/* Tree */}
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Шапка */}
          <div className="flex items-center gap-3 px-4 py-3 border-b"
            style={{ background: "rgba(0,255,255,0.03)", borderColor: "#1e2535" }}>
            <span className="font-orbitron text-xs font-bold neon-text-cyan flex-1">НАЗВАНИЕ</span>
            <span className="font-orbitron text-xs font-bold text-gray-600 w-24 text-center">ТОВАРЫ</span>
            <span className="font-orbitron text-xs font-bold text-gray-600 w-6 text-center">№</span>
            <span className="w-24" />
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <Icon name="Loader" size={24} className="text-gray-700 mx-auto animate-spin" />
            </div>
          ) : flat.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="FolderOpen" size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="font-orbitron text-sm text-gray-600">Нет категорий</p>
            </div>
          ) : (
            renderTree(tree)
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl animate-fade-in"
            style={{ background: "#0a0e18", border: "1px solid #1e2535" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1e2535" }}>
              <h2 className="font-orbitron text-sm font-black gradient-text">
                {editCat ? "Редактировать категорию" : "Новая категория"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
                <Icon name="X" size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="font-exo text-xs text-gray-500 mb-1 block">Название *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Смартфоны" autoFocus
                  className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                  style={{ background: "#060810", border: "1px solid #1e2535" }} />
              </div>

              <div>
                <label className="font-exo text-xs text-gray-500 mb-1 block">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="smartfony"
                  className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                  style={{ background: "#060810", border: "1px solid #1e2535" }} />
              </div>

              <div>
                <label className="font-exo text-xs text-gray-500 mb-1 block">Родительская категория</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none cursor-pointer"
                  style={{ background: "#060810", border: "1px solid #1e2535" }}>
                  <option value="">— Корневая категория —</option>
                  {flat.filter(c => c.id !== editCat?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.parent_id ? `  └ ${c.name}` : c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-exo text-xs text-gray-500 mb-1 block">Порядок сортировки</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-xl font-exo text-sm text-white outline-none"
                  style={{ background: "#060810", border: "1px solid #1e2535" }} />
              </div>
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

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-scale-in"
            style={{ background: "#0a0e18", border: "1px solid rgba(255,0,80,0.3)" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,0,80,0.1)", border: "1px solid rgba(255,0,80,0.3)" }}>
              <Icon name="Trash2" size={20} className="text-red-400" />
            </div>
            <h3 className="font-orbitron text-sm font-bold text-white text-center mb-2">Удалить категорию?</h3>
            <p className="font-exo text-xs text-gray-500 text-center mb-6">
              Товары в этой категории будут откреплены, подкатегории перейдут к родителю.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: "1px solid #1e2535" }}>Отмена</button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl font-orbitron text-sm font-bold text-white"
                style={{ background: "rgba(255,0,80,0.2)", border: "1px solid rgba(255,0,80,0.4)" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
