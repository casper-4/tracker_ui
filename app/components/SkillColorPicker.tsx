"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// Design system accents + common skill colors
export const PRESET_COLORS = [
  "#00FF9F",
  "#F3E600",
  "#55EAD4",
  "#FF2060",
  "#C840FF",
  "#a855f7",
  "#ec4899",
  "#3b82f6",
  "#f97316",
  "#22c55e",
];

// TODO: [UI] add hex validation & conversion helper (support rgb/hsl input → hex output)
export function isValidHex(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

const DROPDOWN_CLOSE_DELAY_MS = 150;

type Props = {
  color: string;
  onChange: (color: string) => void;
};

export default function SkillColorPicker({ color, onChange }: Props) {
  const { lang } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("");
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearClose();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setShowCustom(false);
      setCustomHex("");
    }, DROPDOWN_CLOSE_DELAY_MS);
  };

  const handlePresetSelect = (preset: string) => {
    onChange(preset);
    // TODO: [DATA] save skill color to persistence
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomConfirm = () => {
    const trimmed = customHex.trim();
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (isValidHex(withHash)) {
      onChange(withHash);
      // TODO: [DATA] save skill color to persistence
      setIsOpen(false);
      setShowCustom(false);
      setCustomHex("");
    }
  };

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => {
        clearClose();
        setIsOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger button — swatch + hex code */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-[7px] border border-white/9 hover:border-white/20 active:scale-[0.96] transition-all cursor-pointer focus:outline-none"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <span
          className="w-4 h-4 rounded-full shrink-0"
          style={{
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}80`,
          }}
        />
        <span className="w-px h-3 bg-white/10 shrink-0" />
        <span
          className="text-[9px] uppercase tracking-[0.15em] font-mono"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {color.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 z-[200]"
          onMouseEnter={() => {
            clearClose();
            setIsOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <div
            className="p-4 rounded-[14px] shadow-xl w-[200px]"
            style={{
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderTop: "1px solid rgba(255,255,255,0.16)",
              backdropFilter: "blur(24px)",
            }}
          >
            {!showCustom ? (
              <>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-3">
                  {t(lang, "skill_color")}
                </p>
                <div className="grid grid-cols-5 gap-2.5 mb-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className="w-7 h-7 rounded-full transition-all hover:scale-110 active:scale-95 focus:outline-none"
                      style={{
                        backgroundColor: preset,
                        boxShadow:
                          preset === color
                            ? `0 0 10px ${preset}99, 0 0 0 2px ${preset}60`
                            : "none",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left text-[10px] uppercase tracking-[0.08em] text-white/30 hover:text-white/55 border-t border-white/6 pt-2.5 mt-1 transition-colors"
                >
                  {t(lang, "color_custom")}
                </button>
              </>
            ) : (
              <>
                <p className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-3">
                  {t(lang, "color_custom")}
                </p>
                <div className="flex items-center justify-center mb-3">
                  <input
                    type="color"
                    value={isValidHex(color) ? color : "#888888"}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      onChange(e.target.value);
                      // TODO: [DATA] save skill color to persistence
                    }}
                    className="w-full h-8 cursor-pointer rounded-[7px] border border-white/9 bg-transparent"
                  />
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomConfirm();
                    }}
                    placeholder="#F3E600"
                    maxLength={7}
                    className="flex-1 bg-[#0A0A0A] border border-white/9 text-[11px] font-mono text-white/70 placeholder-white/18 px-2 py-1.5 rounded-[7px] focus:outline-none focus:border-white/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleCustomConfirm}
                    className="px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] font-bold bg-[#F3E600]/10 hover:bg-[#F3E600]/20 text-[#F3E600] border border-[#F3E600]/30 rounded-[7px] transition-colors active:scale-[0.96]"
                  >
                    {t(lang, "color_confirm")}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="mt-2.5 w-full text-left text-[10px] uppercase tracking-[0.08em] text-white/20 hover:text-white/40 transition-colors"
                >
                  {t(lang, "color_back")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
