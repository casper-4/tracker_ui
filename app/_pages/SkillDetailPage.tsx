"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Pin, Pencil } from "lucide-react";
import { radarNPolygon, roundSvg } from "@/app/components/radar";
import { MOCK_SKILLS, MOCK_QUESTS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import QuestDetailModal from "@/app/components/QuestDetailModal";
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
    closeTimeoutRef.current = setTimeout(() => onOpenChange(false), DROPDOWN_CLOSE_DELAY_MS);
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
      <span className={`${textClass} uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 cursor-pointer ${statusTagClass[quest.status]}`}>
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
};

export default function SkillDetailPage({ skillId }: Props) {
  const { lang } = useLang();
  // TODO: [DATA] persistence will go here — using simple useState without persistence
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [questStatuses, setQuestStatuses] = useState<Record<string, QuestStatus>>({});
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [openStatusDropdownKey, setOpenStatusDropdownKey] = useState<string | null>(null);

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

  const setStatusOverride = useCallback((questId: string, status: QuestStatus) => {
    // TODO: [DATA] persistence will go here
    setQuestStatuses((prev) => ({ ...prev, [questId]: status }));
    setOpenStatusDropdownKey(null);
  }, []);

  const togglePinned = useCallback((entityId: string) => {
    // TODO: [DATA] persistence will go here
    setPinnedIds((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId]
    );
  }, []);

  const isPinned = useCallback((entityId: string) => pinnedIds.includes(entityId), [pinnedIds]);

  if (!skill) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-[#888]">Skill not found.</p>
      </div>
    );
  }

  const aspects = skill.aspects || [];
  const radar = aspects.length > 0 ? radarNPolygon(aspects.map((a) => a.completionPercentage)) : null;

  // Group subskills by aspect for the tree
  const subSkillsByAspect = new Map(
    aspects.map((a) => [a.id, skill.subSkills.filter((ss) => ss.aspect === a.id)])
  );

  // All quest IDs belonging to this skill
  const questIdsInSkill = new Set(
    skill.subSkills.flatMap((ss) => (ss.quests || []).map((q) => q.id))
  );

  const questsInProgress = MOCK_QUESTS.filter(
    (q) => questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "in_progress"
  );

  const questsPlanned = MOCK_QUESTS.filter(
    (q) => questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "planned"
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
              <svg viewBox="0 0 100 100" className="w-full max-w-[320px] overflow-visible">
                {[40, 26.7, 13.3].map((maxR, ri) => {
                  const n = aspects.length;
                  const pts = Array.from({ length: n }, (_, i) => {
                    const angle = (i * 360) / n;
                    const rad = (angle * Math.PI) / 180;
                    return `${roundSvg(50 + maxR * Math.sin(rad))},${roundSvg(50 - maxR * Math.cos(rad))}`;
                  });
                  return <polygon key={ri} points={pts.join(" ")} fill="none" stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="2,2" />;
                })}
                <polygon points={radar.points} fill="rgba(250,204,21,0.08)" stroke={skill.color} strokeWidth="1.5" />
                {radar.pts.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={skill.color} />
                ))}
                {aspects.map((a, i) => {
                  const n = aspects.length;
                  const angle = (i * 360) / n;
                  const rad = (angle * Math.PI) / 180;
                  const dist = 46;
                  const x = roundSvg(50 + dist * Math.sin(rad));
                  const y = roundSvg(50 - dist * Math.cos(rad));
                  return <text key={i} x={x} y={y} fill="#888" fontSize="3" textAnchor="middle" className="uppercase tracking-widest">{a.name}</text>;
                })}
              </svg>
            ) : (
              <div className="text-[#666]">No aspects to display.</div>
            )}
          </div>

          <div className="w-80">
            <h4 className="text-sm text-white font-bold mb-3">{t(lang, "skill_aspects")}</h4>
            <div className="flex flex-col gap-3">
              {aspects.map((a) => (
                <div key={a.id}>
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#888] mb-1">
                    <span>{a.name}</span>
                    <span style={{ color: skill.color }}>{a.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1f1f1f] rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${a.completionPercentage}%`, backgroundColor: skill.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quests: In Progress | Planned | Pinned */}
      <section className="mt-6 border border-[#1f1f1f] bg-[#0a0a0a] p-6">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-4">Quests</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* In Progress */}
          <div>
            <h4 className="text-[10px] text-[#888] uppercase tracking-widest mb-2">{t(lang, "quests_in_progress")}</h4>
            {questsInProgress.length === 0 ? (
              <p className="text-[#555] text-xs">{t(lang, "quests_empty")}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {questsInProgress.map((quest) => (
                  <li
                    key={quest.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedQuest(quest)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedQuest(quest); }
                    }}
                    className="flex items-center gap-2 p-2 border border-[#1f1f1f] bg-[#050505] rounded group cursor-pointer hover:border-[#333] hover:bg-[#0d0d0d] transition-colors"
                  >
                    <span className="flex-1 min-w-0 text-sm text-white truncate">{quest.name}</span>
                    <StatusTagDropdown
                      dropdownKey={`inprogress-${quest.id}`}
                      quest={{ ...quest, status: getEffectiveStatus(quest.id) }}
                      statusLabels={statusLabels}
                      statusTagClass={statusTagClass}
                      isOpen={openStatusDropdownKey === `inprogress-${quest.id}`}
                      onOpenChange={(open) => setOpenStatusDropdownKey(open ? `inprogress-${quest.id}` : null)}
                      onStatusSelect={setStatusOverride}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Planned */}
          <div>
            <h4 className="text-[10px] text-[#888] uppercase tracking-widest mb-2">{t(lang, "quests_planned")}</h4>
            {questsPlanned.length === 0 ? (
              <p className="text-[#555] text-xs">{t(lang, "quests_empty")}</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {questsPlanned.map((quest) => (
                  <li
                    key={quest.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedQuest(quest)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedQuest(quest); }
                    }}
                    className="flex items-center gap-2 p-2 border border-[#1f1f1f] bg-[#050505] rounded group cursor-pointer hover:border-[#333] hover:bg-[#0d0d0d] transition-colors"
                  >
                    <span className="flex-1 min-w-0 text-sm text-white truncate">{quest.name}</span>
                    <StatusTagDropdown
                      dropdownKey={`planned-${quest.id}`}
                      quest={{ ...quest, status: getEffectiveStatus(quest.id) }}
                      statusLabels={statusLabels}
                      statusTagClass={statusTagClass}
                      isOpen={openStatusDropdownKey === `planned-${quest.id}`}
                      onOpenChange={(open) => setOpenStatusDropdownKey(open ? `planned-${quest.id}` : null)}
                      onStatusSelect={setStatusOverride}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pinned */}
          <div>
            <h4 className="text-[10px] text-[#888] uppercase tracking-widest mb-2">{t(lang, "pin")}</h4>
            {pinnedInThisSkill.length === 0 ? (
              <p className="text-[#555] text-xs">
                No pinned quests. Use the pin icon in &quot;{t(lang, "skill_structure")}&quot;.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {pinnedInThisSkill.map((quest) => {
                  const status = getEffectiveStatus(quest.id);
                  return (
                    <li key={quest.id} className="flex items-center gap-2 p-2 border border-[#1f1f1f] bg-[#050505] rounded group">
                      <button
                        type="button"
                        onClick={() => setSelectedQuest(quest)}
                        className="flex-1 min-w-0 text-left text-sm text-white truncate hover:underline"
                      >
                        {quest.name}
                      </button>
                      <StatusTagDropdown
                        dropdownKey={`pinned-${quest.id}`}
                        quest={{ ...quest, status }}
                        statusLabels={statusLabels}
                        statusTagClass={statusTagClass}
                        isOpen={openStatusDropdownKey === `pinned-${quest.id}`}
                        onOpenChange={(open) => setOpenStatusDropdownKey(open ? `pinned-${quest.id}` : null)}
                        onStatusSelect={setStatusOverride}
                      />
                      <button
                        type="button"
                        onClick={() => togglePinned(quest.id)}
                        className="p-1.5 rounded hover:bg-[#1f1f1f] opacity-70 group-hover:opacity-100 transition-opacity shrink-0"
                        title={t(lang, "unpin")}
                        style={{ color: skill.color }}
                      >
                        <Pin size={14} className="fill-current" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
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
                  <span className="text-sm font-medium text-white uppercase tracking-wide">{aspect.name}</span>
                  <div className="flex-1 max-w-[120px] h-2 bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${aspect.completionPercentage}%`, backgroundColor: skill.color }} />
                  </div>
                  <span className="text-xs font-mono font-bold" style={{ color: skill.color }}>{aspect.completionPercentage}%</span>
                  <div className="flex items-center gap-1 opacity-70 group-hover/row:opacity-100">
                    <button type="button" className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-[#888] transition-colors" title={t(lang, "edit")}>
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>

                {subSkills.length > 0 && (
                  <div className="ml-4 mt-2 pl-4 border-l-2 border-[#1f1f1f] space-y-4">
                    {subSkills.map((subSkill) => {
                      const questsForSubSkill = (subSkill.quests || []).map((q) => {
                        const found = MOCK_QUESTS.find((mq) => mq.id === q.id);
                        return found ? { ...found, percentage: q.percentage } : null;
                      }).filter((q): q is Quest & { percentage: number } => q != null);

                      return (
                        <div key={subSkill.id} className="relative">
                          <div
                            className="relative flex items-center gap-2 p-2 rounded border border-[#1f1f1f] bg-[#050505] hover:border-[#333] hover:bg-[#0a0a0a] transition-colors group/row"
                            id={`subskill-${subSkill.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[#e0e0e0] group-hover/row:text-white">{subSkill.name}</span>
                              <span className="text-[10px] text-[#666] ml-2">Lvl {subSkill.level}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-70 group-hover/row:opacity-100 shrink-0">
                              <button type="button" className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-[#888] transition-colors" title={t(lang, "edit")}>
                                <Pencil size={14} />
                              </button>
                            </div>
                          </div>
                          {questsForSubSkill.length > 0 && (
                            <div className="ml-4 mt-2 pl-4 border-l border-[#1f1f1f] space-y-1.5">
                              {questsForSubSkill.map((q) => (
                                <div
                                  key={q.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedQuest(q)}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedQuest(q); } }}
                                  className="flex items-center gap-2 py-1.5 text-[12px] text-[#888] border-b border-[#151515] last:border-0 group/row cursor-pointer hover:bg-[#0d0d0d] rounded px-1 -mx-1 transition-colors"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: skill.color }} />
                                  <span className="flex-1 min-w-0 text-[#aaa]">{q.name}</span>
                                  {(() => {
                                    const status = getEffectiveStatus(q.id);
                                    return (
                                      <StatusTagDropdown
                                        dropdownKey={`tree-${q.id}`}
                                        quest={{ ...q, status }}
                                        statusLabels={statusLabels}
                                        statusTagClass={statusTagClass}
                                        isOpen={openStatusDropdownKey === `tree-${q.id}`}
                                        onOpenChange={(open) => setOpenStatusDropdownKey(open ? `tree-${q.id}` : null)}
                                        onStatusSelect={setStatusOverride}
                                        size="xs"
                                      />
                                    );
                                  })()}
                                  <span className="text-[#666] font-mono shrink-0">{q.percentage}%</span>
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <span className={`inline-flex transition-opacity ${isPinned(q.id) ? "opacity-100" : "opacity-0 group-hover/row:opacity-70"}`}>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePinned(q.id); }}
                                        className="p-1 rounded hover:bg-[#1f1f1f] transition-colors"
                                        title={isPinned(q.id) ? t(lang, "unpin") : t(lang, "pin")}
                                        style={{ color: isPinned(q.id) ? skill.color : "#666" }}
                                      >
                                        <Pin size={12} className={isPinned(q.id) ? "fill-current" : ""} />
                                      </button>
                                    </span>
                                    <span className="opacity-0 group-hover/row:opacity-70 transition-opacity inline-flex">
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedQuest(q); }}
                                        className="p-1 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-[#888] transition-colors"
                                        title={t(lang, "edit")}
                                      >
                                        <Pencil size={12} />
                                      </button>
                                    </span>
                                  </div>
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
          <p className="text-[#666] text-sm">No aspects — add aspects to skill data.</p>
        )}
      </section>

      {selectedQuest ? (
        <QuestDetailModal
          quest={{ ...selectedQuest, status: getEffectiveStatus(selectedQuest.id) }}
          onClose={() => setSelectedQuest(null)}
          skillColor={skill.color}
          onQuestChange={(updated) => {
            // TODO: [DATA] persistence will go here
            setQuestStatuses((prev) => ({ ...prev, [updated.id]: updated.status }));
          }}
        />
      ) : null}
    </div>
  );
}
