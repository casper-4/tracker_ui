"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Xmark,
  EditPencil,
  Camera,
  VideoCamera,
  Attachment,
  Refresh,
  Check,
  NavArrowDown,
} from "iconoir-react";
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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

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

  const handleStatusChangeValue = useCallback(
    (value: QuestStatus) => {
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

  useEffect(() => {
    if (!statusDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-status-dropdown]")) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [statusDropdownOpen]);

  const statusColor = MOCK_STATUS_COLORS[quest.status];

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: PANEL_WIDTH, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
      className="h-full flex flex-col overflow-hidden shrink-0 pt-6 pb-6 lg:pt-10 lg:pb-10 xl:pt-16 xl:pb-16 pr-10 pl-2"
      style={{ minWidth: 0 }}
      role="complementary"
      aria-label={t(lang, "quest_detail_title")}
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden rounded-[14px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          borderLeft: `2px solid ${skillColor}`,
          backdropFilter: "blur(24px)",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Colored glow blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: skillColor,
            filter: "blur(70px)",
            opacity: 0.12,
            transition: "background 0.3s ease",
          }}
        />
        {/* Top-edge shine */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
          }}
        />
        {/* ── Header ── */}
        <div
          className="px-5 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Skill name — tag-style label */}
              <p
                className="text-[8px] uppercase mb-2"
                style={{
                  fontFamily: "var(--font-accent)",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: skillColor,
                }}
              >
                {skillName ?? "—"}
              </p>
              <h2
                className="text-base font-bold leading-snug text-white"
                style={{ letterSpacing: "-0.01em" }}
              >
                {quest.name}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {/* Recurring toggle — tag style, no border */}
              <button
                type="button"
                onClick={handleToggleRecurring}
                className="relative overflow-hidden flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] transition-all duration-150 active:scale-95"
                style={
                  quest.isRecurring
                    ? {
                        background: `${skillColor}1E`,
                        color: skillColor,
                        fontFamily: "var(--font-accent)",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.30)",
                        fontFamily: "var(--font-accent)",
                        fontSize: "8px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }
                }
                title={t(lang, "quest_recurring_label")}
              >
                <span
                  className="absolute inset-x-0 top-0 pointer-events-none"
                  style={{
                    height: "50%",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                  }}
                />
                <Refresh width={10} height={10} strokeWidth={2.2} />
                {t(lang, "quest_recurring_label")}
              </button>
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: "rgba(255,255,255,0.30)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.70)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.30)")
                }
                aria-label={t(lang, "quest_close")}
              >
                <Xmark width={16} height={16} strokeWidth={2.0} />
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
            <div className="px-5 py-5 space-y-6">
              {/* Gallery */}
              <div>
                <SectionLabel>{t(lang, "quest_gallery")}</SectionLabel>
                {/* TODO: [DATA] render actual attachment thumbnails here */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="aspect-[20/13] rounded-[10px] flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.20) 100%)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderTop: "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      <Camera
                        width={18}
                        height={18}
                        strokeWidth={1.8}
                        style={{ color: "rgba(255,255,255,0.18)" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <SectionLabel>{t(lang, "quest_description")}</SectionLabel>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded transition-colors"
                      style={{ color: "rgba(255,255,255,0.25)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "rgba(255,255,255,0.25)")
                      }
                      title={t(lang, "edit")}
                    >
                      <EditPencil width={13} height={13} strokeWidth={1.8} />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-[9px] text-[13px] focus:outline-none resize-y transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.70)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.22)";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 3px rgba(255,255,255,0.04)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <ActionButton
                        variant="confirm"
                        onClick={handleSaveDescription}
                      >
                        <Check width={13} height={13} strokeWidth={2.2} />
                        {t(lang, "quest_save")}
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        onClick={() => {
                          setEditDescription(quest.description);
                          setIsEditing(false);
                        }}
                      >
                        <Xmark width={13} height={13} strokeWidth={2.0} />
                        {t(lang, "quest_cancel")}
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-[13px] leading-relaxed whitespace-pre-wrap"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {quest.description || "—"}
                  </p>
                )}
              </div>

              {/* Expected duration */}
              <div>
                <SectionLabel>{t(lang, "quest_duration")}</SectionLabel>
                <p
                  className="mt-1 text-[13px] font-mono"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {formatDuration(quest.duration)}
                </p>
              </div>

              {/* Actual duration — editable, only when completed */}
              {quest.status === "completed" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <SectionLabel>
                      {t(lang, "quest_actual_duration")}
                    </SectionLabel>
                    {!isEditingActual && (
                      <button
                        type="button"
                        onClick={() => setIsEditingActual(true)}
                        className="p-1 rounded transition-colors"
                        style={{ color: "rgba(255,255,255,0.25)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.55)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "rgba(255,255,255,0.25)")
                        }
                        title={t(lang, "edit")}
                      >
                        <EditPencil width={13} height={13} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>
                  {isEditingActual ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        min={1}
                        value={editActualDuration}
                        onChange={(e) => setEditActualDuration(e.target.value)}
                        className="w-20 px-3 py-2 rounded-[9px] text-[13px] font-mono focus:outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.70)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border =
                            "1px solid rgba(255,255,255,0.22)";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(255,255,255,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border =
                            "1px solid rgba(255,255,255,0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        placeholder="min"
                        autoFocus
                      />
                      <span
                        className="text-[10px] uppercase tracking-widest"
                        style={{ color: "rgba(255,255,255,0.30)" }}
                      >
                        min
                      </span>
                      <ActionButton
                        variant="confirm"
                        onClick={handleSaveActualDuration}
                      >
                        <Check width={13} height={13} strokeWidth={2.2} />
                        {t(lang, "quest_save")}
                      </ActionButton>
                      <ActionButton
                        variant="ghost"
                        onClick={() => {
                          setEditActualDuration(
                            quest.actualDuration != null
                              ? String(Math.round(quest.actualDuration / 60))
                              : "",
                          );
                          setIsEditingActual(false);
                        }}
                      >
                        <Xmark width={13} height={13} strokeWidth={2.0} />
                        {t(lang, "quest_cancel")}
                      </ActionButton>
                    </div>
                  ) : (
                    <p
                      className="text-[13px] font-mono mt-1"
                      style={{
                        color:
                          quest.actualDuration != null
                            ? MOCK_STATUS_COLORS.completed
                            : "rgba(255,255,255,0.18)",
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
                <SectionLabel>{t(lang, "quest_comment")}</SectionLabel>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={3}
                  placeholder="—"
                  className="w-full mt-2 px-3 py-2.5 rounded-[9px] text-[13px] focus:outline-none resize-y transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.55)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.22)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(255,255,255,0.04)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                    handleSaveComment();
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.08em] font-semibold mb-2"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                >
                  {t(lang, "quest_status")}
                </p>
                {/* Custom status dropdown */}
                <div className="relative" data-status-dropdown>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-[9px] text-[13px] font-semibold transition-all"
                    style={{
                      background: `${statusColor}14`,
                      border: `1px solid ${statusColor}44`,
                      color: statusColor,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          background: statusColor,
                          boxShadow: `0 0 6px ${statusColor}90`,
                        }}
                      />
                      {t(
                        lang,
                        STATUS_OPTIONS.find((o) => o.value === quest.status)!
                          .labelKey,
                      )}
                    </div>
                    <NavArrowDown
                      width={14}
                      height={14}
                      strokeWidth={2.0}
                      style={{
                        opacity: 0.6,
                        transition: "transform 0.15s ease",
                        transform: statusDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <AnimatePresence>
                    {statusDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 z-20 mt-1.5 rounded-[10px] overflow-hidden"
                        style={{
                          background: "#1C1C1C",
                          border: "1px solid rgba(255,255,255,0.10)",
                          backdropFilter: "blur(24px)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                        }}
                      >
                        {STATUS_OPTIONS.map((opt) => {
                          const optColor = MOCK_STATUS_COLORS[opt.value];
                          const isSelected = quest.status === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                handleStatusChangeValue(opt.value);
                                setStatusDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-semibold transition-all"
                              style={{
                                color: isSelected
                                  ? optColor
                                  : "rgba(255,255,255,0.55)",
                                background: isSelected
                                  ? `${optColor}10`
                                  : "transparent",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `${optColor}18`;
                                e.currentTarget.style.color = optColor;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = isSelected
                                  ? `${optColor}10`
                                  : "transparent";
                                e.currentTarget.style.color = isSelected
                                  ? optColor
                                  : "rgba(255,255,255,0.55)";
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  background: optColor,
                                  opacity: isSelected ? 1 : 0.4,
                                  boxShadow: isSelected
                                    ? `0 0 6px ${optColor}80`
                                    : "none",
                                }}
                              />
                              {t(lang, opt.labelKey)}
                              {isSelected && (
                                <Check
                                  width={12}
                                  height={12}
                                  strokeWidth={2.2}
                                  className="ml-auto"
                                  style={{ color: optColor }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status history */}
                <div className="mt-4">
                  <p
                    className="text-[10px] uppercase tracking-[0.08em] font-semibold mb-2"
                    style={{ color: "rgba(255,255,255,0.20)" }}
                  >
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
                          <ul className="space-y-2">
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
                                    className="text-[10px] uppercase tracking-wider w-20 shrink-0 font-semibold"
                                    style={{ color }}
                                  >
                                    {t(lang, labelKey)}
                                  </span>
                                  <span
                                    className="font-mono text-[10px]"
                                    style={{ color: "rgba(255,255,255,0.30)" }}
                                  >
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
                              className="mt-2 text-[10px] uppercase tracking-widest transition-colors"
                              style={{ color: "rgba(255,255,255,0.25)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color =
                                  "rgba(255,255,255,0.55)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color =
                                  "rgba(255,255,255,0.25)")
                              }
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
                    <p
                      className="text-[11px] font-mono"
                      style={{ color: "rgba(255,255,255,0.18)" }}
                    >
                      {t(lang, "quest_history_empty")}
                    </p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <SectionLabel>{t(lang, "quest_attachments")}</SectionLabel>
                {/* TODO: [DATA] implement file attachment upload/storage */}
                <div className="flex gap-2 flex-wrap mt-2">
                  {[
                    { icon: Camera, key: "quest_attach_photo" as const },
                    { icon: VideoCamera, key: "quest_attach_video" as const },
                    { icon: Attachment, key: "quest_attach_file" as const },
                  ].map(({ icon: Icon, key }) => (
                    <button
                      key={key}
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[11px] font-semibold transition-all active:scale-[0.96]"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.40)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.07)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.13)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.70)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor =
                          "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.40)";
                      }}
                    >
                      <Icon width={12} height={12} strokeWidth={2.0} />
                      {t(lang, key)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div
          className="px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            className="text-[10px] font-mono truncate"
            style={{ color: "rgba(255,255,255,0.18)" }}
            title={quest.id}
          >
            {quest.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] uppercase tracking-[0.08em] font-semibold"
      style={{ color: "rgba(255,255,255,0.30)" }}
    >
      {children}
    </p>
  );
}

function ActionButton({
  variant,
  onClick,
  children,
}: {
  variant: "confirm" | "ghost";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties =
    variant === "confirm"
      ? { background: "rgba(0,255,159,0.10)", color: "#00FF9F", border: "none" }
      : {
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.45)",
          border: "1px solid rgba(255,255,255,0.08)",
        };
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[11px] font-semibold transition-all active:scale-[0.96]"
      style={style}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.15)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "")}
    >
      {children}
    </button>
  );
}
