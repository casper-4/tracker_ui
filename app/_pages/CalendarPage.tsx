"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, LayoutList } from "lucide-react";
import { MOCK_QUESTS, MOCK_SKILLS } from "@/lib/mock";
import type { Quest } from "@/lib/mock";
import QuestDetailModal from "@/app/components/QuestDetailModal";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

type CalendarView = "day" | "week" | "month";
type QuestOverride = Partial<Pick<Quest, "status" | "plannedDateTime">>;

function getStartOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function getStartOfWeek(d: Date): Date {
  const start = getStartOfDay(d);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return start;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function addWeeks(d: Date, n: number): Date { return addDays(d, n * 7); }

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function sameDay(a: Date, b: Date): boolean {
  return getStartOfDay(a).getTime() === getStartOfDay(b).getTime();
}

function getEffectiveQuest(quest: Quest, override: QuestOverride): Quest {
  return { ...quest, ...override };
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAY_LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

export default function CalendarPage() {
  const { lang } = useLang();
  const [view, setView] = useState<CalendarView>("week");
  const [currentDate, setCurrentDate] = useState(() => getStartOfDay(new Date()));
  // TODO: [DATA] persistence will go here — simple useState for drag/pin state
  const [overrides, setOverrides] = useState<Record<string, QuestOverride>>({});
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ date: Date; hour?: number } | null>(null);

  const skillById = useMemo(
    () => Object.fromEntries(MOCK_SKILLS.map((s) => [s.id, s])),
    []
  );

  const pinnedQuests = useMemo(
    () => pinnedIds.map((id) => MOCK_QUESTS.find((q) => q.id === id)).filter((q): q is Quest => q != null),
    [pinnedIds]
  );

  const questsWithPlanned = useMemo(() => {
    return MOCK_QUESTS
      .map((q) => getEffectiveQuest(q, overrides[q.id] ?? {}))
      .filter((q) => q.plannedDateTime != null && q.plannedDateTime > 0);
  }, [overrides]);

  const applyOverride = useCallback((questId: string, patch: QuestOverride) => {
    // TODO: [DATA] persistence will go here
    setOverrides((prev) => {
      const current = prev[questId] ?? {};
      return { ...prev, [questId]: { ...current, ...patch } };
    });
  }, []);

  const handleDropOnSlot = useCallback((date: Date, hour: number) => {
    if (!draggedQuestId) return;
    setDropTarget(null);
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    applyOverride(draggedQuestId, { plannedDateTime: slotStart.getTime(), status: "planned" });
    setDraggedQuestId(null);
  }, [draggedQuestId, applyOverride]);

  const handleDropOnDay = useCallback((date: Date) => {
    if (!draggedQuestId) return;
    setDropTarget(null);
    const slotStart = getStartOfDay(date);
    slotStart.setHours(9, 0, 0, 0);
    applyOverride(draggedQuestId, { plannedDateTime: slotStart.getTime(), status: "planned" });
    setDraggedQuestId(null);
  }, [draggedQuestId, applyOverride]);

  const setDropTargetSlot = useCallback((date: Date | null, hour?: number) => {
    if (date === null) setDropTarget(null);
    else setDropTarget({ date, hour });
  }, []);

  const navLabel = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const weekStart = getStartOfWeek(currentDate);
      const weekEnd = addDays(weekStart, 6);
      return `${weekStart.getDate()}.${weekStart.getMonth() + 1} – ${weekEnd.getDate()}.${weekEnd.getMonth() + 1}.${weekEnd.getFullYear()}`;
    }
    return currentDate.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  }, [view, currentDate]);

  const goPrev = useCallback(() => {
    if (view === "day") setCurrentDate((d) => addDays(d, -1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, -1));
    else setCurrentDate((d) => addMonths(d, -1));
  }, [view]);

  const goNext = useCallback(() => {
    if (view === "day") setCurrentDate((d) => addDays(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addMonths(d, 1));
  }, [view]);

  const goToday = useCallback(() => {
    setCurrentDate(getStartOfDay(new Date()));
  }, []);

  const viewLabels = {
    day: t(lang, "calendar_day"),
    week: t(lang, "calendar_week"),
    month: t(lang, "calendar_month"),
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full overflow-hidden">
      <header className="mb-4 shrink-0">
        <h1 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-2">
          {t(lang, "calendar_title")}
        </h1>
        <p className="text-sm text-[#888] mb-4">{t(lang, "calendar_description")}</p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 border border-[#1f1f1f] rounded overflow-hidden">
            {(["day", "week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  view === v ? "bg-[#facc15] text-black" : "bg-[#0a0a0a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                {viewLabels[v]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="p-1.5 rounded border border-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] rounded text-[#888] hover:text-white hover:bg-[#1a1a1a]"
            >
              {t(lang, "calendar_today")}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="p-1.5 rounded border border-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-sm text-[#aaa] min-w-[200px] capitalize">{navLabel}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 gap-4">
        {/* Pinned quests sidebar */}
        <aside className="w-52 shrink-0 border border-[#1f1f1f] bg-[#0a0a0a] rounded flex flex-col overflow-hidden">
          <h2 className="text-[10px] text-[#888] uppercase tracking-widest p-3 border-b border-[#1f1f1f] flex items-center gap-2">
            <LayoutList size={12} />
            {t(lang, "calendar_pinned")}
          </h2>
          <ul className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1.5">
            {pinnedQuests.length === 0 ? (
              <li className="text-[#555] text-xs p-2">{t(lang, "calendar_pinned_empty")}</li>
            ) : (
              pinnedQuests.map((quest) => {
                const skill = skillById[quest.skill];
                const color = skill?.color ?? "#666";
                const effective = getEffectiveQuest(quest, overrides[quest.id] ?? {});
                return (
                  <li key={quest.id}>
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDraggedQuestId(quest.id);
                        e.dataTransfer.setData("text/plain", quest.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggedQuestId(null);
                        setDropTarget(null);
                      }}
                      onClick={() => setSelectedQuest(quest)}
                      className={`block w-full text-left p-2 rounded border cursor-grab active:cursor-grabbing transition-colors ${
                        draggedQuestId === quest.id ? "opacity-50" : "hover:border-[#333] hover:bg-[#111]"
                      }`}
                      style={{ borderColor: color }}
                    >
                      <p className="text-xs font-medium text-white truncate">{quest.name}</p>
                      {effective.plannedDateTime != null && (
                        <p className="text-[10px] text-[#666] mt-0.5">
                          {new Date(effective.plannedDateTime).toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Calendar */}
        <main className="flex-1 border border-[#1f1f1f] bg-[#0a0a0a] rounded overflow-auto custom-scrollbar">
          {view === "day" && (
            <DayView
              date={currentDate}
              quests={questsWithPlanned}
              skillById={skillById}
              onDropSlot={handleDropOnSlot}
              onQuestClick={(id) => {
                const q = MOCK_QUESTS.find((x) => x.id === id);
                if (q) setSelectedQuest(getEffectiveQuest(q, overrides[q.id] ?? {}));
              }}
              dropTarget={dropTarget}
              setDropTarget={setDropTargetSlot}
            />
          )}
          {view === "week" && (
            <WeekView
              startDate={getStartOfWeek(currentDate)}
              quests={questsWithPlanned}
              skillById={skillById}
              onDropSlot={handleDropOnSlot}
              onQuestClick={(id) => {
                const q = MOCK_QUESTS.find((x) => x.id === id);
                if (q) setSelectedQuest(getEffectiveQuest(q, overrides[q.id] ?? {}));
              }}
              dropTarget={dropTarget}
              setDropTarget={setDropTargetSlot}
            />
          )}
          {view === "month" && (
            <MonthView
              monthDate={currentDate}
              quests={questsWithPlanned}
              skillById={skillById}
              onDropDay={handleDropOnDay}
              onQuestClick={(id) => {
                const q = MOCK_QUESTS.find((x) => x.id === id);
                if (q) setSelectedQuest(getEffectiveQuest(q, overrides[q.id] ?? {}));
              }}
              dropTarget={dropTarget}
              setDropTarget={setDropTargetSlot}
            />
          )}
        </main>
      </div>

      {selectedQuest && (
        <QuestDetailModal
          quest={selectedQuest}
          onClose={() => setSelectedQuest(null)}
          skillColor={skillById[selectedQuest.skill]?.color}
          onQuestChange={(updated) => {
            // TODO: [DATA] persistence will go here
            applyOverride(updated.id, { status: updated.status });
          }}
        />
      )}
    </div>
  );
}

type DropTarget = { date: Date; hour?: number } | null;

type SlotViewProps = {
  quests: Quest[];
  skillById: Record<string, { color: string }>;
  onDropSlot: (date: Date, hour: number) => void;
  onQuestClick: (id: string) => void;
  dropTarget: DropTarget;
  setDropTarget: (date: Date | null, hour?: number) => void;
};

function DayView({ date, quests, skillById, onDropSlot, onQuestClick, dropTarget, setDropTarget }: SlotViewProps & { date: Date }) {
  const dayStart = getStartOfDay(date);
  const questsByHour = useMemo(() => {
    const map: Record<number, Quest[]> = {};
    for (const q of quests) {
      const d = new Date(q.plannedDateTime!);
      if (d.getTime() >= dayStart.getTime() && d.getTime() < addDays(dayStart, 1).getTime()) {
        const h = d.getHours();
        if (!map[h]) map[h] = [];
        map[h].push(q);
      }
    }
    return map;
  }, [quests, dayStart]);

  return (
    <div className="p-4">
      <div className="flex">
        <div className="w-14 shrink-0 text-[10px] text-[#666] uppercase tracking-wider space-y-0">
          {HOURS.map((h) => (
            <div key={h} className="h-12 flex items-start pt-0.5 font-mono">
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
        <div className="flex-1 border-l border-[#1f1f1f]">
          {HOURS.map((hour) => {
            const isTarget = dropTarget && dropTarget.hour !== undefined && sameDay(dropTarget.date, dayStart) && dropTarget.hour === hour;
            return (
              <div
                key={hour}
                className={`h-12 border-b border-[#1f1f1f] min-h-[3rem] flex flex-col transition-colors ${isTarget ? "bg-[#facc15]/10" : ""}`}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(new Date(dayStart), hour); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => { e.preventDefault(); onDropSlot(new Date(dayStart), hour); }}
              >
                <div className="flex-1 p-1 flex flex-wrap gap-1">
                  {(questsByHour[hour] ?? []).map((q) => (
                    <CalendarQuestChip key={q.id} quest={q} color={skillById[q.skill]?.color ?? "#666"} onClick={() => onQuestClick(q.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({ startDate, quests, skillById, onDropSlot, onQuestClick, dropTarget, setDropTarget }: SlotViewProps & { startDate: Date }) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startDate, i)), [startDate]);

  const questsByDayHour = useMemo(() => {
    const map: Record<string, Quest[]> = {};
    for (const q of quests) {
      const d = new Date(q.plannedDateTime!);
      const dayKey = getStartOfDay(d).getTime();
      const hour = d.getHours();
      const key = `${dayKey}-${hour}`;
      if (!map[key]) map[key] = [];
      map[key].push(q);
    }
    return map;
  }, [quests]);

  return (
    <div className="p-4 min-w-[600px]">
      <div className="flex border-b border-[#1f1f1f]">
        <div className="w-14 shrink-0" />
        {days.map((d) => (
          <div key={d.getTime()} className="flex-1 min-w-0 text-center py-2 border-l first:border-l-0 border-[#1f1f1f]">
            <span className="text-[10px] text-[#666] uppercase">{WEEKDAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</span>
            <p className="text-sm font-medium text-white">{d.getDate()}</p>
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="w-14 shrink-0 text-[10px] text-[#666] font-mono space-y-0">
          {HOURS.map((h) => (
            <div key={h} className="h-10 flex items-start pt-0.5">{h.toString().padStart(2, "0")}</div>
          ))}
        </div>
        <div className="flex-1 flex border-l border-[#1f1f1f]">
          {days.map((day) => (
            <div key={day.getTime()} className="flex-1 min-w-0 flex flex-col border-l first:border-l-0 border-[#1f1f1f]">
              {HOURS.map((hour) => {
                const dayStart = getStartOfDay(day);
                const key = `${dayStart.getTime()}-${hour}`;
                const slotQuests = questsByDayHour[key] ?? [];
                const isTarget = dropTarget && dropTarget.hour !== undefined && sameDay(dropTarget.date, day) && dropTarget.hour === hour;
                return (
                  <div
                    key={hour}
                    className={`h-10 border-b border-[#1f1f1f] min-h-[2.5rem] flex flex-col transition-colors ${isTarget ? "bg-[#facc15]/10" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(new Date(day), hour); }}
                    onDragLeave={() => setDropTarget(null)}
                    onDrop={(e) => { e.preventDefault(); onDropSlot(new Date(day), hour); }}
                  >
                    <div className="flex-1 p-0.5 flex flex-col gap-0.5 overflow-hidden">
                      {slotQuests.map((q) => (
                        <CalendarQuestChip key={q.id} quest={q} color={skillById[q.skill]?.color ?? "#666"} onClick={() => onQuestClick(q.id)} compact />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthView({
  monthDate,
  quests,
  skillById,
  onDropDay,
  onQuestClick,
  dropTarget,
  setDropTarget,
}: {
  monthDate: Date;
  quests: Quest[];
  skillById: Record<string, { color: string }>;
  onDropDay: (date: Date) => void;
  onQuestClick: (id: string) => void;
  dropTarget: DropTarget;
  setDropTarget: (date: Date | null, hour?: number) => void;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const dayDates = useMemo(() => {
    const out: (Date | null)[] = [];
    for (let i = 0; i < startPadding; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    return out;
  }, [year, month, startPadding, daysInMonth]);

  const questsByDay = useMemo(() => {
    const map: Record<number, Quest[]> = {};
    for (const q of quests) {
      const d = new Date(q.plannedDateTime!);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = getStartOfDay(d).getTime();
      if (!map[key]) map[key] = [];
      map[key].push(q);
    }
    return map;
  }, [quests, year, month]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-7 gap-px border border-[#1f1f1f] rounded overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-[#111] py-2 text-center text-[10px] text-[#666] uppercase">{label}</div>
        ))}
        {dayDates.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="min-h-[80px] bg-[#0a0a0a]" />;
          const key = d.getTime();
          const dayQuests = questsByDay[key] ?? [];
          const isTarget = dropTarget && sameDay(dropTarget.date, d);
          return (
            <div
              key={key}
              className={`min-h-[80px] bg-[#0a0a0a] p-1 flex flex-col transition-colors ${isTarget ? "bg-[#facc15]/10" : ""}`}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setDropTarget(new Date(d)); }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => { e.preventDefault(); onDropDay(d); }}
            >
              <span className="text-xs text-[#666] font-mono">{d.getDate()}</span>
              <div className="flex-1 mt-1 space-y-1 overflow-y-auto custom-scrollbar">
                {dayQuests.map((q) => (
                  <CalendarQuestChip key={q.id} quest={q} color={skillById[q.skill]?.color ?? "#666"} onClick={() => onQuestClick(q.id)} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarQuestChip({
  quest,
  color,
  onClick,
  compact,
}: {
  quest: Quest;
  color: string;
  onClick: () => void;
  compact?: boolean;
}) {
  const start = quest.plannedDateTime ? new Date(quest.plannedDateTime) : null;
  const end = start && quest.duration ? new Date(start.getTime() + quest.duration * 1000) : null;
  const timeStr =
    start && end
      ? `${start.getHours().toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")} – ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`
      : null;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-full text-left rounded border truncate transition-opacity hover:opacity-90 ${compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"}`}
      style={{ borderColor: color, color }}
      title={quest.name + (timeStr ? ` (${timeStr})` : "")}
    >
      <span className="block truncate text-white/95">{quest.name}</span>
      {!compact && timeStr && <span className="block text-[10px] opacity-80">{timeStr}</span>}
    </button>
  );
}
