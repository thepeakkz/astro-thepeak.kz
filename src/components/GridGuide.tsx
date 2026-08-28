"use client";

import { useEffect, useState } from "react";

interface GridSettings {
  visible: boolean;
  panelOpen: boolean;
  columns: boolean;
  outline: boolean;
  baseline: boolean;
  axis: boolean;
  opacity: number;
}

const STORAGE_KEY = "thepeak_grid_settings";

const defaultSettings: GridSettings = {
  visible: false,
  panelOpen: false,
  columns: true,
  outline: true,
  baseline: false,
  axis: true,
  opacity: 50,
};

export default function GridGuide() {
  const [settings, setSettings] = useState<GridSettings>(defaultSettings);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [mounted, setMounted] = useState(false);

  // Load initial settings on client
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  // Update viewport size
  useEffect(() => {
    if (!mounted) return;
    const updateSize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [mounted]);

  // Persist settings
  const updateSettings = (updates: Partial<GridSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Keyboard shortcut listener (G / Russian П)
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "g" || e.key === "G" || e.key === "п" || e.key === "П") {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setSettings((prev) => {
            const nextVisible = !prev.visible;
            const next = {
              ...prev,
              visible: nextVisible,
              panelOpen: nextVisible && !prev.panelOpen ? true : prev.panelOpen,
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted]);

  if (!mounted) return null;

  const w = viewport.width;
  const breakpoint =
    w >= 1280
      ? { text: "Desktop XL (≥1280)", badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" }
      : w >= 1024
      ? { text: "Laptop LG (≥1024)", badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" }
      : w >= 768
      ? { text: "Tablet MD (≥768)", badgeClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" }
      : w >= 640
      ? { text: "Small SM (≥640)", badgeClass: "bg-blue-500/20 text-blue-300 border border-blue-500/30" }
      : { text: "Mobile (<640)", badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/30" };

  return (
    <>
      {/* ---------------- Grid Overlay (Fixed) ---------------- */}
      <div
        id="thepeak-grid-overlay"
        className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-150 ${
          settings.visible ? "block" : "hidden"
        }`}
        style={{
          opacity: settings.opacity / 100,
        }}
        aria-hidden="true"
      >
        {/* Margin Guides */}
        {settings.outline ? (
          <div
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{
              borderLeft: "var(--page-margin, clamp(1rem, 3vw, 4rem)) solid rgba(253, 75, 50, 0.04)",
              borderRight: "var(--page-margin, clamp(1rem, 3vw, 4rem)) solid rgba(253, 75, 50, 0.04)",
            }}
          />
        ) : null}

        {/* 12-Column Swiss Grid Container */}
        {settings.columns ? (
          <div className="swiss-grid h-full relative box-border">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="relative h-full border-x border-[#fd4b32]/25 bg-[#fd4b32]/[0.08] box-border"
              >
                <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold text-[#fd4b32] bg-white/90 px-1.5 py-0.5 leading-none border border-[#fd4b32]/25">
                  {i + 1}
                </span>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold text-[#fd4b32] bg-white/90 px-1.5 py-0.5 leading-none border border-[#fd4b32]/25">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Baseline horizontal grid (24px) */}
        {settings.baseline ? (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 23px, rgba(253, 75, 50, 0.2) 24px)",
              backgroundSize: "100% 24px",
            }}
          />
        ) : null}

        {/* Center Axis Line */}
        {settings.axis ? (
          <div
            className="absolute top-0 bottom-0 left-1/2 w-px bg-blue-600 -translate-x-1/2 pointer-events-none"
            style={{ boxShadow: "0 0 4px rgba(37, 99, 235, 0.5)" }}
          />
        ) : null}
      </div>

      {/* ---------------- Floating HUD Control Panel ---------------- */}
      <div className="fixed bottom-6 right-6 z-[10000] font-sans">
        {/* Minimized trigger button */}
        <button
          type="button"
          onClick={() => {
            if (!settings.visible) {
              updateSettings({ visible: true, panelOpen: true });
            } else {
              updateSettings({ panelOpen: !settings.panelOpen });
            }
          }}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 bg-[#1a1a1a]/95 backdrop-blur-md border border-white/20 text-white cursor-pointer text-[0.82rem] font-semibold shadow-2xl hover:bg-black hover:border-[#fd4b32]/60 hover:-translate-y-0.5 transition-all select-none"
          title="Показать/скрыть сетку (Горячая клавиша: G)"
          aria-label="Сетка: переключить оверлей"
        >
          <svg className="w-4 h-4 text-[#fd4b32]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="0" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
          <span className="tracking-wide">Сетка</span>
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              settings.visible ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-neutral-500"
            }`}
          />
        </button>

        {/* Expanded Controls Panel */}
        {settings.panelOpen ? (
          <div className="absolute bottom-[calc(100%+0.75rem)] right-0 w-[19rem] max-w-[calc(100vw-2rem)] bg-[#161617]/95 backdrop-blur-xl border border-white/15 text-neutral-100 p-5 shadow-2xl flex flex-col gap-4.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <strong className="text-[0.88rem] font-semibold text-white tracking-tight">Сетка и Направляющие</strong>
                <span className={`text-[0.65rem] font-bold px-2 py-0.5 uppercase tracking-wider ${breakpoint.badgeClass}`}>
                  {breakpoint.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ panelOpen: false })}
                className="bg-transparent border-none text-neutral-400 text-xl leading-none cursor-pointer p-1 hover:text-white transition-colors"
                title="Свернуть панель"
                aria-label="Свернуть"
              >
                ×
              </button>
            </div>

            {/* Stats Block */}
            <div className="grid grid-cols-2 gap-2 bg-black/35 p-2.5 border border-white/5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] uppercase tracking-wider text-neutral-400">Вьюпорт</span>
                <span className="text-[0.76rem] font-semibold text-neutral-200">
                  {viewport.width}px × {viewport.height}px ({(viewport.width / 16).toFixed(1)}rem)
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] uppercase tracking-wider text-neutral-400">Сетка (Swiss Grid)</span>
                <span className="text-[0.76rem] font-semibold text-neutral-200">12 колонок</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-2.5">
              <label className="flex items-center gap-2.5 text-[0.8rem] cursor-pointer select-none text-neutral-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.columns}
                  onChange={(e) => updateSettings({ columns: e.target.checked })}
                  className="w-4 h-4 accent-[#fd4b32] cursor-pointer"
                />
                <span>12 Колонок</span>
              </label>

              <label className="flex items-center gap-2.5 text-[0.8rem] cursor-pointer select-none text-neutral-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.outline}
                  onChange={(e) => updateSettings({ outline: e.target.checked })}
                  className="w-4 h-4 accent-[#fd4b32] cursor-pointer"
                />
                <span>Поля страницы (Margin)</span>
              </label>

              <label className="flex items-center gap-2.5 text-[0.8rem] cursor-pointer select-none text-neutral-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.baseline}
                  onChange={(e) => updateSettings({ baseline: e.target.checked })}
                  className="w-4 h-4 accent-[#fd4b32] cursor-pointer"
                />
                <span>Базовая сетка (24px)</span>
              </label>

              <label className="flex items-center gap-2.5 text-[0.8rem] cursor-pointer select-none text-neutral-200 hover:text-white">
                <input
                  type="checkbox"
                  checked={settings.axis}
                  onChange={(e) => updateSettings({ axis: e.target.checked })}
                  className="w-4 h-4 accent-[#fd4b32] cursor-pointer"
                />
                <span>Центральная ось</span>
              </label>
            </div>

            {/* Opacity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[0.72rem] text-neutral-400">
                <span>Прозрачность</span>
                <span>{settings.opacity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.opacity}
                onChange={(e) => updateSettings({ opacity: Number(e.target.value) })}
                className="w-full accent-[#fd4b32] cursor-pointer"
              />
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[0.68rem] text-neutral-400">
                Клавиша <kbd className="bg-white/15 text-white px-1.5 py-0.5 text-xs font-mono border border-white/20">G</kbd> — вкл/выкл сетку
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
