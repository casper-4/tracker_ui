"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { MOCK_QUESTS, MOCK_SKILLS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import { Refresh } from "iconoir-react";
import QuestsChart from "@/app/components/QuestsChart";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

type Props = {
  questStatuses: Record<string, QuestStatus>;
  onQuestSelect: (questId: string) => void;
  onQuestStatusChange: (questId: string, status: QuestStatus) => void;
};

export default function QuestsPage({
  questStatuses,
  onQuestSelect,
  onQuestStatusChange,
}: Props) {
  const { lang } = useLang();

  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<QuestStatus | null>(
    null,
  );

  const skillById = useMemo(
    () => Object.fromEntries(MOCK_SKILLS.map((s) => [s.id, s])),
    [],
  );

  const subSkillById = useMemo(() => {
    const map: Record<
      string,
      { name: string; skillName: string; color: string }
    > = {};
    for (const skill of MOCK_SKILLS) {
      for (const ss of skill.subSkills) {
        map[ss.id] = {
          name: ss.name,
          skillName: skill.name,
          color: skill.color,
        };
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
          onDragOver={() => {
            if (dragOverColumn !== "planned") setDragOverColumn("planned");
          }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("planned")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => {
            setDraggedQuestId(null);
            setDragOverColumn(null);
          }}
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
          onDragOver={() => {
            if (dragOverColumn !== "in_progress")
              setDragOverColumn("in_progress");
          }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("in_progress")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => {
            setDraggedQuestId(null);
            setDragOverColumn(null);
          }}
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
          onDragOver={() => {
            if (dragOverColumn !== "completed") setDragOverColumn("completed");
          }}
          onDragLeave={() => setDragOverColumn(null)}
          onDrop={() => handleDrop("completed")}
          onCardDragStart={setDraggedQuestId}
          onCardDragEnd={() => {
            setDraggedQuestId(null);
            setDragOverColumn(null);
          }}
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
  getSubSkillLabels: (
    quest: Quest,
  ) => { name: string; skillName: string; color: string }[];
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
  columnKey,
  title,
  quests,
  getSubSkillLabels,
  getSkillName,
  onQuestClick,
  emptyLabel,
  dropHereLabel,
  isDragging,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardDragEnd,
}: QuestColumnProps) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDragLeave();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      style={{
        background: isOver
          ? "linear-gradient(160deg, rgba(243,230,0,0.07) 0%, rgba(243,230,0,0.02) 60%, rgba(0,0,0,0.3) 100%)"
          : "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
        border: isOver
          ? "1px dashed rgba(243,230,0,0.45)"
          : isDragging
            ? "1px dashed rgba(255,255,255,0.12)"
            : "1px solid rgba(255,255,255,0.09)",
        borderTop: isOver
          ? "1px dashed rgba(243,230,0,0.45)"
          : "1px solid rgba(255,255,255,0.16)",
        borderRadius: 14,
        backdropFilter: "blur(24px)",
      }}
      className="p-4 flex flex-col min-h-[280px] transition-all duration-200 relative"
    >
      <h2 className="text-[10px] text-white/30 uppercase tracking-[0.08em] mb-3 flex items-center justify-between gap-2">
        <span>{title}</span>
        <span className="font-mono text-white/20 tabular-nums text-[11px]">
          {quests.length}
        </span>
      </h2>
      {quests.length === 0 ? (
        <p className="text-white/30 text-xs flex-1">
          {isOver ? (
            <span className="text-[#F3E600]/60">{dropHereLabel}</span>
          ) : (
            emptyLabel
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-2 flex-1">
          {isOver && (
            <li className="h-9 rounded-lg border border-dashed border-[#F3E600]/40 bg-[#F3E600]/5 flex items-center justify-center">
              <span
                className="text-[10px] text-[#F3E600]/60 uppercase tracking-[0.2em]"
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                {dropHereLabel}
              </span>
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

function QuestCard({
  quest,
  effectiveStatus,
  skillName,
  subSkillLabels,
  onClick,
  onDragStart,
  onDragEnd,
}: QuestCardProps) {
  const { lang } = useLang();
  const firstColor = subSkillLabels[0]?.color ?? "#666";
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (cardRef.current) {
      cardRef.current.style.setProperty("--mx", `${x}px`);
      cardRef.current.style.setProperty("--my", `${y}px`);
      cardRef.current.style.setProperty("--mo", "1");
    }
  };
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.setProperty("--mo", "0");
  };

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className="cursor-grab active:cursor-grabbing"
    >
      <button
        ref={cardRef}
        type="button"
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full text-left p-3 rounded-[14px] transition-all duration-150 group cursor-pointer relative overflow-hidden
          hover:-translate-y-0.5 active:scale-[0.994]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Mouse-follow light */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[14px] transition-opacity duration-200"
          style={{
            background:
              "radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.025), transparent)",
            opacity: "var(--mo, 0)",
          }}
        />
        {/* Colored glow blob */}
        <div
          className="pointer-events-none absolute -top-4 -left-4 w-16 h-16 rounded-full"
          style={{
            background: firstColor,
            filter: "blur(70px)",
            opacity: 0.15,
          }}
        />
        <p className="text-[14px] font-semibold text-white mb-2.5 line-clamp-2 group-hover:text-white relative z-10">
          {quest.name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 relative z-10">
          <span
            className="tag-neon text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
            style={{
              fontFamily: "Orbitron, sans-serif",
              background: `${firstColor}20`,
              color: firstColor,
            }}
          >
            {skillName}
          </span>
          {subSkillLabels.map((ss) => (
            <span
              key={ss.name}
              className="tag-neon text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
              style={{
                fontFamily: "Orbitron, sans-serif",
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.5)",
              }}
              title={ss.skillName}
            >
              {ss.name}
            </span>
          ))}
          {quest.isRecurring && (
            <span
              className="tag-neon flex items-center gap-1 text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
              style={{
                fontFamily: "Orbitron, sans-serif",
                background: "rgba(85,234,212,0.12)",
                color: "#55EAD4",
              }}
            >
              <Refresh width={9} height={9} strokeWidth={2.2} />
              {t(lang, "quest_recurring_label")}
            </span>
          )}
        </div>
      </button>
    </li>
  );
}
