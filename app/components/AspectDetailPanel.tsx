"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Xmark, NavArrowRight } from "iconoir-react";
import type { Aspect, SubSkill } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const PANEL_WIDTH = 400;

type Props = {
  aspect: Aspect;
  skillName: string;
  skillColor: string;
  subSkills: SubSkill[];
  onClose: () => void;
  onSubSkillSelect?: (subSkillId: string) => void;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.14em] leading-none text-[var(--color-fg-subtle)]">
      {children}
    </p>
  );
}

export default function AspectDetailPanel({
  aspect,
  skillName,
  skillColor,
  subSkills,
  onClose,
  onSubSkillSelect,
}: Props) {
  const { lang } = useLang();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const recentHistory = useMemo(() => aspect.history.slice(-30), [aspect.history]);
  const bars = useMemo(() => aspect.history.slice(-20), [aspect.history]);
  const avg30d = useMemo(() => {
    if (!recentHistory.length) return 0;
    const sum = recentHistory.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / recentHistory.length);
  }, [recentHistory]);
  const peak30d = useMemo(
    () => (recentHistory.length ? Math.max(...recentHistory) : 0),
    [recentHistory],
  );
  const low30d = useMemo(
    () => (recentHistory.length ? Math.min(...recentHistory) : 0),
    [recentHistory],
  );
  const delta7d = useMemo(() => {
    if (aspect.history.length < 8) return 0;
    const latest = aspect.history[aspect.history.length - 1] ?? 0;
    const weekAgo = aspect.history[aspect.history.length - 8] ?? latest;
    return latest - weekAgo;
  }, [aspect.history]);

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: PANEL_WIDTH, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
      className="h-full flex flex-col overflow-hidden shrink-0 pt-6 pb-6 lg:pt-10 lg:pb-10 xl:pt-16 xl:pb-16 pr-10 pl-2"
      style={{ minWidth: 0 }}
      role="complementary"
      aria-label={t(lang, "aspect_detail_title")}
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
            background: aspect.color,
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
                {aspect.name}
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
            key={aspect.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="px-5 py-5 space-y-6">
              <div>
                <SectionLabel>{t(lang, "quest_description")}</SectionLabel>
                <p
                  className="mt-2 text-[13px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {aspect.description || t(lang, "aspect_no_description")}
                </p>
              </div>

              <div>
                <SectionLabel>{t(lang, "aspect_completion")}</SectionLabel>
                <div
                  className="mt-2 p-3 rounded-[10px]"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.20) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="flex items-end justify-between">
                    <span
                      className="text-2xl font-bold font-mono tracking-tight"
                      style={{ color: aspect.color }}
                    >
                      {aspect.completionPercentage}%
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-[0.12em]"
                      style={{
                        color:
                          delta7d >= 0
                            ? "rgba(0,255,159,0.85)"
                            : "rgba(255,32,96,0.85)",
                      }}
                    >
                      {t(lang, "aspect_last7_delta")}: {delta7d >= 0 ? "+" : ""}
                      {delta7d}%
                    </span>
                  </div>
                  <div className="mt-3 h-3 rounded-full overflow-hidden bg-white/5">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${aspect.completionPercentage}%`,
                        background: `linear-gradient(90deg, ${aspect.color}44, ${aspect.color})`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>{t(lang, "skill_progress")}</SectionLabel>
                <div
                  className="mt-2 p-3 rounded-[10px]"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.20) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="h-16 flex items-end gap-1.5">
                    {bars.map((value, i) => (
                      <div
                        key={`${aspect.id}-${i}`}
                        className="flex-1 rounded-t-[5px]"
                        style={{
                          height: `${Math.max(8, Math.round(value * 0.55))}%`,
                          background: `${aspect.color}AA`,
                          boxShadow: `0 0 8px ${aspect.color}55`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <StatPill label={t(lang, "aspect_avg_30d")} value={`${avg30d}%`} />
                    <StatPill label={t(lang, "aspect_peak_30d")} value={`${peak30d}%`} />
                    <StatPill label={t(lang, "aspect_low_30d")} value={`${low30d}%`} />
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>{t(lang, "aspect_related_subskills")}</SectionLabel>
                {subSkills.length === 0 ? (
                  <p className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {t(lang, "aspect_no_subskills")}
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {subSkills.map((subSkill) => (
                      <button
                        key={subSkill.id}
                        type="button"
                        onClick={() => onSubSkillSelect?.(subSkill.id)}
                        className="w-full text-left p-2 rounded-[8px] transition-colors hover:bg-white/5"
                        style={{
                          border: "1px solid rgba(255,255,255,0.07)",
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] text-white/80">{subSkill.name}</span>
                          <div className="flex items-center gap-1.5 text-white/35">
                            <span className="text-[10px] uppercase tracking-[0.12em]">
                              {t(lang, "subskill_level")} {subSkill.level}
                            </span>
                            <NavArrowRight width={12} height={12} strokeWidth={1.8} />
                          </div>
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

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-[8px] px-2 py-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p className="text-[9px] uppercase tracking-[0.1em] text-white/30">{label}</p>
      <p className="text-[12px] font-mono font-bold text-white/70 mt-0.5">{value}</p>
    </div>
  );
}
