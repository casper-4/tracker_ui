"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Music, Crosshair, Mic, Disc, PenTool } from "lucide-react";
import { MOCK_SKILLS } from "@/lib/mock";
import type { Skill } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL } from "@/app/constants";

type SkillsListPageProps = {
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
  setActiveTab?: Dispatch<SetStateAction<string>>;
};

export default function SkillsListPage({ setSelectedSkillId, setActiveTab }: SkillsListPageProps) {
  const { lang } = useLang();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_SKILLS.length === 0 ? (
          <p className="text-[#888] text-sm">{t(lang, "no_skills")}</p>
        ) : (
          MOCK_SKILLS.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              icon={
                skill.id === "skill/guitar" ? Music
                : skill.id === "skill/vocals" ? Mic
                : skill.id === "skill/production" ? Disc
                : skill.id === "skill/songwriting" ? PenTool
                : Crosshair
              }
              lang={lang}
              onSelect={() => {
                setSelectedSkillId?.(skill.id);
                setActiveTab?.(TAB_SKILL_DETAIL);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  icon: Icon,
  lang,
  onSelect,
}: {
  skill: Skill;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  lang: "pl" | "en";
  onSelect?: () => void;
}) {
  const { name, description, completionPercentage, nextQuest, color } = skill;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex flex-col hover:border-[#333] transition-colors group cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[#1f1f1f] flex items-center justify-center group-hover:border-white/20 transition-colors">
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">{name}</h3>
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>{completionPercentage}%</span>
      </div>

      <p className="text-xs text-[#666] mb-6 flex-1">{description}</p>

      <div className="w-full h-1 bg-[#1f1f1f] rounded-full mb-6">
        <div className="h-full rounded-full" style={{ width: `${completionPercentage}%`, backgroundColor: color }} />
      </div>

      <div className="pt-4 border-t border-[#1f1f1f]">
        <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">
          {t(lang, "skill_next_quest")}
        </p>
        <p className="text-sm text-[#ccc]">{nextQuest}</p>
      </div>
    </button>
  );
}
