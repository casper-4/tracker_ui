"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Apple,
  List,
  Gym,
  Search,
  MoreVert,
  NavArrowLeft,
  NavArrowRight,
  FireFlame,
  Heart,
  HeartSolid,
} from "iconoir-react";
import {
  MOCK_DIET_WEEK,
  MOCK_FOOD_DB,
  MOCK_NAMED_MEALS,
  type MealSlotId,
  type DietDay,
  type NamedMeal,
  type MealSlot,
} from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import MealDetailPanel from "@/app/components/MealDetailPanel";

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

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseTimeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 12 * 60;
  return Math.max(0, Math.min(23 * 60 + 59, h * 60 + m));
}

function formatMinutesToTime(totalMinutes: number) {
  const safe = Math.max(0, Math.min(23 * 60 + 59, Math.round(totalMinutes)));
  const h = String(Math.floor(safe / 60)).padStart(2, "0");
  const m = String(safe % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function computeInsertTime(prevTime?: string, nextTime?: string) {
  if (prevTime && nextTime) {
    const prev = parseTimeToMinutes(prevTime);
    const next = parseTimeToMinutes(nextTime);
    if (next <= prev + 1) return formatMinutesToTime(Math.min(prev + 1, 1439));
    return formatMinutesToTime(prev + Math.floor((next - prev) / 2));
  }

  if (nextTime) {
    const next = parseTimeToMinutes(nextTime);
    return formatMinutesToTime(Math.max(0, next - 60));
  }

  if (prevTime) {
    const prev = parseTimeToMinutes(prevTime);
    return formatMinutesToTime(Math.min(1439, prev + 60));
  }

  return "12:00";
}

function normalizeTimeInput(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return "12:00";
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m)) return "12:00";
  return formatMinutesToTime(h * 60 + m);
}

function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function buildWeekDates(anchorDate: string, weekOffset: number) {
  const base = new Date(anchorDate + "T12:00:00");
  const weekStart = startOfWeek(base, 1);
  const shiftedStart = addDays(weekStart, weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => dateKey(addDays(shiftedStart, i)));
}

const SLOT_COLORS: Record<MealSlotId, string> = {
  breakfast: "var(--color-warning)",
  lunch: "var(--color-success)",
  snack: "var(--color-data)",
  dinner: "var(--color-focus)",
};

const GLASS_BG =
  "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)";

type DietDragPayload = {
  source: "catalog" | "plan";
  mealId: string;
  fromIdx?: number;
};

const DIET_DRAG_KEY = "application/diet-meal";

function setDragPayload(dataTransfer: DataTransfer, payload: DietDragPayload) {
  dataTransfer.setData(DIET_DRAG_KEY, JSON.stringify(payload));
  dataTransfer.setData("application/meal-id", payload.mealId);
}

function getDragPayload(dataTransfer: DataTransfer): DietDragPayload | null {
  const raw = dataTransfer.getData(DIET_DRAG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as DietDragPayload;
      if (
        parsed?.mealId &&
        (parsed.source === "catalog" || parsed.source === "plan")
      ) {
        return parsed;
      }
    } catch {
      // Ignore malformed payload and fallback to legacy transfer format.
    }
  }

  const mealId = dataTransfer.getData("application/meal-id");
  if (!mealId) return null;

  return {
    source: "catalog",
    mealId,
  };
}

