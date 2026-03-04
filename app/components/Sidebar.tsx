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
  ChevronsLeft,
  ChevronsRight,
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
  {
    icon: Settings,
    labelKey: "nav_preferences" as const,
    tab: TAB_PREFERENCES,
  },
];

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  collapsed = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center border border-transparent transition-all ${
        collapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-3"
      } ${
        active
          ? "border-[#facc15] text-[#facc15] bg-[#facc15]/5"
          : "text-[#888] hover:text-[#ccc] hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span className="text-xs uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
}

type SidebarProps = {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  selectedSkillId?: string;
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
};

const Sidebar = ({
  activeTab,
  setActiveTab,
  selectedSkillId,
  setSelectedSkillId,
}: SidebarProps) => {
  const { lang } = useLang();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const isSkillsExpanded =
    !collapsed &&
    (hoveredMenu === TAB_SKILLS ||
      (activeTab === TAB_SKILL_DETAIL && selectedSkillId));

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="border-r border-[#1f1f1f] flex flex-col justify-between shrink-0 bg-[#050505] z-20 relative overflow-hidden"
    >
      <div>
        {/* Header / Logo */}
        <div className="h-[7.5rem] min-h-[7.5rem] p-4 flex items-center border-b border-[#1f1f1f] box-border overflow-hidden">
          <div
            className={`flex items-center gap-4 ${collapsed ? "justify-center w-full" : ""}`}
          >
            <div className="w-10 h-10 border border-[#facc15] flex items-center justify-center shrink-0">
              <div className="w-4 h-4 rounded-full border-2 border-[#facc15] flex items-center justify-center">
                <div className="w-1 h-1 bg-[#facc15] rounded-full"></div>
              </div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-sans font-bold tracking-widest text-white leading-none">
                  Optimize
                </h1>
                <p className="text-[10px] text-[#facc15] tracking-widest mt-1">
                  TRACKER_UI V0.1
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <div className={`mt-6 ${collapsed ? "px-0" : "px-4"}`}>
          {!collapsed && (
            <h2 className="text-[10px] text-[#666] uppercase tracking-widest mb-4 px-2">{`// NAV`}</h2>
          )}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) =>
              item.subMenu ? (
                <div
                  key={item.tab}
                  className="relative group"
                  onMouseEnter={() => !collapsed && setHoveredMenu(item.tab)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <NavItem
                    icon={item.icon}
                    label={t(lang, item.labelKey)}
                    active={
                      activeTab === item.tab || activeTab === TAB_SKILL_DETAIL
                    }
                    onClick={() => setActiveTab(item.tab)}
                    collapsed={collapsed}
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
                              activeTab === TAB_SKILL_DETAIL &&
                              selectedSkillId === skill.id;
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
                  collapsed={collapsed}
                />
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`border-t border-[#1f1f1f] flex items-center ${
          collapsed ? "justify-center p-4" : "justify-between p-6"
        }`}
      >
        {!collapsed && (
          <p className="text-[10px] text-[#444] tracking-widest">
            BUILD 2026.03.04
          </p>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-[#444] hover:text-[#facc15] transition-colors p-1"
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" />
          ) : (
            <ChevronsLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
