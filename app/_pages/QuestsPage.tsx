"use client";

import { useMemo, useState, useCallback } from "react";
import { MOCK_QUESTS, MOCK_SKILLS, MOCK_STATUS_COLORS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import { RefreshCw } from "lucide-react";
import QuestsChart from "@/app/components/QuestsChart";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

type Props = {
  questStatuses: Record<string, QuestStatus>;
  onQuestSelect: (questId: string) => void;
  onQuestStatusChange: (questId: string, status: QuestStatus) => void;
};

export default function QuestsPage({ questStatuses, onQuestSelect, onQuestStatusChange }: Props) {
  const { lang } = useLang();

  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<QuestStatus | null>(null);

  const skillById = useMemo(
    () => Object.fromEntries(MOCK_SKILLS.map((s) => [s.id, s])),
    []
  );

  const subSkillById = useMemo(() => {
    const map: Record<string, { name: string; skillName: string; color: string }> = {};
    for (const skill of MOCK_SKILLS) {
      for (const ss of skill.subSkills) {
        map[ss.id] = { name: ss.name, skillName: skill.name, color: skill.color };
      }
    }
    return map;
  }, []);

  const getSkillName = (skillId: string) => skillById[skillId]?.name ?? skillId;

  const getEffectiveStatus = (quest: Quest): QuestStatus =>
    questStatuses[quest.id] ?? quest.status;

  const getSubSkillLabels = (quest: Quest) =>
    quest.subSkills.map((ss) => {
      const info = subSkillById[ss.id];
      return info
        ? { name: info.name, skillName: info.skillName, color: info.color }
        : { name: ss.id, skillName: "", color: "#666" };
    });

  const { inProgress, planned, completed } = useMemo(() => {
    const inProgress: Quest[] = [];
    const planned: Quest[] = [];
    const completed: Quest[] = [];
    for (const quest of MOCK_QUESTS) {
      const status = getEffectiveStatus(quest);
      if (status === "in_progress") inProgress.push(quest);
      else if (status === "planned") planned.push(quest);
      else if (status === "completed") completed.push(quest);
    }
    return { inProgress, planned, completed };
  }, [questStatuses]);

  const handleDrop = useCallback(
    (targetStatus: QuestStatus) => {
      if (!draggedQuestId) return;
      // TODO: [DATA] persistence will go here
      onQuestStatusChange(draggedQuestId, targetStatus);
      setDraggedQuestId(null);
      setDragOverColumn(null);
    },
    [draggedQuestId, onQuestStatusChange],
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-2">
          {t(lang, "quests_title")}
        </h1>
        <p className="text-sm text-[#888]">{t(lang, "quests_description")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuestColumn
          columnKey="planned"
          title={t(lang, "quests_planned")}
          quests={planned}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={onQuestSelect}
          emptyLabel={t(lang, "quests_empty")}
          dropHereLabel={t(lang, "drop_here")}
          isDragging={draggedQuestId !== null}
          isOver={dragOverColumn === "planned"}
          onDragOver={() => { if (dragOverColumn !== "planned") setDragOverColumn("planned"); }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("planned")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => { setDraggedQuestId(null); setDragOverColumn(null); }}
        />
        <QuestColumn
          columnKey="in_progress"
          title={t(lang, "quests_in_progress")}
          quests={inProgress}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={onQuestSelect}
          emptyLabel={t(lang, "quests_empty")}
          dropHereLabel={t(lang, "drop_here")}
          isDragging={draggedQuestId !== null}
          isOver={dragOverColumn === "in_progress"}
          onDragOver={() => { if (dragOverColumn !== "in_progress") setDragOverColumn("in_progress"); }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("in_progress")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => { setDraggedQuestId(null); setDragOverColumn(null); }}
        />
        <QuestColumn
          columnKey="completed"
          title={t(lang, "quests_completed")}
          quests={completed}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={onQuestSelect}
          emptyLabel={t(lang, "quests_empty")}
          dropHereLabel={t(lang, "drop_here")}
          isDragging={draggedQuestId !== null}
          isOver={dragOverColumn === "completed"}
          onDragOver={() => { if (dragOverColumn !== "completed") setDragOverColumn("completed"); }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("completed")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => { setDraggedQuestId(null); setDragOverColumn(null); }}
        />
      </div>

      <QuestsChart
        quests={MOCK_QUESTS}
        getSkillName={getSkillName}
        onQuestClick={onQuestSelect}
      />
    </div>
  );
}

type QuestColumnProps = {
  columnKey: QuestStatus;
  title: string;
  quests: Quest[];
  getSubSkillLabels: (quest: Quest) => { name: string; skillName: string; color: string }[];
  getSkillName: (skillId: string) => string;
  onQuestClick: (questId: string) => void;
  emptyLabel: string;
  dropHereLabel: string;
  isDragging: boolean;
  isOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onCardDragStart: (questId: string) => void;
  onCardDragEnd: () => void;
};

function QuestColumn({
  columnKey, title, quests, getSubSkillLabels, getSkillName, onQuestClick,
  emptyLabel, dropHereLabel, isDragging, isOver,
  onDragOver, onDragLeave, onDrop, onCardDragStart, onCardDragEnd,
}: QuestColumnProps) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onDragLeave(); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className={`p-4 flex flex-col min-h-[280px] transition-colors ${
        isOver
          ? "bg-[#facc15]/5 border border-dashed border-[#facc15]/50"
          : isDragging
            ? "border border-dashed border-[#333] bg-[#0a0a0a]"
            : "border border-[#1f1f1f] bg-[#0a0a0a]"
      }`}
    >
      <h2 className="text-[10px] text-[#888] uppercase tracking-widest mb-3 flex items-center justify-between gap-2">
        <span>{title}</span>
        <span className="font-mono text-[#666] tabular-nums">{quests.length}</span>
      </h2>
      {quests.length === 0 ? (
        <p className="text-[#555] text-xs flex-1">
          {isOver ? (
            <span className="text-[#facc15]/60">{dropHereLabel}</span>
          ) : (
            emptyLabel
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-2 flex-1">
          {isOver && (
            <li className="h-9 rounded border border-dashed border-[#facc15]/40 bg-[#facc15]/5 flex items-center justify-center">
              <span className="text-[10px] text-[#facc15]/60 uppercase tracking-widest">{dropHereLabel}</span>
            </li>
          )}
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              effectiveStatus={columnKey}
              skillName={getSkillName(quest.skill)}
              subSkillLabels={getSubSkillLabels(quest)}
              onClick={() => onQuestClick(quest.id)}
              onDragStart={() => onCardDragStart(quest.id)}
              onDragEnd={onCardDragEnd}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type QuestCardProps = {
  quest: Quest;
  effectiveStatus: QuestStatus;
  skillName: string;
  subSkillLabels: { name: string; skillName: string; color: string }[];
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

function QuestCard({ quest, effectiveStatus, skillName, subSkillLabels, onClick, onDragStart, onDragEnd }: QuestCardProps) {
  const { lang } = useLang();
  const firstColor = subSkillLabels[0]?.color ?? "#666";
  const statusColor = MOCK_STATUS_COLORS[effectiveStatus];
  return (
    <li
      draggable
      onDragStart={(e) => { e.stopPropagation(); onDragStart(); }}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-3 border border-[#1f1f1f] bg-[#050505] rounded hover:border-[#333] hover:bg-[#0d0d0d] transition-colors group cursor-pointer"
      >
        <p className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-[#facc15]/90">
          {quest.name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider"
            style={{ borderColor: firstColor, color: firstColor }}
          >
            {skillName}
          </span>
          {subSkillLabels.map((ss) => (
            <span
              key={ss.name}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a1a1a] text-[#999] uppercase tracking-wider"
              title={ss.skillName}
            >
              {ss.name}
            </span>
          ))}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider"
            style={{ borderColor: statusColor, color: statusColor }}
          >
            {effectiveStatus.replace("_", " ")}
          </span>
          {quest.isRecurring ? (
            <span
              className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider"
              style={{ borderColor: firstColor, color: firstColor }}
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
      </button>
    </li>
  );
}
