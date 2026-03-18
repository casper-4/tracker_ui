"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ViewGrid,
  Brain,
  Activity,
  Settings,
  Apple,
  Calendar,
  Flash,
  Heart,
  SidebarCollapse,
  SidebarExpand,
} from "iconoir-react";
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
  TAB_HEALTH,
} from "@/app/constants";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const navItems = [
  {
    icon: ViewGrid,
    labelKey: "nav_dashboard" as const,
    tab: TAB_DASHBOARD,
    accentColor: "#00FF9F",
  },
  {
    icon: Brain,
    labelKey: "nav_skills" as const,
    tab: TAB_SKILLS,
    accentColor: "#F3E600",
    subMenu: MOCK_SKILLS,
  },
  {
    icon: Flash,
    labelKey: "nav_quests" as const,
    tab: TAB_QUESTS,
    accentColor: "#C840FF",
  },
  {
    icon: Calendar,
    labelKey: "nav_calendar" as const,
    tab: TAB_CALENDAR,
    accentColor: "#55EAD4",
  },
  {
    icon: Activity,
    labelKey: "nav_training" as const,
    tab: TAB_TRAINING,
    accentColor: "#F3E600",
  },
  {
    icon: Apple,
    labelKey: "nav_diet" as const,
    tab: TAB_DIET,
    accentColor: "#55EAD4",
  },
  {
    icon: Heart,
    labelKey: "nav_health" as const,
    tab: TAB_HEALTH,
    accentColor: "#FF2060",
  },
  {
    icon: Settings,
    labelKey: "nav_preferences" as const,
    tab: TAB_PREFERENCES,
    accentColor: "#C840FF",
  },
];

function SkillRow({
  skill,
  isActive,
  onClick,
}: {
  skill: { id: string; name: string; color: string };
  isActive: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const dotColor = isActive || hovered ? skill.color : "rgba(255,255,255,0.2)";
  const textColor = isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left py-1.5 px-2 rounded-[5px] transition-all flex items-center gap-2"
    >
      <span
        className="shrink-0 w-1.5 h-1.5 rounded-full transition-all"
        style={{
          backgroundColor: dotColor,
          boxShadow: isActive || hovered ? `0 0 6px ${skill.color}99` : "none",
        }}
      />
      <span
        className="text-[10px] uppercase tracking-widest transition-colors"
        style={{ color: textColor }}
      >
        {skill.name}
      </span>
    </button>
  );
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
  collapsed = false,
  accentColor = "#F3E600",
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const iconColor = active || hovered ? accentColor : "rgba(255,255,255,0.35)";

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full flex items-center transition-all rounded-[7px] ${
        collapsed ? "justify-center px-0 py-3" : "gap-4 px-4 py-3"
      }`}
    >
      <Icon
        width={16}
        height={16}
        strokeWidth={1.8}
        className="shrink-0 transition-colors"
        style={{ color: iconColor }}
      />
      {!collapsed && (
        <span
          className="text-[13px] font-medium uppercase tracking-widest whitespace-nowrap transition-colors"
          style={{
            color: active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.35)",
          }}
        >
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
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
};

const Sidebar = ({
  activeTab,
  setActiveTab,
  selectedSkillId,
  setSelectedSkillId,
  collapsed,
  setCollapsed,
}: SidebarProps) => {
  const { lang } = useLang();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const isSkillsExpanded =
    !collapsed &&
    (hoveredMenu === TAB_SKILLS ||
      (activeTab === TAB_SKILL_DETAIL && selectedSkillId));

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="fixed left-10 top-6 bottom-6 lg:top-10 lg:bottom-10 xl:top-16 xl:bottom-16 z-50 flex flex-col overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderTop: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="overflow-y-auto scrollbar-none">
        {/* Header / Logo */}
        <div
          className={`flex items-center justify-center border-b border-white/[0.07] box-border ${collapsed ? "h-auto py-4" : "h-20 min-h-[5rem]"}`}
        >
          <div
            className={`dot-loader flex gap-[5px] ${collapsed ? "flex-col items-center" : "flex-row items-center"}`}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Nav */}
        <div className={`mt-6 ${collapsed ? "px-0" : "px-4"}`}>
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
                    accentColor={item.accentColor}
                  />
                  <AnimatePresence>
                    {isSkillsExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden ml-4 mt-1"
                      >
                        <ul className="py-2 px-2 flex flex-col gap-0.5">
                          {item.subMenu.map((skill) => {
                            const isActive =
                              activeTab === TAB_SKILL_DETAIL &&
                              selectedSkillId === skill.id;
                            return (
                              <li key={skill.id}>
                                <SkillRow
                                  skill={skill}
                                  isActive={isActive}
                                  onClick={() => {
                                    setSelectedSkillId?.(skill.id);
                                    setActiveTab(TAB_SKILL_DETAIL);
                                  }}
                                />
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
                  accentColor={item.accentColor}
                />
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`mt-auto border-t border-white/[0.07] flex items-center ${
          collapsed ? "justify-center p-4" : "justify-between p-6"
        }`}
      >
        {!collapsed && (
          <p className="text-[10px] text-white/[0.18] tracking-widest">
            BUILD 2026.03.04
          </p>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-white/[0.18] hover:text-[#F3E600] transition-colors p-1"
        >
          {collapsed ? (
            <SidebarExpand width={16} height={16} strokeWidth={1.8} />
          ) : (
            <SidebarCollapse width={16} height={16} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
