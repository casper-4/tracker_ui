"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Pencil } from "lucide-react";
import type { Quest, QuestStatus } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

const STATUS_OPTIONS: { value: QuestStatus; labelKey: "status_open" | "status_planned" | "status_in_progress" | "status_completed" }[] = [
  { value: "open", labelKey: "status_open" },
  { value: "planned", labelKey: "status_planned" },
  { value: "in_progress", labelKey: "status_in_progress" },
  { value: "completed", labelKey: "status_completed" },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec ? `${min} min ${sec} s` : `${min} min`;
}

type Props = {
  quest: Quest;
  onClose: () => void;
  skillColor?: string;
  onQuestChange?: (updated: Quest) => void;
};

export default function QuestDetailModal({
  quest: initialQuest,
  onClose,
  skillColor = "#facc15",
  onQuestChange,
}: Props) {
  const { lang } = useLang();
  const [quest, setQuest] = useState<Quest>(initialQuest);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialQuest.name);
  const [editDescription, setEditDescription] = useState(initialQuest.description);

  useEffect(() => {
    setQuest(initialQuest);
    setEditName(initialQuest.name);
    setEditDescription(initialQuest.description);
  }, [initialQuest]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as QuestStatus;
      const updated = { ...quest, status: value };
      setQuest(updated);
      // TODO: [DATA] persistence will go here
      onQuestChange?.(updated);
    },
    [quest, onQuestChange],
  );

  const handleSaveEdit = useCallback(() => {
    const updated = {
      ...quest,
      name: editName.trim() || quest.name,
      description: editDescription.trim() || quest.description,
    };
    setQuest(updated);
    // TODO: [DATA] persistence will go here
    onQuestChange?.(updated);
    setIsEditing(false);
  }, [quest, editName, editDescription, onQuestChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-detail-title"
    >
      <div
        className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ borderLeftWidth: 4, borderLeftColor: skillColor }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#1f1f1f] shrink-0">
          <h2
            id="quest-detail-title"
            className="text-[10px] text-[#facc15] uppercase tracking-widest"
          >
            {t(lang, "quest_detail_title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#888] hover:text-white transition-colors"
            aria-label={t(lang, "quest_close")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-1">
              {t(lang, "quest_name")}
            </label>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#555]"
                placeholder={t(lang, "quest_name")}
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <p className="text-sm text-white flex-1">{quest.name}</p>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-[#facc15] transition-colors opacity-70 group-hover:opacity-100"
                  title={t(lang, "edit")}
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-1">
              {t(lang, "quest_description")}
            </label>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#555] resize-y"
                placeholder={t(lang, "quest_description")}
              />
            ) : (
              <p className="text-sm text-[#aaa] whitespace-pre-wrap">{quest.description || "—"}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded bg-[#333] hover:bg-[#444] text-white text-sm"
              >
                {t(lang, "quest_save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditName(quest.name);
                  setEditDescription(quest.description);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded border border-[#333] text-[#888] hover:text-white text-sm"
              >
                {t(lang, "quest_cancel")}
              </button>
            </div>
          )}

          {/* Status */}
          <div>
            <label
              htmlFor="quest-status-select"
              className="block text-[10px] uppercase tracking-widest text-[#666] mb-1"
            >
              {t(lang, "quest_status")}
            </label>
            <select
              id="quest-status-select"
              value={quest.status}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#555]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(lang, opt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1f1f1f]">
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-[#666] mb-0.5">ID</span>
              <p className="text-xs text-[#888] font-mono truncate" title={quest.id}>{quest.id}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-[#666] mb-0.5">Skill</span>
              <p className="text-xs text-[#888] font-mono truncate" title={quest.skill}>{quest.skill}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-[#666] mb-0.5">
                {t(lang, "quest_duration")}
              </span>
              <p className="text-xs text-[#aaa]">{formatDuration(quest.duration)}</p>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-[#666] mb-0.5">
                {t(lang, "quest_recurring")}
              </span>
              <p className="text-xs text-[#aaa]">{quest.isRecurring ? "Tak" : "Nie"}</p>
            </div>
          </div>

          {quest.results && quest.results.length > 0 && (
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-[#666] mb-1">Results</span>
              <ul className="space-y-1 text-xs text-[#888]">
                {quest.results.map((r, i) => (
                  <li key={r.id ?? i} className="flex justify-between gap-2">
                    <span>{r.name}</span>
                    <span>{r.rating}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