function setMealDragPreview(dataTransfer: DataTransfer, meal: NamedMeal) {
  const preview = document.createElement("div");
  preview.style.position = "fixed";
  preview.style.left = "-9999px";
  preview.style.top = "-9999px";
  preview.style.padding = "8px 10px";
  preview.style.borderRadius = "10px";
  preview.style.border = "1px solid rgba(255,255,255,0.16)";
  preview.style.background =
    "linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 55%, rgba(0,0,0,0.35) 100%)";
  preview.style.backdropFilter = "blur(20px)";
  preview.style.color = "#fff";
  preview.style.fontFamily =
    "GeistMono, ui-monospace, SFMono-Regular, Menlo, monospace";
  preview.style.fontSize = "12px";
  preview.style.fontWeight = "700";
  preview.style.letterSpacing = "0.04em";
  preview.style.display = "flex";
  preview.style.alignItems = "center";
  preview.style.gap = "8px";
  preview.style.maxWidth = "240px";
  preview.style.pointerEvents = "none";
  preview.style.zIndex = "2147483647";
  preview.innerHTML = `<span style=\"font-size:16px;line-height:1\">${meal.emoji}</span><span style=\"white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;max-width:180px\">${meal.name}</span>`;

  document.body.appendChild(preview);
  dataTransfer.setDragImage(preview, 14, 14);

  requestAnimationFrame(() => {
    if (preview.parentElement) preview.parentElement.removeChild(preview);
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-mono uppercase tracking-[0.14em] leading-none text-[var(--color-fg-subtle)]">
      {children}
    </p>
  );
}

// ─── MealCard (timeline view) ─────────────────────────────────────────────────

function MealCard({
  meal,
  slotColorVar,
  onRemove,
  onClick,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  isDragging,
  isDraggingAny,
  dropLabel,
}: {
  meal: NamedMeal;
  slotColorVar: string;
  onRemove: () => void;
  onClick: () => void;
  isDragOver?: boolean;
  onDragOver?: () => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDraggingAny?: boolean;
  dropLabel: string;
}) {
  const macros = useMemo(() => computeMealMacros(meal.ingredients), [meal]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      draggable
      onDragStartCapture={onDragStart}
      onDragEndCapture={(e) => onDragEnd?.(e)}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border cursor-grab active:cursor-grabbing transition-all group",
        isDragOver
          ? "border-[var(--color-data)] bg-[var(--color-data-subtle)]"
          : isDraggingAny
            ? "border-dashed border-[var(--color-border-default)]"
            : "border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:-translate-y-[2px]",
        isDragging ? "opacity-45 scale-[0.985]" : "opacity-100",
      )}
      style={{
        background: GLASS_BG,
        borderTopColor: "var(--color-border-strong)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-[70px] pointer-events-none"
        style={{ background: slotColorVar }}
      />

      {/* Top shine */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-4 space-y-2.5">
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-[15px] leading-none shrink-0">
            {meal.emoji}
          </span>
          <p className="text-[13px] font-medium text-[var(--color-fg-primary)] truncate leading-[1.25]">
            {meal.name}
          </p>
        </div>

        {/* Description */}
        <p className="text-[10px] text-[var(--color-fg-subtle)] line-clamp-1">
          {meal.description}
        </p>

        {/* Macros */}
        <div className="flex items-center gap-4 text-[10px]">
          <span
            style={{ color: "var(--color-warning)" }}
            className="font-medium inline-flex items-center gap-1"
          >
            {Math.round(macros.kcal)}
            <FireFlame width={11} height={11} strokeWidth={2} />
          </span>
          <span
            style={{ color: "var(--color-danger)" }}
            className="font-medium"
          >
            {Math.round(macros.protein)}g P
          </span>
          <span
            style={{ color: "var(--color-success)" }}
            className="font-medium"
          >
            {Math.round(macros.carbs)}g C
          </span>
          <span style={{ color: "var(--color-data)" }} className="font-medium">
            {Math.round(macros.fat)}g F
          </span>
        </div>
      </div>

      {isDragOver && (
        <div className="absolute inset-0 z-20 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-data)] bg-[var(--color-data-subtle)]/90 flex items-center justify-center pointer-events-none">
          <span
            className="tag-neon text-[8px] px-[10px] py-[5px] rounded-[7px] uppercase tracking-[0.2em] font-bold"
            style={{
              fontFamily: "Orbitron, sans-serif",
              background: "rgba(85,234,212,0.12)",
              color: "var(--color-data)",
            }}
          >
            {dropLabel}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Meal Catalog ─────────────────────────────────────────────────────────────

type SortBy = "name" | "kcal" | "protein";
type FilterBy = "all" | "favorites" | MealSlotId;

const SORT_ICON_BY_OPTION: Record<
  SortBy,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  name: List,
  kcal: Apple,
  protein: Gym,
};

const SORT_ACCENT_BY_OPTION: Record<SortBy, string> = {
  name: "var(--color-data)",
  kcal: "var(--color-warning)",
  protein: "var(--color-danger)",
};

const FILTER_ACCENT_BY_OPTION: Record<FilterBy, string> = {
  all: "var(--color-fg-secondary)",
  favorites: "var(--color-danger)",
  breakfast: "var(--color-warning)",
  lunch: "var(--color-success)",
  snack: "var(--color-data)",
  dinner: "var(--color-focus)",
};

function MealCatalog({
  meals,
  favoriteMealIds,
  onToggleFavorite,
  onMealClick,
  onMealDragStart,
  onMealDragEnd,
  lang,
}: {
  meals: NamedMeal[];
  favoriteMealIds: Set<string>;
  onToggleFavorite: (mealId: string) => void;
  onMealClick: (meal: NamedMeal) => void;
  onMealDragStart: (e: React.DragEvent, meal: NamedMeal) => void;
  onMealDragEnd: () => void;
  lang: "pl" | "en";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSortMenu && !showFilterMenu) return;

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (sortMenuRef.current && !sortMenuRef.current.contains(target)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(target)) {
        setShowFilterMenu(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showSortMenu, showFilterMenu]);

  const filteredAndSorted = useMemo(() => {
    let result = meals;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.name.toLowerCase().includes(q));
    }

    if (filterBy === "favorites") {
      result = result.filter((m) => favoriteMealIds.has(m.id));
    } else if (filterBy !== "all") {
      result = result.filter((m) => m.suitableFor.includes(filterBy));
    }

    result = [...result].sort((a, b) => {
      const macroA = computeMealMacros(a.ingredients);
      const macroB = computeMealMacros(b.ingredients);
      switch (sortBy) {
        case "kcal":
          return macroB.kcal - macroA.kcal;
        case "protein":
          return macroB.protein - macroA.protein;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [favoriteMealIds, filterBy, meals, searchQuery, sortBy]);

  const filterOptions: Array<{ value: FilterBy; label: string }> = [
    { value: "all", label: t(lang, "diet_filter_all") },
    { value: "favorites", label: t(lang, "diet_filter_favorites") },
    { value: "breakfast", label: t(lang, "diet_slot_breakfast") },
    { value: "lunch", label: t(lang, "diet_slot_lunch") },
    { value: "snack", label: t(lang, "diet_slot_snack") },
    { value: "dinner", label: t(lang, "diet_slot_dinner") },
  ];

  return (
    <div
      className="h-full flex flex-col rounded-[var(--radius-xl)] border border-[var(--color-border-default)] overflow-hidden"
      style={{
        background: GLASS_BG,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Header */}
      <div className="border-b border-[var(--color-border-default)] p-4 space-y-3 flex-shrink-0">
        <SectionLabel>{t(lang, "diet_all_meals")}</SectionLabel>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-subtle)] pointer-events-none">
            <Search width={14} height={14} strokeWidth={1.8} />
          </div>
          <input
            type="text"
            placeholder={t(lang, "diet_search_meals")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] pl-9 pr-3 py-2 text-[13px] text-[var(--color-fg-secondary)] placeholder-[var(--color-fg-subtle)] focus:outline-none focus:border-[var(--color-border-strong)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort button */}
          <div className="relative" ref={sortMenuRef}>
            <button
              onClick={() => {
                setShowSortMenu(!showSortMenu);
                setShowFilterMenu(false);
              }}
              title={t(lang, "diet_sort_by")}
              className="group grid place-items-center w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] active:scale-[0.96] transition-all"
            >
              <MoreVert
                width={13}
                height={13}
                strokeWidth={2.1}
                className="transition-colors text-[var(--color-fg-subtle)] group-hover:text-[var(--color-data)]"
              />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] overflow-hidden z-20"
                >
                  {(["name", "kcal", "protein"] as SortBy[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] transition-all border-b border-[var(--color-border-subtle)] last:border-0",
                        sortBy === option
                          ? "bg-white/[0.04] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-white/[0.04]",
                      )}
                    >
                      {(() => {
                        const Icon = SORT_ICON_BY_OPTION[option];
                        const accent = SORT_ACCENT_BY_OPTION[option];
                        return (
                          <>
                            <Icon
                              width={13}
                              height={13}
                              strokeWidth={1.8}
                              color={
                                sortBy === option
                                  ? accent
                                  : "var(--color-fg-subtle)"
                              }
                            />
                            <span
                              className="uppercase tracking-[0.08em]"
                              style={{
                                color:
                                  sortBy === option
                                    ? accent
                                    : "var(--color-fg-secondary)",
                              }}
                            >
                              {option === "name" && t(lang, "diet_sort_name")}
                              {option === "kcal" && t(lang, "diet_sort_kcal")}
                              {option === "protein" &&
                                t(lang, "diet_sort_protein")}
                            </span>
                          </>
                        );
                      })()}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter button */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => {
                setShowFilterMenu(!showFilterMenu);
                setShowSortMenu(false);
              }}
              title={t(lang, "diet_filter_by")}
              className="group grid place-items-center w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] active:scale-[0.96] transition-all"
            >
              <List
                width={13}
                height={13}
                strokeWidth={2.1}
                className="transition-colors text-[var(--color-fg-subtle)] group-hover:text-[var(--color-warning)]"
              />
            </button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-overlay)] overflow-hidden z-20"
                >
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterBy(option.value);
                        setShowFilterMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left text-[11px] transition-all border-b border-[var(--color-border-subtle)] last:border-0",
                        filterBy === option.value
                          ? "bg-white/[0.04] text-[var(--color-fg-primary)] font-medium"
                          : "text-[var(--color-fg-secondary)] hover:bg-white/[0.04]",
                      )}
                    >
                      <span className="uppercase tracking-[0.08em]">
                        {option.label}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: FILTER_ACCENT_BY_OPTION[option.value],
                        }}
                      />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Meals list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-2">
          {filteredAndSorted.map((meal, idx) => (
            <MealCatalogCard
              key={meal.id}
              meal={meal}
              index={idx}
              isFavorite={favoriteMealIds.has(meal.id)}
              onToggleFavorite={() => onToggleFavorite(meal.id)}
              onClick={() => onMealClick(meal)}
              onDragStart={(e) => onMealDragStart(e, meal)}
              onDragEnd={onMealDragEnd}
              lang={lang}
            />
          ))}
          {filteredAndSorted.length === 0 && (
            <div className="flex items-center justify-center py-8 text-[var(--color-fg-subtle)]">
              <p className="text-[13px]">
                {searchQuery
                  ? t(lang, "diet_no_results")
                  : t(lang, "diet_no_meals")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MealCatalogCard({
  meal,
  index,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDragStart,
  onDragEnd,
  lang,
}: {
  meal: NamedMeal;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  lang: "pl" | "en";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const macros = useMemo(() => computeMealMacros(meal.ingredients), [meal]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="p-3 rounded-[var(--radius-md)] border border-[var(--color-border-default)] cursor-move hover:border-[var(--color-border-strong)] transition-all group"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.2) 100%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transitionDuration: "0.2s",
        transitionDelay: `${index * 0.02}s`,
        transitionTimingFunction: "ease",
      }}
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.94 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-2.5 right-2.5 z-10 p-0.5 transition-all"
        aria-label={
          isFavorite
            ? t(lang, "diet_favorite_remove")
            : t(lang, "diet_favorite_add")
        }
      >
        {isFavorite ? (
          <HeartSolid
            width={13}
            height={13}
            className="transition-all text-[var(--color-danger)]"
          />
        ) : (
          <Heart
            width={13}
            height={13}
            strokeWidth={2}
            className="transition-all text-[var(--color-fg-subtle)] group-hover:text-[var(--color-danger)] [filter:drop-shadow(0_0_0_rgba(255,32,96,0.0))] group-hover:[filter:drop-shadow(0_0_4px_rgba(255,32,96,0.42))]"
          />
        )}
      </motion.button>

      <div className="flex items-start gap-2">
        <span className="text-base leading-none flex-shrink-0">
          {meal.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[var(--color-fg-primary)] truncate leading-[1.2]">
            {meal.name}
          </p>
          <p className="text-[10px] text-[var(--color-fg-tertiary)] line-clamp-1 pr-8">
            {meal.description}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-mono whitespace-nowrap overflow-hidden">
            <span
              style={{ color: "var(--color-warning)" }}
              className="font-semibold text-[13px] leading-none inline-flex items-center gap-1"
            >
              {Math.round(macros.kcal)}
              <FireFlame width={12} height={12} strokeWidth={2} />
            </span>
            <span className="text-[var(--color-fg-subtle)]">|</span>
            <span style={{ color: "var(--color-danger)" }}>
              {Math.round(macros.protein)}g P
            </span>
            <span style={{ color: "var(--color-success)" }}>
              {Math.round(macros.carbs)}g C
            </span>
            <span style={{ color: "var(--color-data)" }}>
              {Math.round(macros.fat)}g F
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DayPlanWidget ────────────────────────────────────────────────────────────

function DayPlanWidget({
  weekDates,
  weekRangeLabel,
  onPrevWeek,
  onNextWeek,
  activeDate,
  todayDate,
  onDateChange,
  sortedMeals,
  dayTotals,
  onMealClick,
  onRemoveMeal,
  onDropOnMeal,
  onDropAtTime,
  onDragOverMeal,
  onDragOverInsert,
  onDragLeaveAll,
  onMealDragStart,
  onMealDragEnd,
  dragOverMealIdx,
  dragOverInsertTime,
  activeDrag,
  editingMealIdx,
  editingTimeValue,
  onStartEditingTime,
  onEditingTimeChange,
  onCommitEditingTime,
  onCancelEditingTime,
  lang,
}: {
  weekDates: string[];
  weekRangeLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  activeDate: string;
  todayDate: string;
  onDateChange: (date: string) => void;
  sortedMeals: (MealSlot & { originalIdx: number })[];
  dayTotals: ReturnType<typeof computeMealMacros>;
  onMealClick: (meal: NamedMeal, slot: MealSlotId, time: string) => void;
  onRemoveMeal: (idx: number) => void;
  onDropOnMeal: (e: React.DragEvent, idx: number) => void;
  onDropAtTime: (
    e: React.DragEvent,
    time: string,
    slotHint?: MealSlotId,
  ) => void;
  onDragOverMeal: (idx: number) => void;
  onDragOverInsert: (time: string) => void;
  onDragLeaveAll: () => void;
  onMealDragStart: (
    e: React.DragEvent,
    mealSlot: MealSlot & { originalIdx: number },
    meal: NamedMeal,
  ) => void;
  onMealDragEnd: (e: React.DragEvent) => void;
  dragOverMealIdx: number | null;
  dragOverInsertTime: string | null;
  activeDrag: DietDragPayload | null;
  editingMealIdx: number | null;
  editingTimeValue: string;
  onStartEditingTime: (mealIdx: number, currentTime: string) => void;
  onEditingTimeChange: (time: string) => void;
  onCommitEditingTime: () => void;
  onCancelEditingTime: () => void;
  lang: "pl" | "en";
}) {
  const isDragging = activeDrag !== null;

  const renderInsertZone = (
    key: string,
    time: string,
    slotHint?: MealSlotId,
  ) => (
    <div
      key={key}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOverInsert(time);
      }}
      onDragLeave={onDragLeaveAll}
      onDrop={(e) => onDropAtTime(e, time, slotHint)}
      className={cn(
        "h-5 rounded-[var(--radius-sm)] border border-dashed transition-all",
        dragOverInsertTime === time
          ? "border-[var(--color-data)] bg-[var(--color-data-subtle)]"
          : isDragging
            ? "border-[var(--color-border-default)]"
            : "border-transparent",
      )}
    />
  );

  return (
    <div
      className="relative rounded-[var(--radius-xl)] border border-[var(--color-border-default)] overflow-hidden flex flex-col h-full"
      style={{
        background: GLASS_BG,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top shine */}
      <div
        className="absolute top-0 left-[10%] right-[10%] h-px z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
        }}
      />

      {/* Header */}
      <div className="border-b border-[var(--color-border-default)] p-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="min-w-0 pt-0.5">
            <SectionLabel>{t(lang, "diet_day_plan")}</SectionLabel>

            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-mono tabular-nums">
              <span className="inline-flex items-center gap-1 text-[var(--color-warning)] font-semibold text-[13px] leading-none">
                {Math.round(dayTotals.kcal)}
                <FireFlame width={11} height={11} strokeWidth={2} />
              </span>
              <span className="text-[var(--color-fg-subtle)]">|</span>
              <span className="text-[var(--color-danger)] font-medium">
                P {Math.round(dayTotals.protein)}g
              </span>
              <span className="text-[var(--color-success)] font-medium">
                C {Math.round(dayTotals.carbs)}g
              </span>
              <span className="text-[var(--color-data)] font-medium">
                F {Math.round(dayTotals.fat)}g
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-2 self-stretch md:self-center min-w-0">
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={onPrevWeek}
                className="grid place-items-center w-7 h-7 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition-all"
              >
                <NavArrowLeft width={13} height={13} strokeWidth={2} />
              </button>
              <p className="text-[10px] text-[var(--color-fg-subtle)] uppercase tracking-[0.08em] min-w-[118px] text-center">
                {weekRangeLabel}
              </p>
              <button
                onClick={onNextWeek}
                className="grid place-items-center w-7 h-7 rounded-[var(--radius-sm)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-white/[0.04] transition-all"
              >
                <NavArrowRight width={13} height={13} strokeWidth={2} />
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto justify-end">
              {weekDates.map((date) => {
                const isActive = date === activeDate;
                const isToday = date === todayDate;

                return (
                  <button
                    key={date}
                    onClick={() => onDateChange(date)}
                    className={cn(
                      "flex flex-col items-center px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-all border min-w-[44px]",
                      isActive
                        ? "border-[var(--color-data)] bg-[var(--color-data-subtle)]"
                        : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] uppercase tracking-[0.12em] font-medium",
                        isActive
                          ? "text-[var(--color-data)]"
                          : isToday
                            ? "text-[var(--color-fg-primary)]"
                            : "text-[var(--color-fg-subtle)]",
                      )}
                    >
                      {shortDay(date, lang)}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-medium mt-0.5",
                        isActive
                          ? "text-[var(--color-data)]"
                          : isToday
                            ? "text-[var(--color-fg-primary)]"
                            : "text-[var(--color-fg-subtle)]",
                      )}
                    >
                      {dayNum(date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline meals */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
        <div className="space-y-4">
          {sortedMeals.length === 0 ? (
            <div
              className={cn(
                "flex items-center justify-center h-32 rounded-[var(--radius-md)] text-[var(--color-fg-subtle)] border border-dashed transition-colors",
                isDragging
                  ? "border-[var(--color-data)] bg-[var(--color-data-subtle)]"
                  : "border-[var(--color-border-default)]",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                onDragOverInsert("12:00");
              }}
              onDragLeave={onDragLeaveAll}
              onDrop={(e) => onDropAtTime(e, "12:00", "snack")}
            >
              <p className="text-[13px] text-center">
                {isDragging ? t(lang, "drop_here") : t(lang, "diet_drag_hint")}
              </p>
            </div>
          ) : (
            sortedMeals.map((mealSlot, idx) => {
              const meal = MEAL_MAP[mealSlot.mealId];
              if (!meal) return null;

              const prevMeal = idx > 0 ? sortedMeals[idx - 1] : undefined;
              const insertTimeBefore = computeInsertTime(
                prevMeal?.time,
                mealSlot.time,
              );

              const nextMeal =
                idx < sortedMeals.length - 1 ? sortedMeals[idx + 1] : undefined;
              const insertTimeAfter = computeInsertTime(
                mealSlot.time,
                nextMeal?.time,
              );

              return (
                <div key={`meal-${activeDate}-${mealSlot.originalIdx}`}>
                  {idx === 0 &&
                    renderInsertZone(
                      "insert-start",
                      insertTimeBefore,
                      mealSlot.slot,
                    )}

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      onDragOverMeal(mealSlot.originalIdx);
                    }}
                    onDragLeave={onDragLeaveAll}
                    onDrop={(e) => onDropOnMeal(e, mealSlot.originalIdx)}
                    className="flex gap-3"
                  >
                    <div className="w-11 pt-0.5 flex-shrink-0 text-right">
                      {editingMealIdx === mealSlot.originalIdx ? (
                        <input
                          type="time"
                          value={editingTimeValue}
                          onChange={(e) => onEditingTimeChange(e.target.value)}
                          onBlur={onCommitEditingTime}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onCommitEditingTime();
                            if (e.key === "Escape") onCancelEditingTime();
                          }}
                          autoFocus
                          className="w-[66px] bg-[var(--color-bg-overlay)] border border-[var(--color-border-default)] rounded-[var(--radius-sm)] px-1.5 py-1 text-[10px] font-medium tracking-[0.04em] text-[var(--color-fg-primary)]"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            onStartEditingTime(
                              mealSlot.originalIdx,
                              mealSlot.time,
                            )
                          }
                          className="text-[10px] font-medium tracking-[0.04em] text-[var(--color-fg-tertiary)] hover:text-[var(--color-fg-primary)] transition-colors"
                        >
                          {mealSlot.time}
                        </button>
                      )}
                    </div>

                    {/* Timeline dot and line */}
                    <div className="flex flex-col items-center flex-shrink-0 w-8">
                      <div
                        className="w-2 h-2 rounded-full border-2 relative z-10"
                        style={{ borderColor: SLOT_COLORS[mealSlot.slot] }}
                      />
                      {idx < sortedMeals.length - 1 && (
                        <div
                          className="w-0.5 flex-1 mt-1"
                          style={{ background: "var(--color-border-subtle)" }}
                        />
                      )}
                    </div>

                    {/* Meal card */}
                    <div className="flex-1 min-w-0">
                      <MealCard
                        meal={meal}
                        slotColorVar={SLOT_COLORS[mealSlot.slot]}
                        onRemove={() => onRemoveMeal(mealSlot.originalIdx)}
                        onClick={() =>
                          onMealClick(meal, mealSlot.slot, mealSlot.time)
                        }
                        isDragOver={dragOverMealIdx === mealSlot.originalIdx}
                        isDragging={
                          activeDrag?.source === "plan" &&
                          activeDrag.fromIdx === mealSlot.originalIdx
                        }
                        isDraggingAny={isDragging}
                        onDragStart={(e) => onMealDragStart(e, mealSlot, meal)}
                        onDragEnd={onMealDragEnd}
                        dropLabel={t(lang, "drop_here")}
                      />
                    </div>
                  </div>

                  {renderInsertZone(
                    `insert-after-${mealSlot.originalIdx}`,
                    insertTimeAfter,
                    mealSlot.slot,
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeDate, setActiveDate] = useState(TODAY);
  const [weekState, setWeekState] = useState<DietDay[]>(MOCK_DIET_WEEK);
  const [favoriteMealIds, setFavoriteMealIds] = useState<Set<string>>(
    () =>
      new Set(
        MOCK_NAMED_MEALS.filter((meal) => meal.isFavorite).map(
          (meal) => meal.id,
        ),
      ),
  );
  const [dragOverMealIdx, setDragOverMealIdx] = useState<number | null>(null);
  const [dragOverInsertTime, setDragOverInsertTime] = useState<string | null>(
    null,
  );
  const [activeDrag, setActiveDrag] = useState<DietDragPayload | null>(null);
  const [editingMealIdx, setEditingMealIdx] = useState<number | null>(null);
  const [editingTimeValue, setEditingTimeValue] = useState("12:00");
  const [selectedMeal, setSelectedMeal] = useState<{
    meal: NamedMeal;
    slot: MealSlotId;
    time: string;
  } | null>(null);

  const mealsWithFavoriteState = useMemo(
    () =>
      MOCK_NAMED_MEALS.map((meal) => ({
        ...meal,
        isFavorite: favoriteMealIds.has(meal.id),
      })),
    [favoriteMealIds],
  );

  const weekDates = useMemo(
    () => buildWeekDates(TODAY, weekOffset),
    [TODAY, weekOffset],
  );

  const weekRangeLabel = useMemo(() => {
    const first = weekDates[0];
    const last = weekDates[weekDates.length - 1];
    if (!first || !last) return "";
    const start = new Date(first + "T12:00:00");
    const end = new Date(last + "T12:00:00");
    const startLabel = `${String(start.getDate()).padStart(2, "0")}.${String(start.getMonth() + 1).padStart(2, "0")}`;
    const endLabel = `${String(end.getDate()).padStart(2, "0")}.${String(end.getMonth() + 1).padStart(2, "0")}`;
    return `${startLabel} - ${endLabel}`;
  }, [weekDates]);

  const activeDayData = useMemo(
    () =>
      weekState.find((d) => d.date === activeDate) ?? {
        date: activeDate,
        meals: [],
      },
    [activeDate, weekState],
  );

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

  function handleRemoveMeal(originalIdx: number) {
    setWeekState((prev) =>
      prev.map((day) =>
        day.date !== activeDate
          ? day
          : { ...day, meals: day.meals.filter((_, i) => i !== originalIdx) },
      ),
    );
    setSelectedMeal(null);
  }

  function handleAddMeal(meal: NamedMeal, time: string, slotHint?: MealSlotId) {
    const preferredSlot =
      slotHint && meal.suitableFor.includes(slotHint)
        ? slotHint
        : meal.suitableFor[0] || "snack";

    const newMealSlot: MealSlot = {
      slot: preferredSlot,
      time: normalizeTimeInput(time),
      mealId: meal.id,
    };
    setWeekState((prev) =>
      prev.map((day) =>
        day.date !== activeDate
          ? day
          : {
              ...day,
              meals: [...day.meals, newMealSlot].sort((a, b) =>
                a.time.localeCompare(b.time),
              ),
            },
      ),
    );
  }

  function handleDropMealOnExisting(
    e: React.DragEvent,
    targetOriginalIdx: number,
  ) {
    e.preventDefault();
    e.stopPropagation();

    const payload = getDragPayload(e.dataTransfer);
    if (!payload) return;

    if (payload.source === "catalog") {
      const sourceMeal = MEAL_MAP[payload.mealId];
      if (!sourceMeal) return;

      if (targetOriginalIdx >= 0) {
        setWeekState((prev) =>
          prev.map((day) =>
            day.date !== activeDate
              ? day
              : {
                  ...day,
                  meals: day.meals.map((m, i) =>
                    i === targetOriginalIdx
                      ? { ...m, mealId: payload.mealId }
                      : m,
                  ),
                },
          ),
        );
      }

      setActiveDrag(null);
      setDragOverMealIdx(null);
      setDragOverInsertTime(null);
      return;
    }

    if (
      payload.source === "plan" &&
      payload.fromIdx !== undefined &&
      targetOriginalIdx >= 0
    ) {
      const fromIdx = payload.fromIdx;

      if (fromIdx !== targetOriginalIdx) {
        setWeekState((prev) =>
          prev.map((day) => {
            if (day.date !== activeDate) return day;

            const source = day.meals[fromIdx];
            const target = day.meals[targetOriginalIdx];
            if (!source || !target) return day;

            const nextMeals = [...day.meals];
            nextMeals[fromIdx] = {
              ...source,
              time: target.time,
              slot: target.slot,
            };
            nextMeals[targetOriginalIdx] = {
              ...target,
              time: source.time,
              slot: source.slot,
            };

            return {
              ...day,
              meals: nextMeals,
            };
          }),
        );
      }
    }

    setActiveDrag(null);
    setDragOverMealIdx(null);
    setDragOverInsertTime(null);
  }

  function handleDropMealAtTime(
    e: React.DragEvent,
    targetTime: string,
    slotHint?: MealSlotId,
  ) {
    e.preventDefault();
    e.stopPropagation();

    const payload = getDragPayload(e.dataTransfer);
    if (!payload) return;

    if (payload.source === "catalog") {
      const sourceMeal = MEAL_MAP[payload.mealId];
      if (!sourceMeal) return;
      handleAddMeal(sourceMeal, targetTime, slotHint);
    }

    if (payload.source === "plan" && payload.fromIdx !== undefined) {
      setWeekState((prev) =>
        prev.map((day) => {
          if (day.date !== activeDate) return day;

          const source = day.meals[payload.fromIdx!];
          if (!source) return day;

          const nextMeals = [...day.meals];
          nextMeals[payload.fromIdx!] = {
            ...source,
            time: normalizeTimeInput(targetTime),
            slot: slotHint ?? source.slot,
          };

          return {
            ...day,
            meals: nextMeals,
          };
        }),
      );
    }

    setActiveDrag(null);
    setDragOverMealIdx(null);
    setDragOverInsertTime(null);
  }

  function clearDragState() {
    setActiveDrag(null);
    setDragOverMealIdx(null);
    setDragOverInsertTime(null);
  }

  function handleCatalogDragStart(e: React.DragEvent, meal: NamedMeal) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "copy";
    setDragPayload(e.dataTransfer, {
      source: "catalog",
      mealId: meal.id,
    });
    setMealDragPreview(e.dataTransfer, meal);
    setActiveDrag({ source: "catalog", mealId: meal.id });
  }

  function handlePlanMealDragStart(
    e: React.DragEvent,
    mealSlot: MealSlot & { originalIdx: number },
    meal: NamedMeal,
  ) {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    const payload: DietDragPayload = {
      source: "plan",
      mealId: mealSlot.mealId,
      fromIdx: mealSlot.originalIdx,
    };
    setDragPayload(e.dataTransfer, payload);
    setMealDragPreview(e.dataTransfer, meal);
    setActiveDrag(payload);
  }

  function handlePlanMealDragEnd(e: React.DragEvent) {
    const fromIdx = activeDrag?.fromIdx;
    const shouldRemove =
      activeDrag?.source === "plan" &&
      fromIdx !== undefined &&
      e.dataTransfer.dropEffect === "none";

    if (shouldRemove && fromIdx !== undefined) {
      handleRemoveMeal(fromIdx);
    }

    clearDragState();
  }

  function handleMealClick(meal: NamedMeal) {
    const mealSlot = sortedMeals.find((m) => m.mealId === meal.id);
    const details = {
      meal,
      slot: mealSlot?.slot ?? meal.suitableFor[0] ?? "snack",
      time: mealSlot?.time ?? "--:--",
    };

    if (onMealSelect) {
      onMealSelect(details);
      return;
    }

    setSelectedMeal(details);
  }

  function handleMealClickFromPlan(
    meal: NamedMeal,
    slot: MealSlotId,
    time: string,
  ) {
    const details = { meal, slot, time };

    if (onMealSelect) {
      onMealSelect(details);
      return;
    }

    setSelectedMeal(details);
  }

  function handleMealClickFromCatalog(meal: NamedMeal) {
    handleMealClick(meal);
  }

  function handleToggleFavorite(mealId: string) {
    setFavoriteMealIds((prev) => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  }

  function shiftWeek(direction: -1 | 1) {
    setWeekOffset((prev) => prev + direction);
    setActiveDate((prev) => {
      const prevDate = new Date(prev + "T12:00:00");
      return dateKey(addDays(prevDate, direction * 7));
    });
  }

  function handleStartEditingTime(mealIdx: number, currentTime: string) {
    setEditingMealIdx(mealIdx);
    setEditingTimeValue(normalizeTimeInput(currentTime));
  }

  function handleCommitEditingTime() {
    if (editingMealIdx === null) return;

    const nextTime = normalizeTimeInput(editingTimeValue);

    setWeekState((prev) =>
      prev.map((day) => {
        if (day.date !== activeDate) return day;

        const source = day.meals[editingMealIdx];
        if (!source) return day;

        const nextMeals = [...day.meals];
        nextMeals[editingMealIdx] = {
          ...source,
          time: nextTime,
        };

        return {
          ...day,
          meals: nextMeals,
        };
      }),
    );

    setEditingMealIdx(null);
  }

  function handleCancelEditingTime() {
    setEditingMealIdx(null);
  }

  return (
    <div className="flex h-full overflow-hidden bg-[var(--color-bg-base)]">
      {/* Left panel: Meal Catalog */}
      <div className="w-[22rem] border-r border-[var(--color-border-default)] flex flex-col h-full p-4">
        <MealCatalog
          meals={mealsWithFavoriteState}
          favoriteMealIds={favoriteMealIds}
          onToggleFavorite={handleToggleFavorite}
          onMealClick={handleMealClickFromCatalog}
          onMealDragStart={handleCatalogDragStart}
          onMealDragEnd={clearDragState}
          lang={lang}
        />
      </div>

      {/* Right panel: Day plan */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
        {/* Day plan with timeline */}
        <DayPlanWidget
          weekDates={weekDates}
          weekRangeLabel={weekRangeLabel}
          onPrevWeek={() => shiftWeek(-1)}
          onNextWeek={() => shiftWeek(1)}
          activeDate={activeDate}
          todayDate={TODAY}
          onDateChange={setActiveDate}
          sortedMeals={sortedMeals}
          dayTotals={dayTotals}
          onMealClick={handleMealClickFromPlan}
          onRemoveMeal={handleRemoveMeal}
          onDropOnMeal={handleDropMealOnExisting}
          onDropAtTime={handleDropMealAtTime}
          onDragOverMeal={(idx) => {
            setDragOverMealIdx(idx);
            setDragOverInsertTime(null);
          }}
          onDragOverInsert={(time) => {
            setDragOverInsertTime(time);
            setDragOverMealIdx(null);
          }}
          onDragLeaveAll={() => {
            setDragOverMealIdx(null);
            setDragOverInsertTime(null);
          }}
          onMealDragStart={handlePlanMealDragStart}
          onMealDragEnd={handlePlanMealDragEnd}
          dragOverMealIdx={dragOverMealIdx}
          dragOverInsertTime={dragOverInsertTime}
          activeDrag={activeDrag}
          editingMealIdx={editingMealIdx}
          editingTimeValue={editingTimeValue}
          onStartEditingTime={handleStartEditingTime}
          onEditingTimeChange={setEditingTimeValue}
          onCommitEditingTime={handleCommitEditingTime}
          onCancelEditingTime={handleCancelEditingTime}
          lang={lang}
        />
      </div>

      {/* Right panel: Meal detail */}
      <AnimatePresence>
        {!onMealSelect && selectedMeal && (
          <MealDetailPanel
            meal={selectedMeal.meal}
            slot={selectedMeal.slot}
            time={selectedMeal.time}
            isFavorite={favoriteMealIds.has(selectedMeal.meal.id)}
            onToggleFavorite={() => handleToggleFavorite(selectedMeal.meal.id)}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
