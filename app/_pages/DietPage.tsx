"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Utensils,
  Apple,
  Moon,
  ShoppingCart,
  BarChart3,
  Check,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  MOCK_DIET_WEEK,
  MOCK_FOOD_DB,
  MOCK_DIET_GOALS,
  MOCK_SHOPPING_LIST,
  type MealSlotId,
  type ShoppingItem,
  type FoodCategory,
} from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// ─── helpers ──────────────────────────────────────────────────────────────────

const FOOD_MAP = Object.fromEntries(MOCK_FOOD_DB.map((f) => [f.id, f]));

function computeMealMacros(ingredients: { foodId: string; grams: number }[]) {
  return ingredients.reduce(
    (acc, ing) => {
      const food = FOOD_MAP[ing.foodId];
      if (!food) return acc;
      const ratio = ing.grams / 100;
      return {
        kcal: acc.kcal + food.kcalPer100g * ratio,
        protein: acc.protein + food.proteinPer100g * ratio,
        carbs: acc.carbs + food.carbsPer100g * ratio,
        fat: acc.fat + food.fatPer100g * ratio,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
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

function shortDay(dateStr: string, lang: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const idx = String(d.getDay());
  return lang === "pl" ? DAY_LABELS[idx] : DAY_LABELS_EN[idx];
}

function dayNum(dateStr: string): number {
  return new Date(dateStr + "T12:00:00").getDate();
}

const SLOT_ICONS: Record<MealSlotId, React.ReactNode> = {
  breakfast: <Coffee size={14} />,
  lunch: <Utensils size={14} />,
  snack: <Apple size={14} />,
  dinner: <Moon size={14} />,
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

const CAT_ORDER: FoodCategory[] = [
  "protein",
  "carbs",
  "veggies",
  "dairy",
  "fats",
  "other",
];

// ─── sub-components ────────────────────────────────────────────────────────────

function KcalRing({ consumed, target }: { consumed: number; target: number }) {
  const r = 62;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(consumed / target, 1);
  const offset = circ * (1 - pct);
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="-rotate-90">
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="#1f1f1f"
          strokeWidth="10"
        />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={over ? "#ef4444" : "#facc15"}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-[#e0e0e0] font-mono tabular-nums">
          {Math.round(consumed)}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#555]">
          kcal
        </span>
        <span
          className={cn(
            "text-[10px] font-mono mt-0.5",
            over ? "text-[#ef4444]" : "text-[#888]",
          )}
        >
          {over
            ? `+${Math.round(consumed - target)}`
            : `−${Math.round(remaining)}`}
        </span>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = Math.min((value / target) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] uppercase tracking-widest text-[#666]">
          {label}
        </span>
        <span className="text-[11px] font-mono text-[#888]">
          <span style={{ color }} className="text-[#e0e0e0]">
            {Math.round(value)}
          </span>
          <span className="text-[#444]">/{target}g</span>
        </span>
      </div>
      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function MealSlotCard({
  slot,
  time,
  ingredients,
  lang: language,
}: {
  slot: MealSlotId;
  time: string;
  ingredients: { foodId: string; grams: number }[];
  lang: string;
}) {
  const [open, setOpen] = useState(true);
  const macros = useMemo(() => computeMealMacros(ingredients), [ingredients]);
  const slotColor = SLOT_COLORS[slot];
  const slotLabel = t(
    language as "pl" | "en",
    `diet_slot_${slot}` as Parameters<typeof t>[1],
  );

  return (
    <div className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-sm overflow-hidden hover:border-[#2a2a2a] transition-colors">
      {/* header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0d0d0d] transition-colors"
      >
        <span style={{ color: slotColor }} className="shrink-0">
          {SLOT_ICONS[slot]}
        </span>
        <span
          className="text-[10px] uppercase tracking-[0.15em] font-mono"
          style={{ color: slotColor }}
        >
          {slotLabel}
        </span>
        <span className="text-[10px] font-mono text-[#444] ml-1">{time}</span>
        <span className="ml-auto text-[10px] font-mono text-[#555] tabular-nums">
          {Math.round(macros.kcal)} kcal
        </span>
        <ChevronRight
          size={12}
          className={cn(
            "text-[#444] transition-transform shrink-0",
            open && "rotate-90",
          )}
        />
      </button>

      {/* body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1">
              {ingredients.length === 0 ? (
                <p className="text-[#444] text-xs py-2">
                  {t(language as "pl" | "en", "diet_no_ingredients")}
                </p>
              ) : (
                ingredients.map((ing, i) => {
                  const food = FOOD_MAP[ing.foodId];
                  if (!food) return null;
                  const kcal = (food.kcalPer100g * ing.grams) / 100;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 py-1 border-b border-[#141414] last:border-0"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: CAT_COLORS[food.category] }}
                      />
                      <span className="text-xs text-[#ccc] flex-1 truncate">
                        {food.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#555]">
                        {ing.grams}g
                      </span>
                      <span className="text-[10px] font-mono text-[#444] w-14 text-right">
                        {Math.round(kcal)} kcal
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* macro strip */}
            <div className="flex divide-x divide-[#1a1a1a] border-t border-[#1a1a1a]">
              {(
                [
                  { label: "P", value: macros.protein, color: "#ec4899" },
                  { label: "C", value: macros.carbs, color: "#f59e0b" },
                  { label: "F", value: macros.fat, color: "#a855f7" },
                ] as { label: string; value: number; color: string }[]
              ).map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex-1 flex items-center justify-center gap-1 py-2"
                >
                  <span
                    className="text-[9px] uppercase tracking-widest"
                    style={{ color }}
                  >
                    {label}
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    {Math.round(value)}g
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── main page ─────────────────────────────────────────────────────────────────

export default function DietPage() {
  const { lang } = useLang();

  // today is 2026-03-04
  const TODAY = "2026-03-04";
  const [activeDate, setActiveDate] = useState(TODAY);
  const [rightTab, setRightTab] = useState<"macros" | "shopping">("macros");
  const [shoppingItems, setShoppingItems] =
    useState<ShoppingItem[]>(MOCK_SHOPPING_LIST);
  const [listGenerated, setListGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

  const activeDayData = useMemo(
    () =>
      MOCK_DIET_WEEK.find((d) => d.date === activeDate) ?? MOCK_DIET_WEEK[0],
    [activeDate],
  );

  // total day macros
  const dayTotals = useMemo(() => {
    const allIngredients = activeDayData.meals.flatMap((m) => m.ingredients);
    return computeMealMacros(allIngredients);
  }, [activeDayData]);

  const goals = MOCK_DIET_GOALS;

  // shopping list helpers
  function toggleItem(id: string) {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  }
  function checkAll() {
    setShoppingItems((prev) => prev.map((i) => ({ ...i, checked: true })));
  }
  function uncheckAll() {
    setShoppingItems((prev) => prev.map((i) => ({ ...i, checked: false })));
  }

  function handleGenerate() {
    setGenerating(true);
    // TODO: [DATA] replace with real algorithm that aggregates week ingredients
    setTimeout(() => {
      setGenerating(false);
      setListGenerated(true);
      setRightTab("shopping");
    }, 900);
  }

  const groupedShopping = useMemo(() => {
    const groups: Partial<Record<FoodCategory, ShoppingItem[]>> = {};
    for (const cat of CAT_ORDER) {
      const items = shoppingItems.filter((i) => i.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [shoppingItems]);

  const uncheckedCount = shoppingItems.filter((i) => !i.checked).length;

  const catLabelKey = (cat: FoodCategory): Parameters<typeof t>[1] =>
    `diet_cat_${cat}` as Parameters<typeof t>[1];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#facc15] text-[10px] uppercase tracking-widest font-mono">
            {t(lang, "diet_title")}
          </p>
          <h1 className="text-lg font-bold text-[#e0e0e0] mt-1">
            {t(lang, "diet_plan")}
          </h1>
        </div>

        {/* daily kcal + macro pills */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-1.5 border border-[#1f1f1f] px-3 py-1.5 rounded-sm bg-[#0a0a0a]">
            <span className="text-[10px] uppercase tracking-widest text-[#555] font-mono">
              {t(lang, "diet_kcal")}
            </span>
            <span className="text-sm font-bold text-[#facc15] font-mono tabular-nums">
              {Math.round(dayTotals.kcal)}
            </span>
            <span className="text-[10px] text-[#444] font-mono">
              / {goals.kcal}
            </span>
          </div>
          {(
            [
              {
                key: "diet_protein",
                val: dayTotals.protein,
                target: goals.protein,
                color: "#ec4899",
              },
              {
                key: "diet_carbs",
                val: dayTotals.carbs,
                target: goals.carbs,
                color: "#f59e0b",
              },
              {
                key: "diet_fat",
                val: dayTotals.fat,
                target: goals.fat,
                color: "#a855f7",
              },
            ] as {
              key: Parameters<typeof t>[1];
              val: number;
              target: number;
              color: string;
            }[]
          ).map(({ key, val, target, color }) => (
            <div
              key={key}
              className="flex items-center gap-1.5 border border-[#1f1f1f] px-3 py-1.5 rounded-sm bg-[#0a0a0a]"
            >
              <span
                className="text-[10px] uppercase tracking-widest font-mono"
                style={{ color: color + "99" }}
              >
                {t(lang, key)}
              </span>
              <span
                className="text-sm font-bold font-mono tabular-nums"
                style={{ color }}
              >
                {Math.round(val)}
              </span>
              <span className="text-[10px] text-[#444] font-mono">
                / {target}g
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── day selector ───────────────────────────────────────── */}
      <div className="flex gap-1 border border-[#1f1f1f] bg-[#0a0a0a] p-1 rounded-sm w-fit">
        {WEEK_DATES.map((date) => {
          const isActive = date === activeDate;
          const isToday = date === TODAY;
          return (
            <button
              key={date}
              onClick={() => setActiveDate(date)}
              className={cn(
                "flex flex-col items-center px-3 py-1.5 rounded-sm transition-colors min-w-[44px]",
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
              {isToday && (
                <span className="w-1 h-1 rounded-full bg-[#facc15] mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── main grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        {/* ── left: meal timeline ──────────── */}
        <div className="col-span-12 lg:col-span-7 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDate}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {activeDayData.meals.map((meal) => (
                <MealSlotCard
                  key={meal.slot}
                  slot={meal.slot}
                  time={meal.time}
                  ingredients={meal.ingredients}
                  lang={lang}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── right: macros + shopping ─────── */}
        <div className="col-span-12 lg:col-span-5 space-y-3">
          {/* tab switcher */}
          <div className="flex border border-[#1f1f1f] bg-[#0a0a0a] rounded-sm p-0.5">
            {(["macros", "shopping"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-[10px] uppercase tracking-widest font-mono transition-colors",
                  rightTab === tab
                    ? "bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20"
                    : "text-[#555] hover:text-[#888]",
                )}
              >
                {tab === "macros" ? (
                  <BarChart3 size={11} />
                ) : (
                  <ShoppingCart size={11} />
                )}
                {tab === "macros"
                  ? t(lang, "diet_macros")
                  : t(lang, "diet_shopping_list")}
                {tab === "shopping" && uncheckedCount > 0 && (
                  <span className="ml-1 bg-[#facc15]/20 text-[#facc15] text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                    {uncheckedCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {rightTab === "macros" ? (
              <motion.div
                key="macros"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-sm p-5 space-y-5"
              >
                {/* kcal ring */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[9px] uppercase tracking-widest text-[#444] font-mono">
                    {t(lang, "diet_progress_ring")}
                  </span>
                  <KcalRing consumed={dayTotals.kcal} target={goals.kcal} />
                  <div className="flex gap-4 text-[10px] font-mono">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[#444] uppercase tracking-widest text-[9px]">
                        {t(lang, "diet_target")}
                      </span>
                      <span className="text-[#888]">{goals.kcal}</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[#444] uppercase tracking-widest text-[9px]">
                        {t(lang, "diet_consumed")}
                      </span>
                      <span className="text-[#facc15]">
                        {Math.round(dayTotals.kcal)}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[#444] uppercase tracking-widest text-[9px]">
                        {t(lang, "diet_remaining")}
                      </span>
                      <span className="text-[#888]">
                        {Math.max(0, Math.round(goals.kcal - dayTotals.kcal))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#141414]" />

                {/* macro bars */}
                <div className="space-y-3">
                  <MacroBar
                    label={t(lang, "diet_protein")}
                    value={dayTotals.protein}
                    target={goals.protein}
                    color="#ec4899"
                  />
                  <MacroBar
                    label={t(lang, "diet_carbs")}
                    value={dayTotals.carbs}
                    target={goals.carbs}
                    color="#f59e0b"
                  />
                  <MacroBar
                    label={t(lang, "diet_fat")}
                    value={dayTotals.fat}
                    target={goals.fat}
                    color="#a855f7"
                  />
                </div>

                {/* macro legend dots */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    {
                      label: t(lang, "diet_protein"),
                      pct: ((dayTotals.protein * 4) / dayTotals.kcal) * 100,
                      color: "#ec4899",
                    },
                    {
                      label: t(lang, "diet_carbs"),
                      pct: ((dayTotals.carbs * 4) / dayTotals.kcal) * 100,
                      color: "#f59e0b",
                    },
                    {
                      label: t(lang, "diet_fat"),
                      pct: ((dayTotals.fat * 9) / dayTotals.kcal) * 100,
                      color: "#a855f7",
                    },
                  ].map(({ label, pct, color }) => (
                    <div
                      key={label}
                      className="border border-[#1a1a1a] rounded-sm p-2 flex flex-col items-center gap-1"
                    >
                      <span
                        className="text-sm font-bold font-mono tabular-nums"
                        style={{ color }}
                      >
                        {isNaN(pct) ? "—" : `${Math.round(pct)}%`}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-[#444]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="shopping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border border-[#1f1f1f] bg-[#0a0a0a] rounded-sm overflow-hidden"
              >
                {/* shopping list toolbar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono px-3 py-1.5 border rounded-sm transition-colors",
                      listGenerated
                        ? "border-[#22c55e]/30 text-[#22c55e] bg-[#22c55e]/5 cursor-default"
                        : "border-[#facc15]/20 text-[#facc15] hover:bg-[#facc15]/5",
                    )}
                  >
                    {generating ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : listGenerated ? (
                      <Check size={10} />
                    ) : (
                      <RefreshCw size={10} />
                    )}
                    {listGenerated
                      ? t(lang, "diet_generated")
                      : t(lang, "diet_generate_list")}
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={uncheckAll}
                      className="text-[9px] uppercase tracking-widest text-[#444] hover:text-[#888] font-mono transition-colors"
                    >
                      {t(lang, "diet_uncheck_all")}
                    </button>
                  </div>
                </div>

                {/* grouped items */}
                <div className="max-h-[420px] overflow-y-auto custom-scrollbar divide-y divide-[#0f0f0f]">
                  {CAT_ORDER.filter((cat) => groupedShopping[cat]).map(
                    (cat) => (
                      <div key={cat}>
                        {/* category header */}
                        <div className="sticky top-0 flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] border-b border-[#141414]">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: CAT_COLORS[cat] }}
                          />
                          <span
                            className="text-[9px] uppercase tracking-widest font-mono"
                            style={{ color: CAT_COLORS[cat] }}
                          >
                            {t(lang, catLabelKey(cat))}
                          </span>
                          <span className="ml-auto text-[9px] font-mono text-[#333]">
                            {
                              groupedShopping[cat]!.filter((i) => !i.checked)
                                .length
                            }
                            /{groupedShopping[cat]!.length}
                          </span>
                        </div>

                        {/* items */}
                        {groupedShopping[cat]!.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleItem(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#0d0d0d] transition-colors group"
                          >
                            <span
                              className={cn(
                                "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                                item.checked
                                  ? "border-[#22c55e] bg-[#22c55e]/15"
                                  : "border-[#2a2a2a] group-hover:border-[#333]",
                              )}
                            >
                              {item.checked && (
                                <Check size={10} className="text-[#22c55e]" />
                              )}
                            </span>
                            <span
                              className={cn(
                                "text-xs flex-1 text-left transition-colors",
                                item.checked
                                  ? "text-[#444] line-through"
                                  : "text-[#ccc]",
                              )}
                            >
                              {item.name}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-mono tabular-nums transition-colors",
                                item.checked ? "text-[#333]" : "text-[#555]",
                              )}
                            >
                              {item.amount >= 1000
                                ? `${(item.amount / 1000).toFixed(1)} kg`
                                : `${item.amount} ${item.unit}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ),
                  )}
                </div>

                {/* footer count */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1a1a1a] bg-[#050505]">
                  <span className="text-[9px] uppercase tracking-widest text-[#444] font-mono">
                    {uncheckedCount} {t(lang, "diet_items_left")}
                  </span>
                  <button
                    onClick={checkAll}
                    className="text-[9px] uppercase tracking-widest text-[#444] hover:text-[#facc15] font-mono transition-colors"
                  >
                    {t(lang, "diet_check_all")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
