"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pencil, Camera, Video, Paperclip, RefreshCw } from "lucide-react";
import type { Quest, QuestStatus } from "@/lib/mock";
import { MOCK_STATUS_COLORS } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

const PANEL_WIDTH = 420;

const STATUS_OPTIONS: {
  value: QuestStatus;
  labelKey:
    | "status_open"
    | "status_planned"
    | "status_in_progress"
    | "status_completed";
}[] = [
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

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  quest: Quest;
  onClose: () => void;
  skillColor?: string;
  skillName?: string;
  onQuestChange?: (updated: Quest) => void;
};

export default function QuestDetailPanel({
  quest: initialQuest,
  onClose,
  skillColor = "#facc15",
  skillName,
  onQuestChange,
}: Props) {
  const { lang } = useLang();
  const [quest, setQuest] = useState<Quest>(initialQuest);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(
    initialQuest.description,
  );
  const [editActualDuration, setEditActualDuration] = useState(
    initialQuest.actualDuration != null
      ? String(Math.round(initialQuest.actualDuration / 60))
      : "",
  );
  const [isEditingActual, setIsEditingActual] = useState(false);
  const [editComment, setEditComment] = useState(initialQuest.comment ?? "");
  const [historyExpanded, setHistoryExpanded] = useState(false);

  useEffect(() => {
    setQuest(initialQuest);
    setEditDescription(initialQuest.description);
    setEditActualDuration(
      initialQuest.actualDuration != null
        ? String(Math.round(initialQuest.actualDuration / 60))
        : "",
    );
    setEditComment(initialQuest.comment ?? "");
    setIsEditing(false);
    setIsEditingActual(false);
    setHistoryExpanded(false);
  }, [initialQuest.id]);

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as QuestStatus;
      const entry = { status: value, timestamp: Date.now() };
      const updated: Quest = {
        ...quest,
        status: value,
        statusChangelog: [...(quest.statusChangelog ?? []), entry],
      };
      setQuest(updated);
      // TODO: [DATA] persistence will go here
      onQuestChange?.(updated);
    },
    [quest, onQuestChange],
  );

  const handleToggleRecurring = useCallback(() => {
    const updated = { ...quest, isRecurring: !quest.isRecurring };
    setQuest(updated);
    // TODO: [DATA] persistence will go here
    onQuestChange?.(updated);
  }, [quest, onQuestChange]);

  const handleSaveDescription = useCallback(() => {
    const updated = {
      ...quest,
      description: editDescription.trim() || quest.description,
    };
    setQuest(updated);
    // TODO: [DATA] persistence will go here
    onQuestChange?.(updated);
    setIsEditing(false);
  }, [quest, editDescription, onQuestChange]);

  const handleSaveActualDuration = useCallback(() => {
    const mins = parseInt(editActualDuration, 10);
    const actualDuration = isNaN(mins) || mins <= 0 ? undefined : mins * 60;
    const updated = { ...quest, actualDuration };
    setQuest(updated);
    // TODO: [DATA] persistence will go here
    onQuestChange?.(updated);
    setIsEditingActual(false);
  }, [quest, editActualDuration, onQuestChange]);

  const handleSaveComment = useCallback(() => {
    const updated = { ...quest, comment: editComment.trim() || undefined };
    setQuest(updated);
    // TODO: [DATA] persistence will go here
    onQuestChange?.(updated);
  }, [quest, editComment, onQuestChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusColor = MOCK_STATUS_COLORS[quest.status];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: PANEL_WIDTH, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
      className="h-full bg-[#0a0a0a] flex flex-col overflow-hidden shrink-0"
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: "solid",
        borderLeftColor: skillColor,
        minWidth: 0,
        transition: "border-color 0.2s ease",
      }}
      role="complementary"
      aria-label={t(lang, "quest_detail_title")}
    >
      <div className="flex flex-col h-full" style={{ width: PANEL_WIDTH }}>
        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1f1f1f] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] uppercase tracking-widest font-mono mb-1"
                style={{ color: skillColor }}
              >
                {skillName ?? "—"}
              </p>
              <h2 className="text-sm font-bold text-white leading-snug">
                {quest.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <button
                type="button"
                onClick={handleToggleRecurring}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border uppercase tracking-widest transition-all"
                style={
                  quest.isRecurring
                    ? {
                        backgroundColor: skillColor + "22",
                        borderColor: skillColor,
                        color: skillColor,
                      }
                    : {
                        backgroundColor: "transparent",
                        borderColor: "#333",
                        color: "#444",
                      }
                }
                title={t(lang, "quest_recurring_label")}
              >
                <RefreshCw size={10} />
                {t(lang, "quest_recurring_label")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-white transition-colors"
                aria-label={t(lang, "quest_close")}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quest.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="px-5 py-4 space-y-5">
              {/* Gallery — full width grid */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-2">
                  {t(lang, "quest_gallery")}
                </label>
                {/* TODO: [DATA] render actual attachments thumbnails here */}
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="aspect-[20/13] rounded border border-[#1f1f1f] bg-[#0d0d0d] flex items-center justify-center text-[#222]"
                    >
                      <Camera size={18} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase tracking-widest text-[#666]">
                    {t(lang, "quest_description")}
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded hover:bg-[#1f1f1f] text-[#555] hover:text-[#888] transition-colors"
                      title={t(lang, "edit")}
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-[#111] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#555] resize-y"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveDescription}
                        className="px-3 py-1.5 rounded bg-[#333] hover:bg-[#444] text-white text-xs"
                      >
                        {t(lang, "quest_save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditDescription(quest.description);
                          setIsEditing(false);
                        }}
                        className="px-3 py-1.5 rounded border border-[#333] text-[#888] hover:text-white text-xs"
                      >
                        {t(lang, "quest_cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#aaa] whitespace-pre-wrap leading-relaxed">
                    {quest.description || "—"}
                  </p>
                )}
              </div>

              {/* Expected duration */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-1">
                  {t(lang, "quest_duration")}
                </label>
                <p className="text-sm text-[#aaa] font-mono">
                  {formatDuration(quest.duration)}
                </p>
              </div>

              {/* Actual duration — editable, only when completed */}
              {quest.status === "completed" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] uppercase tracking-widest text-[#666]">
                      {t(lang, "quest_actual_duration")}
                    </label>
                    {!isEditingActual && (
                      <button
                        type="button"
                        onClick={() => setIsEditingActual(true)}
                        className="p-1 rounded hover:bg-[#1f1f1f] text-[#555] hover:text-[#888] transition-colors"
                        title={t(lang, "edit")}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                  </div>
                  {isEditingActual ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={editActualDuration}
                        onChange={(e) => setEditActualDuration(e.target.value)}
                        className="w-24 px-3 py-1.5 bg-[#111] border border-[#333] rounded text-white text-sm font-mono focus:outline-none focus:border-[#555]"
                        placeholder="min"
                        autoFocus
                      />
                      <span className="text-[10px] text-[#555] uppercase tracking-widest">
                        min
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveActualDuration}
                        className="px-3 py-1.5 rounded bg-[#333] hover:bg-[#444] text-white text-xs"
                      >
                        {t(lang, "quest_save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditActualDuration(
                            quest.actualDuration != null
                              ? String(Math.round(quest.actualDuration / 60))
                              : "",
                          );
                          setIsEditingActual(false);
                        }}
                        className="px-2 py-1.5 rounded border border-[#333] text-[#888] hover:text-white text-xs"
                      >
                        {t(lang, "quest_cancel")}
                      </button>
                    </div>
                  ) : (
                    <p
                      className="text-sm font-mono"
                      style={{
                        color:
                          quest.actualDuration != null
                            ? MOCK_STATUS_COLORS.completed
                            : "#3a3a3a",
                      }}
                    >
                      {quest.actualDuration != null
                        ? formatDuration(quest.actualDuration)
                        : "—"}
                    </p>
                  )}
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-1">
                  {t(lang, "quest_comment")}
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  onBlur={handleSaveComment}
                  rows={3}
                  placeholder="—"
                  className="w-full px-3 py-2 bg-[#111] border border-[#1f1f1f] rounded text-sm text-[#aaa] placeholder-[#333] focus:outline-none focus:border-[#333] resize-y"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="quest-panel-status"
                  className="block text-[10px] uppercase tracking-widest text-[#666] mb-1"
                >
                  {t(lang, "quest_status")}
                </label>
                <select
                  id="quest-panel-status"
                  value={quest.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 bg-[#111] rounded text-white text-sm focus:outline-none"
                  style={{ border: `1px solid ${statusColor}55` }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(lang, opt.labelKey)}
                    </option>
                  ))}
                </select>

                {/* Historia — always visible */}
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-widest text-[#3a3a3a] mb-2">
                    {t(lang, "quest_history")}
                  </p>
                  {quest.statusChangelog && quest.statusChangelog.length > 0 ? (
                    (() => {
                      const reversed = [...quest.statusChangelog].reverse();
                      const visible = historyExpanded
                        ? reversed
                        : reversed.slice(0, 3);
                      const hasMore = reversed.length > 3;
                      return (
                        <>
                          <ul className="space-y-1.5">
                            {visible.map((entry, i) => {
                              const color = MOCK_STATUS_COLORS[entry.status];
                              const labelKey = `status_${entry.status}` as
                                | "status_open"
                                | "status_planned"
                                | "status_in_progress"
                                | "status_completed";
                              return (
                                <li key={i} className="flex items-center gap-2">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span
                                    className="text-[10px] uppercase tracking-wider w-20 shrink-0"
                                    style={{ color }}
                                  >
                                    {t(lang, labelKey)}
                                  </span>
                                  <span className="font-mono text-[10px] text-[#3a3a3a]">
                                    {formatTimestamp(entry.timestamp)}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                          {hasMore && (
                            <button
                              type="button"
                              onClick={() => setHistoryExpanded((v) => !v)}
                              className="mt-2 text-[10px] uppercase tracking-widest text-[#444] hover:text-[#666] transition-colors"
                            >
                              {historyExpanded
                                ? `▲ ukryj`
                                : `▼ +${reversed.length - 3} więcej`}
                            </button>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <p className="text-[10px] font-mono text-[#2a2a2a]">
                      {t(lang, "quest_history_empty")}
                    </p>
                  )}
                </div>
              </div>

              {/* Attachments — below history */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#666] mb-2">
                  {t(lang, "quest_attachments")}
                </label>
                {/* TODO: [DATA] implement file attachment upload/storage */}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { icon: Camera, key: "quest_attach_photo" as const },
                    { icon: Video, key: "quest_attach_video" as const },
                    { icon: Paperclip, key: "quest_attach_file" as const },
                  ].map(({ icon: Icon, key }) => (
                    <button
                      key={key}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1f1f1f] rounded text-[10px] uppercase tracking-widest text-[#555] hover:border-[#333] hover:text-[#888] transition-colors"
                    >
                      <Icon size={12} />
                      {t(lang, key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-[#151515] shrink-0">
          <p
            className="text-[10px] font-mono text-[#2e2e2e] truncate"
            title={quest.id}
          >
            {quest.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
