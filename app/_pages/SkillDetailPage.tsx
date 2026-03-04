"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Pin, RefreshCw } from "lucide-react";
import { radarNPolygon, roundSvg } from "@/app/components/radar";
import { MOCK_SKILLS, MOCK_QUESTS, MOCK_STATUS_COLORS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

const DROPDOWN_CLOSE_DELAY_MS = 150;

type StatusTagDropdownProps = {
  dropdownKey: string;
  quest: Quest;
  statusLabels: Record<QuestStatus, string>;
  statusTagClass: Record<QuestStatus, string>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusSelect: (questId: string, status: QuestStatus) => void;
  size?: "sm" | "xs";
};

function StatusTagDropdown({
  dropdownKey,
  quest,
  statusLabels,
  statusTagClass,
  isOpen,
  onOpenChange,
  onStatusSelect,
  size = "sm",
}: StatusTagDropdownProps) {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textClass = size === "xs" ? "text-[10px]" : "text-[10px]";

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(
      () => onOpenChange(false),
      DROPDOWN_CLOSE_DELAY_MS,
    );
  }, [onOpenChange, clearCloseTimeout]);

  const handleEnter = useCallback(() => {
    clearCloseTimeout();
    onOpenChange(true);
  }, [onOpenChange, clearCloseTimeout]);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className={`${textClass} uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 cursor-pointer ${statusTagClass[quest.status]}`}
      >
        {statusLabels[quest.status]}
      </span>
      {isOpen && (
        <div
          className="absolute top-full left-0 pt-1 z-50"
          onMouseEnter={handleEnter}
          onMouseLeave={scheduleClose}
        >
          <div className="py-1 rounded bg-[#1a1a1a] border border-[#333] shadow-xl min-w-[120px]">
            {(Object.keys(statusLabels) as QuestStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`w-full text-left px-3 py-1.5 text-[10px] uppercase hover:bg-[#252525] transition-colors ${s === quest.status ? "bg-[#252525]" : ""} ${statusTagClass[s]}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusSelect(quest.id, s);
                }}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  skillId?: string;
  skillColor: string;
  onSkillColorChange: (color: string) => void;
  onQuestSelect: (id: string) => void;
};

export default function SkillDetailPage({
  skillId,
  skillColor,
  onSkillColorChange,
  onQuestSelect,
}: Props) {
  const { lang } = useLang();
  // TODO: [DATA] persistence will go here — using simple useState without persistence
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [questStatuses, setQuestStatuses] = useState<
    Record<string, QuestStatus>
  >({});
  const [openStatusDropdownKey, setOpenStatusDropdownKey] = useState<
    string | null
  >(null);
  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<
    "in_progress" | "planned" | "pinned" | null
  >(null);
  // TODO: [DATA] persistence will go here
  const [recurringOverrides, setRecurringOverrides] = useState<
    Record<string, boolean>
  >({});

  const getEffectiveRecurring = useCallback(
    (questId: string, baseValue: boolean): boolean =>
      recurringOverrides[questId] ?? baseValue,
    [recurringOverrides],
  );

  const toggleRecurring = useCallback((questId: string, baseValue: boolean) => {
    // TODO: [DATA] persistence will go here
    setRecurringOverrides((prev) => ({
      ...prev,
      [questId]: !(prev[questId] ?? baseValue),
    }));
  }, []);

  const statusLabels: Record<QuestStatus, string> = {
    open: t(lang, "status_open"),
    planned: t(lang, "status_planned"),
    in_progress: t(lang, "status_in_progress"),
    completed: t(lang, "status_completed"),
  };

  const statusTagClass: Record<QuestStatus, string> = {
    open: "bg-[#1f1f1f] text-[#888]",
    planned: "bg-amber-500/20 text-amber-400",
    in_progress: "bg-sky-500/20 text-sky-400",
    completed: "bg-emerald-500/20 text-emerald-400",
  };

  const skill = useMemo(() => {
    if (skillId) {
      return MOCK_SKILLS.find((s) => s.id === skillId) || MOCK_SKILLS[0];
    }
    return MOCK_SKILLS[0];
  }, [skillId]);

  const getEffectiveStatus = useCallback(
    (questId: string): QuestStatus => {
      if (questStatuses[questId]) return questStatuses[questId];
      const quest = MOCK_QUESTS.find((q) => q.id === questId);
      return quest?.status ?? "open";
    },
    [questStatuses],
  );

  const setStatusOverride = useCallback(
    (questId: string, status: QuestStatus) => {
      // TODO: [DATA] persistence will go here
      setQuestStatuses((prev) => ({ ...prev, [questId]: status }));
      setOpenStatusDropdownKey(null);
    },
    [],
  );

  const togglePinned = useCallback((entityId: string) => {
    // TODO: [DATA] persistence will go here
    setPinnedIds((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId],
    );
  }, []);

  const isPinned = useCallback(
    (entityId: string) => pinnedIds.includes(entityId),
    [pinnedIds],
  );

  const handleDrop = useCallback(
    (targetColumn: "in_progress" | "planned" | "pinned") => {
      if (!draggedQuestId) return;
      if (targetColumn === "pinned") {
        // TODO: [DATA] persistence will go here
        setPinnedIds((prev) =>
          prev.includes(draggedQuestId) ? prev : [...prev, draggedQuestId],
        );
      } else {
        // TODO: [DATA] persistence will go here
        setQuestStatuses((prev) => ({
          ...prev,
          [draggedQuestId]: targetColumn,
        }));
        setPinnedIds((prev) => prev.filter((id) => id !== draggedQuestId));
      }
      setDraggedQuestId(null);
      setDragOverColumn(null);
    },
    [draggedQuestId],
  );

  if (!skill) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-[#888]">Skill not found.</p>
      </div>
    );
  }

  const aspects = skill.aspects || [];
  const radar =
    aspects.length > 0
      ? radarNPolygon(aspects.map((a) => a.completionPercentage))
      : null;

  // Group subskills by aspect for the tree
  const subSkillsByAspect = new Map(
    aspects.map((a) => [
      a.id,
      skill.subSkills.filter((ss) => ss.aspect === a.id),
    ]),
  );

  // All quest IDs belonging to this skill
  const questIdsInSkill = new Set(
    skill.subSkills.flatMap((ss) => (ss.quests || []).map((q) => q.id)),
  );

  const questsInProgress = MOCK_QUESTS.filter(
    (q) =>
      questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "in_progress",
  );

  const questsPlanned = MOCK_QUESTS.filter(
    (q) => questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "planned",
  );

  const pinnedInThisSkill = pinnedIds
    .filter((id) => questIdsInSkill.has(id))
    .map((id) => MOCK_QUESTS.find((q) => q.id === id))
    .filter((q): q is Quest => q != null);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Neural radar & aspects */}
      <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-4">
          {t(lang, "skill_neural_map").toUpperCase()}
        </h3>

        <div className="flex items-start gap-6">
          <div className="flex-1 flex items-center justify-center">
            {radar ? (
              <svg
                viewBox="0 0 100 100"
                className="w-full max-w-[320px] overflow-visible"
              >
                {[40, 26.7, 13.3].map((maxR, ri) => {
                  const n = aspects.length;
                  const pts = Array.from({ length: n }, (_, i) => {
                    const angle = (i * 360) / n;
                    const rad = (angle * Math.PI) / 180;
                    return `${roundSvg(50 + maxR * Math.sin(rad))},${roundSvg(50 - maxR * Math.cos(rad))}`;
                  });
                  return (
                    <polygon
                      key={ri}
                      points={pts.join(" ")}
                      fill="none"
                      stroke="#1f1f1f"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  );
                })}
                <polygon
                  points={radar.points}
                  fill="rgba(250,204,21,0.08)"
                  stroke={skillColor}
                  strokeWidth="1.5"
                />
                {radar.pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={skillColor} />
                ))}
                {aspects.map((a, i) => {
                  const n = aspects.length;
                  const angle = (i * 360) / n;
                  const rad = (angle * Math.PI) / 180;
                  const dist = 46;
                  const x = roundSvg(50 + dist * Math.sin(rad));
                  const y = roundSvg(50 - dist * Math.cos(rad));
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      fill="#888"
                      fontSize="3"
                      textAnchor="middle"
                      className="uppercase tracking-widest"
                    >
                      {a.name}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div className="text-[#666]">No aspects to display.</div>
            )}
          </div>

          <div className="w-80">
            <h4 className="text-sm text-white font-bold mb-3">
              {t(lang, "skill_aspects")}
            </h4>
            <div className="flex flex-col gap-3">
              {aspects.map((a) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#888] mb-1">
                    <span>{a.name}</span>
                    <span style={{ color: skillColor }}>
                      {a.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1f1f1f] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${a.completionPercentage}%`,
                        backgroundColor: skillColor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quests: In Progress | Planned | Pinned — drag-and-drop between columns */}
      <section className="mt-6 border border-[#1f1f1f] bg-[#0a0a0a] p-6">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-4">
          Quests
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              key: "in_progress" as const,
              label: t(lang, "quests_in_progress"),
              quests: questsInProgress,
            },
            {
              key: "planned" as const,
              label: t(lang, "quests_planned"),
              quests: questsPlanned,
            },
            {
              key: "pinned" as const,
              label: t(lang, "pin"),
              quests: pinnedInThisSkill,
            },
          ].map(({ key, label, quests }) => {
            const isOver = dragOverColumn === key;
            const isDragging = draggedQuestId !== null;
            return (
              <div
                key={key}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverColumn !== key) setDragOverColumn(key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(key);
                }}
                className={`min-h-[80px] rounded-md p-2 transition-colors ${
                  isOver
                    ? "bg-[#facc15]/5 border border-dashed border-[#facc15]/50"
                    : isDragging
                      ? "border border-dashed border-[#333]"
                      : "border border-transparent"
                }`}
              >
                <h4 className="text-[10px] text-[#888] uppercase tracking-widest mb-2">
                  {label}
                </h4>
                {quests.length === 0 ? (
                  <p className="text-[#555] text-xs">
                    {isOver ? (
                      <span className="text-[#facc15]/60">
                        {t(lang, "drop_here")}
                      </span>
                    ) : key === "pinned" ? (
                      <>
                        No pinned quests. Use the pin icon in &quot;
                        {t(lang, "skill_structure")}&quot; or drag here.
                      </>
                    ) : (
                      t(lang, "quests_empty")
                    )}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {isOver && (
                      <li className="h-9 rounded border border-dashed border-[#facc15]/40 bg-[#facc15]/5 flex items-center justify-center">
                        <span className="text-[10px] text-[#facc15]/60 uppercase tracking-widest">
                          {t(lang, "drop_here")}
                        </span>
                      </li>
                    )}
                    {quests.map((quest) => {
                      const effStatus = getEffectiveStatus(quest.id);
                      const statusColor = MOCK_STATUS_COLORS[effStatus];
                      const subSkillLabels = quest.subSkills.map((ss) => {
                        const found = skill.subSkills.find(
                          (s) => s.id === ss.id,
                        );
                        return found
                          ? { name: found.name, color: skill.color }
                          : { name: ss.id, color: "#666" };
                      });
                      return (
                        <li
                          key={quest.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedQuestId(quest.id);
                          }}
                          onDragEnd={() => {
                            setDraggedQuestId(null);
                            setDragOverColumn(null);
                          }}
                          onClick={() => onQuestSelect(quest.id)}
                          className={`p-3 border border-[#1f1f1f] bg-[#050505] rounded group cursor-grab active:cursor-grabbing hover:border-[#333] hover:bg-[#0d0d0d] transition-colors select-none ${
                            draggedQuestId === quest.id
                              ? "opacity-40 scale-95"
                              : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-[#facc15]/90">
                            {quest.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {subSkillLabels.map((ss) => (
                              <span
                                key={ss.name}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#999] uppercase tracking-wider"
                              >
                                {ss.name}
                              </span>
                            ))}
                            {quest.isRecurring ? (
                              <span
                                className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider"
                                style={{
                                  borderColor: skill.color,
                                  color: skill.color,
                                }}
                              >
                                <RefreshCw size={9} />
                                {t(lang, "quest_recurring_label")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border border-[#2a2a2a] text-[#444] uppercase tracking-wider">
                                <RefreshCw size={9} />
                                {t(lang, "quest_recurring_label")}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Tree: aspects → subskills → quests */}
      <section className="mt-10 border border-[#1f1f1f] bg-[#0a0a0a] p-6">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-6">
          {t(lang, "skill_structure").toUpperCase()}
        </h3>
        <div className="space-y-6">
          {aspects.map((aspect) => {
            const subSkills = subSkillsByAspect.get(aspect.id) ?? [];
            return (
              <div key={aspect.id} className="relative">
                <div
                  className="flex items-center gap-4 p-3 rounded border border-[#2a2a2a] bg-[#0d0d0d] group/row"
                  style={{ borderLeftColor: skill.color, borderLeftWidth: 4 }}
                >
                  <span className="text-sm font-medium text-white uppercase tracking-wide">
                    {aspect.name}
                  </span>
                  <div className="flex-1 max-w-[120px] h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${aspect.completionPercentage}%`,
                        backgroundColor: skill.color,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: skill.color }}
                  >
                    {aspect.completionPercentage}%
                  </span>
                </div>

                {subSkills.length > 0 && (
                  <div className="ml-4 mt-2 pl-4 border-l-2 border-[#1f1f1f] space-y-4">
                    {subSkills.map((subSkill) => {
                      const questsForSubSkill = (subSkill.quests || [])
                        .map((q) => {
                          const found = MOCK_QUESTS.find(
                            (mq) => mq.id === q.id,
                          );
                          return found
                            ? { ...found, percentage: q.percentage }
                            : null;
                        })
                        .filter(
                          (q): q is Quest & { percentage: number } => q != null,
                        );

                      return (
                        <div key={subSkill.id} className="relative">
                          <div
                            className="relative flex items-center gap-2 p-2 rounded border border-[#1f1f1f] bg-[#050505] hover:border-[#333] hover:bg-[#0a0a0a] transition-colors group/row"
                            id={`subskill-${subSkill.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[#e0e0e0] group-hover/row:text-white">
                                {subSkill.name}
                              </span>
                              <span className="text-[10px] text-[#666] ml-2">
                                Lvl {subSkill.level}
                              </span>
                            </div>
                          </div>
                          {questsForSubSkill.length > 0 && (
                            <div className="ml-4 mt-2 pl-4 border-l border-[#1f1f1f] space-y-1.5">
                              {questsForSubSkill.map((q) => (
                                <div
                                  key={q.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => onQuestSelect(q.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      onQuestSelect(q.id);
                                    }
                                  }}
                                  className="flex items-center gap-2 py-1.5 text-[12px] text-[#888] border-b border-[#151515] last:border-0 group/row cursor-pointer hover:bg-[#0d0d0d] rounded px-1 -mx-1 transition-colors"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: skill.color }}
                                  />
                                  <span className="flex-1 min-w-0 text-[#aaa]">
                                    {q.name}
                                  </span>
                                  {(() => {
                                    const status = getEffectiveStatus(q.id);
                                    return (
                                      <StatusTagDropdown
                                        dropdownKey={`tree-${q.id}`}
                                        quest={{ ...q, status }}
                                        statusLabels={statusLabels}
                                        statusTagClass={statusTagClass}
                                        isOpen={
                                          openStatusDropdownKey ===
                                          `tree-${q.id}`
                                        }
                                        onOpenChange={(open) =>
                                          setOpenStatusDropdownKey(
                                            open ? `tree-${q.id}` : null,
                                          )
                                        }
                                        onStatusSelect={setStatusOverride}
                                        size="xs"
                                      />
                                    );
                                  })()}
                                  {(() => {
                                    const recurring = getEffectiveRecurring(
                                      q.id,
                                      q.isRecurring,
                                    );
                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleRecurring(q.id, q.isRecurring);
                                        }}
                                        className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 transition-colors ${
                                          recurring
                                            ? "border-[#555] text-[#aaa] hover:border-[#777]"
                                            : "border-[#2a2a2a] text-[#444] hover:border-[#444]"
                                        }`}
                                        title={t(lang, "quest_recurring_label")}
                                      >
                                        <RefreshCw size={9} />
                                      </button>
                                    );
                                  })()}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      togglePinned(q.id);
                                    }}
                                    className="p-1 rounded hover:bg-[#1f1f1f] transition-colors shrink-0"
                                    title={
                                      isPinned(q.id)
                                        ? t(lang, "unpin")
                                        : t(lang, "pin")
                                    }
                                    style={{
                                      color: isPinned(q.id)
                                        ? skill.color
                                        : "#444",
                                    }}
                                  >
                                    <Pin
                                      size={12}
                                      className={
                                        isPinned(q.id) ? "fill-current" : ""
                                      }
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {aspects.length === 0 && (
          <p className="text-[#666] text-sm">
            No aspects — add aspects to skill data.
          </p>
        )}
      </section>
    </div>
  );
}
