"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPage from "@/app/_pages/DashboardPage";
import SkillsListPage from "@/app/_pages/SkillsListPage";
import QuestsPage from "@/app/_pages/QuestsPage";
import SkillDetailPage from "@/app/_pages/SkillDetailPage";
import CalendarPage from "@/app/_pages/CalendarPage";
import TrainingPage from "@/app/_pages/TrainingPage";
import DietPage from "@/app/_pages/DietPage";
import HealthPage from "@/app/_pages/HealthPage";
import PreferencesPage from "@/app/_pages/PreferencesPage";
import Sidebar from "@/app/components/Sidebar";
// import TopBar from "@/app/components/TopBar";
import QuestDetailPanel from "@/app/components/QuestDetailPanel";
import { MOCK_QUESTS, MOCK_SKILLS } from "@/lib/mock";
import type { Quest, QuestStatus, NamedMeal, MealSlotId } from "@/lib/mock";
import MealDetailPanel from "@/app/components/MealDetailPanel";
import {
  TAB_DASHBOARD,
  TAB_SKILLS,
  TAB_QUESTS,
  TAB_SKILL_DETAIL,
  TAB_CALENDAR,
  TAB_TRAINING,
  TAB_DIET,
  TAB_PREFERENCES,
  TAB_HEALTH,
} from "@/app/constants";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const MODULE_IN_BUILD: string[] = [];
const SCROLLABLE_SELECTOR =
  ".custom-scrollbar, .overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-scroll, .overflow-y-scroll, .overflow-x-scroll";
const SCROLLBAR_INTENT_ZONE_PX = 14;

