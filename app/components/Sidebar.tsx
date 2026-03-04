"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Target,
  Activity,
  Settings,
  Diamond,
  Calendar,
  Swords,
} from "lucide-react";
import { MOCK_SKILLS } from "@/lib/mock";
import {
  TAB_DASHBOARD,
  TAB_SKILLS,
  TAB_QUESTS,
  TAB_TRAINING,
  TAB_DIET,
  TAB_CALENDAR,
  TAB_PREFERENCES,
  TAB_SKILL_DETAIL,
} from "@/app/constants";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const navItems = [
  { icon: LayoutGrid, labelKey: "nav_dashboard" as const, tab: TAB_DASHBOARD },
  {
    icon: Target,
    labelKey: "nav_skills" as const,
    tab: TAB_SKILLS,
    subMenu: MOCK_SKILLS,
  },
  { icon: Swords, labelKey: "nav_quests" as const, tab: TAB_QUESTS },
  { icon: Calendar, labelKey: "nav_calendar" as const, tab: TAB_CALENDAR },
  { icon: Activity, labelKey: "nav_training" as const, tab: TAB_TRAINING },
  { icon: Diamond, labelKey: "nav_diet" as const, tab: TAB_DIET },
  { icon: Settings, labelKey: "nav_preferences" as const, tab: TAB_PREFERENCES },
];

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 border border-transparent transition-all ${
        active
          ? "border-[#facc15] text-[#facc15] bg-[#facc15]/5"
          : "text-[#888] hover:text-[#ccc] hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs uppercase tracking-widest">{label}</span>
    </button>
  );
}

type SidebarProps = {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  selectedSkillId?: string;
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
};

const Sidebar = ({ activeTab, setActiveTab, selectedSkillId, setSelectedSkillId }: SidebarProps) => {
  const { lang } = useLang();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const isSkillsExpanded =
    hoveredMenu === TAB_SKILLS || (activeTab === TAB_SKILL_DETAIL && selectedSkillId);

  return (
    <aside className="w-64 border-r border-[#1f1f1f] flex flex-col justify-between shrink-0 bg-[#050505] z-20 relative">
      <div>
        <div className="h-[7.5rem] min-h-[7.5rem] p-6 flex items-center gap-4 border-b border-[#1f1f1f] box-border">
          <div className="w-10 h-10 border border-[#facc15] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full border-2 border-[#facc15] flex items-center justify-center">
              <div className="w-1 h-1 bg-[#facc15] rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-sans font-bold tracking-widest text-white leading-none">
              ATLAS
            </h1>
            <p className="text-[10px] text-[#facc15] tracking-widest mt-1">
              SKILL_OS V0.1
            </p>
          </div>
        </div>

        <div className="px-4 mt-6">
          <h2 className="text-[10px] text-[#666] uppercase tracking-widest mb-4 px-2">{`// NAV`}</h2>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) =>
              item.subMenu ? (
                <div
                  key={item.tab}
                  className="relative group"
                  onMouseEnter={() => setHoveredMenu(item.tab)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <NavItem
                    icon={item.icon}
                    label={t(lang, item.labelKey)}
                    active={activeTab === item.tab || activeTab === TAB_SKILL_DETAIL}
                    onClick={() => setActiveTab(item.tab)}
                  />
                  <AnimatePresence>
                    {isSkillsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-[#0a0a0a] border border-[#1f1f1f] ml-4 mt-1"
                      >
                        <ul className="py-2 px-2 flex flex-col gap-1">
                          {item.subMenu.map((skill) => {
                            const isActive =
                              activeTab === TAB_SKILL_DETAIL && selectedSkillId === skill.id;
                            return (
                              <li key={skill.id}>
                                <button
                                  onClick={() => {
                                    setSelectedSkillId?.(skill.id);
                                    setActiveTab(TAB_SKILL_DETAIL);
                                  }}
                                  className={`w-full text-left text-[10px] py-1.5 px-2 transition-colors uppercase tracking-widest ${
                                    isActive
                                      ? "text-[#facc15] bg-[#facc15]/5 border-l-2 border-[#facc15] -ml-0.5 pl-2.5"
                                      : "text-[#888] hover:text-[#facc15]"
                                  }`}
                                >
                                  {skill.name}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavItem
                  key={item.tab}
                  icon={item.icon}
                  label={t(lang, item.labelKey)}
                  active={activeTab === item.tab}
                  onClick={() => setActiveTab(item.tab)}
                />
              ),
            )}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-[#1f1f1f]">
        <p className="text-[10px] text-[#444] tracking-widest">
          BUILD 2026.03.04
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
