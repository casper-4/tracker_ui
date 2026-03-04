"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

type HoverData = {
  date: string;
  status: QuestStatus;
  quests: Quest[];
} | null;

type QuestsChartProps = {
  quests: Quest[];
  getSkillName: (skillId: string) => string;
  onQuestClick: (questId: string) => void;
};

const COLORS: Record<QuestStatus, string> = {
  planned: "#facc15",
  in_progress: "#60a5fa",
  completed: "#4ade80",
};

export default function QuestsChart({
  quests,
  getSkillName,
  onQuestClick,
}: QuestsChartProps) {
  const { lang } = useLang();
  const [hoverData, setHoverData] = useState<HoverData>(null);

  const chartData = useMemo(() => {
    const now = new Date();
    const data: ChartDataPoint[] = [];

    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("pl-PL", {
        weekday: "short",
        month: "2-digit",
        day: "2-digit",
      });

      const questsBy: Record<QuestStatus, Quest[]> = {
        planned: [],
        in_progress: [],
        completed: [],
      };

      // Mock data for chart display
      questsBy.planned = MOCK_QUESTS.filter((q) => q.status === "planned").slice(0, 2);
      questsBy.in_progress = MOCK_QUESTS.filter((q) => q.status === "in_progress").slice(0, 1);
      questsBy.completed = MOCK_QUESTS.filter((q) => q.status === "completed").slice(0, 2);

      data.push({
        date: dateStr,
        dayLabel,
        planned: questsBy.planned.length,
        in_progress: questsBy.in_progress.length,
        completed: questsBy.completed.length,
        questsBy,
      });
    }

    return data;
  }, [quests]);

  const handleMouseEnter = (data: ChartDataPoint, status: QuestStatus) => {
    if (data.questsBy[status].length > 0) {
      setHoverData({
        date: data.date,
        status,
        quests: data.questsBy[status],
      });
    }
  };

  const handleQuestClick = (questId: string) => {
    onQuestClick(questId);
    setHoverData(null);
  };

  const statusLabel = (status: QuestStatus): string => {
    if (status === "planned") return t(lang, "quests_planned");
    if (status === "in_progress") return t(lang, "quests_in_progress");
    return t(lang, "quests_completed");
  };

  return (
    <div className="mt-8 border border-[#1f1f1f] bg-[#0a0a0a] p-6">
      <h2 className="text-[10px] text-[#888] uppercase tracking-widest mb-6">
        Stats — last 2 weeks
      </h2>

      <div className="relative w-full">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="dayLabel"
              stroke="#666"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#666" tick={{ fontSize: 12 }} />
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
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartDataPoint };
                return (
                  <circle
                    key={`planned-dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={COLORS.planned}
                    onClick={() => handleMouseEnter(payload, "planned")}
                    onMouseEnter={() => handleMouseEnter(payload, "planned")}
                    onMouseLeave={() => setHoverData(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="in_progress"
              stroke={COLORS.in_progress}
              strokeWidth={2}
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartDataPoint };
                return (
                  <circle
                    key={`in-progress-dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={COLORS.in_progress}
                    onClick={() => handleMouseEnter(payload, "in_progress")}
                    onMouseEnter={() => handleMouseEnter(payload, "in_progress")}
                    onMouseLeave={() => setHoverData(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke={COLORS.completed}
              strokeWidth={2}
              dot={(props: Record<string, unknown>) => {
                const { cx, cy, payload } = props as { cx: number; cy: number; payload: ChartDataPoint };
                return (
                  <circle
                    key={`completed-dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={COLORS.completed}
                    onClick={() => handleMouseEnter(payload, "completed")}
                    onMouseEnter={() => handleMouseEnter(payload, "completed")}
                    onMouseLeave={() => setHoverData(null)}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Hover Popup */}
        {hoverData && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-[#1f1f1f] bg-[#050505] rounded p-4 w-96 max-h-96 flex flex-col z-50 shadow-2xl">
            <div className="mb-3 pb-3 border-b border-[#1f1f1f]">
              <p className="text-xs text-[#888] uppercase tracking-widest">
                {hoverData.date}
              </p>
              <p className="text-sm text-white mt-1">
                {statusLabel(hoverData.status)}
              </p>
            </div>
            <ul className="flex flex-col gap-2 overflow-y-auto flex-1">
              {hoverData.quests.map((quest) => (
                <li key={quest.id}>
                  <button
                    onClick={() => handleQuestClick(quest.id)}
                    className="w-full text-left p-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded hover:border-[#333] hover:bg-[#151515] transition-colors group"
                  >
                    <p className="text-xs font-medium text-white group-hover:text-[#facc15]/90 line-clamp-2">
                      {quest.name}
                    </p>
                    <p className="text-[10px] text-[#666] mt-1">
                      {quest.description?.slice(0, 50) || "—"}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setHoverData(null)}
              className="mt-3 text-xs text-[#666] hover:text-[#999] transition-colors"
            >
              {t(lang, "quest_close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
