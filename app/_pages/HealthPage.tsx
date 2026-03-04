"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Moon, Zap, Heart, Activity, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { MOCK_SLEEP_LOG, MOCK_RECOVERY_TODAY } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// ─── helpers ─────────────────────────────────────────────────────────────────

const QUALITY_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#f59e0b",
  4: "#a855f7",
  5: "#22c55e",
};

function qualityStars(rating: number): string {
  return "●".repeat(rating) + "○".repeat(5 - rating);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]}`;
}

function recoveryColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#a855f7";
  if (score >= 55) return "#f59e0b";
  return "#ef4444";
}

function TrendIcon({ values }: { values: number[] }) {
  if (values.length < 2) return <Minus className="w-3 h-3 text-[#666]" />;
  const delta = values[values.length - 1] - values[values.length - 2];
  if (delta > 0.2) return <TrendingUp className="w-3 h-3 text-[#22c55e]" />;
  if (delta < -0.2) return <TrendingDown className="w-3 h-3 text-[#ef4444]" />;
  return <Minus className="w-3 h-3 text-[#666]" />;
}

// ─── metric card ─────────────────────────────────────────────────────────────

type MetricCardProps = {
  label: string;
  value: string;
  unit?: string;
  avg7d?: string;
  avg7dLabel: string;
  accent: string;
  icon: React.ReactNode;
  trend?: number[];
};

function MetricCard({ label, value, unit, avg7d, avg7dLabel, accent, icon, trend }: MetricCardProps) {
  return (
    <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-5 flex flex-col gap-3 hover:border-[#333] transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-[#666]">{label}</p>
        <span style={{ color: accent }} className="opacity-70">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold font-mono" style={{ color: accent }}>
          {value}
        </span>
        {unit && <span className="text-[#666] text-sm mb-1">{unit}</span>}
        {trend && (
          <span className="mb-1 ml-auto">
            <TrendIcon values={trend} />
          </span>
        )}
      </div>
      {avg7d !== undefined && (
        <p className="text-[10px] text-[#555] uppercase tracking-widest">
          {avg7dLabel}: <span className="text-[#888]">{avg7d}</span>
        </p>
      )}
    </div>
  );
}

// ─── sleep stages bar ─────────────────────────────────────────────────────────

type SleepStagesProps = {
  entry: (typeof MOCK_SLEEP_LOG)[0];
  lang: "pl" | "en";
};

function SleepStages({ entry, lang }: SleepStagesProps) {
  const total = entry.deepSleep + entry.lightSleep + entry.rem + entry.awake;
  const stages = [
    { labelKey: "health_stage_deep" as const, hours: entry.deepSleep, color: "#a855f7" },
    { labelKey: "health_stage_rem" as const, hours: entry.rem, color: "#38bdf8" },
    { labelKey: "health_stage_light" as const, hours: entry.lightSleep, color: "#1d4ed8" },
    { labelKey: "health_stage_awake" as const, hours: entry.awake, color: "#374151" },
  ];

  return (
    <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-5 flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-widest text-[#666]">
        {t(lang, "health_sleep_stages")}
      </p>
      {/* Stacked horizontal bar */}
      <div className="flex h-6 w-full overflow-hidden rounded-sm gap-px">
        {stages.map((s) => (
          <div
            key={s.labelKey}
            style={{
              width: `${(s.hours / total) * 100}%`,
              backgroundColor: s.color,
            }}
            title={`${t(lang, s.labelKey)}: ${s.hours.toFixed(1)}h`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {stages.map((s) => (
          <div key={s.labelKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] uppercase tracking-widest text-[#666] truncate">
              {t(lang, s.labelKey)}
            </span>
            <span className="text-[10px] text-[#888] ml-auto font-mono">
              {s.hours.toFixed(1)}h
            </span>
          </div>
        ))}
      </div>
      {/* Compact stats row */}
      <div className="border-t border-[#1f1f1f] pt-3 flex justify-between">
        <div>
          <p className="text-[10px] text-[#555] uppercase tracking-widest">{t(lang, "health_bedtime")}</p>
          <p className="text-sm font-mono text-[#e0e0e0] mt-0.5">{entry.bedtime}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#555] uppercase tracking-widest">{t(lang, "health_wake")}</p>
          <p className="text-sm font-mono text-[#e0e0e0] mt-0.5">{entry.wakeTime}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#555] uppercase tracking-widest">{t(lang, "health_resting_hr")}</p>
          <p className="text-sm font-mono mt-0.5" style={{ color: "#ec4899" }}>
            {entry.restingHR} <span className="text-[10px]">bpm</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── recovery factors ────────────────────────────────────────────────────────

function RecoveryFactors({ lang }: { lang: "pl" | "en" }) {
  return (
    <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-5 flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-widest text-[#666]">
        {t(lang, "health_recovery_factors")}
      </p>
      <div className="flex flex-col gap-3">
        {MOCK_RECOVERY_TODAY.map((f) => (
          <div key={f.labelKey} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#888]">
                {t(lang, f.labelKey as Parameters<typeof t>[1])}
              </span>
              <span className="text-xs font-mono" style={{ color: f.color }}>
                {f.value}
              </span>
            </div>
            <div className="h-1 bg-[#1f1f1f] w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${f.value}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="h-full"
                style={{ backgroundColor: f.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── sleep log row ────────────────────────────────────────────────────────────

function SleepLogRow({
  entry,
  index,
  lang,
}: {
  entry: (typeof MOCK_SLEEP_LOG)[0];
  index: number;
  lang: "pl" | "en";
}) {
  const [expanded, setExpanded] = useState(false);
  const rc = recoveryColor(entry.recoveryScore);

  return (
    <>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full grid items-center text-left hover:bg-[#0d0d0d] transition-colors py-2.5 px-3 border-b border-[#1a1a1a]"
        style={{ gridTemplateColumns: "80px 60px 56px 48px 48px 36px 24px" }}
      >
        <span className="text-[10px] font-mono text-[#888]">{formatDate(entry.date)}</span>
        <span className="text-xs font-mono text-[#e0e0e0]">{entry.totalHours.toFixed(1)}h</span>
        <span className="text-[10px] font-mono" style={{ color: QUALITY_COLORS[entry.qualityRating] }}>
          {qualityStars(entry.qualityRating)}
        </span>
        <span
          className="text-xs font-mono font-bold text-center"
          style={{ color: rc }}
        >
          {entry.recoveryScore}
        </span>
        <span className="text-[10px] font-mono text-[#666]">{entry.hrv} ms</span>
        <span className="text-[10px] font-mono text-[#666]">{entry.restingHR}</span>
        <span className="text-[#555] flex justify-end">
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>
      {expanded && (
        <div className="px-3 py-2 border-b border-[#1a1a1a] bg-[#050505] grid grid-cols-4 gap-3 text-[10px]">
          <div>
            <p className="text-[#555] uppercase tracking-widest">{t(lang, "health_stage_deep")}</p>
            <p className="text-[#a855f7] font-mono mt-0.5">{entry.deepSleep.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-[#555] uppercase tracking-widest">{t(lang, "health_stage_rem")}</p>
            <p className="text-[#38bdf8] font-mono mt-0.5">{entry.rem.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-[#555] uppercase tracking-widest">{t(lang, "health_stage_light")}</p>
            <p className="text-[#1d4ed8] font-mono mt-0.5">{entry.lightSleep.toFixed(1)}h</p>
          </div>
          {entry.notes && (
            <div className="col-span-4">
              <p className="text-[#555] uppercase tracking-widest mb-0.5">Note</p>
              <p className="text-[#888] italic">{entry.notes}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#333] bg-[#0a0a0a] p-3 text-[10px] font-mono min-w-[120px]">
      <p className="text-[#666] uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey.toUpperCase()}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
          {p.dataKey === "sleep" ? "h" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function HealthPage() {
  const { lang } = useLang();
  const [showAllLog, setShowAllLog] = useState(false);

  const sortedLog = useMemo(
    () => [...MOCK_SLEEP_LOG].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  const lastNight = sortedLog[0];

  // chart data — latest 14 entries chronological
  const chartData = useMemo(
    () =>
      [...sortedLog]
        .slice(0, 14)
        .reverse()
        .map((e) => ({
          date: formatDate(e.date),
          sleep: e.totalHours,
          recovery: e.recoveryScore,
        })),
    [sortedLog]
  );

  const avg7dSleep = useMemo(() => {
    const slice = sortedLog.slice(0, 7);
    return (slice.reduce((s, e) => s + e.totalHours, 0) / slice.length).toFixed(1);
  }, [sortedLog]);

  const avg7dRecovery = useMemo(() => {
    const slice = sortedLog.slice(0, 7);
    return Math.round(slice.reduce((s, e) => s + e.recoveryScore, 0) / slice.length);
  }, [sortedLog]);

  const avg7dHrv = useMemo(() => {
    const slice = sortedLog.slice(0, 7);
    return Math.round(slice.reduce((s, e) => s + e.hrv, 0) / slice.length);
  }, [sortedLog]);

  const visibleLog = showAllLog ? sortedLog : sortedLog.slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-6 max-w-6xl mx-auto"
    >
      {/* ── section label ── */}
      <p className="text-[10px] uppercase tracking-widest text-[#444]">
        // {t(lang, "health_last_night")} — {formatDate(lastNight.date)}
      </p>

      {/* ── row 1: metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={t(lang, "health_sleep_duration")}
          value={lastNight.totalHours.toFixed(1)}
          unit="h"
          avg7d={`${avg7dSleep}h`}
          avg7dLabel={t(lang, "health_avg_7d")}
          accent="#a855f7"
          icon={<Moon className="w-4 h-4" />}
          trend={sortedLog.slice(0, 7).map((e) => e.totalHours).reverse()}
        />
        <MetricCard
          label={t(lang, "health_recovery_score")}
          value={String(lastNight.recoveryScore)}
          avg7d={String(avg7dRecovery)}
          avg7dLabel={t(lang, "health_avg_7d")}
          accent={recoveryColor(lastNight.recoveryScore)}
          icon={<Zap className="w-4 h-4" />}
          trend={sortedLog.slice(0, 7).map((e) => e.recoveryScore / 10).reverse()}
        />
        <MetricCard
          label={t(lang, "health_hrv")}
          value={String(lastNight.hrv)}
          unit="ms"
          avg7d={`${avg7dHrv} ms`}
          avg7dLabel={t(lang, "health_avg_7d")}
          accent="#38bdf8"
          icon={<Activity className="w-4 h-4" />}
          trend={sortedLog.slice(0, 7).map((e) => e.hrv / 10).reverse()}
        />
        <MetricCard
          label={t(lang, "health_resting_hr")}
          value={String(lastNight.restingHR)}
          unit="bpm"
          avg7d={`${Math.round(sortedLog.slice(0, 7).reduce((s, e) => s + e.restingHR, 0) / 7)} bpm`}
          avg7dLabel={t(lang, "health_avg_7d")}
          accent="#ec4899"
          icon={<Heart className="w-4 h-4" />}
          trend={sortedLog.slice(0, 7).map((e) => e.restingHR / 10).reverse()}
        />
      </div>

      {/* ── row 2: trend chart + recovery factors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend chart — 2/3 width */}
        <div className="lg:col-span-2 border border-[#1f1f1f] bg-[#0a0a0a] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-widest text-[#666]">
              {t(lang, "health_trend")}
            </p>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#a855f7] inline-block" />
                <span className="text-[#666]">{t(lang, "health_sleep_duration")}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#facc15] inline-block" />
                <span className="text-[#666]">{t(lang, "health_recovery_score")}</span>
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRecovery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="sleep"
                orientation="left"
                domain={[0, 12]}
                tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="recovery"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: "#444", fontSize: 9, fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                yAxisId="sleep"
                type="monotone"
                dataKey="sleep"
                stroke="#a855f7"
                strokeWidth={1.5}
                fill="url(#gradSleep)"
                dot={false}
              />
              <Area
                yAxisId="recovery"
                type="monotone"
                dataKey="recovery"
                stroke="#facc15"
                strokeWidth={1.5}
                fill="url(#gradRecovery)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recovery factors — 1/3 width */}
        <RecoveryFactors lang={lang} />
      </div>

      {/* ── row 3: sleep stages + sleep log ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sleep stages */}
        <SleepStages entry={lastNight} lang={lang} />

        {/* Sleep log */}
        <div className="lg:col-span-2 border border-[#1f1f1f] bg-[#0a0a0a]">
          {/* Header row */}
          <div
            className="grid px-3 py-2 border-b border-[#1f1f1f]"
            style={{ gridTemplateColumns: "80px 60px 56px 48px 48px 36px 24px" }}
          >
            {["Date", "Sleep", "Quality", "Rec.", "HRV", "HR", ""].map((h) => (
              <span key={h} className="text-[9px] uppercase tracking-widest text-[#444]">{h}</span>
            ))}
          </div>
          <div className="section-label px-3 py-2 border-b border-[#1f1f1f]">
            <p className="text-[10px] uppercase tracking-widest text-[#666]">
              {t(lang, "health_log")}
            </p>
          </div>
          {visibleLog.map((entry, i) => (
            <SleepLogRow key={entry.date} entry={entry} index={i} lang={lang} />
          ))}
          {sortedLog.length > 7 && (
            <button
              onClick={() => setShowAllLog((v) => !v)}
              className="w-full py-2.5 text-[10px] uppercase tracking-widest text-[#555] hover:text-[#888] transition-colors border-t border-[#1a1a1a]"
            >
              {showAllLog ? "▲ Show less" : `▼ Show all (${sortedLog.length})`}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
