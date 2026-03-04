"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPage from "@/app/_pages/DashboardPage";
import SkillsListPage from "@/app/_pages/SkillsListPage";
import QuestsPage from "@/app/_pages/QuestsPage";
import SkillDetailPage from "@/app/_pages/SkillDetailPage";
import CalendarPage from "@/app/_pages/CalendarPage";
import TrainingPage from "@/app/_pages/TrainingPage";
import DietPage from "@/app/_pages/DietPage";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";
import {
  TAB_DASHBOARD,
  TAB_SKILLS,
  TAB_QUESTS,
  TAB_SKILL_DETAIL,
  TAB_CALENDAR,
  TAB_TRAINING,
  TAB_DIET,
  TAB_PREFERENCES,
} from "@/app/constants";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const MODULE_IN_BUILD = [TAB_PREFERENCES];

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
      <p className="uppercase tracking-widest text-sm">{t(lang, "module_in_progress")}</p>
    </motion.div>
  );
}

export default function TrackerUI() {
  const [activeTab, setActiveTab] = useState(TAB_DASHBOARD);
  const [selectedSkillId, setSelectedSkillId] = useState<string | undefined>(undefined);

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
          <QuestsPage />
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
          <SkillDetailPage skillId={selectedSkillId} />
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
          className="h-full min-h-0 flex flex-col max-w-7xl mx-auto"
        >
          <CalendarPage />
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
          className="max-w-6xl mx-auto"
        >
          <DietPage />
        </motion.div>
      );
    }
    if (MODULE_IN_BUILD.includes(activeTab)) {
      return <ModuleInProgress key="in-build" />;
    }
    return <ModuleInProgress key="other" />;
  }, [activeTab, selectedSkillId]);

  return (
    <div className="flex w-full h-screen bg-[#050505] text-[#e0e0e0] font-mono overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSkillId={selectedSkillId}
        setSelectedSkillId={setSelectedSkillId}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} selectedSkillId={selectedSkillId} />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 xl:p-16">
          <AnimatePresence mode="wait">{content}</AnimatePresence>
        </main>
      </div>
    </div>
  );
}
