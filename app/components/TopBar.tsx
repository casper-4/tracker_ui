"use client";

import { MOCK_SKILLS, MOCK_USER } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import SkillColorPicker from "@/app/components/SkillColorPicker";

const formatHeaderDate = () => {
  const d = new Date();
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
};

const PAGE_HEADERS: Record<
  string,
  {
    subtitle: string | (() => string);
    title: string;
    titleHighlight?: boolean;
    descriptionKey?: "quests_description" | "calendar_description";
    description?: string;
  }
> = {
  DASHBOARD: {
    subtitle: () => formatHeaderDate(),
    title: `SYS_HELLO, ${MOCK_USER.name.toUpperCase()}`,
    titleHighlight: true,
    description: "Today's plan and progress overview.",
  },
  SKILLS: {
    subtitle: "// SKILL DATABASE",
    title: "SKILL_RIG ACTIVE",
    titleHighlight: true,
    description: "All skills and their status.",
  },
  QUESTS: {
    subtitle: "// QUESTS",
    title: "QUESTS",
    titleHighlight: true,
    descriptionKey: "quests_description",
  },
  TRAINING: {
    subtitle: "// TRAINING",
    title: "TRAINING",
    titleHighlight: true,
    description: "Training plan and history.",
  },
  DIET: {
    subtitle: "// DIET",
    title: "DIET",
    titleHighlight: true,
    description: "Meal plan and calories.",
  },
  CALENDAR: {
    subtitle: "// CALENDAR",
    title: "CALENDAR",
    titleHighlight: true,
    descriptionKey: "calendar_description",
  },
  PREFERENCES: {
    subtitle: "// SETTINGS",
    title: "PREFERENCES",
    titleHighlight: true,
    description: "App and account settings.",
  },
};

type TopBarProps = {
  activeTab: string;
  selectedSkillId?: string;
  skillColor?: string;
  onSkillColorChange?: (color: string) => void;
};

export default function TopBar({
  activeTab,
  selectedSkillId,
  skillColor,
  onSkillColorChange,
}: TopBarProps) {
  const { lang } = useLang();

  let subtitle = "// MODULE";
  let title = "IN PROGRESS";
  let titleHighlight = true as boolean;
  let description: string | undefined = undefined;

  if (activeTab === "SKILL_DETAIL" && selectedSkillId) {
    const skill = MOCK_SKILLS.find((s) => s.id === selectedSkillId);
    subtitle = "// SKILLS";
    title = skill?.name ?? selectedSkillId;
    titleHighlight = false;
    description = skill?.description;
  } else {
    const entry = PAGE_HEADERS[activeTab];
    if (entry) {
      subtitle =
        typeof entry.subtitle === "function"
          ? entry.subtitle()
          : entry.subtitle;
      title = entry.title;
      titleHighlight = entry.titleHighlight ?? true;
      if (entry.descriptionKey) {
        description = t(lang, entry.descriptionKey);
      } else {
        description = entry.description;
      }
    }
  }

  const skill =
    activeTab === "SKILL_DETAIL" && selectedSkillId
      ? MOCK_SKILLS.find((s) => s.id === selectedSkillId)
      : null;

  const showProgress = activeTab === "SKILL_DETAIL";

  return (
    <header className="sticky top-0 z-10 flex items-center gap-6 p-6 border-b border-[#1f1f1f] bg-[#050505] shrink-0 h-[7.5rem] box-border">
      {/* Left: title + description */}
      <div className="w-[340px] min-w-[340px] shrink-0 flex flex-col justify-center min-h-0">
        <p className="text-[10px] text-[#666] uppercase tracking-widest mb-1 truncate">
          {subtitle}
        </p>
        <h2 className="text-xl font-sans font-bold text-white tracking-tight leading-none truncate">
          {titleHighlight ? (
            title.split(" ").length > 1 ? (
              <>
                {title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-[#facc15] text-glow-yellow">
                  {title.split(" ").slice(-1)[0]}
                </span>
              </>
            ) : (
              <span className="text-[#facc15] text-glow-yellow">{title}</span>
            )
          ) : (
            <span className="text-[#facc15] text-glow-yellow">{title}</span>
          )}
        </h2>
        {description ? (
          <p className="text-sm text-[#888] mt-2 truncate">{description}</p>
        ) : (
          <div className="mt-2 min-h-[2.5rem]" aria-hidden />
        )}
      </div>

      {/* Progress — only on SKILL_DETAIL */}
      <div className="w-[400px] min-w-[400px] h-[52px] shrink-0 flex flex-col justify-center -ml-2">
        {showProgress ? (
          <>
            <div className="text-[10px] text-[#666] uppercase tracking-widest mb-1 w-full">
              {t(lang, "skill_progress")}
            </div>
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 min-w-0 h-2.5 bg-[#1f1f1f] rounded-full overflow-hidden">
                {skill ? (
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${skill.completionPercentage}%`,
                      backgroundColor: skillColor,
                    }}
                  />
                ) : null}
              </div>
              <span
                className="text-xs font-mono font-bold shrink-0 w-10 text-right"
                style={{ color: skillColor ?? "#666" }}
              >
                {skill ? `${skill.completionPercentage}%` : "—"}
              </span>
            </div>
          </>
        ) : null}
      </div>

      {/* Right: color swatch (SKILL_DETAIL only) */}
      {showProgress && skillColor && onSkillColorChange && (
        <div className="ml-auto shrink-0">
          <SkillColorPicker color={skillColor} onChange={onSkillColorChange} />
        </div>
      )}
    </header>
  );
}