function ModuleInProgress() {
  const { lang } = useLang();
  return (
    <motion.div
      key="in-progress"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center h-full text-[#666]"
    >
      <p className="uppercase tracking-widest text-sm">
        {t(lang, "module_in_progress")}
      </p>
    </motion.div>
  );
}

export default function TrackerUI() {
  const [activeTab, setActiveTab] = useState(TAB_DASHBOARD);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(
    undefined,
  );
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [questStatuses, setQuestStatuses] = useState<
    Record<string, QuestStatus>
  >({});
  // Per-skill color overrides — keyed by skill ID
  // TODO: [DATA] save skill colors to persistence
  const [skillColors, setSkillColors] = useState<Record<string, string>>({});
  const [selectedMealForPanel, setSelectedMealForPanel] = useState<{
    meal: NamedMeal;
    slot: MealSlotId;
    time: string;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // 60px collapsed + 40px left-10 + 12px gap  |  240px expanded + 40px + 12px
  const contentPadding = sidebarCollapsed ? 112 : 292;

  const getSkillColor = (id?: string): string => {
    if (!id) return "#666666";
    return (
      skillColors[id] ??
      MOCK_SKILLS.find((s) => s.id === id)?.color ??
      "#666666"
    );
  };

  const setSkillColor = (id: string, color: string) => {
    setSkillColors((prev) => ({ ...prev, [id]: color }));
  };

  const skillById = useMemo(
    () => Object.fromEntries(MOCK_SKILLS.map((s) => [s.id, s])),
    [],
  );

  const selectedQuest = useMemo<Quest | null>(() => {
    if (!selectedQuestId) return null;
    const q = MOCK_QUESTS.find((q) => q.id === selectedQuestId);
    if (!q) return null;
    return { ...q, status: questStatuses[q.id] ?? q.status };
  }, [selectedQuestId, questStatuses]);

  const handleQuestChange = (updated: Quest) => {
    setQuestStatuses((prev) => ({ ...prev, [updated.id]: updated.status }));
  };

  const content = useMemo(() => {
    if (activeTab === TAB_DASHBOARD) {
      return (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <DashboardPage
            setSelectedSkillId={setSelectedSkillId}
            setActiveTab={setActiveTab}
          />
        </motion.div>
      );
    }
    if (activeTab === TAB_SKILLS) {
      return (
        <motion.div
          key="skills"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <SkillsListPage
            setSelectedSkillId={setSelectedSkillId}
            setActiveTab={setActiveTab}
          />
        </motion.div>
      );
    }
    if (activeTab === TAB_QUESTS) {
      return (
        <motion.div
          key="quests"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <QuestsPage
            questStatuses={questStatuses}
            onQuestSelect={setSelectedQuestId}
            onQuestStatusChange={(id, status) =>
              setQuestStatuses((prev) => ({ ...prev, [id]: status }))
            }
          />
        </motion.div>
      );
    }
    if (activeTab === TAB_SKILL_DETAIL) {
      return (
        <motion.div
          key="skill-detail"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <SkillDetailPage
            skillId={selectedSkillId}
            skillColor={getSkillColor(selectedSkillId)}
            onSkillColorChange={(c) =>
              selectedSkillId && setSkillColor(selectedSkillId, c)
            }
            onQuestSelect={setSelectedQuestId}
          />
        </motion.div>
      );
    }
    if (activeTab === TAB_CALENDAR) {
      return (
        <motion.div
          key="calendar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <CalendarPage onQuestSelect={setSelectedQuestId} />
        </motion.div>
      );
    }
    if (activeTab === TAB_TRAINING) {
      return (
        <motion.div
          key="training"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <TrainingPage />
        </motion.div>
      );
    }
    if (activeTab === TAB_DIET) {
      return (
        <motion.div
          key="diet"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto w-full flex-1 min-h-0 flex flex-col"
        >
          <DietPage onMealSelect={setSelectedMealForPanel} />
        </motion.div>
      );
    }
    if (activeTab === TAB_HEALTH) {
      return (
        <motion.div
          key="health"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <HealthPage />
        </motion.div>
      );
    }
    if (activeTab === TAB_PREFERENCES) {
      return (
        <motion.div
          key="preferences"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="max-w-6xl mx-auto"
        >
          <PreferencesPage />
        </motion.div>
      );
    }
    if (MODULE_IN_BUILD.includes(activeTab)) {
      return <ModuleInProgress key="in-build" />;
    }
    return <ModuleInProgress key="other" />;
  }, [activeTab, selectedSkillId, questStatuses, skillColors]);

  useEffect(() => {
    let activeElement: HTMLElement | null = null;
    let lockedElement: HTMLElement | null = null;

    const setActiveElement = (next: HTMLElement | null) => {
      if (activeElement === next) return;
      activeElement?.classList.remove("scrollbar-intent-active");
      next?.classList.add("scrollbar-intent-active");
      activeElement = next;
    };

    const getScrollableAtPoint = (x: number, y: number): HTMLElement | null => {
      const elements = document.elementsFromPoint(x, y);

      for (const node of elements) {
        if (!(node instanceof HTMLElement)) continue;
        if (!node.matches(SCROLLABLE_SELECTOR)) continue;
        if (node.classList.contains("scrollbar-none")) continue;

        const hasVerticalScroll = node.scrollHeight > node.clientHeight;
        const hasHorizontalScroll = node.scrollWidth > node.clientWidth;
        if (!hasVerticalScroll && !hasHorizontalScroll) continue;

        return node;
      }

      return null;
    };

    const isInsideRightIntentZone = (
      element: HTMLElement,
      clientX: number,
      clientY: number,
    ): boolean => {
      const rect = element.getBoundingClientRect();
      if (clientY < rect.top || clientY > rect.bottom) return false;
      const deltaRight = rect.right - clientX;
      return deltaRight >= 0 && deltaRight <= SCROLLBAR_INTENT_ZONE_PX;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (lockedElement) {
        setActiveElement(lockedElement);
        return;
      }

      const candidate = getScrollableAtPoint(event.clientX, event.clientY);
      if (candidate && isInsideRightIntentZone(candidate, event.clientX, event.clientY)) {
        setActiveElement(candidate);
        return;
      }

      setActiveElement(null);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const candidate = getScrollableAtPoint(event.clientX, event.clientY);
      if (candidate && isInsideRightIntentZone(candidate, event.clientX, event.clientY)) {
        lockedElement = candidate;
        setActiveElement(candidate);
      }
    };

    const clearLock = () => {
      lockedElement = null;
    };

    const clearActive = () => {
      lockedElement = null;
      setActiveElement(null);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", clearLock, { passive: true });
    window.addEventListener("pointercancel", clearLock, { passive: true });
    window.addEventListener("blur", clearActive);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", clearLock);
      window.removeEventListener("pointercancel", clearLock);
      window.removeEventListener("blur", clearActive);
      activeElement?.classList.remove("scrollbar-intent-active");
    };
  }, []);

  return (
    <div className="flex w-full h-screen bg-black text-white font-mono overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSkillId={selectedSkillId}
        setSelectedSkillId={setSelectedSkillId}
        skillColors={skillColors}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <motion.div
        className="flex-1 flex flex-col min-w-0"
        animate={{ paddingLeft: contentPadding }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      >
        {/* <TopBar
          activeTab={activeTab}
          selectedSkillId={selectedSkillId}
          skillColor={getSkillColor(selectedSkillId)}
          onSkillColorChange={(c) =>
            selectedSkillId && setSkillColor(selectedSkillId, c)
          }
        /> */}
        <div className="flex-1 flex min-h-0">
          <main
            className={`flex-1 min-w-0 custom-scrollbar p-6 lg:p-10 xl:p-16 ${activeTab === TAB_CALENDAR || activeTab === TAB_DIET ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}
          >
            <AnimatePresence mode="wait">{content}</AnimatePresence>
          </main>
          <AnimatePresence>
            {selectedQuest && (
              <QuestDetailPanel
                quest={selectedQuest}
                onClose={() => setSelectedQuestId(null)}
                skillColor={getSkillColor(selectedQuest.skill)}
                skillName={
                  skillById[selectedQuest.skill]?.name ?? selectedQuest.skill
                }
                onQuestChange={handleQuestChange}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {activeTab === TAB_DIET && selectedMealForPanel && (
              <MealDetailPanel
                meal={selectedMealForPanel.meal}
                slot={selectedMealForPanel.slot}
                time={selectedMealForPanel.time}
                onClose={() => setSelectedMealForPanel(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
