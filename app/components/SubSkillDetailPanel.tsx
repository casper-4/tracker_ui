"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Xmark } from "iconoir-react";
import type { Quest, SubSkill } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const PANEL_WIDTH = 400;

type Props = {
  subSkill: SubSkill;
  skillName: string;
  skillColor: string;
  aspectName?: string;
  linkedQuests: Quest[];
  onClose: () => void;
  onQuestSelect?: (questId: string) => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.14em] leading-none text-[var(--color-fg-subtle)]">
      {children}
    </p>
  );
}

export default function SubSkillDetailPanel({
  subSkill,
  skillName,
  skillColor,
  aspectName,
  linkedQuests,
  onClose,
  onQuestSelect,
}: Props) {
  const { lang } = useLang();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const completion = useMemo(() => {
    if (!subSkill.quests.length) return 0;
    const total = subSkill.quests.reduce((acc, quest) => acc + quest.percentage, 0);
    return Math.round(total / subSkill.quests.length);
  }, [subSkill.quests]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: PANEL_WIDTH, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
      className="h-full flex flex-col overflow-hidden shrink-0 pt-6 pb-6 lg:pt-10 lg:pb-10 xl:pt-16 xl:pb-16 pr-10 pl-2"
      style={{ minWidth: 0 }}
      role="complementary"
      aria-label={t(lang, "subskill_detail_title")}
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden rounded-[14px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          borderLeft: `2px solid ${skillColor}`,
          backdropFilter: "blur(24px)",
        }}
      >
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: skillColor,
            filter: "blur(70px)",
            opacity: 0.12,
          }}
        />
        <div
          className="absolute pointer-events-none z-10"
          style={{
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
          }}
        />

        <div
          className="px-5 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="text-[8px] uppercase mb-2"
                style={{
                  fontFamily: "var(--font-accent)",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: skillColor,
                }}
              >
                {skillName}
              </p>
              <h2
                className="text-base font-bold leading-snug"
                style={{ color: "#fff", letterSpacing: "-0.01em" }}
              >
                {subSkill.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "rgba(255,255,255,0.30)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.70)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.30)")
              }
              aria-label={t(lang, "quest_close")}
            >
              <Xmark width={16} height={16} strokeWidth={2.0} />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={subSkill.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="px-5 py-5 space-y-6">
              <div>
                <SectionLabel>{t(lang, "quest_description")}</SectionLabel>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                  {subSkill.description || t(lang, "subskill_no_description")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <StatPill
                  label={t(lang, "subskill_level")}
                  value={String(subSkill.level)}
                  accent={skillColor}
                />
                <StatPill
                  label={t(lang, "subskill_completion")}
                  value={`${completion}%`}
                  accent={skillColor}
                />
              </div>

              <div>
                <SectionLabel>{t(lang, "subskill_belongs_aspect")}</SectionLabel>
                <p className="mt-2 text-[12px] text-white/65">{aspectName || "—"}</p>
              </div>

              <div>
                <SectionLabel>{t(lang, "subskill_linked_quests")}</SectionLabel>
                {linkedQuests.length === 0 ? (
                  <p className="mt-2 text-[12px] text-white/35">{t(lang, "subskill_no_quests")}</p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {linkedQuests.map((quest) => (
                      <button
                        key={quest.id}
                        type="button"
                        onClick={() => onQuestSelect?.(quest.id)}
                        className="w-full text-left p-2 rounded-[8px] transition-colors hover:bg-white/5"
                        style={{
                          border: "1px solid rgba(255,255,255,0.07)",
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] text-white/80">{quest.name}</span>
                          <span className="text-[10px] uppercase tracking-[0.1em] text-white/35">
                            {Math.round(quest.duration / 60)} min
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-[10px] px-3 py-3"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.20) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderTop: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">{label}</p>
      <p className="text-[16px] font-mono font-bold mt-1" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
