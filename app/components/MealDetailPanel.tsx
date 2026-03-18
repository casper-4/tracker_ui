"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MOCK_FOOD_DB, type NamedMeal, type MealSlotId } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const PANEL_WIDTH = 400;

const FOOD_MAP = Object.fromEntries(MOCK_FOOD_DB.map((f) => [f.id, f]));

type FoodCategory =
  | "protein"
  | "carbs"
  | "veggies"
  | "dairy"
  | "fats"
  | "other";

const CAT_COLORS: Record<FoodCategory, string> = {
  protein: "#ec4899",
  carbs: "#f59e0b",
  veggies: "#22c55e",
  dairy: "#38bdf8",
  fats: "#a855f7",
  other: "#888",
};

const SLOT_COLORS: Record<MealSlotId, string> = {
  breakfast: "#f59e0b",
  lunch: "#22c55e",
  snack: "#38bdf8",
  dinner: "#a855f7",
};

function computeMacros(ingredients: { foodId: string; grams: number }[]) {
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

type Props = {
  meal: NamedMeal;
  slot: MealSlotId;
  time: string;
  onClose: () => void;
};

export default function MealDetailPanel({ meal, slot, time, onClose }: Props) {
  const { lang } = useLang();
  const slotColor = SLOT_COLORS[slot];
  const macros = computeMacros(meal.ingredients);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const slotLabelKey = `diet_slot_${slot}` as
    | "diet_slot_breakfast"
    | "diet_slot_lunch"
    | "diet_slot_snack"
    | "diet_slot_dinner";

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: PANEL_WIDTH, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.25, 0, 0, 1] }}
      className="h-full bg-[#0a0a0a] flex flex-col overflow-hidden shrink-0"
      style={{
        borderLeftWidth: 4,
        borderLeftStyle: "solid",
        borderLeftColor: slotColor,
        minWidth: 0,
      }}
      role="complementary"
      aria-label={meal.name}
    >
      <div className="flex flex-col h-full" style={{ width: PANEL_WIDTH }}>
        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1f1f1f] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p
                className="text-[10px] uppercase tracking-widest font-mono mb-1 flex items-center gap-2"
                style={{ color: slotColor }}
              >
                {t(lang, slotLabelKey)}
                <span className="text-[#333]">·</span>
                <span className="text-[#444]">{time}</span>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{meal.emoji}</span>
                <h2 className="text-sm font-bold text-white leading-snug">
                  {meal.name}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#1f1f1f] text-[#666] hover:text-white transition-colors shrink-0 mt-0.5"
              aria-label={t(lang, "diet_close_panel")}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={meal.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            <div className="px-5 py-4 space-y-5">
              {/* Description */}
              <p className="text-sm text-[#888] leading-relaxed">
                {meal.description}
              </p>

              {/* Macro summary */}
              <div className="border border-[#1f1f1f] rounded-sm overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-[#1a1a1a]">
                  <div className="flex flex-col items-center justify-center py-4 gap-0.5">
                    <span className="text-2xl font-bold font-mono tabular-nums text-[#facc15]">
                      {Math.round(macros.kcal)}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#444] font-mono">
                      kcal
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 gap-0.5">
                    <span className="text-2xl font-bold font-mono tabular-nums text-[#ec4899]">
                      {Math.round(macros.protein)}g
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#444] font-mono">
                      {t(lang, "diet_protein")}
                    </span>
                  </div>
                </div>
                <div className="border-t border-[#1a1a1a] px-4 py-3 space-y-2">
                  {[
                    {
                      label: t(lang, "diet_carbs"),
                      value: macros.carbs,
                      color: "#f59e0b",
                    },
                    {
                      label: t(lang, "diet_fat"),
                      value: macros.fat,
                      color: "#a855f7",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-1 border-b border-[#111] last:border-0"
                    >
                      <span className="text-[10px] uppercase tracking-widest text-[#555] font-mono">
                        {label}
                      </span>
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color }}
                      >
                        {Math.round(value)}
                        <span className="text-[10px] text-[#444] ml-0.5">
                          g
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macro % bar */}
              {macros.kcal > 0 && (
                <div className="space-y-1.5">
                  <div className="h-2 bg-[#111] rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${((macros.protein * 4) / macros.kcal) * 100}%`,
                        background: "#ec4899",
                      }}
                      className="h-full"
                    />
                    <div
                      style={{
                        width: `${((macros.carbs * 4) / macros.kcal) * 100}%`,
                        background: "#f59e0b",
                      }}
                      className="h-full"
                    />
                    <div
                      style={{
                        width: `${((macros.fat * 9) / macros.kcal) * 100}%`,
                        background: "#a855f7",
                      }}
                      className="h-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    {[
                      {
                        label: t(lang, "diet_protein"),
                        pct: (macros.protein * 4) / macros.kcal,
                        color: "#ec4899",
                      },
                      {
                        label: t(lang, "diet_carbs"),
                        pct: (macros.carbs * 4) / macros.kcal,
                        color: "#f59e0b",
                      },
                      {
                        label: t(lang, "diet_fat"),
                        pct: (macros.fat * 9) / macros.kcal,
                        color: "#a855f7",
                      },
                    ].map(({ label, pct, color }) => (
                      <span
                        key={label}
                        className="text-[9px] font-mono uppercase tracking-widest"
                        style={{ color }}
                      >
                        {Math.round(pct * 100)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#555] font-mono mb-2">
                  {t(lang, "diet_meal_ingredients")}
                </p>
                <div className="border border-[#1a1a1a] rounded-sm overflow-hidden">
                  {meal.ingredients.map((ing, i) => {
                    const food = FOOD_MAP[ing.foodId];
                    if (!food) return null;
                    const kcal = (food.kcalPer100g * ing.grams) / 100;
                    const protein = (food.proteinPer100g * ing.grams) / 100;
                    const catColor =
                      CAT_COLORS[food.category as FoodCategory] ?? "#888";
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2.5 border-b border-[#111] last:border-0 hover:bg-[#0d0d0d] transition-colors"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: catColor }}
                        />
                        <span className="text-xs text-[#ccc] flex-1 truncate">
                          {food.name}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono shrink-0"
                          style={{
                            color: catColor,
                            borderColor: catColor + "44",
                            background: catColor + "11",
                          }}
                        >
                          {food.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#555] w-10 text-right shrink-0">
                          {ing.grams}g
                        </span>
                        <div className="text-right shrink-0 w-20">
                          <span className="text-[10px] font-mono text-[#888] block">
                            {Math.round(kcal)} kcal
                          </span>
                          <span className="text-[9px] font-mono text-[#ec4899]">
                            {Math.round(protein)}g P
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Footer ── */}
        <div className="px-5 py-3 border-t border-[#151515] shrink-0">
          <p
            className="text-[10px] font-mono text-[#2a2a2a] truncate"
            title={meal.id}
          >
            {meal.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
