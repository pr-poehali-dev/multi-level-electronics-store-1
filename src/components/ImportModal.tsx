import { useState, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const IMPORT_URL = "https://functions.poehali.dev/50ca3d4e-e025-4cbf-a5dd-d14395e0d774";

interface DbField { key: string; label: string; }
interface PreviewData {
  headers: string[];
  preview_rows: string[][];
  auto_mapping: Record<string, string>;
  db_fields: DbField[];
  total_rows: number;
}
interface ImportResult {
  added: number;
  skipped_count: number;
  skipped: string[];
  errors: string[];
  total_in_file: number;
}
interface ImportModalProps { onClose: () => void; onDone: () => void; }

function buildForm(file: File, action: string, extra?: Record<string, string>): FormData {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("action", action);
  if (extra) Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

const STEPS = ["Файл", "Маппинг колонок", "Результат"];

export default function ImportModal({ onClose, onDone }: ImportModalProps) {
  const [step, setStep] = useState(0);

  const [dataFile, setDataFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (!f) return;
    if (f.name.toLowerCase().endsWith(".xls")) {
      setError("Формат .xls не поддерживается. Пересохраните файл как .xlsx");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("Файл слишком большой (максимум 50 МБ)");
      return;
    }
    setError("");
    setDataFile(f);
  }, []);

  const loadPreview = async () => {
    if (!dataFile) return;
    setLoadingPreview(true); setError("");
    try {
      setLoadingStatus(`Отправляем (${(dataFile.size / 1024 / 1024).toFixed(1)} МБ)...`);
      const res = await fetch(IMPORT_URL, {
        method: "POST",
        body: buildForm(dataFile, "preview"),
      });
      setLoadingStatus("Обрабатываем...");
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); }
      catch { setError(`Неожиданный ответ сервера: ${text.slice(0, 300)}`); setLoadingPreview(false); return; }
      setLoadingPreview(false); setLoadingStatus("");
      if (!res.ok) { setError((data.error as string) || `Ошибка ${res.status}`); return; }
      setPreview(data as unknown as PreviewData);
      setMapping((data.auto_mapping as Record<string, string>) || {});
      setStep(1);
    } catch (e) {
      setLoadingPreview(false); setLoadingStatus("");
      setError(`Ошибка сети: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const runImport = async () => {
    if (!dataFile || !preview) return;
    setImporting(true); setError(""); setStep(2);
    try {
      const res = await fetch(IMPORT_URL, {
        method: "POST",
        body: buildForm(dataFile, "import", { mapping: JSON.stringify(mapping) }),
      });
      const data = await res.json();
      setImporting(false);
      if (!res.ok) { setError(data.error || "Ошибка импорта"); setStep(1); return; }
      setResult(data);
    } catch (e) {
      setImporting(false);
      setError(`Ошибка сети: ${e instanceof Error ? e.message : String(e)}`);
      setStep(1);
    }
  };

  const setColMapping = (fileCol: string, dbField: string) => {
    setMapping(prev => {
      const next = { ...prev };
      if (dbField) {
        Object.keys(next).forEach(k => { if (next[k] === dbField && k !== fileCol) delete next[k]; });
        next[fileCol] = dbField;
      } else {
        delete next[fileCol];
      }
      return next;
    });
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const hasName = Object.values(mapping).includes("naimenovanie");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}>
      <div className="w-full max-w-3xl rounded-2xl animate-fade-in flex flex-col"
        style={{ background: "#0a0e18", border: "1px solid #1e2535", maxHeight: "92vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          <div>
            <h2 className="font-orbitron text-base font-black gradient-text">ИМПОРТ ТОВАРОВ</h2>
            <p className="font-exo text-xs text-gray-600 mt-0.5">CSV или Excel — выберите соответствие колонок</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <Icon name="X" size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex items-center px-6 py-3 border-b flex-shrink-0 gap-1" style={{ borderColor: "#1e2535" }}>
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-orbitron text-xs font-bold"
                  style={i < step ? { background: "linear-gradient(135deg,#00ffff,#a855f7)", color: "#000" }
                    : i === step ? { border: "1px solid #00ffff", color: "#00ffff" }
                    : { border: "1px solid #1e2535", color: "#4b5563" }}>
                  {i < step ? <Icon name="Check" size={11} /> : i + 1}
                </div>
                <span className="font-exo text-xs hidden sm:block"
                  style={{ color: i === step ? "#fff" : i < step ? "#00ffff" : "#4b5563" }}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="w-6 sm:w-10 h-px mx-2" style={{ background: i < step ? "#00ffff40" : "#1e2535" }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* STEP 0: выбор файла */}
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="rounded-xl p-10 text-center cursor-pointer transition-all"
                style={{ border: `2px dashed ${drag ? "#00ffff" : dataFile ? "#a855f7" : "#1e2535"}`, background: drag ? "rgba(0,255,255,0.03)" : dataFile ? "rgba(168,85,247,0.03)" : "transparent" }}>
                <input ref={fileRef} type="file" accept=".csv,.xlsx,.txt" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.name.toLowerCase().endsWith(".xls")) {
                      setError("Формат .xls не поддерживается. Пожалуйста, пересохраните файл в Excel как .xlsx (Файл → Сохранить как → Excel Workbook .xlsx)");
                      return;
                    }
                    if (f.size > 50 * 1024 * 1024) {
                      setError("Файл слишком большой (максимум 50 МБ). Разбейте на части.");
                      return;
                    }
                    setError("");
                    setDataFile(f);
                  }} />
                {dataFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}>
                      <Icon name="FileSpreadsheet" size={20} className="text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-exo font-semibold text-white text-sm">{dataFile.name}</div>
                      <div className="font-exo text-xs text-gray-500">{(dataFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setDataFile(null); }}
                      className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-all">
                      <Icon name="X" size={13} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Icon name="Upload" size={36} className="text-gray-700 mx-auto mb-3" />
                    <p className="font-exo text-sm text-gray-500">Перетащите или <span className="neon-text-cyan">нажмите для выбора</span></p>
                    <p className="font-exo text-xs text-gray-700 mt-1">CSV, XLSX</p>
                  </>
                )}
              </div>
              {error && (
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(255,0,80,0.06)", border: "1px solid rgba(255,0,80,0.2)" }}>
                  <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                  <p className="font-exo text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: маппинг колонок */}
          {step === 1 && preview && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)" }}>
                <Icon name="Info" size={15} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="font-exo text-xs text-gray-400 leading-relaxed">
                  Файл: <span className="text-white font-semibold">{preview.total_rows}</span> строк,
                  {" "}<span className="text-white font-semibold">{preview.headers.length}</span> колонок.
                  Для каждой колонки укажите поле базы. Поле <span className="neon-text-cyan">«Наименование»</span> обязательно.
                  {Object.keys(preview.auto_mapping).length > 0 && <span className="text-cyan-400"> Часть полей определена автоматически — проверьте.</span>}
                </div>
              </div>

              {/* Маппинг-таблица */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e2535" }}>
                <div className="grid gap-3 px-4 py-2.5 items-center"
                  style={{ gridTemplateColumns: "1fr 20px 1fr", background: "rgba(0,255,255,0.03)", borderBottom: "1px solid #1e2535" }}>
                  <span className="font-orbitron text-xs font-bold neon-text-cyan">КОЛОНКА В ФАЙЛЕ</span>
                  <span />
                  <span className="font-orbitron text-xs font-bold text-purple-400">ПОЛЕ В БАЗЕ ДАННЫХ</span>
                </div>

                {preview.headers.map((col) => {
                  const selectedDb = mapping[col] || "";
                  const isLinked = !!selectedDb;
                  const isRequired = selectedDb === "naimenovanie";
                  const exampleIdx = preview.headers.indexOf(col);
                  const example = preview.preview_rows[0]?.[exampleIdx] || "";

                  return (
                    <div key={col} className="grid gap-3 px-4 py-3 items-center transition-colors hover:bg-white/[0.015]"
                      style={{ gridTemplateColumns: "1fr 20px 1fr", borderBottom: "1px solid #0d1117" }}>
                      <div className="min-w-0">
                        <div className="font-exo font-semibold text-sm text-white truncate">{col}</div>
                        {example && <div className="font-exo text-xs text-gray-600 mt-0.5 truncate">→ {example}</div>}
                      </div>

                      <Icon name="ArrowRight" size={13}
                        style={{ color: isRequired ? "#00ffff" : isLinked ? "#a855f7" : "#2d3748" }} />

                      <select
                        value={selectedDb}
                        onChange={e => setColMapping(col, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg font-exo text-sm outline-none cursor-pointer transition-all"
                        style={{
                          background: isRequired ? "rgba(0,255,255,0.06)" : isLinked ? "rgba(168,85,247,0.06)" : "#060810",
                          border: `1px solid ${isRequired ? "rgba(0,255,255,0.3)" : isLinked ? "rgba(168,85,247,0.3)" : "#1e2535"}`,
                          color: isLinked ? "#fff" : "#6b7280",
                        }}>
                        <option value="">— не импортировать —</option>
                        {preview.db_fields.map(f => (
                          <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Предпросмотр */}
              {preview.preview_rows.length > 0 && (
                <details className="group">
                  <summary className="font-orbitron text-xs text-gray-600 cursor-pointer hover:text-gray-400 transition-colors tracking-wider list-none flex items-center gap-2">
                    <Icon name="ChevronRight" size={12} className="group-open:rotate-90 transition-transform" />
                    ПРЕДПРОСМОТР ДАННЫХ (первые {preview.preview_rows.length} строки)
                  </summary>
                  <div className="mt-2 rounded-xl overflow-x-auto" style={{ border: "1px solid #1e2535" }}>
                    <table className="text-left w-full" style={{ minWidth: preview.headers.length * 130 }}>
                      <thead>
                        <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #1e2535" }}>
                          {preview.headers.map(h => (
                            <th key={h} className="px-3 py-2 font-exo text-xs text-gray-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.preview_rows.map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: "1px solid #0d1117" }}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-3 py-1.5 font-exo text-xs text-gray-400 whitespace-nowrap max-w-[160px] truncate">{cell || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              {/* Статус */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-exo text-xs text-gray-500">
                  Привязано: <span className="text-white font-semibold">{mappedCount}</span> из {preview.headers.length} колонок
                </span>
                {!hasName && (
                  <span className="flex items-center gap-1 font-exo text-xs text-yellow-400">
                    <Icon name="AlertTriangle" size={12} /> Обязательно привяжите «Наименование»
                  </span>
                )}
                {hasName && (
                  <span className="flex items-center gap-1 font-exo text-xs text-green-400">
                    <Icon name="CheckCircle" size={12} /> Готово к импорту
                  </span>
                )}
              </div>

              {error && (
                <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(255,0,80,0.06)", border: "1px solid rgba(255,0,80,0.2)" }}>
                  <Icon name="AlertCircle" size={14} className="text-red-400 flex-shrink-0" />
                  <p className="font-exo text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: результат */}
          {step === 2 && (
            <div className="animate-fade-in">
              {importing ? (
                <div className="text-center py-14">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse"
                    style={{ border: "2px solid #00ffff", background: "rgba(0,255,255,0.05)" }}>
                    <Icon name="Loader" size={26} className="text-cyan-400 animate-spin" />
                  </div>
                  <p className="font-orbitron text-sm text-white mb-1">Импортируем...</p>
                  <p className="font-exo text-xs text-gray-500">Проверяем дубли и добавляем записи в базу</p>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: result.added, label: "Добавлено", color: "#00ffff", bg: "rgba(0,255,255,0.05)", border: "rgba(0,255,255,0.2)" },
                      { value: result.skipped_count, label: "Пропущено", color: "#fbbf24", bg: "rgba(251,191,36,0.05)", border: "rgba(251,191,36,0.2)" },
                      { value: result.total_in_file, label: "В файле", color: "#9ca3af", bg: "rgba(255,255,255,0.02)", border: "#1e2535" },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <div className="font-orbitron text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="font-exo text-xs text-gray-500 mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {result.skipped.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="AlertTriangle" size={13} className="text-yellow-400" />
                        <span className="font-orbitron text-xs text-yellow-400">ПРОПУЩЕНЫ (уже существуют)</span>
                      </div>
                      <div className="max-h-28 overflow-y-auto space-y-1">
                        {result.skipped.map((n, i) => (
                          <div key={i} className="font-exo text-xs text-gray-500 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-yellow-600 inline-block flex-shrink-0" />{n}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.errors.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: "rgba(255,0,80,0.04)", border: "1px solid rgba(255,0,80,0.15)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="XCircle" size={13} className="text-red-400" />
                        <span className="font-orbitron text-xs text-red-400">ОШИБКИ</span>
                      </div>
                      {result.errors.map((e, i) => <p key={i} className="font-exo text-xs text-gray-500">{e}</p>)}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e2535" }}>
          <button
            onClick={step > 0 && !importing && !result ? () => setStep(s => s - 1) : onClose}
            disabled={importing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-exo text-sm text-gray-400 hover:text-white transition-all disabled:opacity-40"
            style={{ border: "1px solid #1e2535" }}>
            {step > 0 && !result ? <><Icon name="ChevronLeft" size={14} /> Назад</> : "Закрыть"}
          </button>

          {step === 0 && (
            <button onClick={loadPreview} disabled={!dataFile || loadingPreview}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-40">
              {loadingPreview
                ? <><Icon name="Loader" size={14} className="animate-spin" /> {loadingStatus || "Загрузка..."}</>
                : <>Далее <Icon name="ChevronRight" size={14} /></>}
            </button>
          )}

          {step === 1 && (
            <button onClick={runImport} disabled={!hasName || importing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient disabled:opacity-40">
              <Icon name="FileUp" size={14} />
              Импортировать ({preview?.total_rows} строк)
            </button>
          )}

          {step === 2 && result && !importing && (
            <button onClick={() => { onDone(); onClose(); }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-orbitron text-sm font-bold btn-gradient">
              <Icon name="RefreshCw" size={14} /> Обновить список
            </button>
          )}
        </div>
      </div>
    </div>
  );
}