"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Pin, PinSolid, Refresh } from "iconoir-react";
import SkillColorPicker from "@/app/components/SkillColorPicker";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { radarNPolygon, roundSvg } from "@/app/components/radar";
import { MOCK_SKILLS, MOCK_QUESTS, MOCK_STATUS_COLORS } from "@/lib/mock";
import type { Quest, QuestStatus } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

const DROPDOWN_CLOSE_DELAY_MS = 150;

type StatusTagStyle = { background: string; color: string };

type StatusTagDropdownProps = {
  dropdownKey: string;
  quest: Quest;
  statusLabels: Record<QuestStatus, string>;
  statusTagStyle: Record<QuestStatus, StatusTagStyle>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusSelect: (questId: string, status: QuestStatus) => void;
};

function StatusTagDropdown({
  dropdownKey,
  quest,
  statusLabels,
  statusTagStyle,
  isOpen,
  onOpenChange,
  onStatusSelect,
}: StatusTagDropdownProps) {
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(
      () => onOpenChange(false),
      DROPDOWN_CLOSE_DELAY_MS,
    );
  }, [onOpenChange, clearCloseTimeout]);

  const handleEnter = useCallback(() => {
    clearCloseTimeout();
    onOpenChange(true);
  }, [onOpenChange, clearCloseTimeout]);

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={scheduleClose}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="tag-neon text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold shrink-0 cursor-pointer"
        style={{
          fontFamily: "Orbitron, sans-serif",
          ...statusTagStyle[quest.status],
        }}
      >
        {statusLabels[quest.status]}
      </span>
      {isOpen && (
        <div
          className="absolute top-full left-0 pt-1 z-50"
          onMouseEnter={handleEnter}
          onMouseLeave={scheduleClose}
        >
          <div className="py-1 rounded-[7px] bg-[#1C1C1C] border border-white/10 shadow-xl min-w-[140px]">
            {(Object.keys(statusLabels) as QuestStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`w-full text-left px-3 py-1.5 text-[8px] uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-colors ${s === quest.status ? "bg-white/5" : ""}`}
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  ...statusTagStyle[s],
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusSelect(quest.id, s);
                }}
              >
                {statusLabels[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type Props = {
  skillId?: string;
  skillColor: string;
  onSkillColorChange: (color: string) => void;
  onQuestSelect: (id: string) => void;
};

export default function SkillDetailPage({
  skillId,
  skillColor,
  onSkillColorChange,
  onQuestSelect,
}: Props) {
  const { lang } = useLang();
  // TODO: [DATA] persistence will go here — using simple useState without persistence
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [selectedAspectId, setSelectedAspectId] = useState<string | null>(null);
  const [hoveredAspectId, setHoveredAspectId] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<7 | 30 | 180 | 365>(30);
  const [questStatuses, setQuestStatuses] = useState<
    Record<string, QuestStatus>
  >({});
  const [openStatusDropdownKey, setOpenStatusDropdownKey] = useState<
    string | null
  >(null);
  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<
    "in_progress" | "planned" | "pinned" | null
  >(null);
  // TODO: [DATA] persistence will go here
  const [recurringOverrides, setRecurringOverrides] = useState<
    Record<string, boolean>
  >({});

  const getEffectiveRecurring = useCallback(
    (questId: string, baseValue: boolean): boolean =>
      recurringOverrides[questId] ?? baseValue,
    [recurringOverrides],
  );

  const toggleRecurring = useCallback((questId: string, baseValue: boolean) => {
    // TODO: [DATA] persistence will go here
    setRecurringOverrides((prev) => ({
      ...prev,
      [questId]: !(prev[questId] ?? baseValue),
    }));
  }, []);

  const statusLabels: Record<QuestStatus, string> = {
    open: t(lang, "status_open"),
    planned: t(lang, "status_planned"),
    in_progress: t(lang, "status_in_progress"),
    completed: t(lang, "status_completed"),
  };

  const statusTagStyle: Record<QuestStatus, StatusTagStyle> = {
    open: {
      background: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.5)",
    },
    planned: { background: "rgba(243,230,0,0.12)", color: "#F3E600" },
    in_progress: { background: "rgba(85,234,212,0.12)", color: "#55EAD4" },
    completed: { background: "rgba(0,255,159,0.12)", color: "#00FF9F" },
  };

  const skill = useMemo(() => {
    if (skillId) {
      return MOCK_SKILLS.find((s) => s.id === skillId) || MOCK_SKILLS[0];
    }
    return MOCK_SKILLS[0];
  }, [skillId]);

  useEffect(() => {
    setSelectedAspectId(null);
  }, [skill.id]);

  const getEffectiveStatus = useCallback(
    (questId: string): QuestStatus => {
      if (questStatuses[questId]) return questStatuses[questId];
      const quest = MOCK_QUESTS.find((q) => q.id === questId);
      return quest?.status ?? "open";
    },
    [questStatuses],
  );

  const setStatusOverride = useCallback(
    (questId: string, status: QuestStatus) => {
      // TODO: [DATA] persistence will go here
      setQuestStatuses((prev) => ({ ...prev, [questId]: status }));
      setOpenStatusDropdownKey(null);
    },
    [],
  );

  const togglePinned = useCallback((entityId: string) => {
    // TODO: [DATA] persistence will go here
    setPinnedIds((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId],
    );
  }, []);

  const isPinned = useCallback(
    (entityId: string) => pinnedIds.includes(entityId),
    [pinnedIds],
  );

  const handleDrop = useCallback(
    (targetColumn: "in_progress" | "planned" | "pinned") => {
      if (!draggedQuestId) return;
      if (targetColumn === "pinned") {
        // TODO: [DATA] persistence will go here
        setPinnedIds((prev) =>
          prev.includes(draggedQuestId) ? prev : [...prev, draggedQuestId],
        );
      } else {
        // TODO: [DATA] persistence will go here
        setQuestStatuses((prev) => ({
          ...prev,
          [draggedQuestId]: targetColumn,
        }));
        setPinnedIds((prev) => prev.filter((id) => id !== draggedQuestId));
      }
      setDraggedQuestId(null);
      setDragOverColumn(null);
    },
    [draggedQuestId],
  );

  if (!skill) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-white/30">Skill not found.</p>
      </div>
    );
  }

  const aspects = skill.aspects || [];
  const radar =
    aspects.length > 0
      ? radarNPolygon(aspects.map((a) => a.completionPercentage))
      : null;
  const radarGoal =
    aspects.length > 0 ? radarNPolygon(aspects.map(() => 100)) : null;

  const chartData = useMemo(() => {
    if (aspects.length === 0 || !aspects[0].history?.length) return [];
    const len = aspects[0].history.length;
    return Array.from({ length: len }, (_, i) => {
      const daysAgo = len - 1 - i;
      const point: Record<string, number> = { daysAgo };
      aspects.forEach((a) => {
        point[a.id] = a.history[i];
      });
      return point;
    });
  }, [aspects]);

  const visibleChartData = useMemo(
    () => chartData.slice(-chartRange),
    [chartData, chartRange],
  );

  const xAxisInterval = useMemo(() => {
    if (chartRange === 7) return 0;
    if (chartRange === 30) return 4;
    if (chartRange === 180) return 29;
    return 60; // 365
  }, [chartRange]);

  const formatXTick = useCallback(
    (v: number): string => {
      if (v === 0) return t(lang, "chart_today");
      if (chartRange <= 30) return `${v}d`;
      const d = new Date();
      d.setDate(d.getDate() - v);
      return d.toLocaleDateString(lang === "pl" ? "pl-PL" : "en-US", {
        month: "short",
        day: "numeric",
      });
    },
    [chartRange, lang],
  );

  const renderAspectTooltip = useCallback(
    (props: {
      active?: boolean;
      payload?: Array<{ dataKey?: string; value?: number }>;
      label?: number;
    }) => {
      const { active, payload, label } = props;
      if (!active || !payload?.length) return null;
      const dayLabel =
        label === 0
          ? t(lang, "chart_today")
          : `${label} ${t(lang, "chart_days_ago")}`;
      const filtered = payload.filter(
        (e) => selectedAspectId === null || e.dataKey === selectedAspectId,
      );
      return (
        <div
          className="p-3 min-w-[140px] shadow-xl rounded-[7px]"
          style={{
            background: "#1C1C1C",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p className="text-[10px] text-white/30 uppercase tracking-[0.08em] mb-2">
            {dayLabel}
          </p>
          {filtered.map((entry) => {
            const aspect = aspects.find((a) => a.id === entry.dataKey);
            if (!aspect) return null;
            return (
              <div
                key={entry.dataKey}
                className="flex items-center gap-2 mb-1 last:mb-0"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: aspect.color }}
                />
                <span className="text-[10px] text-white/55 uppercase tracking-wide flex-1">
                  {aspect.name}
                </span>
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: aspect.color }}
                >
                  {entry.value}%
                </span>
              </div>
            );
          })}
        </div>
      );
    },
    [aspects, lang, selectedAspectId],
  );

  // Group subskills by aspect for the tree
  const subSkillsByAspect = new Map(
    aspects.map((a) => [
      a.id,
      skill.subSkills.filter((ss) => ss.aspect === a.id),
    ]),
  );

  // All quest IDs belonging to this skill
  const questIdsInSkill = new Set(
    skill.subSkills.flatMap((ss) => (ss.quests || []).map((q) => q.id)),
  );

  const questsInProgress = MOCK_QUESTS.filter(
    (q) =>
      questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "in_progress",
  );

  const questsPlanned = MOCK_QUESTS.filter(
    (q) => questIdsInSkill.has(q.id) && getEffectiveStatus(q.id) === "planned",
  );

  const pinnedInThisSkill = pinnedIds
    .filter((id) => questIdsInSkill.has(id))
    .map((id) => MOCK_QUESTS.find((q) => q.id === id))
    .filter((q): q is Quest => q != null);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Skill hero widget ── */}
      <div
        className="mb-6 p-6 rounded-[14px] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Colored glow blob */}
        <div
          className="absolute w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: skillColor,
            filter: "blur(70px)",
            opacity: 0.13,
            top: -80,
            right: 60,
          }}
        />

        <div className="relative z-10 flex items-center gap-8">
          {/* Identity */}
          <div className="min-w-[200px]">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.08em] mb-2">
              // {t(lang, "nav_skills")}
            </p>
            <h1
              className="text-4xl font-bold leading-none mb-3 tracking-tight"
              style={{ color: skillColor }}
            >
              {skill.name}
            </h1>
            <p className="text-sm text-white/55">{skill.description}</p>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-white/6 shrink-0 mx-2" />

          {/* Progress */}
          <div className="flex-1 max-w-[320px]">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[10px] text-white/30 uppercase tracking-[0.08em]">
                {t(lang, "skill_progress")}
              </span>
              <span
                className="text-3xl font-bold font-mono tracking-tight"
                style={{ color: skillColor }}
              >
                {skill.completionPercentage}%
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden relative"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {/* Target marker */}
              <div
                className="absolute top-0 bottom-0 w-px"
                style={{
                  left: `${skill.targetPercentage}%`,
                  background: "rgba(255,255,255,0.25)",
                }}
              />
              {/* Fill */}
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${skill.completionPercentage}%`,
                  background: `linear-gradient(90deg, ${skillColor}40, ${skillColor})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-white/20">0%</span>
              <span className="text-[9px] text-white/30">
                {t(lang, "skill_target")}: {skill.targetPercentage}%
              </span>
            </div>
          </div>

          {/* Color picker */}
          <div className="ml-auto shrink-0 flex flex-col items-end gap-2">
            <span className="text-[9px] text-white/20 uppercase tracking-[0.08em]">
              {t(lang, "skill_color")}
            </span>
            <SkillColorPicker
              color={skillColor}
              onChange={onSkillColorChange}
            />
          </div>
        </div>
      </div>

      {/* Neural map & aspect progress chart */}
      <div
        className="p-6 rounded-[14px] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        <h3 className="text-[10px] text-white/20 uppercase tracking-[0.08em] mb-4">
          {t(lang, "skill_neural_map").toUpperCase()}
        </h3>

        <div className="grid grid-cols-3 gap-8 items-start">
          {/* ── Neural map (1 col) ── */}
          <div className="flex flex-col items-center">
            {radar ? (
              <svg
                viewBox="0 0 100 100"
                className="w-full max-w-[240px] overflow-visible"
              >
                {/* Concentric grid rings */}
                {[40, 26.7, 13.3].map((maxR, ri) => {
                  const n = aspects.length;
                  const pts = Array.from({ length: n }, (_, i) => {
                    const angle = (i * 360) / n;
                    const rad = (angle * Math.PI) / 180;
                    return `${roundSvg(50 + maxR * Math.sin(rad))},${roundSvg(50 - maxR * Math.cos(rad))}`;
                  });
                  return (
                    <polygon
                      key={ri}
                      points={pts.join(" ")}
                      fill="none"
                      stroke="#1f1f1f"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  );
                })}
                {/* Axis lines from center — dashed */}
                {aspects.map((_, i) => {
                  const n = aspects.length;
                  const angle = (i * 360) / n;
                  const rad = (angle * Math.PI) / 180;
                  const x = roundSvg(50 + 40 * Math.sin(rad));
                  const y = roundSvg(50 - 40 * Math.cos(rad));
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={x}
                      y2={y}
                      stroke="#1f1f1f"
                      strokeWidth="0.5"
                      strokeDasharray="2,2"
                    />
                  );
                })}
                {/* Goal outline (100%) — dashed */}
                {radarGoal && (
                  <polygon
                    points={radarGoal.points}
                    fill="none"
                    stroke="#333"
                    strokeWidth="0.6"
                    strokeDasharray="3,3"
                  />
                )}
                {/* Colored sector triangles — one per aspect */}
                {radar.pts.map((p, i) => {
                  const a = aspects[i];
                  const next = radar.pts[(i + 1) % aspects.length];
                  const isActive =
                    hoveredAspectId === a.id || selectedAspectId === a.id;
                  return (
                    <polygon
                      key={`sector-${i}`}
                      points={`50,50 ${p.x},${p.y} ${next.x},${next.y}`}
                      fill={isActive ? `${a.color}38` : `${a.color}18`}
                      stroke={a.color}
                      strokeWidth={isActive ? "1.2" : "0.7"}
                      strokeLinejoin="round"
                      style={{
                        transition: "fill 0.15s ease, stroke-width 0.15s ease",
                      }}
                    />
                  );
                })}
                {/* Per-aspect interactive group: hit target + ring + dot + label */}
                {radar.pts.map((p, i) => {
                  const a = aspects[i];
                  const n = aspects.length;
                  const angle = (i * 360) / n;
                  const rad = (angle * Math.PI) / 180;
                  const dist = 47;
                  const lx = roundSvg(50 + dist * Math.sin(rad));
                  const ly = roundSvg(50 - dist * Math.cos(rad));
                  const isHovered = hoveredAspectId === a.id;
                  const isSelected = selectedAspectId === a.id;
                  const isActive = isHovered || isSelected;
                  return (
                    <g
                      key={i}
                      style={{ cursor: "pointer", outline: "none" }}
                      onClick={() =>
                        setSelectedAspectId((prev) =>
                          prev === a.id ? null : a.id,
                        )
                      }
                      onMouseEnter={() => setHoveredAspectId(a.id)}
                      onMouseLeave={() => setHoveredAspectId(null)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedAspectId((prev) =>
                            prev === a.id ? null : a.id,
                          );
                        }
                      }}
                    >
                      {/* invisible hit target */}
                      <circle cx={p.x} cy={p.y} r="5" fill="transparent" />
                      {/* pulse ring on hover or selection */}
                      {isActive && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4"
                          fill="none"
                          stroke={a.color}
                          strokeWidth="0.6"
                          opacity="0.7"
                        />
                      )}
                      {/* data dot */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isActive ? 2.5 : 1.5}
                        fill={a.color}
                        style={{ transition: "r 0.15s ease" }}
                      />
                      {/* label */}
                      <text
                        x={lx}
                        y={ly}
                        fill={isSelected ? "#F3E600" : a.color}
                        fontSize="3.5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        opacity={isActive ? 1 : 0.7}
                        className="uppercase tracking-widest"
                        style={{
                          transition: "fill 0.15s ease, opacity 0.15s ease",
                        }}
                      >
                        {a.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="text-white/30 text-sm">
                {t(lang, "skill_no_aspects")}
              </div>
            )}
          </div>

          {/* ── Aspect progress line chart (2 cols) ── */}
          <div className="col-span-2">
            {visibleChartData.length > 0 ? (
              <>
                {/* Range selector */}
                <div className="flex justify-end gap-1 mb-3">
                  {(
                    [
                      [7, t(lang, "chart_range_7d")],
                      [30, t(lang, "chart_range_30d")],
                      [180, t(lang, "chart_range_6m")],
                      [365, t(lang, "chart_range_1y")],
                    ] as [7 | 30 | 180 | 365, string][]
                  ).map(([r, label]) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setChartRange(r)}
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] border transition-colors ${
                        chartRange === r
                          ? "border-[#F3E600] text-[#F3E600] bg-[#F3E600]/5"
                          : "border-white/6 text-white/30 hover:border-white/12 hover:text-white/55"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={visibleChartData}
                    margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis
                      dataKey="daysAgo"
                      stroke="#333"
                      tick={{ fontSize: 10, fill: "#555" }}
                      tickFormatter={formatXTick}
                      interval={xAxisInterval}
                    />
                    <YAxis
                      stroke="#333"
                      tick={{ fontSize: 10, fill: "#555" }}
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      content={renderAspectTooltip as any}
                      cursor={{ stroke: "#333", strokeWidth: 1 }}
                    />
                    {aspects.map((a) => {
                      const isSelected = selectedAspectId === a.id;
                      const dimmed = selectedAspectId !== null && !isSelected;
                      return (
                        <Line
                          key={a.id}
                          type="monotone"
                          dataKey={a.id}
                          stroke={a.color}
                          strokeWidth={isSelected ? 3 : dimmed ? 1 : 2}
                          strokeOpacity={dimmed ? 0.2 : 1}
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: a.color,
                            strokeWidth: 0,
                          }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>

                {/* Aspect legend — clickable, centred */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
                  {aspects.map((a) => {
                    const isSelected = selectedAspectId === a.id;
                    const dimmed = selectedAspectId !== null && !isSelected;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() =>
                          setSelectedAspectId((prev) =>
                            prev === a.id ? null : a.id,
                          )
                        }
                        className="flex items-center gap-1.5 transition-opacity"
                        style={{ opacity: dimmed ? 0.3 : 1 }}
                      >
                        <span
                          className="w-4 h-px inline-block"
                          style={{ backgroundColor: a.color }}
                        />
                        <span
                          className="text-[9px] uppercase tracking-widest"
                          style={{
                            color: isSelected ? a.color : "#666",
                          }}
                        >
                          {a.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-white/30 text-sm">
                {t(lang, "skill_no_history")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quests: In Progress | Planned | Pinned — drag-and-drop between columns */}
      <section
        className="mt-6 p-6 rounded-[14px] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        <h3 className="text-[10px] text-white/20 uppercase tracking-[0.08em] mb-4">
          {t(lang, "quests_title").toUpperCase()}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              key: "planned" as const,
              label: t(lang, "quests_planned"),
              quests: questsPlanned,
            },
            {
              key: "in_progress" as const,
              label: t(lang, "quests_in_progress"),
              quests: questsInProgress,
            },
            {
              key: "pinned" as const,
              label: t(lang, "pin"),
              quests: pinnedInThisSkill,
            },
          ].map(({ key, label, quests }) => {
            const isOver = dragOverColumn === key;
            const isDragging = draggedQuestId !== null;
            return (
              <div
                key={key}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverColumn !== key) setDragOverColumn(key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setDragOverColumn(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(key);
                }}
                className={`min-h-[80px] rounded-[7px] p-2 transition-colors ${
                  isOver
                    ? "bg-[#F3E600]/5 border border-dashed border-[#F3E600]/50"
                    : isDragging
                      ? "border border-dashed border-white/12"
                      : "border border-transparent"
                }`}
              >
                <h4 className="text-[10px] text-white/30 uppercase tracking-[0.08em] mb-2">
                  {label}
                </h4>
                {quests.length === 0 ? (
                  <p className="text-white/30 text-xs">
                    {isOver ? (
                      <span className="text-[#F3E600]/60">
                        {t(lang, "drop_here")}
                      </span>
                    ) : key === "pinned" ? (
                      t(lang, "skill_pinned_hint")
                    ) : (
                      t(lang, "quests_empty")
                    )}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {isOver && (
                      <li className="h-9 rounded-[7px] border border-dashed border-[#F3E600]/40 bg-[#F3E600]/5 flex items-center justify-center">
                        <span
                          className="text-[8px] text-[#F3E600]/60 uppercase tracking-[0.2em]"
                          style={{ fontFamily: "Orbitron, sans-serif" }}
                        >
                          {t(lang, "drop_here")}
                        </span>
                      </li>
                    )}
                    {quests.map((quest) => {
                      const effStatus = getEffectiveStatus(quest.id);
                      const statusColor = MOCK_STATUS_COLORS[effStatus];
                      const subSkillLabels = quest.subSkills.map((ss) => {
                        const found = skill.subSkills.find(
                          (s) => s.id === ss.id,
                        );
                        return found
                          ? { name: found.name, color: skill.color }
                          : { name: ss.id, color: "#666" };
                      });
                      return (
                        <li
                          key={quest.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedQuestId(quest.id);
                          }}
                          onDragEnd={() => {
                            setDraggedQuestId(null);
                            setDragOverColumn(null);
                          }}
                          onClick={() => onQuestSelect(quest.id)}
                          className={`p-3 rounded-[14px] group cursor-grab active:cursor-grabbing hover:-translate-y-0.5 active:scale-[0.994] transition-all duration-150 select-none relative overflow-hidden ${
                            draggedQuestId === quest.id
                              ? "opacity-40 scale-95"
                              : ""
                          }`}
                          style={{
                            background:
                              "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderTop: "1px solid rgba(255,255,255,0.16)",
                            backdropFilter: "blur(24px)",
                          }}
                        >
                          <p className="text-[14px] font-semibold text-white mb-2 line-clamp-2 group-hover:text-white">
                            {quest.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {subSkillLabels.map((ss) => (
                              <span
                                key={ss.name}
                                className="tag-neon text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
                                style={{
                                  fontFamily: "Orbitron, sans-serif",
                                  background: "rgba(255,255,255,0.07)",
                                  color: "rgba(255,255,255,0.5)",
                                }}
                              >
                                {ss.name}
                              </span>
                            ))}
                            {quest.isRecurring ? (
                              <span
                                className="tag-neon flex items-center gap-1 text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
                                style={{
                                  fontFamily: "Orbitron, sans-serif",
                                  background: `${skill.color}20`,
                                  color: skill.color,
                                }}
                              >
                                <Refresh
                                  width={9}
                                  height={9}
                                  strokeWidth={2.2}
                                />
                                {t(lang, "quest_recurring_label")}
                              </span>
                            ) : (
                              <span
                                className="flex items-center gap-1 text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
                                style={{
                                  fontFamily: "Orbitron, sans-serif",
                                  background: "rgba(255,255,255,0.04)",
                                  color: "rgba(255,255,255,0.18)",
                                }}
                              >
                                <Refresh
                                  width={9}
                                  height={9}
                                  strokeWidth={2.2}
                                />
                                {t(lang, "quest_recurring_label")}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Tree: aspects → subskills → quests */}
      <section
        className="mt-6 p-6 rounded-[14px] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          backdropFilter: "blur(24px)",
        }}
      >
        <h3 className="text-[10px] text-white/20 uppercase tracking-[0.08em] mb-6">
          {t(lang, "skill_structure").toUpperCase()}
        </h3>
        <div className="space-y-6">
          {aspects.map((aspect) => {
            const subSkills = subSkillsByAspect.get(aspect.id) ?? [];
            return (
              <div key={aspect.id} className="relative">
                <div
                  className="flex items-center gap-4 p-3 rounded-[7px] relative overflow-hidden group/row"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderLeft: `4px solid ${skill.color}`,
                  }}
                >
                  <span className="text-sm font-medium text-white uppercase tracking-wide">
                    {aspect.name}
                  </span>
                  <div className="progress-wrap flex-1 max-w-[120px] flex items-center gap-2">
                    <div className="progress-track flex-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="progress-fill h-full rounded-full"
                        style={{
                          width: `${aspect.completionPercentage}%`,
                          background: `linear-gradient(90deg, ${skill.color}40, ${skill.color})`,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: skill.color }}
                  >
                    {aspect.completionPercentage}%
                  </span>
                </div>

                {subSkills.length > 0 && (
                  <div className="ml-4 mt-2 pl-4 border-l-2 border-[#1f1f1f] space-y-4">
                    {subSkills.map((subSkill) => {
                      const questsForSubSkill = (subSkill.quests || [])
                        .map((q) => {
                          const found = MOCK_QUESTS.find(
                            (mq) => mq.id === q.id,
                          );
                          return found
                            ? { ...found, percentage: q.percentage }
                            : null;
                        })
                        .filter(
                          (q): q is Quest & { percentage: number } => q != null,
                        );

                      return (
                        <div key={subSkill.id} className="relative">
                          <div
                            className="relative flex items-center gap-2 p-2 rounded-[7px] group/row transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                            id={`subskill-${subSkill.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[#e0e0e0] group-hover/row:text-white">
                                {subSkill.name}
                              </span>
                              <span className="text-[10px] text-white/30 ml-2">
                                {t(lang, "skill_level_prefix")} {subSkill.level}
                              </span>
                            </div>
                          </div>
                          {questsForSubSkill.length > 0 && (
                            <div className="ml-4 mt-2 pl-4 border-l border-[#1f1f1f] space-y-1.5">
                              {questsForSubSkill.map((q) => (
                                <div
                                  key={q.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => onQuestSelect(q.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      onQuestSelect(q.id);
                                    }
                                  }}
                                  className="flex items-center gap-2 py-1.5 text-[12px] text-white/55 border-b border-white/6 last:border-0 group/row cursor-pointer hover:bg-white/3 rounded px-1 -mx-1 transition-colors"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: skill.color }}
                                  />
                                  <span className="flex-1 min-w-0 text-white/70">
                                    {q.name}
                                  </span>
                                  {(() => {
                                    const status = getEffectiveStatus(q.id);
                                    return (
                                      <StatusTagDropdown
                                        dropdownKey={`tree-${q.id}`}
                                        quest={{ ...q, status }}
                                        statusLabels={statusLabels}
                                        statusTagStyle={statusTagStyle}
                                        isOpen={
                                          openStatusDropdownKey ===
                                          `tree-${q.id}`
                                        }
                                        onOpenChange={(open) =>
                                          setOpenStatusDropdownKey(
                                            open ? `tree-${q.id}` : null,
                                          )
                                        }
                                        onStatusSelect={setStatusOverride}
                                      />
                                    );
                                  })()}
                                  {(() => {
                                    const recurring = getEffectiveRecurring(
                                      q.id,
                                      q.isRecurring,
                                    );
                                    return (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleRecurring(q.id, q.isRecurring);
                                        }}
                                        className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-[7px] border uppercase tracking-widest shrink-0 transition-colors ${
                                          recurring
                                            ? "border-white/20 text-white/55 hover:border-white/40"
                                            : "border-white/6 text-white/18 hover:border-white/12"
                                        }`}
                                        title={t(lang, "quest_recurring_label")}
                                      >
                                        <Refresh
                                          width={9}
                                          height={9}
                                          strokeWidth={2.2}
                                        />
                                      </button>
                                    );
                                  })()}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      togglePinned(q.id);
                                    }}
                                    className="p-1 rounded hover:bg-[#1f1f1f] transition-colors shrink-0"
                                    title={
                                      isPinned(q.id)
                                        ? t(lang, "unpin")
                                        : t(lang, "pin")
                                    }
                                    style={{
                                      color: isPinned(q.id)
                                        ? skill.color
                                        : "#444",
                                    }}
                                  >
                                    {isPinned(q.id) ? (
                                      <PinSolid width={12} height={12} />
                                    ) : (
                                      <Pin
                                        width={12}
                                        height={12}
                                        strokeWidth={1.8}
                                      />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {aspects.length === 0 && (
          <p className="text-white/30 text-sm">{t(lang, "skill_no_aspects")}</p>
        )}
      </section>
    </div>
  );
}
