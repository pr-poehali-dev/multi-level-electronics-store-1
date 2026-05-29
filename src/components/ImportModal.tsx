import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const IMPORT_URL = "https://functions.poehali.dev/50ca3d4e-e025-4cbf-a5dd-d14395e0d774";

interface ImportResult {
  added: number;
  skipped_count: number;
  skipped: string[];
  errors: string[];
  total_in_file: number;
}

interface ImportModalProps {
  onClose: () => void;
  onDone: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImportModal({ onClose, onDone }: ImportModalProps) {
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dragData, setDragData] = useState(false);
  const dataRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleDataDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragData(false);
    const file = e.dataTransfer.files[0];
    if (file) setDataFile(file);
  }, []);

  const handleImport = async () => {
    if (!dataFile) return;
    setLoading(true);
    setError("");
    setResult(null);

    const file_base64 = await fileToBase64(dataFile);
    const res = await fetch(IMPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_base64, filename: dataFile.name, photos: [] }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Ошибка импорта");
    } else {
      setResult(data);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
    >
      <div
        className="w-full max-w-xl rounded-2xl animate-fade-in flex flex-col"
        style={{ background: "#0a0e18", border: "1px solid #1e2535", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          <div>
            <h2 className="font-orbitron text-base font-black gradient-text">ИМПОРТ ТОВАРОВ</h2>
            <p className="font-exo text-xs text-gray-600 mt-0.5">CSV или Excel</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <Icon name="X" size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Формат */}
          <div className="rounded-xl p-4" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Info" size={14} className="text-purple-400" />
              <span className="font-orbitron text-xs font-bold text-purple-400">ФОРМАТ КОЛОНОК</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {["наименование*", "артикул", "цвет", "цена розница", "цена опт", "себестоимость", "количество", "остаток", "код китай", "штрихкод", "вес товара", "габариты упаковки"].map(col => (
                <span key={col} className="font-exo text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-purple-500 inline-block" />
                  {col}
                </span>
              ))}
            </div>
            <p className="font-exo text-xs text-gray-600 mt-2">* Обязательное поле. Разделитель: «;» или «,»</p>
          </div>

          {/* Drop zone */}
          {!result && !loading && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragData(true); }}
                onDragLeave={() => setDragData(false)}
                onDrop={handleDataDrop}
                onClick={() => dataRef.current?.click()}
                className="rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragData ? "#00ffff" : dataFile ? "#a855f7" : "#1e2535"}`,
                  background: dragData ? "rgba(0,255,255,0.03)" : dataFile ? "rgba(168,85,247,0.03)" : "transparent",
                }}
              >
                <input
                  ref={dataRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && setDataFile(e.target.files[0])}
                />
                {dataFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                      <Icon name="FileSpreadsheet" size={20} className="text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-exo font-semibold text-white text-sm">{dataFile.name}</div>
                      <div className="font-exo text-xs text-gray-500">{(dataFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setDataFile(null); }}
                      className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all"
                    >
                      <Icon name="X" size={13} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Icon name="Upload" size={32} className="text-gray-700 mx-auto mb-3" />
                    <p className="font-exo text-sm text-gray-500">Перетащите файл или <span className="neon-text-cyan">нажмите для выбора</span></p>
                    <p className="font-exo text-xs text-gray-700 mt-1">CSV, XLSX — до 10 MB</p>
                  </>
                )}
              </div>

              {error && (
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(255,0,80,0.06)", border: "1px solid rgba(255,0,80,0.2)" }}>
                  <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0" />
                  <p className="font-exo text-sm text-red-300">{error}</p>
                </div>
              )}
            </>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse"
                style={{ border: "2px solid #00ffff", background: "rgba(0,255,255,0.05)" }}>
                <Icon name="Loader" size={26} className="text-cyan-400 animate-spin" />
              </div>
              <p className="font-orbitron text-sm text-white mb-1">Импортируем товары...</p>
              <p className="font-exo text-xs text-gray-500">Проверяем дубли и добавляем записи</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)" }}>
                  <div className="font-orbitron text-2xl font-black neon-text-cyan">{result.added}</div>
                  <div className="font-exo text-xs text-gray-500 mt-1">Добавлено</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}>
                  <div className="font-orbitron text-2xl font-black text-yellow-400">{result.skipped_count}</div>
                  <div className="font-exo text-xs text-gray-500 mt-1">Пропущено</div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1e2535" }}>
                  <div className="font-orbitron text-2xl font-black text-gray-400">{result.total_in_file}</div>
                  <div className="font-exo text-xs text-gray-500 mt-1">В файле</div>
                </div>
              </div>

              {result.skipped.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="AlertTriangle" size={14} className="text-yellow-400" />
                    <span className="font-orbitron text-xs text-yellow-400">ПРОПУЩЕНЫ (уже существуют)</span>
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {result.skipped.map((name, i) => (
                      <div key={i} className="font-exo text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-yellow-600 inline-block flex-shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="rounded-xl p-4" style={{ background: "rgba(255,0,80,0.04)", border: "1px solid rgba(255,0,80,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="XCircle" size={14} className="text-red-400" />
                    <span className="font-orbitron text-xs text-red-400">ОШИБКИ</span>
                  </div>
                  {result.errors.map((e, i) => (
                    <p key={i} className="font-exo text-xs text-gray-500">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all"
            style={{ border: "1px solid #1e2535" }}
          >
            {result ? "Закрыть" : "Отмена"}
          </button>

          {result ? (
            <button onClick={() => { onDone(); onClose(); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient">
              <Icon name="RefreshCw" size={14} /> Обновить список
            </button>
          ) : (
            <button
              onClick={handleImport}
              disabled={!dataFile || loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-40"
            >
              <Icon name="FileUp" size={14} /> Импортировать
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
