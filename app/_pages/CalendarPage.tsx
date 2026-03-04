"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, LayoutList, Calendar } from "lucide-react";
import { MOCK_QUESTS, MOCK_SKILLS } from "@/lib/mock";
import type { Quest } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// TODO: [DATA] persistence will go here

type MultiDaySpan = 7 | 14 | 30;
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

function sameDay(a: Date, b: Date): boolean {
  return getStartOfDay(a).getTime() === getStartOfDay(b).getTime();
}

function getEffectiveQuest(quest: Quest, override: QuestOverride): Quest {
  return { ...quest, ...override };
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

const WEEKDAY_SHORT: Record<number, string> = {
  0: "Nd",
  1: "Pn",
  2: "Wt",
  3: "Śr",
  4: "Cz",
  5: "Pt",
  6: "So",
};

type CalendarPageProps = {
  onQuestSelect: (id: string) => void;
};

export default function CalendarPage({ onQuestSelect }: CalendarPageProps) {
  const { lang } = useLang();
  const today = useMemo(() => getStartOfDay(new Date()), []);

  const [span, setSpan] = useState<MultiDaySpan>(7);
  // rangeStart = first day of the wide multi-day view
  const [rangeStart, setRangeStart] = useState<Date>(() =>
    getStartOfWeek(new Date()),
  );
  // TODO: [DATA] persistence will go here — simple useState for drag/pin state
  const [overrides, setOverrides] = useState<Record<string, QuestOverride>>({});
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [draggedQuestId, setDraggedQuestId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const [pinnedDragOver, setPinnedDragOver] = useState(false);

  const handleChipDragEnd = useCallback(() => {
    setDraggedQuestId(null);
    setDropTarget(null);
  }, []);

  const skillById = useMemo(
    () => Object.fromEntries(MOCK_SKILLS.map((s) => [s.id, s])),
    [],
  );

  const pinnedQuests = useMemo(
    () =>
      pinnedIds
        .map((id) => MOCK_QUESTS.find((q) => q.id === id))
        .filter((q): q is Quest => q != null),
    [pinnedIds],
  );

  const questsWithPlanned = useMemo(() => {
    return MOCK_QUESTS.map((q) =>
      getEffectiveQuest(q, overrides[q.id] ?? {}),
    ).filter((q) => q.plannedDateTime != null && q.plannedDateTime > 0);
  }, [overrides]);

  const handleDropOnPinned = useCallback(() => {
    if (!draggedQuestId) return;
    setPinnedDragOver(false);
    setPinnedIds((prev) =>
      prev.includes(draggedQuestId) ? prev : [...prev, draggedQuestId],
    );
    setDraggedQuestId(null);
  }, [draggedQuestId]);

  const applyOverride = useCallback((questId: string, patch: QuestOverride) => {
    // TODO: [DATA] persistence will go here
    setOverrides((prev) => {
      const current = prev[questId] ?? {};
      return { ...prev, [questId]: { ...current, ...patch } };
    });
  }, []);

  const handleDropOnSlot = useCallback(
    (date: Date, hour: number) => {
      if (!draggedQuestId) return;
      setDropTarget(null);
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      applyOverride(draggedQuestId, {
        plannedDateTime: slotStart.getTime(),
        status: "planned",
      });
      setDraggedQuestId(null);
    },
    [draggedQuestId, applyOverride],
  );

  const setDropTargetSlot = useCallback((date: Date | null, hour?: number) => {
    if (date === null) setDropTarget(null);
    else setDropTarget({ date, hour });
  }, []);

  // Navigation: move range by span
  const goPrev = useCallback(() => {
    setRangeStart((d) => addDays(d, -span));
  }, [span]);

  const goNext = useCallback(() => {
    setRangeStart((d) => addDays(d, span));
  }, [span]);

  const goToday = useCallback(() => {
    setRangeStart(getStartOfWeek(new Date()));
  }, []);

  const handleSpanChange = useCallback((newSpan: MultiDaySpan) => {
    setSpan(newSpan);
    setRangeStart(getStartOfWeek(new Date()));
  }, []);

  const rangeEnd = useMemo(
    () => addDays(rangeStart, span - 1),
    [rangeStart, span],
  );

  const navLabel = useMemo(() => {
    const fmt = (d: Date) =>
      `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
        .toString()
        .padStart(2, "0")}.${d.getFullYear()}`;
    return `${fmt(rangeStart)} – ${fmt(rangeEnd)}`;
  }, [rangeStart, rangeEnd]);

  const spanLabels: Record<MultiDaySpan, string> = {
    7: t(lang, "calendar_7days"),
    14: t(lang, "calendar_14days"),
    30: t(lang, "calendar_30days"),
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Header ── */}
      <header className="mb-4 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Span switcher */}
          <div className="flex items-center gap-1 border border-[#1f1f1f] rounded overflow-hidden">
            {([7, 14, 30] as MultiDaySpan[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpanChange(s)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                  span === s
                    ? "bg-[#facc15] text-black font-bold"
                    : "bg-[#0a0a0a] text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                {spanLabels[s]}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="p-1.5 rounded border border-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 py-1.5 text-xs border border-[#1f1f1f] rounded text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              {t(lang, "calendar_today")}
            </button>
            <button
              type="button"
              onClick={goNext}
              className="p-1.5 rounded border border-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
            <span className="text-sm text-[#aaa] font-mono tracking-wider">
              {navLabel}
            </span>
          </div>
        </div>
      </header>

      {/* ── Three-column layout ── */}
      <div className="flex flex-1 min-h-0 gap-3">
        {/* ── Col 1: Pinned quests ── */}
        <aside
          className={`w-52 shrink-0 border rounded flex flex-col overflow-hidden transition-colors ${
            pinnedDragOver
              ? "border-dashed border-[#facc15]/50 bg-[#facc15]/5"
              : "border-[#1f1f1f] bg-[#0a0a0a]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            if (!pinnedDragOver) setPinnedDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node))
              setPinnedDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleDropOnPinned();
          }}
        >
          <h2 className="text-[10px] text-[#888] uppercase tracking-widest px-3 h-[60px] border-b border-[#1f1f1f] flex items-center gap-2 shrink-0">
            <LayoutList size={12} />
            {t(lang, "calendar_pinned")}
          </h2>
          <ul className="p-2 overflow-y-auto custom-scrollbar flex-1 space-y-1.5">
            {pinnedQuests.length === 0 ? (
              <li className="text-[#555] text-xs p-2">
                {pinnedDragOver ? (
                  <span className="text-[#facc15]/60">
                    {t(lang, "drop_here")}
                  </span>
                ) : (
                  t(lang, "calendar_pinned_empty")
                )}
              </li>
            ) : (
              pinnedQuests.map((quest) => {
                const skill = skillById[quest.skill];
                const color = skill?.color ?? "#666";
                const effective = getEffectiveQuest(
                  quest,
                  overrides[quest.id] ?? {},
                );
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
                        setPinnedDragOver(false);
                      }}
                      onClick={() => onQuestSelect(quest.id)}
                      className={`block w-full text-left p-2 rounded border cursor-grab active:cursor-grabbing transition-colors ${
                        draggedQuestId === quest.id
                          ? "opacity-50"
                          : "hover:border-[#333] hover:bg-[#111]"
                      }`}
                      style={{ borderColor: color }}
                    >
                      <p className="text-xs font-medium text-white truncate">
                        {quest.name}
                      </p>
                      {effective.plannedDateTime != null && (
                        <p className="text-[10px] text-[#666] mt-0.5">
                          {new Date(effective.plannedDateTime).toLocaleString(
                            "pl-PL",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* ── Col 2: Narrow daily view (always today) ── */}
        <aside className="w-52 shrink-0 border border-[#1f1f1f] bg-[#0a0a0a] rounded flex flex-col overflow-hidden">
          <div className="shrink-0 px-3 h-[60px] border-b border-[#1f1f1f] flex items-center gap-2">
            <Calendar size={12} className="text-[#facc15]" />
            <div>
              <p className="text-xs text-white font-mono mt-0.5">
                {today
                  .toLocaleDateString("pl-PL", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })
                  .replace(/^\p{L}/u, (c) => c.toUpperCase())}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <NarrowDayView
              date={today}
              quests={questsWithPlanned}
              skillById={skillById}
              onDropSlot={handleDropOnSlot}
              onQuestClick={onQuestSelect}
              dropTarget={dropTarget}
              setDropTarget={setDropTargetSlot}
              draggedQuestId={draggedQuestId}
              onChipDragStart={setDraggedQuestId}
              onChipDragEnd={handleChipDragEnd}
            />
          </div>
        </aside>

        {/* ── Col 3: Wide multi-day calendar ── */}
        <main className="flex-1 min-w-0 border border-[#1f1f1f] bg-[#0a0a0a] rounded overflow-auto custom-scrollbar">
          {span <= 14 ? (
            <MultiDayHourlyView
              startDate={rangeStart}
              days={span}
              quests={questsWithPlanned}
              skillById={skillById}
              onDropSlot={handleDropOnSlot}
              onQuestClick={onQuestSelect}
              dropTarget={dropTarget}
              setDropTarget={setDropTargetSlot}
              today={today}
              draggedQuestId={draggedQuestId}
              onChipDragStart={setDraggedQuestId}
              onChipDragEnd={handleChipDragEnd}
            />
          ) : (
            <MultiDayGridView
              startDate={rangeStart}
              days={span}
              quests={questsWithPlanned}
              skillById={skillById}
              onQuestClick={onQuestSelect}
              today={today}
            />
          )}
        </main>
      </div>
    </div>
  );
}

type DropTarget = { date: Date; hour?: number } | null;

// ─────────────────────────────────────────────────────────────────────────────
// Narrow Day View (column 2 — always today)
// ─────────────────────────────────────────────────────────────────────────────

type NarrowDayViewProps = {
  date: Date;
  quests: Quest[];
  skillById: Record<string, { color: string }>;
  onDropSlot: (date: Date, hour: number) => void;
  onQuestClick: (id: string) => void;
  dropTarget: DropTarget;
  setDropTarget: (date: Date | null, hour?: number) => void;
  draggedQuestId: string | null;
  onChipDragStart: (id: string) => void;
  onChipDragEnd: () => void;
};

function NarrowDayView({
  date,
  quests,
  skillById,
  onDropSlot,
  onQuestClick,
  dropTarget,
  setDropTarget,
  draggedQuestId,
  onChipDragStart,
  onChipDragEnd,
}: NarrowDayViewProps) {
  const dayStart = getStartOfDay(date);
  const now = useNow();
  const isToday = sameDay(date, now);
  const sevenAmRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sevenAmRef.current?.scrollIntoView({ block: "start" });
  }, []);
  const questsByHour = useMemo(() => {
    const map: Record<number, Quest[]> = {};
    for (const q of quests) {
      const d = new Date(q.plannedDateTime!);
      if (
        d.getTime() >= dayStart.getTime() &&
        d.getTime() < addDays(dayStart, 1).getTime()
      ) {
        const h = d.getHours();
        if (!map[h]) map[h] = [];
        map[h].push(q);
      }
    }
    return map;
  }, [quests, dayStart]);

  return (
    <div className="p-2">
      <div className="flex">
        {/* Hour labels */}
        <div className="w-8 shrink-0 text-[9px] text-[#555] font-mono">
          {HOURS.map((h) => (
            <div key={h} className="h-10 flex items-start pt-0.5">
              {h.toString().padStart(2, "0")}
            </div>
          ))}
        </div>
        {/* Slots */}
        <div className="flex-1 border-l border-[#1f1f1f]">
          {HOURS.map((hour) => {
            const isTarget =
              dropTarget?.hour !== undefined &&
              sameDay(dropTarget.date, dayStart) &&
              dropTarget.hour === hour;
            return (
              <div
                key={hour}
                ref={hour === 7 ? sevenAmRef : undefined}
                className={`h-10 border-b border-[#1f1f1f] flex flex-col transition-colors relative ${
                  isTarget ? "bg-[#facc15]/10" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDropTarget(new Date(dayStart), hour);
                }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  onDropSlot(new Date(dayStart), hour);
                }}
              >
                {isToday && now.getHours() === hour && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${(now.getMinutes() / 60) * 100}%` }}
                  >
                    <div className="relative flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#facc15] shrink-0 -ml-[3px]" />
                      <div className="flex-1 h-px bg-[#facc15] opacity-80" />
                    </div>
                  </div>
                )}
                <div className="flex-1 px-1 flex flex-col gap-px overflow-hidden">
                  {(questsByHour[hour] ?? []).map((q) => (
                    <CalendarQuestChip
                      key={q.id}
                      quest={q}
                      color={skillById[q.skill]?.color ?? "#666"}
                      onClick={() => onQuestClick(q.id)}
                      compact
                      isDragging={draggedQuestId === q.id}
                      onDragStart={() => onChipDragStart(q.id)}
                      onDragEnd={onChipDragEnd}
                    />
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

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Day Hourly View (column 3, span = 7 or 14)
// ─────────────────────────────────────────────────────────────────────────────

type MultiDayHourlyViewProps = {
  startDate: Date;
  days: number;
  quests: Quest[];
  skillById: Record<string, { color: string }>;
  onDropSlot: (date: Date, hour: number) => void;
  onQuestClick: (id: string) => void;
  dropTarget: DropTarget;
  setDropTarget: (date: Date | null, hour?: number) => void;
  today: Date;
  draggedQuestId: string | null;
  onChipDragStart: (id: string) => void;
  onChipDragEnd: () => void;
};

function MultiDayHourlyView({
  startDate,
  days,
  quests,
  skillById,
  onDropSlot,
  onQuestClick,
  dropTarget,
  setDropTarget,
  today,
  draggedQuestId,
  onChipDragStart,
  onChipDragEnd,
}: MultiDayHourlyViewProps) {
  const sevenAmRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sevenAmRef.current?.scrollIntoView({ block: "start" });
  }, [days]);

  const now = useNow();

  const dayList = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(startDate, i)),
    [startDate, days],
  );

  const questsByDayHour = useMemo(() => {
    const map: Record<string, Quest[]> = {};
    for (const q of quests) {
      const d = new Date(q.plannedDateTime!);
      const key = `${getStartOfDay(d).getTime()}-${d.getHours()}`;
      if (!map[key]) map[key] = [];
      map[key].push(q);
    }
    return map;
  }, [quests]);

  const rowH = days <= 7 ? "h-10" : "h-8";
  const hourColW = days <= 7 ? "w-10" : "w-7";

  return (
    <div className={`pb-3 ${days > 7 ? "min-w-[700px]" : "min-w-[440px]"}`}>
      {/* Day headers — sticky inside the scrollable main */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] px-3">
        <div className="flex border-b border-[#1f1f1f] h-[60px]">
          <div className={`${hourColW} shrink-0`} />
          {dayList.map((d) => {
            const isToday = sameDay(d, today);
            return (
              <div
                key={d.getTime()}
                className="flex-1 min-w-0 text-center py-2 border-l border-[#1f1f1f]"
              >
                <span
                  className={`text-[9px] uppercase tracking-widest block ${
                    isToday ? "text-[#facc15]" : "text-[#555]"
                  }`}
                >
                  {WEEKDAY_SHORT[d.getDay()]}
                </span>
                <span
                  className={`font-mono font-bold block leading-tight ${
                    days <= 7 ? "text-sm" : "text-xs"
                  } ${isToday ? "text-[#facc15]" : "text-[#ccc]"}`}
                >
                  {d.getDate()}
                </span>
                {days <= 7 && (
                  <span className="text-[9px] text-[#444] block">
                    {d.toLocaleDateString("pl-PL", { month: "short" })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly grid */}
      <div className="flex px-3">
        <div
          className={`${hourColW} shrink-0 text-[9px] text-[#444] font-mono`}
        >
          {HOURS.map((h) => (
            <div
              key={h}
              className={`${rowH} flex items-start pt-0.5 justify-end pr-1`}
            >
              {h.toString().padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className="flex-1 flex border-l border-[#1f1f1f]">
          {dayList.map((day, dayIndex) => {
            const isToday = sameDay(day, today);
            return (
              <div
                key={day.getTime()}
                className={`flex-1 min-w-0 flex flex-col border-l first:border-l-0 border-[#1f1f1f] ${
                  isToday ? "bg-[#facc15]/[0.03]" : ""
                }`}
              >
                {HOURS.map((hour) => {
                  const dayStart = getStartOfDay(day);
                  const key = `${dayStart.getTime()}-${hour}`;
                  const slotQuests = questsByDayHour[key] ?? [];
                  const isTarget =
                    dropTarget?.hour !== undefined &&
                    sameDay(dropTarget.date, day) &&
                    dropTarget.hour === hour;
                  return (
                    <div
                      key={hour}
                      ref={
                        dayIndex === 0 && hour === 7 ? sevenAmRef : undefined
                      }
                      className={`${rowH} border-b border-[#1f1f1f] flex flex-col transition-colors relative ${
                        isTarget ? "bg-[#facc15]/10" : ""
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDropTarget(new Date(day), hour);
                      }}
                      onDragLeave={() => setDropTarget(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        onDropSlot(new Date(day), hour);
                      }}
                    >
                      {isToday && now.getHours() === hour && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{ top: `${(now.getMinutes() / 60) * 100}%` }}
                        >
                          <div className="relative flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#facc15] shrink-0 -ml-[3px]" />
                            <div className="flex-1 h-px bg-[#facc15] opacity-80" />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 p-0.5 flex flex-col gap-px overflow-hidden">
                        {slotQuests.map((q) => (
                          <CalendarQuestChip
                            key={q.id}
                            quest={q}
                            color={skillById[q.skill]?.color ?? "#666"}
                            onClick={() => onQuestClick(q.id)}
                            compact
                            isDragging={draggedQuestId === q.id}
                            onDragStart={() => onChipDragStart(q.id)}
                            onDragEnd={onChipDragEnd}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Day Grid View (column 3, span = 30)
// ─────────────────────────────────────────────────────────────────────────────

type MultiDayGridViewProps = {
  startDate: Date;
  days: number;
  quests: Quest[];
  skillById: Record<string, { color: string }>;
  onQuestClick: (id: string) => void;
  today: Date;
};

function MultiDayGridView({
  startDate,
  days,
  quests,
  skillById,
  onQuestClick,
  today,
}: MultiDayGridViewProps) {
  const dayList = useMemo(
    () => Array.from({ length: days }, (_, i) => addDays(startDate, i)),
    [startDate, days],
  );

  const questsByDay = useMemo(() => {
    const map: Record<number, Quest[]> = {};
    for (const q of quests) {
      const key = getStartOfDay(new Date(q.plannedDateTime!)).getTime();
      if (!map[key]) map[key] = [];
      map[key].push(q);
    }
    return map;
  }, [quests]);

  const cols = 7;
  const firstDow = (dayList[0].getDay() + 6) % 7; // Monday = 0
  const paddedCells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...dayList,
  ];
  const remainder = paddedCells.length % cols;
  if (remainder !== 0) {
    for (let i = 0; i < cols - remainder; i++) paddedCells.push(null);
  }

  const weekdayLabels = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  return (
    <div className="p-3">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b border-[#1f1f1f] mb-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[10px] text-[#555] uppercase tracking-widest"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-[#1f1f1f] border border-[#1f1f1f] rounded overflow-hidden">
        {paddedCells.map((d, i) => {
          if (!d) {
            return (
              <div key={`empty-${i}`} className="min-h-[90px] bg-[#050505]" />
            );
          }
          const key = d.getTime();
          const dayQuests = questsByDay[key] ?? [];
          const isToday = sameDay(d, today);
          return (
            <div
              key={key}
              className={`min-h-[90px] p-1.5 flex flex-col transition-colors ${
                isToday ? "bg-[#facc15]/[0.06]" : "bg-[#0a0a0a]"
              }`}
            >
              <span
                className={`text-xs font-mono font-bold leading-none mb-1 ${
                  isToday ? "text-[#facc15]" : "text-[#444]"
                }`}
              >
                {d.getDate()}
              </span>
              <div className="flex-1 space-y-px overflow-y-auto custom-scrollbar">
                {dayQuests.map((q) => (
                  <CalendarQuestChip
                    key={q.id}
                    quest={q}
                    color={skillById[q.skill]?.color ?? "#666"}
                    onClick={() => onQuestClick(q.id)}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quest chip (shared)
// ─────────────────────────────────────────────────────────────────────────────

function CalendarQuestChip({
  quest,
  color,
  onClick,
  compact,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  quest: Quest;
  color: string;
  onClick: () => void;
  compact?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}) {
  const start = quest.plannedDateTime ? new Date(quest.plannedDateTime) : null;
  const end =
    start && quest.duration
      ? new Date(start.getTime() + quest.duration * 1000)
      : null;
  const timeStr =
    start && end
      ? `${start.getHours().toString().padStart(2, "0")}:${start
          .getMinutes()
          .toString()
          .padStart(2, "0")} – ${end
          .getHours()
          .toString()
          .padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`
      : null;

  return (
    <button
      type="button"
      draggable={!!onDragStart}
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", quest.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`w-full text-left rounded border truncate transition-opacity hover:opacity-90 ${
        onDragStart ? "cursor-grab active:cursor-grabbing" : ""
      } ${
        compact ? "px-1 py-px text-[10px]" : "px-2 py-1 text-xs"
      } ${isDragging ? "opacity-40" : ""}`}
      style={{ borderColor: color, color }}
      title={quest.name + (timeStr ? ` (${timeStr})` : "")}
    >
      <span className="block truncate text-white/90">{quest.name}</span>
      {!compact && timeStr && (
        <span className="block text-[10px] opacity-70">{timeStr}</span>
      )}
    </button>
  );
}
