import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const IMPORT_URL = "https://functions.poehali.dev/50ca3d4e-e025-4cbf-a5dd-d14395e0d774";

interface PhotoFile {
  name: string;
  mime: string;
  base64: string;
  preview: string;
}

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

const STEPS = ["Файл данных", "Фотографии", "Импорт"];

export default function ImportModal({ onClose, onDone }: ImportModalProps) {
  const [step, setStep] = useState(0);

  // Step 0
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dragData, setDragData] = useState(false);
  const dataRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [dragPhotos, setDragPhotos] = useState(false);
  const photosRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleDataDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragData(false);
    const file = e.dataTransfer.files[0];
    if (file) setDataFile(file);
  }, []);

  const handlePhotoDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragPhotos(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    await addPhotoFiles(files);
  }, []);

  const addPhotoFiles = async (files: File[]) => {
    const newPhotos: PhotoFile[] = await Promise.all(
      files.map(async (f) => ({
        name: f.name,
        mime: f.type || "image/jpeg",
        base64: await fileToBase64(f),
        preview: URL.createObjectURL(f),
      }))
    );
    setPhotos(prev => {
      const existing = new Set(prev.map(p => p.name));
      return [...prev, ...newPhotos.filter(p => !existing.has(p.name))];
    });
  };

  const removePhoto = (name: string) => {
    setPhotos(prev => prev.filter(p => p.name !== name));
  };

  const handleImport = async () => {
    if (!dataFile) return;
    setLoading(true);
    setError("");
    setResult(null);

    const file_base64 = await fileToBase64(dataFile);
    const body = {
      file_base64,
      filename: dataFile.name,
      photos: photos.map(({ name, mime, base64 }) => ({ name, mime, base64 })),
    };

    const res = await fetch(IMPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
        className="w-full max-w-2xl rounded-2xl animate-fade-in flex flex-col"
        style={{ background: "#0a0e18", border: "1px solid #1e2535", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          <div>
            <h2 className="font-orbitron text-base font-black gradient-text">ИМПОРТ ТОВАРОВ</h2>
            <p className="font-exo text-xs text-gray-600 mt-0.5">CSV или Excel + фотографии</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <Icon name="X" size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-0 px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-orbitron text-xs font-bold transition-all"
                  style={
                    i < step
                      ? { background: "linear-gradient(135deg,#00ffff,#a855f7)", color: "#000" }
                      : i === step
                      ? { border: "1px solid #00ffff", color: "#00ffff" }
                      : { border: "1px solid #1e2535", color: "#4b5563" }
                  }
                >
                  {i < step ? <Icon name="Check" size={12} /> : i + 1}
                </div>
                <span
                  className="font-exo text-xs hidden sm:block"
                  style={{ color: i === step ? "#fff" : i < step ? "#00ffff" : "#4b5563" }}
                >
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-8 sm:w-12 h-px mx-2" style={{ background: i < step ? "#00ffff40" : "#1e2535" }} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 0 — Файл данных */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <p className="font-exo text-sm text-gray-400">
                Загрузите файл <span className="neon-text-cyan font-semibold">.csv</span> или <span className="neon-text-cyan font-semibold">.xlsx</span> с данными товаров.
              </p>

              {/* Format hint */}
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
              <div
                onDragOver={e => { e.preventDefault(); setDragData(true); }}
                onDragLeave={() => setDragData(false)}
                onDrop={handleDataDrop}
                onClick={() => dataRef.current?.click()}
                className="relative rounded-xl p-8 text-center cursor-pointer transition-all"
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
            </div>
          )}

          {/* STEP 1 — Фотографии */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="font-exo text-sm text-gray-400">
                Загрузите фотографии товаров. Имя файла должно совпадать с <span className="neon-text-cyan">наименованием</span> или <span className="neon-text-cyan">артикулом</span> товара.
              </p>

              <div className="rounded-xl p-3" style={{ background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.15)" }}>
                <div className="flex items-start gap-2">
                  <Icon name="Lightbulb" size={14} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                  <p className="font-exo text-xs text-gray-400 leading-relaxed">
                    Пример: товар «iPhone 15 Pro» — фото назовите <span className="text-cyan-300">iphone 15 pro.jpg</span>.<br />
                    Регистр не важен. Шаг необязательный — можно пропустить.
                  </p>
                </div>
              </div>

              {/* Photo drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragPhotos(true); }}
                onDragLeave={() => setDragPhotos(false)}
                onDrop={handlePhotoDrop}
                onClick={() => photosRef.current?.click()}
                className="rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragPhotos ? "#00ffff" : "#1e2535"}`,
                  background: dragPhotos ? "rgba(0,255,255,0.03)" : "transparent",
                }}
              >
                <input
                  ref={photosRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async e => e.target.files && await addPhotoFiles(Array.from(e.target.files))}
                />
                <Icon name="Images" size={28} className="text-gray-700 mx-auto mb-2" />
                <p className="font-exo text-sm text-gray-500">Перетащите фото или <span className="neon-text-cyan">нажмите для выбора</span></p>
                <p className="font-exo text-xs text-gray-700 mt-1">JPG, PNG, WEBP — несколько файлов сразу</p>
              </div>

              {/* Photos grid */}
              {photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-orbitron text-xs text-gray-500">{photos.length} фото загружено</span>
                    <button onClick={() => setPhotos([])} className="font-exo text-xs text-red-400 hover:text-red-300 transition-colors">
                      Удалить все
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                    {photos.map(ph => (
                      <div key={ph.name} className="relative group rounded-xl overflow-hidden aspect-square" style={{ border: "1px solid #1e2535" }}>
                        <img src={ph.preview} alt={ph.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <p className="font-exo text-xs text-white text-center line-clamp-2 leading-tight">{ph.name}</p>
                          <button onClick={() => removePhoto(ph.name)} className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500/20 border border-red-500/40">
                            <Icon name="X" size={10} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — Импорт */}
          {step === 2 && (
            <div className="animate-fade-in">
              {!result && !loading && !error && (
                <div className="text-center py-4 space-y-4">
                  <div className="glass-card rounded-xl p-4 text-left space-y-2">
                    <div className="flex justify-between font-exo text-sm">
                      <span className="text-gray-500">Файл данных</span>
                      <span className="text-white">{dataFile?.name}</span>
                    </div>
                    <div className="flex justify-between font-exo text-sm">
                      <span className="text-gray-500">Фотографии</span>
                      <span className="text-white">{photos.length} шт.</span>
                    </div>
                  </div>
                  <p className="font-exo text-sm text-gray-400">
                    Дубли по наименованию будут автоматически пропущены (без учёта регистра).
                  </p>
                  <button onClick={handleImport} className="px-10 py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient">
                    ЗАПУСТИТЬ ИМПОРТ
                  </button>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse" style={{ border: "2px solid #00ffff", background: "rgba(0,255,255,0.05)" }}>
                    <Icon name="Loader" size={28} className="text-cyan-400 animate-spin" />
                  </div>
                  <p className="font-orbitron text-sm text-white mb-1">Импортируем товары...</p>
                  <p className="font-exo text-xs text-gray-500">Загружаем фото и добавляем записи в базу</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(255,0,80,0.1)", border: "1px solid rgba(255,0,80,0.3)" }}>
                    <Icon name="AlertCircle" size={26} className="text-red-400" />
                  </div>
                  <p className="font-orbitron text-sm text-red-400 mb-2">Ошибка импорта</p>
                  <p className="font-exo text-sm text-gray-500 mb-4">{error}</p>
                  <button onClick={() => { setError(""); }} className="px-6 py-2 rounded-xl font-exo text-sm btn-neon-cyan">
                    Попробовать снова
                  </button>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Summary */}
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

                  {/* Skipped list */}
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

                  <button
                    onClick={() => { onDone(); onClose(); }}
                    className="w-full py-3 rounded-xl font-orbitron text-sm font-bold btn-gradient"
                  >
                    ГОТОВО — ОБНОВИТЬ СПИСОК
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!loading && !result && (
          <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e2535" }}>
            <button
              onClick={() => step > 0 ? setStep(s => s - 1) : onClose()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all"
              style={{ border: "1px solid #1e2535" }}
            >
              <Icon name="ChevronLeft" size={15} />
              {step === 0 ? "Отмена" : "Назад"}
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 && !dataFile}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-40"
              >
                Далее <Icon name="ChevronRight" size={15} />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
