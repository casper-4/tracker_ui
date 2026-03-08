"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Xmark } from "iconoir-react";
import { MOCK_QUESTS } from "@/lib/mock";
import type { Quest } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

type QuestStatus = "planned" | "in_progress" | "completed";

interface ChartDataPoint {
  date: string;
  dayLabel: string;
  planned: number;
  in_progress: number;
  completed: number;
  questsBy: Record<QuestStatus, Quest[]>;
}

type TooltipState = {
  key: string;
  date: string;
  status: QuestStatus;
  quests: Quest[];
  left: number;
  top: number;
  pinned: boolean;
};

type RangeMode = "7" | "14" | "custom";

type QuestsChartProps = {
  quests: Quest[];
  getSkillName: (skillId: string) => string;
  onQuestClick: (questId: string) => void;
};

const COLORS: Record<QuestStatus, string> = {
  planned: "#F3E600",
  in_progress: "#55EAD4",
  completed: "#00FF9F",
};

// 60 days of smooth mock data — consecutive points differ by at most 1
// [planned, in_progress, completed]
const SMOOTH_DATA: [number, number, number][] = [
  [3, 2, 1],
  [3, 2, 1],
  [4, 2, 2],
  [4, 2, 2],
  [4, 3, 2],
  [5, 3, 2],
  [5, 3, 3],
  [5, 2, 3],
  [4, 2, 3],
  [4, 2, 2],
  [5, 2, 3],
  [5, 3, 3],
  [6, 3, 3],
  [6, 3, 4],
  [5, 3, 4],
  [5, 2, 4],
  [4, 2, 3],
  [4, 2, 3],
  [5, 2, 4],
  [5, 3, 4],
  [5, 3, 4],
  [6, 3, 4],
  [5, 3, 5],
  [5, 2, 5],
  [4, 2, 4],
  [4, 2, 4],
  [3, 2, 3],
  [3, 3, 3],
  [4, 3, 4],
  [4, 3, 4],
  [5, 3, 5],
  [5, 3, 5],
  [5, 2, 4],
  [6, 2, 4],
  [6, 2, 5],
  [5, 2, 5],
  [4, 2, 5],
  [4, 3, 4],
  [4, 3, 5],
  [5, 3, 5],
  [5, 3, 5],
  [5, 3, 5],
  [6, 2, 5],
  [5, 2, 5],
  [4, 2, 4],
  [4, 3, 4],
  [5, 3, 5],
  [5, 3, 5],
  [5, 3, 5],
  [6, 3, 5],
  [6, 2, 5],
  [5, 2, 5],
  [4, 2, 4],
  [4, 2, 5],
  [5, 2, 5],
  [5, 3, 5],
  [6, 3, 5],
  [5, 3, 4],
  [5, 2, 4],
  [5, 2, 5],
];

const allPlanned = MOCK_QUESTS.filter((q) => q.status === "planned");
const allInProgress = MOCK_QUESTS.filter((q) => q.status === "in_progress");
const allCompleted = MOCK_QUESTS.filter((q) => q.status === "completed");

function cycleSlice(arr: Quest[], count: number): Quest[] {
  if (arr.length === 0 || count === 0) return [];
  const result: Quest[] = [];
  for (let i = 0; i < count; i++) result.push(arr[i % arr.length]);
  return result;
}

const CustomXTick = (
  props: Record<string, unknown> & { fontSize?: number },
) => {
  const { x, y, payload, fontSize = 11 } = props as {
    x: number;
    y: number;
    payload: { value: string };
    fontSize?: number;
  };
  const words = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={fontSize}>
        {words.map((word, i) => (
          <tspan key={i} x={0} dy={i === 0 ? "1.1em" : "1.3em"}>
            {word}
          </tspan>
        ))}
      </text>
    </g>
  );
};

const DROPDOWN_W = 256; // px — matches w-64
const DROPDOWN_H = 220; // px — estimated max height

