"use client";

import { useMemo, useState } from "react";
import { MOCK_QUESTS, MOCK_SKILLS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import QuestDetailModal from "@/app/components/QuestDetailModal";
import QuestsChart from "@/app/components/QuestsChart";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

export default function QuestsPage() {
  const { lang } = useLang();
  // Simple useState without persistence
  const [questStatuses, setQuestStatuses] = useState<Record<string, QuestStatus>>({});
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

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

  const handleQuestChange = (updated: Quest) => {
    // TODO: [DATA] persistence will go here
    setQuestStatuses((prev) => ({ ...prev, [updated.id]: updated.status }));
  };

  const handleQuestClick = (questId: string) => {
    const quest = MOCK_QUESTS.find((q) => q.id === questId);
    if (quest) setSelectedQuest({ ...quest, status: getEffectiveStatus(quest) });
  };

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
          title={t(lang, "quests_planned")}
          quests={planned}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={handleQuestClick}
          emptyLabel={t(lang, "quests_empty")}
        />
        <QuestColumn
          title={t(lang, "quests_in_progress")}
          quests={inProgress}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={handleQuestClick}
          emptyLabel={t(lang, "quests_empty")}
        />
        <QuestColumn
          title={t(lang, "quests_completed")}
          quests={completed}
          getSubSkillLabels={getSubSkillLabels}
          getSkillName={getSkillName}
          onQuestClick={handleQuestClick}
          emptyLabel={t(lang, "quests_empty")}
        />
      </div>

      <QuestsChart
        quests={MOCK_QUESTS}
        getSkillName={getSkillName}
        onQuestClick={handleQuestClick}
      />

      {selectedQuest && (
        <QuestDetailModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          skillColor={skillById[selectedQuest.skill]?.color}
          onQuestChange={handleQuestChange}
        />
      )}
    </div>
  );
}

type QuestColumnProps = {
  title: string;
  quests: Quest[];
  getSubSkillLabels: (quest: Quest) => { name: string; skillName: string; color: string }[];
  getSkillName: (skillId: string) => string;
  onQuestClick: (questId: string) => void;
  emptyLabel: string;
};

function QuestColumn({ title, quests, getSubSkillLabels, getSkillName, onQuestClick, emptyLabel }: QuestColumnProps) {
  return (
    <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-4 flex flex-col min-h-[280px]">
      <h2 className="text-[10px] text-[#888] uppercase tracking-widest mb-3 flex items-center justify-between gap-2">
        <span>{title}</span>
        <span className="font-mono text-[#666] tabular-nums">{quests.length}</span>
      </h2>
      {quests.length === 0 ? (
        <p className="text-[#555] text-xs flex-1">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col gap-2 flex-1">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              skillName={getSkillName(quest.skill)}
              subSkillLabels={getSubSkillLabels(quest)}
              onClick={() => onQuestClick(quest.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

type QuestCardProps = {
  quest: Quest;
  skillName: string;
  subSkillLabels: { name: string; skillName: string; color: string }[];
  onClick: () => void;
};

function QuestCard({ quest, skillName, subSkillLabels, onClick }: QuestCardProps) {
  const firstColor = subSkillLabels[0]?.color ?? "#666";
  return (
    <li>
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
        </div>
      </button>
    </li>
  );
}
