"use client";

import { useState, useRef } from "react";

// Preset palette — matches skill colors from copilot-instructions
export const PRESET_COLORS = [
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f59e0b",
  "#f97316",
  "#22c55e",
  "#d946ef",
  "#facc15",
  "#3b82f6",
  "#ef4444",
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
      {/* Color swatch circle */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-9 h-9 rounded-full border-2 border-[#333] hover:border-[#555] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#facc15] hover:scale-110"
        style={{ backgroundColor: color }}
      />

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 z-50"
          onMouseEnter={() => {
            clearClose();
            setIsOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <div className="p-3 rounded bg-[#1a1a1a] border border-[#333] shadow-xl w-[180px]">
            {!showCustom ? (
              <>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 focus:outline-none"
                      style={{
                        backgroundColor: preset,
                        borderColor:
                          preset === color ? "#facc15" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left text-[10px] uppercase tracking-widest text-[#666] hover:text-[#888] py-1 transition-colors"
                >
                  Custom
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-3">
                  <input
                    type="color"
                    value={isValidHex(color) ? color : "#888888"}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      onChange(e.target.value);
                      // TODO: [DATA] save skill color to persistence
                    }}
                    className="w-full h-8 cursor-pointer rounded border border-[#333] bg-transparent"
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomConfirm();
                    }}
                    placeholder="#facc15"
                    maxLength={7}
                    className="flex-1 bg-[#0a0a0a] border border-[#333] text-[11px] font-mono text-[#e0e0e0] placeholder-[#444] px-2 py-1 rounded focus:outline-none focus:border-[#facc15]"
                  />
                  <button
                    type="button"
                    onClick={handleCustomConfirm}
                    className="px-2 py-1 text-[10px] uppercase tracking-widest bg-[#facc15]/10 hover:bg-[#facc15]/20 text-[#facc15] border border-[#facc15]/30 rounded transition-colors"
                  >
                    OK
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustom(false)}
                  className="mt-2 w-full text-left text-[10px] uppercase tracking-widest text-[#444] hover:text-[#666] transition-colors"
                >
                  ← back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