export default function QuestsChart({
  quests,
  getSkillName,
  onQuestClick,
}: QuestsChartProps) {
  const { lang } = useLang();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rangeMode, setRangeMode] = useState<RangeMode>("14");
  const [customInput, setCustomInput] = useState("30");
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  void quests;
  void getSkillName;

  const days =
    rangeMode === "7"
      ? 7
      : rangeMode === "14"
        ? 14
        : Math.max(1, Math.min(60, parseInt(customInput) || 14));

  const isMobile = containerWidth < 500;
  const isTablet = containerWidth < 768;
  const chartHeight = isMobile ? 240 : isTablet ? 320 : 440;
  const xAxisInterval = isMobile
    ? Math.ceil(days / 4) - 1
    : isTablet
      ? Math.ceil(days / 7) - 1
      : 0;
  const xAxisHeight = isMobile ? 45 : 75;
  const xAxisFontSize = isMobile ? 9 : 11;
  const chartMarginBottom = isMobile ? 40 : 75;

  const allChartData = useMemo(() => {
    const now = new Date();
    const total = SMOOTH_DATA.length; // 60
    return SMOOTH_DATA.map(([pc, ipc, cc], idx) => {
      const i = total - 1 - idx;
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel =
        i === 0
          ? t(lang, "chart_today")
          : i === 1
            ? t(lang, "chart_yesterday")
            : `${i} ${t(lang, "chart_days_ago")}`;
      return {
        date: dateStr,
        dayLabel,
        planned: pc,
        in_progress: ipc,
        completed: cc,
        questsBy: {
          planned: cycleSlice(allPlanned, pc),
          in_progress: cycleSlice(allInProgress, ipc),
          completed: cycleSlice(allCompleted, cc),
        },
      };
    });
  }, [lang]);

  const chartData = allChartData.slice(-days);

  // ── tooltip helpers ─────────────────────────────────────────────────────────

  const resolvePos = useCallback(
    (cx: number, cy: number): { left: number; top: number } => {
      const w = containerRef.current?.clientWidth ?? 800;
      const h = containerRef.current?.clientHeight ?? 500;
      const gap = 10;
      const left =
        cx + gap + DROPDOWN_W > w ? cx - gap - DROPDOWN_W : cx + gap;
      const top = cy + DROPDOWN_H > h ? cy - DROPDOWN_H : cy;
      return { left, top };
    },
    [],
  );

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openTooltip = useCallback(
    (
      key: string,
      date: string,
      status: QuestStatus,
      quests: Quest[],
      cx: number,
      cy: number,
    ) => {
      cancelClose();
      // skip setState entirely if same non-pinned tooltip is already shown
      setTooltip((prev) => {
        if (prev?.key === key && !prev.pinned) return prev;
        const pos = resolvePos(cx, cy);
        return {
          key,
          date,
          status,
          quests,
          ...pos,
          pinned: prev?.key === key ? prev.pinned : false,
        };
      });
    },
    [cancelClose, resolvePos],
  );

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => {
      setTooltip((prev) => (prev?.pinned ? prev : null));
    }, 80);
  }, [cancelClose]);

  const togglePin = useCallback(
    (
      key: string,
      date: string,
      status: QuestStatus,
      quests: Quest[],
      cx: number,
      cy: number,
    ) => {
      cancelClose();
      setTooltip((prev) => {
        if (prev?.key === key && prev.pinned) return null;
        const pos = resolvePos(cx, cy);
        return {
          key,
          date,
          status,
          quests,
          ...pos,
          pinned: true,
        };
      });
    },
    [cancelClose, resolvePos],
  );

  const closeTooltip = useCallback(() => {
    cancelClose();
    setTooltip(null);
  }, [cancelClose]);

  // ── dot renderer factory ────────────────────────────────────────────────────

  const makeDot = useCallback(
    (status: QuestStatus) =>
      (props: Record<string, unknown>) => {
        const { cx, cy, payload } = props as {
          cx: number;
          cy: number;
          payload: ChartDataPoint;
        };
        const key = `${payload.date}-${status}`;
        const hasQuests = payload.questsBy[status].length > 0;
        return (
          <circle
            key={key}
            cx={cx}
            cy={cy}
            r={5}
            fill={COLORS[status]}
            style={{ cursor: hasQuests ? "pointer" : "default", outline: "none" }}
            onMouseEnter={() =>
              hasQuests &&
              openTooltip(
                key,
                payload.date,
                status,
                payload.questsBy[status],
                cx,
                cy,
              )
            }
            onMouseLeave={scheduleClose}
            onClick={(e) => {
              e.stopPropagation();
              if (hasQuests)
                togglePin(
                  key,
                  payload.date,
                  status,
                  payload.questsBy[status],
                  cx,
                  cy,
                );
            }}
          />
        );
      },
    [openTooltip, scheduleClose, togglePin],
  );

  const statusLabel = (status: QuestStatus): string => {
    if (status === "planned") return t(lang, "quests_planned");
    if (status === "in_progress") return t(lang, "quests_in_progress");
    return t(lang, "quests_completed");
  };

  const rangeBtn = (mode: RangeMode, label: string) => (
    <button
      key={mode}
      onClick={() => setRangeMode(mode)}
      className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-md transition-all duration-150 ${
        rangeMode === mode
          ? "bg-[#F3E600]/10 text-[#F3E600] border border-[#F3E600]/30"
          : "border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(255,255,255,0.16)] hover:text-[rgba(255,255,255,0.55)]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="mt-8 relative p-4 sm:p-6 rounded-[14px] overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderTop: "1px solid rgba(255,255,255,0.16)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* header row */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-[10px] font-semibold text-[rgba(255,255,255,0.3)] uppercase tracking-[0.08em]">
          Stats
        </h2>
        <div className="flex flex-wrap items-center gap-1">
          {rangeBtn("7", "7d")}
          {rangeBtn("14", "14d")}
          <button
            onClick={() => setRangeMode("custom")}
            className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest rounded-md transition-all duration-150 ${
              rangeMode === "custom"
                ? "bg-[#F3E600]/10 text-[#F3E600] border border-[#F3E600]/30"
                : "border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.3)] hover:border-[rgba(255,255,255,0.16)] hover:text-[rgba(255,255,255,0.55)]"
            }`}
          >
            {t(lang, "chart_range_custom")}
          </button>
          {rangeMode === "custom" && (
            <div className="flex items-center gap-1 ml-1">
              <input
                type="number"
                min={1}
                max={60}
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-12 rounded-md text-[11px] px-2 py-1 text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                }}
              />
              <span className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-widest">
                {t(lang, "chart_days")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* chart — aggressive outline removal covers recharts svg + wrapper divs */}
      <div
        ref={containerRef}
        className="relative w-full [&_*]:outline-none [&_*:focus]:outline-none [&_*:focus-visible]:outline-none"
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: isMobile ? 10 : 30, left: 0, bottom: chartMarginBottom }}
            tabIndex={-1}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="dayLabel"
              stroke="rgba(255,255,255,0.06)"
              tick={(props) => <CustomXTick {...props} fontSize={xAxisFontSize} />}
              height={xAxisHeight}
              interval={xAxisInterval}
            />
            <YAxis
              stroke="rgba(255,255,255,0.06)"
              tick={{ fontSize: isMobile ? 10 : 12, fill: "rgba(255,255,255,0.3)" }}
              width={isMobile ? 24 : 40}
              domain={[0, 7]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
              allowDecimals={false}
            />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="line"
              formatter={(value) => {
                const labels: Record<string, string> = {
                  planned: t(lang, "quests_planned"),
                  in_progress: t(lang, "quests_in_progress"),
                  completed: t(lang, "quests_completed"),
                };
                return labels[value] || value;
              }}
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke={COLORS.planned}
              strokeWidth={2}
              dot={makeDot("planned")}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="in_progress"
              stroke={COLORS.in_progress}
              strokeWidth={2}
              dot={makeDot("in_progress")}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke={COLORS.completed}
              strokeWidth={2}
              dot={makeDot("completed")}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* ── tooltip ───────────────────────────────────────────────────────── */}
        {tooltip && (
          <div
            className="absolute z-50 w-64 rounded-[10px] overflow-hidden shadow-2xl"
            style={{
              left: tooltip.left,
              top: tooltip.top,
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.4) 100%)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderTop: "1px solid rgba(255,255,255,0.16)",
              backdropFilter: "blur(24px)",
            }}
            onMouseEnter={cancelClose}
            onMouseLeave={() => !tooltip.pinned && closeTooltip()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.07)]">
              <div>
                <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-widest">
                  {tooltip.date}
                </p>
                <p
                  className="text-[11px] font-medium mt-0.5 uppercase tracking-widest"
                  style={{ color: COLORS[tooltip.status] }}
                >
                  {statusLabel(tooltip.status)}
                </p>
              </div>
              <button
                onClick={closeTooltip}
                className="text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.7)] transition-colors ml-3 flex-shrink-0"
              >
                <Xmark width={13} height={13} strokeWidth={2} />
              </button>
            </div>
            <ul className="flex flex-col max-h-48 overflow-y-auto">
              {tooltip.quests.map((quest, qi) => (
                <li
                  key={`${quest.id}-${qi}`}
                  className="border-b border-[rgba(255,255,255,0.06)] last:border-0"
                >
                  <button
                    onClick={() => {
                      onQuestClick(quest.id);
                      closeTooltip();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
                  >
                    <p className="text-xs font-medium text-[rgba(255,255,255,0.7)] group-hover:text-[#F3E600] line-clamp-1">
                      {quest.name}
                    </p>
                    {quest.description && (
                      <p className="text-[10px] text-[rgba(255,255,255,0.3)] mt-0.5 line-clamp-1">
                        {quest.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
