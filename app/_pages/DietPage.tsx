"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Utensils,
  Apple,
  Moon,
  Plus,
  Trash2,
  Search,
  X,
} from "lucide-react";
import {
  MOCK_DIET_WEEK,
  MOCK_FOOD_DB,
  MOCK_DIET_GOALS,
  MOCK_NAMED_MEALS,
  type MealSlotId,
  type FoodCategory,
  type DietDay,
  type NamedMeal,
  type MealSlot,
} from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

const FOOD_MAP = Object.fromEntries(MOCK_FOOD_DB.map((f) => [f.id, f]));
const MEAL_MAP = Object.fromEntries(MOCK_NAMED_MEALS.map((m) => [m.id, m]));

function computeMealMacros(ingredients: { foodId: string; grams: number }[]) {
  return ingredients.reduce(
    (acc, ing) => {
      const food = FOOD_MAP[ing.foodId];
      if (!food) return acc;
      const r = ing.grams / 100;
      return {
        kcal: acc.kcal + food.kcalPer100g * r,
        protein: acc.protein + food.proteinPer100g * r,
        carbs: acc.carbs + food.carbsPer100g * r,
        fat: acc.fat + food.fatPer100g * r,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function computeDayTotals(day: DietDay) {
  const all = day.meals.flatMap((m) => MEAL_MAP[m.mealId]?.ingredients ?? []);
  return computeMealMacros(all);
}

function getHoursBetween(t1: string, t2: string): string[] {
  const h1 = parseInt(t1.split(":")[0], 10);
  const h2 = parseInt(t2.split(":")[0], 10);
  const out: string[] = [];
  for (let h = h1 + 1; h < h2; h++)
    out.push(`${String(h).padStart(2, "0")}:00`);
  return out;
}

const WEEK_DATES = MOCK_DIET_WEEK.map((d) => d.date);

const DAY_LABELS: Record<string, string> = {
  "0": "Nd",
  "1": "Pn",
  "2": "Wt",
  "3": "Śr",
  "4": "Cz",
  "5": "Pt",
  "6": "Sb",
};
const DAY_LABELS_EN: Record<string, string> = {
  "0": "Su",
  "1": "Mo",
  "2": "Tu",
  "3": "We",
  "4": "Th",
  "5": "Fr",
  "6": "Sa",
};
function shortDay(dateStr: string, lang: string) {
  const idx = String(new Date(dateStr + "T12:00:00").getDay());
  return lang === "pl" ? DAY_LABELS[idx] : DAY_LABELS_EN[idx];
}
function dayNum(dateStr: string) {
  return new Date(dateStr + "T12:00:00").getDate();
}

const SLOT_ICONS: Record<MealSlotId, React.ReactNode> = {
  breakfast: <Coffee size={13} />,
  lunch: <Utensils size={13} />,
  snack: <Apple size={13} />,
  dinner: <Moon size={13} />,
};
const SLOT_COLORS: Record<MealSlotId, string> = {
  breakfast: "#f59e0b",
  lunch: "#22c55e",
  snack: "#38bdf8",
  dinner: "#a855f7",
};
const CAT_COLORS: Record<FoodCategory, string> = {
  protein: "#ec4899",
  carbs: "#f59e0b",
  veggies: "#22c55e",
  dairy: "#38bdf8",
  fats: "#a855f7",
  other: "#888",
};

// ─── GhostCard ────────────────────────────────────────────────────────────────

function GhostCard({
  meal,
  slotColor,
}: {
  meal: NamedMeal;
  slotColor: string;
}) {
  return (
    <div
      className="border border-[#141414] bg-[#080808] rounded-sm p-3 flex flex-col items-center justify-center gap-2 h-full min-h-[130px]"
      style={{ borderLeftWidth: 2, borderLeftColor: slotColor + "30" }}
    >
      <span className="text-2xl">{meal.emoji}</span>
      <p className="text-[8px] text-[#2a2a2a] text-center font-mono leading-tight line-clamp-3 uppercase tracking-widest px-1">
        {meal.name}
      </p>
    </div>
  );
}

// ─── MainMealCard ─────────────────────────────────────────────────────────────

function MainMealCard({
  slot,
  time,
  meal,
  slotColor,
}: {
  slot: MealSlotId;
  time: string;
  meal: NamedMeal;
  slotColor: string;
}) {
  const macros = useMemo(() => computeMealMacros(meal.ingredients), [meal]);
  return (
    <div
      className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-sm overflow-hidden hover:border-[#2a2a2a] transition-colors"
      style={{ borderLeftWidth: 3, borderLeftColor: slotColor }}
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <span style={{ color: slotColor }}>{SLOT_ICONS[slot]}</span>
        <span
          className="text-[9px] uppercase tracking-[0.15em] font-mono"
          style={{ color: slotColor }}
        >
          {slot}
        </span>
        <span className="text-[9px] font-mono text-[#2a2a2a]">{time}</span>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-[10px] font-mono text-[#facc15] tabular-nums">
            {Math.round(macros.kcal)} kcal
          </span>
          <span className="text-[10px] font-mono text-[#ec4899] tabular-nums">
            {Math.round(macros.protein)}g P
          </span>
        </div>
      </div>
      <div className="flex items-start gap-3 px-4 pb-2">
        <div
          className="text-2xl leading-none shrink-0 mt-0.5 w-9 h-9 flex items-center justify-center rounded border border-[#1a1a1a]"
          style={{ background: slotColor + "0d" }}
        >
          {meal.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#e0e0e0] leading-snug">
            {meal.name}
          </p>
          <p className="text-[10px] text-[#444] leading-relaxed line-clamp-1 mt-0.5">
            {meal.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 px-4 pb-3">
        {meal.ingredients.slice(0, 5).map((ing) => {
          const food = FOOD_MAP[ing.foodId];
          if (!food) return null;
          const c = CAT_COLORS[food.category as FoodCategory] ?? "#888";
          return (
            <span
              key={ing.foodId}
              className="text-[8px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-mono"
              style={{ color: c, borderColor: c + "44", background: c + "11" }}
            >
              {food.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── MealSearchBar ────────────────────────────────────────────────────────────

function MealSearchBar({
  slot,
  currentMealId,
  onSelect,
}: {
  slot: MealSlotId;
  currentMealId: string;
  onSelect: (id: string) => void;
}) {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () =>
      MOCK_NAMED_MEALS.filter(
        (m) =>
          m.suitableFor.includes(slot) &&
          m.id !== currentMealId &&
          (query.trim() === "" ||
            m.name.toLowerCase().includes(query.toLowerCase())),
      ).slice(0, 5),
    [slot, currentMealId, query],
  );

  return (
    <div className="relative mt-1.5">
      <div className="flex items-center gap-2 bg-[#080808] border border-[#141414] rounded-sm px-3 py-1.5 focus-within:border-[#1f1f1f] transition-colors">
        <Search size={10} className="text-[#222] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t(lang, "diet_swap_search")}
          className="flex-1 bg-transparent text-xs text-[#555] placeholder-[#1e1e1e] focus:outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-[#333] hover:text-[#555] transition-colors"
          >
            <X size={10} />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 bg-[#0c0c0c] border border-[#1f1f1f] rounded-sm overflow-hidden mt-0.5 shadow-2xl">
          {results.map((meal) => {
            const m = computeMealMacros(meal.ingredients);
            return (
              <button
                key={meal.id}
                onMouseDown={() => {
                  onSelect(meal.id);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#111] transition-colors text-left border-b border-[#0d0d0d] last:border-0"
              >
                <span className="text-base shrink-0">{meal.emoji}</span>
                <span className="text-xs text-[#aaa] flex-1 truncate">
                  {meal.name}
                </span>
                <span className="text-[9px] font-mono text-[#facc15] tabular-nums shrink-0">
                  {Math.round(m.kcal)} kcal
                </span>
                <span className="text-[9px] font-mono text-[#ec4899] tabular-nums shrink-0 ml-1">
                  {Math.round(m.protein)}g P
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MealCarousel ─────────────────────────────────────────────────────────────

function MealCarousel({
  slot,
  mealId,
  time,
  dateKey,
  onOpen,
  onMealChange,
}: {
  slot: MealSlotId;
  mealId: string;
  time: string;
  dateKey: string;
  onOpen: (meal: NamedMeal) => void;
  onMealChange: (newMealId: string) => void;
}) {
  const slotColor = SLOT_COLORS[slot];
  const alts = useMemo(
    () => MOCK_NAMED_MEALS.filter((m) => m.suitableFor.includes(slot)),
    [slot],
  );

  const [idx, setIdx] = useState(() => {
    const found = alts.findIndex((m) => m.id === mealId);
    return found >= 0 ? found : 0;
  });

  // Sync when mealId or date changes
  useEffect(() => {
    const found = alts.findIndex((m) => m.id === mealId);
    if (found >= 0) setIdx(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealId, dateKey]);

  function go(delta: number) {
    const newIdx = (idx + delta + alts.length) % alts.length;
    setIdx(newIdx);
    onMealChange(alts[newIdx].id);
  }

  const current = alts[idx];
  const prev = alts[(idx - 1 + alts.length) % alts.length];
  const next = alts[(idx + 1) % alts.length];

  if (!current) return null;

  return (
    <div>
      <div className="flex items-stretch gap-1.5">
        {/* Prev ghost */}
        <button
          onClick={() => go(-1)}
          className="w-[108px] shrink-0 opacity-25 hover:opacity-45 transition-opacity"
          aria-label="previous meal"
        >
          <GhostCard meal={prev} slotColor={slotColor} />
        </button>

        {/* Main card */}
        <button
          onClick={() => onOpen(current)}
          className="flex-1 min-w-0 text-left"
        >
          <MainMealCard
            slot={slot}
            time={time}
            meal={current}
            slotColor={slotColor}
          />
        </button>

        {/* Next ghost */}
        <button
          onClick={() => go(1)}
          className="w-[108px] shrink-0 opacity-25 hover:opacity-45 transition-opacity"
          aria-label="next meal"
        >
          <GhostCard meal={next} slotColor={slotColor} />
        </button>
      </div>

      {/* Search bar */}
      <MealSearchBar
        slot={slot}
        currentMealId={current.id}
        onSelect={(newId) => {
          const newIdx = alts.findIndex((m) => m.id === newId);
          if (newIdx >= 0) {
            setIdx(newIdx);
            onMealChange(newId);
          }
        }}
      />
    </div>
  );
}

// ─── AddMealModal ─────────────────────────────────────────────────────────────

function AddMealModal({
  onAdd,
  onClose,
}: {
  onAdd: (slot: MealSlotId, time: string, mealId: string) => void;
  onClose: () => void;
}) {
  const { lang } = useLang();
  const [slot, setSlot] = useState<MealSlotId>("snack");
  const [time, setTime] = useState("10:00");

  const firstMeal = useMemo(
    () => MOCK_NAMED_MEALS.find((m) => m.suitableFor.includes(slot)),
    [slot],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.16 }}
        className="relative z-10 w-72 bg-[#0a0a0a] border border-[#222] rounded-sm p-5 space-y-4"
      >
        <p className="text-[10px] uppercase tracking-widest text-[#facc15] font-mono">
          {t(lang, "diet_add_meal")}
        </p>

        {/* Slot selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {(["breakfast", "lunch", "snack", "dinner"] as MealSlotId[]).map(
            (s) => {
              const labelKey = `diet_slot_${s}` as Parameters<typeof t>[1];
              return (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={cn(
                    "py-2 text-[9px] uppercase tracking-widest font-mono border rounded-sm transition-colors flex items-center justify-center gap-1.5",
                    slot === s
                      ? "border-[#facc15]/40 text-[#facc15] bg-[#facc15]/5"
                      : "border-[#1a1a1a] text-[#444] hover:text-[#666] hover:border-[#222]",
                  )}
                >
                  <span
                    style={{ color: slot === s ? SLOT_COLORS[s] : undefined }}
                  >
                    {SLOT_ICONS[s]}
                  </span>
                  {t(lang, labelKey)}
                </button>
              );
            },
          )}
        </div>

        {/* Time */}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm px-3 py-2 text-sm text-[#ccc] font-mono focus:outline-none focus:border-[#333]"
        />

        {/* Preview */}
        {firstMeal && (
          <div className="flex items-center gap-2 p-2 bg-[#0d0d0d] border border-[#1a1a1a] rounded-sm">
            <span className="text-xl">{firstMeal.emoji}</span>
            <div>
              <p className="text-xs text-[#888]">{firstMeal.name}</p>
              <p className="text-[8px] text-[#333] font-mono uppercase tracking-widest mt-0.5">
                {t(lang, "diet_add_meal_auto")}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              if (firstMeal) {
                onAdd(slot, time, firstMeal.id);
                onClose();
              }
            }}
            className="flex-1 py-2 bg-[#facc15]/10 border border-[#facc15]/25 text-[#facc15] text-[9px] uppercase tracking-widest font-mono rounded-sm hover:bg-[#facc15]/15 transition-colors"
          >
            {t(lang, "diet_add_meal")}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-[#1a1a1a] text-[#444] text-[9px] uppercase tracking-widest font-mono rounded-sm hover:text-[#666] transition-colors"
          >
            {t(lang, "diet_swap_cancel")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── DietPage ─────────────────────────────────────────────────────────────────

type Props = {
  onMealSelect?: (info: {
    meal: NamedMeal;
    slot: MealSlotId;
    time: string;
  }) => void;
};

export default function DietPage({ onMealSelect }: Props) {
  const { lang } = useLang();
  const TODAY = "2026-03-05";
  const [activeDate, setActiveDate] = useState(TODAY);
  const [weekState, setWeekState] = useState<DietDay[]>(MOCK_DIET_WEEK);
  const [showAddModal, setShowAddModal] = useState(false);
  // TODO: [DATA] persist weekState

  const goals = MOCK_DIET_GOALS;

  const activeDayData = useMemo(
    () => weekState.find((d) => d.date === activeDate) ?? weekState[0],
    [activeDate, weekState],
  );

  // Index meals with their original position, then sort by time for display
  const sortedMeals = useMemo(() => {
    return activeDayData.meals
      .map((m, originalIdx) => ({ ...m, originalIdx }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [activeDayData]);

  const dayTotals = useMemo(() => {
    const all = sortedMeals.flatMap(
      (m) => MEAL_MAP[m.mealId]?.ingredients ?? [],
    );
    return computeMealMacros(all);
  }, [sortedMeals]);

  const dayKcalMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const day of weekState) map[day.date] = computeDayTotals(day).kcal;
    return map;
  }, [weekState]);

  // Build timeline items: intersperse intermediate hour markers between meals
  const timelineItems = useMemo(() => {
    type Item =
      | { type: "meal"; meal: (typeof sortedMeals)[0] }
      | { type: "hour"; time: string };
    const items: Item[] = [];
    for (let i = 0; i < sortedMeals.length; i++) {
      if (i > 0) {
        const hours = getHoursBetween(
          sortedMeals[i - 1].time,
          sortedMeals[i].time,
        );
        // show at most 4 intermediate ticks, spaced evenly
        const step = hours.length <= 4 ? 1 : Math.ceil(hours.length / 4);
        for (let j = 0; j < hours.length; j += step) {
          items.push({ type: "hour", time: hours[j] });
        }
      }
      items.push({ type: "meal", meal: sortedMeals[i] });
    }
    return items;
  }, [sortedMeals]);

  function handleMealChange(originalIdx: number, newMealId: string) {
    setWeekState((prev) =>
      prev.map((day) =>
        day.date !== activeDate
          ? day
          : {
              ...day,
              meals: day.meals.map((m, i) =>
                i === originalIdx ? { ...m, mealId: newMealId } : m,
              ),
            },
      ),
    );
    // TODO: [DATA] persist change
  }

  function handleRemoveMeal(originalIdx: number) {
    setWeekState((prev) =>
      prev.map((day) =>
        day.date !== activeDate
          ? day
          : { ...day, meals: day.meals.filter((_, i) => i !== originalIdx) },
      ),
    );
    // TODO: [DATA] persist removal
  }

  function handleAddMeal(slot: MealSlotId, time: string, mealId: string) {
    const newSlot: MealSlot = { slot, time, mealId };
    setWeekState((prev) =>
      prev.map((day) =>
        day.date !== activeDate
          ? day
          : {
              ...day,
              meals: [...day.meals, newSlot].sort((a, b) =>
                a.time.localeCompare(b.time),
              ),
            },
      ),
    );
    // TODO: [DATA] persist addition
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[860px] mx-auto py-5 space-y-5">
          {/* ── Day selector ── */}
          <div className="flex justify-center">
            <div className="flex gap-1 border border-[#1f1f1f] bg-[#0a0a0a] p-1 rounded-sm">
              {WEEK_DATES.map((date) => {
                const isActive = date === activeDate;
                const isToday = date === TODAY;
                const pct = Math.min(
                  ((dayKcalMap[date] ?? 0) / goals.kcal) * 100,
                  100,
                );
                return (
                  <button
                    key={date}
                    onClick={() => setActiveDate(date)}
                    className={cn(
                      "flex flex-col items-center px-3 py-1.5 rounded-sm transition-colors min-w-[48px]",
                      isActive
                        ? "bg-[#facc15]/10 border border-[#facc15]/30"
                        : "hover:bg-[#0d0d0d] border border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[9px] uppercase tracking-widest font-mono",
                        isActive ? "text-[#facc15]" : "text-[#555]",
                      )}
                    >
                      {shortDay(date, lang)}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-bold font-mono mt-0.5",
                        isActive
                          ? "text-[#facc15]"
                          : isToday
                            ? "text-[#e0e0e0]"
                            : "text-[#444]",
                      )}
                    >
                      {dayNum(date)}
                    </span>
                    <div className="w-full h-0.5 bg-[#1a1a1a] rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: isActive ? "#facc15" : "#333",
                        }}
                      />
                    </div>
                    {isToday && !isActive && (
                      <span className="w-1 h-1 rounded-full bg-[#facc15]/60 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Daily summary ── */}
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono flex-wrap">
            <span className="text-[#facc15]">
              {Math.round(dayTotals.kcal)} kcal
            </span>
            <span className="text-[#1c1c1c]">·</span>
            <span className="text-[#ec4899]">
              {Math.round(dayTotals.protein)}g{" "}
              {t(lang, "diet_protein").toLowerCase()}
            </span>
            <span className="text-[#1c1c1c]">·</span>
            <span className="text-[#f59e0b]">
              {Math.round(dayTotals.carbs)}g{" "}
              {t(lang, "diet_carbs").toLowerCase()}
            </span>
            <span className="text-[#1c1c1c]">·</span>
            <span className="text-[#2a2a2a]">
              / {goals.kcal} kcal {t(lang, "diet_target").toLowerCase()}
            </span>
          </div>

          {/* ── Timeline + Meals ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDate}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="relative"
            >
              {/* Vertical timeline line */}
              <div className="absolute left-[66px] top-0 bottom-0 w-px bg-[#0f0f0f]" />

              {/* Empty state */}
              {sortedMeals.length === 0 && (
                <div className="flex items-center justify-center py-16 text-[#2a2a2a] text-xs font-mono uppercase tracking-widest">
                  —
                </div>
              )}

              {timelineItems.map((item, i) => {
                if (item.type === "hour") {
                  return (
                    <div
                      key={`h-${item.time}-${i}`}
                      className="flex items-center h-7"
                    >
                      <div className="w-[66px] text-right pr-3 shrink-0">
                        <span className="text-[7px] font-mono text-[#181818]">
                          {item.time}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-[#141414] relative z-10" />
                    </div>
                  );
                }

                const { meal: mealSlot } = item;
                const meal = MEAL_MAP[mealSlot.mealId];
                if (!meal) return null;
                const slotColor = SLOT_COLORS[mealSlot.slot];

                return (
                  <div
                    key={`meal-${activeDate}-${mealSlot.originalIdx}`}
                    className="flex items-start mb-3"
                  >
                    {/* Timeline: time + dot */}
                    <div className="w-[66px] shrink-0 flex items-center justify-end gap-2 pt-[18px]">
                      <span className="text-[9px] font-mono text-[#444]">
                        {mealSlot.time}
                      </span>
                      <div
                        className="w-2.5 h-2.5 rounded-full border-2 bg-[#050505] relative z-10 shrink-0"
                        style={{ borderColor: slotColor }}
                      />
                    </div>

                    {/* Carousel + search */}
                    <div className="flex-1 pl-4 min-w-0">
                      <MealCarousel
                        slot={mealSlot.slot}
                        mealId={mealSlot.mealId}
                        time={mealSlot.time}
                        dateKey={activeDate}
                        onOpen={(m) =>
                          onMealSelect?.({
                            meal: m,
                            slot: mealSlot.slot,
                            time: mealSlot.time,
                          })
                        }
                        onMealChange={(newId) =>
                          handleMealChange(mealSlot.originalIdx, newId)
                        }
                      />
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemoveMeal(mealSlot.originalIdx)}
                      className="p-2 text-[#1c1c1c] hover:text-[#ef4444] transition-colors shrink-0 mt-3.5"
                      title={t(lang, "diet_remove_meal")}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}

              {/* Add meal button */}
              <div className="flex items-center mt-4 mb-2 pl-[78px]">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono text-[#222] hover:text-[#facc15] border border-[#111] hover:border-[#facc15]/20 px-3 py-1.5 rounded-sm transition-colors"
                >
                  <Plus size={10} />
                  {t(lang, "diet_add_meal")}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddMealModal
            onAdd={handleAddMeal}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
