"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_TRAINING_HISTORY } from "@/lib/mock";
import type {
  TrainingSession,
  TrainingCategory,
  MuscleGroup,
} from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import {
  ChevronRight,
  Trophy,
  Clock,
  BarChart2,
  Dumbbell,
  TrendingUp,
  Check,
  CalendarDays,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ─── Colour maps ─────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<TrainingCategory, string> = {
  push: "#f97316",
  pull: "#38bdf8",
  legs: "#22c55e",
  full: "#a855f7",
};

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  back: "#38bdf8",
  chest: "#f97316",
  shoulders: "#a855f7",
  arms: "#ec4899",
  legs: "#22c55e",
  core: "#f59e0b",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

type FilterType = TrainingCategory | "all";

function calcVolume(session: TrainingSession): number {
  return session.exercises.reduce(
    (total, ex) =>
      total + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0,
  );
}

function calcTotalSets(session: TrainingSession): number {
  return session.exercises.reduce((total, ex) => total + ex.sets.length, 0);
}

function countPRs(session: TrainingSession): number {
  return session.exercises.filter((ex) => ex.pr).length;
}

function formatDate(dateStr: string, lang: "pl" | "en"): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const { lang } = useLang();

  const [selectedId, setSelectedId] = useState<string>(
    MOCK_TRAINING_HISTORY[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedExId, setExpandedExId] = useState<string | null>(null);
  const [progressEx, setProgressEx] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? MOCK_TRAINING_HISTORY
        : MOCK_TRAINING_HISTORY.filter((s) => s.category === filter),
    [filter],
  );

  const selected = useMemo(
    () => MOCK_TRAINING_HISTORY.find((s) => s.id === selectedId) ?? null,
    [selectedId],
  );

  // Build weight-over-time data for the progress chart
  const progressData = useMemo(() => {
    if (!progressEx) return [];
    return MOCK_TRAINING_HISTORY.filter((s) => s.status === "completed")
      .map((s) => {
        const ex = s.exercises.find((e) => e.name === progressEx);
        if (!ex) return null;
        const maxW = Math.max(...ex.sets.map((set) => set.weight));
        return { date: formatDate(s.date, lang), weight: maxW };
      })
      .filter(Boolean)
      .reverse() as { date: string; weight: number }[];
  }, [progressEx, lang]);

  const getCategoryLabel = (cat: TrainingCategory) =>
    ({
      push: t(lang, "training_category_push"),
      pull: t(lang, "training_category_pull"),
      legs: t(lang, "training_category_legs"),
      full: t(lang, "training_category_full"),
    })[cat];

  const getMuscleLabel = (mg: MuscleGroup) =>
    ({
      back: t(lang, "training_muscle_back"),
      chest: t(lang, "training_muscle_chest"),
      shoulders: t(lang, "training_muscle_shoulders"),
      arms: t(lang, "training_muscle_arms"),
      legs: t(lang, "training_muscle_legs"),
      core: t(lang, "training_muscle_core"),
    })[mg];

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t(lang, "training_filter_all") },
    { key: "push", label: t(lang, "training_filter_push") },
    { key: "pull", label: t(lang, "training_filter_pull") },
    { key: "legs", label: t(lang, "training_filter_legs") },
    { key: "full", label: t(lang, "training_filter_full") },
  ];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[#facc15] text-[10px] uppercase tracking-widest font-mono">
          {t(lang, "training_title")}
        </p>
        <span className="text-[#555] text-[10px] uppercase tracking-widest font-mono">
          {MOCK_TRAINING_HISTORY.length} {t(lang, "training_sessions")}
        </span>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <div className="flex gap-4 items-start">
        {/* ── Left: session list ──────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3">
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`text-[10px] uppercase tracking-widest px-2.5 py-1 border font-mono transition-colors ${
                  filter === key
                    ? "border-[#facc15] text-[#facc15] bg-[#facc15]/5"
                    : "border-[#1f1f1f] text-[#555] hover:border-[#333] hover:text-[#888]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Session cards */}
          <div className="flex flex-col gap-2">
            {filtered.map((session) => {
              const vol = calcVolume(session);
              const prs = countPRs(session);
              const isSelected = session.id === selectedId;
              const catColor = CATEGORY_COLORS[session.category];

              return (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedId(session.id);
                    setProgressEx(null);
                    setExpandedExId(null);
                  }}
                  className={`w-full text-left border p-3 transition-colors ${
                    isSelected
                      ? "border-[#facc15] bg-[#facc15]/5"
                      : "border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#333] hover:bg-[#0d0d0d]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] uppercase tracking-widest font-mono font-bold"
                        style={{ color: catColor }}
                      >
                        {session.name}
                      </span>
                      {session.status === "planned" && (
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[#f59e0b]/40 text-[#f59e0b] font-mono">
                          {t(lang, "training_planned_badge")}
                        </span>
                      )}
                    </div>
                    {prs > 0 && (
                      <div className="flex items-center gap-1">
                        <Trophy size={10} className="text-[#facc15]" />
                        <span className="text-[9px] font-mono text-[#facc15]">
                          {prs}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#555]">
                    <span>{formatDate(session.date, lang)}</span>
                    <span>·</span>
                    <span>
                      {session.durationMin} {t(lang, "training_duration_min")}
                    </span>
                    <span>·</span>
                    <span>
                      {vol > 0 ? `${(vol / 1000).toFixed(1)}t` : "BW"}
                    </span>
                  </div>

                  {/* Exercise name pills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {session.exercises.slice(0, 3).map((ex) => (
                      <span
                        key={ex.id}
                        className="text-[9px] px-1.5 py-0.5 font-mono"
                        style={{
                          color: MUSCLE_COLORS[ex.muscleGroup] + "99",
                          border: `1px solid ${MUSCLE_COLORS[ex.muscleGroup]}22`,
                        }}
                      >
                        {ex.name}
                      </span>
                    ))}
                    {session.exercises.length > 3 && (
                      <span className="text-[9px] px-1.5 py-0.5 font-mono text-[#444] border border-[#1a1a1a]">
                        +{session.exercises.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: session detail ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="border border-[#1f1f1f] p-12 text-center text-[#444] text-[11px] font-mono uppercase tracking-widest">
              {t(lang, "training_select_hint")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Session header */}
              <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-5">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-[#e0e0e0] font-mono tracking-tight">
                        {selected.name}
                      </h2>
                      <span
                        className="text-[10px] uppercase tracking-widest px-2 py-0.5 border font-mono font-bold"
                        style={{
                          color: CATEGORY_COLORS[selected.category],
                          borderColor:
                            CATEGORY_COLORS[selected.category] + "44",
                          backgroundColor:
                            CATEGORY_COLORS[selected.category] + "11",
                        }}
                      >
                        {getCategoryLabel(selected.category)}
                      </span>
                      {selected.status === "planned" ? (
                        <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 border border-[#f59e0b]/40 text-[#f59e0b] font-mono">
                          {t(lang, "training_planned_badge")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest px-2 py-0.5 border border-[#22c55e]/30 text-[#22c55e] font-mono">
                          <Check size={9} />
                          {t(lang, "training_completed_badge")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[#555] text-[11px] font-mono">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={11} />
                        {formatDate(selected.date, lang)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={11} />
                        {selected.durationMin} {t(lang, "training_duration_min")}
                      </span>
                    </div>
                  </div>
                </div>
                {selected.notes && (
                  <p className="mt-3 text-xs text-[#555] font-mono border-t border-[#1f1f1f] pt-3">
                    {selected.notes}
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3">
                {(
                  [
                    {
                      label: t(lang, "training_total_volume"),
                      value:
                        calcVolume(selected) > 0
                          ? `${(calcVolume(selected) / 1000).toFixed(2)} t`
                          : "–",
                      icon: <Dumbbell size={14} className="text-[#facc15]" />,
                    },
                    {
                      label: t(lang, "training_total_sets"),
                      value: calcTotalSets(selected),
                      icon: <BarChart2 size={14} className="text-[#38bdf8]" />,
                    },
                    {
                      label: t(lang, "training_exercises"),
                      value: selected.exercises.length,
                      icon: (
                        <TrendingUp size={14} className="text-[#a855f7]" />
                      ),
                    },
                    {
                      label: t(lang, "training_prs"),
                      value: countPRs(selected),
                      icon: <Trophy size={14} className="text-[#f59e0b]" />,
                    },
                  ] as const
                ).map((stat) => (
                  <div
                    key={stat.label}
                    className="border border-[#1f1f1f] bg-[#0a0a0a] p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-[10px] uppercase tracking-widest text-[#555] font-mono">
                        {stat.label}
                      </span>
                    </div>
                    <span className="text-xl font-bold font-mono text-[#e0e0e0]">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Exercise cards */}
              <div className="flex flex-col gap-2">
                {selected.exercises.map((ex) => {
                  const isExpanded = expandedExId === ex.id;
                  const isProgress = progressEx === ex.name;
                  const exVolume = ex.sets.reduce(
                    (s, set) => s + set.reps * set.weight,
                    0,
                  );
                  const muscleColor = MUSCLE_COLORS[ex.muscleGroup];

                  return (
                    <div
                      key={ex.id}
                      className={`border transition-colors ${
                        isExpanded
                          ? "border-[#333] bg-[#0d0d0d]"
                          : "border-[#1f1f1f] bg-[#0a0a0a] hover:border-[#2a2a2a]"
                      }`}
                    >
                      {/* Exercise header */}
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer select-none"
                        onClick={() =>
                          setExpandedExId(isExpanded ? null : ex.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ChevronRight size={14} className="text-[#555]" />
                          </motion.div>
                          <span className="text-sm font-mono text-[#e0e0e0] font-medium">
                            {ex.name}
                          </span>
                          {ex.pr && (
                            <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 border border-[#facc15]/40 text-[#facc15] bg-[#facc15]/5 font-mono">
                              <Trophy size={8} />
                              {t(lang, "training_pr_badge")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[#444]">
                            {ex.sets.length}×
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-widest px-2 py-0.5 border font-mono"
                            style={{
                              color: muscleColor + "cc",
                              borderColor: muscleColor + "33",
                            }}
                          >
                            {getMuscleLabel(ex.muscleGroup)}
                          </span>
                          {/* Progress chart toggle */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProgressEx(isProgress ? null : ex.name);
                            }}
                            title={t(lang, "training_progress")}
                            className={`p-1.5 border transition-colors ${
                              isProgress
                                ? "border-[#facc15]/40 text-[#facc15] bg-[#facc15]/5"
                                : "border-[#1f1f1f] text-[#444] hover:border-[#333] hover:text-[#888]"
                            }`}
                          >
                            <TrendingUp size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded sets table */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <div className="border border-[#1f1f1f]">
                                {/* Header */}
                                <div className="grid grid-cols-[40px_1fr_1fr_1fr] border-b border-[#1f1f1f] px-3 py-2">
                                  {[
                                    t(lang, "training_set"),
                                    t(lang, "training_reps"),
                                    t(lang, "training_weight"),
                                    t(lang, "training_volume_col"),
                                  ].map((h) => (
                                    <span
                                      key={h}
                                      className="text-[10px] uppercase tracking-widest text-[#444] font-mono"
                                    >
                                      {h}
                                    </span>
                                  ))}
                                </div>
                                {/* Rows */}
                                {ex.sets.map((set) => {
                                  const rowVol = set.reps * set.weight;
                                  return (
                                    <div
                                      key={set.setNumber}
                                      className="grid grid-cols-[40px_1fr_1fr_1fr] px-3 py-2.5 border-b border-[#111] last:border-0 hover:bg-[#111] transition-colors"
                                    >
                                      <span className="text-[11px] font-mono text-[#555]">
                                        {set.setNumber}
                                      </span>
                                      <span className="text-[12px] font-mono text-[#e0e0e0] font-medium">
                                        {set.reps}
                                      </span>
                                      <span className="text-[12px] font-mono text-[#e0e0e0]">
                                        {set.weight === 0
                                          ? t(lang, "training_bodyweight")
                                          : `${set.weight} kg`}
                                      </span>
                                      <span className="text-[11px] font-mono text-[#666]">
                                        {set.weight === 0
                                          ? "–"
                                          : `${rowVol} kg`}
                                      </span>
                                    </div>
                                  );
                                })}
                                {/* Summary row */}
                                <div className="grid grid-cols-[40px_1fr_1fr_1fr] px-3 py-2 bg-[#0d0d0d] border-t border-[#1f1f1f]">
                                  <span className="text-[10px] font-mono text-[#444]">
                                    Σ
                                  </span>
                                  <span className="text-[10px] font-mono text-[#555]">
                                    {ex.sets.reduce(
                                      (s, set) => s + set.reps,
                                      0,
                                    )}{" "}
                                    pow.
                                  </span>
                                  <span />
                                  <span className="text-[10px] font-mono text-[#facc15]">
                                    {exVolume > 0 ? `${exVolume} kg` : "–"}
                                  </span>
                                </div>
                              </div>
                              {ex.notes && (
                                <p className="mt-2 text-[11px] font-mono text-[#555] italic">
                                  {ex.notes}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Weight progress chart */}
              <AnimatePresence>
                {progressEx && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.2 }}
                    className="border border-[#1f1f1f] bg-[#0a0a0a] p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={13} className="text-[#facc15]" />
                        <span className="text-[10px] uppercase tracking-widest text-[#888] font-mono">
                          {progressEx} — {t(lang, "training_progress")}
                        </span>
                      </div>
                      <button
                        onClick={() => setProgressEx(null)}
                        className="text-[10px] font-mono text-[#444] hover:text-[#888] uppercase tracking-widest"
                      >
                        ✕
                      </button>
                    </div>
                    {progressData.length < 2 ? (
                      <p className="text-[11px] text-[#444] font-mono text-center py-6">
                        {t(lang, "training_no_progress")}
                      </p>
                    ) : (
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart
                          data={progressData}
                          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="2 4"
                            stroke="#1a1a1a"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="date"
                            tick={{
                              fill: "#555",
                              fontSize: 10,
                              fontFamily: "monospace",
                            }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{
                              fill: "#555",
                              fontSize: 10,
                              fontFamily: "monospace",
                            }}
                            axisLine={false}
                            tickLine={false}
                            unit=" kg"
                          />
                          <Tooltip
                            contentStyle={{
                              background: "#111",
                              border: "1px solid #1f1f1f",
                              borderRadius: 0,
                              fontSize: 11,
                              fontFamily: "monospace",
                              color: "#e0e0e0",
                            }}
                            cursor={{ stroke: "#333", strokeWidth: 1 }}
                            formatter={(v) => [
                              v != null ? `${v} kg` : "–",
                              t(lang, "training_weight"),
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="#facc15"
                            strokeWidth={1.5}
                            dot={{ fill: "#facc15", r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 4, fill: "#facc15" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
