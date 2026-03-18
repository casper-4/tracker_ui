"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Xmark, Heart, HeartSolid } from "iconoir-react";
import { MOCK_FOOD_DB, type NamedMeal, type MealSlotId } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const PANEL_WIDTH = 380;

const FOOD_MAP = Object.fromEntries(MOCK_FOOD_DB.map((f) => [f.id, f]));

type FoodCategory =
  | "protein"
  | "carbs"
  | "veggies"
  | "dairy"
  | "fats"
  | "other";

const CAT_COLORS: Record<FoodCategory, string> = {
  protein: "rgba(236,72,153,1)",
  carbs: "rgba(245,158,11,1)",
  veggies: "rgba(34,197,94,1)",
  dairy: "rgba(56,189,248,1)",
  fats: "rgba(168,85,247,1)",
  other: "rgba(136,136,136,1)",
};

const SLOT_COLORS: Record<MealSlotId, string> = {
  breakfast: "rgba(245,158,11,1)",
  lunch: "rgba(34,197,94,1)",
  snack: "rgba(56,189,248,1)",
  dinner: "rgba(168,85,247,1)",
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
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClose: () => void;
};

export default function MealDetailPanel({
  meal,
  slot,
  time,
  isFavorite = meal.isFavorite,
  onToggleFavorite = () => undefined,
  onClose,
}: Props) {
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
      transition={{ duration: 0.28, ease: [0.25, 0, 0, 1] }}
      className="h-full flex flex-col overflow-hidden shrink-0 pt-6 pb-6 lg:pt-10 lg:pb-10 xl:pt-16 xl:pb-16 pr-10 pl-2"
      style={{ minWidth: 0 }}
      role="complementary"
      aria-label={meal.name}
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden rounded-[14px]"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderTop: "1px solid rgba(255,255,255,0.16)",
          borderLeft: `2px solid ${slotColor}`,
          backdropFilter: "blur(24px)",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Colored glow blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: slotColor,
            filter: "blur(70px)",
            opacity: 0.12,
            transition: "background 0.3s ease",
          }}
        />
        {/* Top-edge shine */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            top: 0,
            left: "10%",
            right: "10%",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
          }}
        />
        {/* ── Header ── */}
        <div
          className="px-5 pt-5 pb-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Meal slot label */}
              <p
                className="text-[8px] uppercase mb-2"
                style={{
                  fontFamily: "var(--font-accent)",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: slotColor,
                }}
              >
                {t(lang, slotLabelKey)}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none">{meal.emoji}</span>
                <div>
                  <h2
                    className="text-[13px] font-bold leading-snug text-white"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {meal.name}
                  </h2>
                  <p
                    className="text-[10px] font-mono mt-0.5"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {time}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleFavorite}
                className="p-0.5 transition-all shrink-0"
                aria-label={
                  isFavorite
                    ? t(lang, "diet_favorite_remove")
                    : t(lang, "diet_favorite_add")
                }
              >
                {isFavorite ? (
                  <HeartSolid
                    width={15}
                    height={15}
                    className="transition-all text-[var(--color-danger)]"
                  />
                ) : (
                  <Heart
                    width={15}
                    height={15}
                    strokeWidth={2.0}
                    className="transition-all text-[var(--color-fg-subtle)] hover:text-[var(--color-danger)] [filter:drop-shadow(0_0_0_rgba(255,32,96,0.0))] hover:[filter:drop-shadow(0_0_4px_rgba(255,32,96,0.42))]"
                  />
                )}
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md transition-colors shrink-0 pt-0.5"
                style={{ color: "rgba(255,255,255,0.30)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.70)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.30)")
                }
                aria-label={t(lang, "diet_close_panel")}
              >
                <Xmark width={16} height={16} strokeWidth={2.0} />
              </button>
            </div>
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
            <div className="px-5 py-5 space-y-6">
              {/* Description */}
              <div>
                <SectionLabel>{t(lang, "diet_description")}</SectionLabel>
                <p
                  className="mt-2 text-[13px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  {meal.description || "—"}
                </p>
              </div>

              {/* Macro summary */}
              <div>
                <SectionLabel>{t(lang, "diet_macros")}</SectionLabel>
                <div
                  className="mt-2 rounded-[10px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.20) 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderTop: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="grid grid-cols-2 divide-x divide-[rgba(255,255,255,0.05)]">
                    <div className="flex flex-col items-center justify-center py-4 gap-0.5">
                      <span
                        className="text-[13px] font-bold font-mono tabular-nums"
                        style={{ color: "rgba(243,230,0,1)" }}
                      >
                        {Math.round(macros.kcal)}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-widest font-mono"
                        style={{ color: "rgba(255,255,255,0.30)" }}
                      >
                        kcal
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 gap-0.5">
                      <span
                        className="text-[13px] font-bold font-mono tabular-nums"
                        style={{ color: "rgba(236,72,153,1)" }}
                      >
                        {Math.round(macros.protein)}g
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-widest font-mono"
                        style={{ color: "rgba(255,255,255,0.30)" }}
                      >
                        {t(lang, "diet_protein")}
                      </span>
                    </div>
                  </div>
                  <div
                    className="px-4 py-3 space-y-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {[
                      {
                        label: t(lang, "diet_carbs"),
                        value: macros.carbs,
                        color: "rgba(245,158,11,1)",
                      },
                      {
                        label: t(lang, "diet_fat"),
                        value: macros.fat,
                        color: "rgba(168,85,247,1)",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between py-1"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                        }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-widest font-mono"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="font-mono text-[13px] font-bold"
                          style={{ color }}
                        >
                          {Math.round(value)}
                          <span
                            className="text-[10px] ml-0.5"
                            style={{ color: "rgba(255,255,255,0.30)" }}
                          >
                            g
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Macro % bar */}
              {macros.kcal > 0 && (
                <div>
                  <SectionLabel>{t(lang, "diet_distribution")}</SectionLabel>
                  <div className="mt-2 space-y-2">
                    <div
                      className="h-3 rounded-full overflow-hidden flex"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <div
                        style={{
                          width: `${((macros.protein * 4) / macros.kcal) * 100}%`,
                          background: "rgba(236,72,153,1)",
                        }}
                        className="h-full"
                      />
                      <div
                        style={{
                          width: `${((macros.carbs * 4) / macros.kcal) * 100}%`,
                          background: "rgba(245,158,11,1)",
                        }}
                        className="h-full"
                      />
                      <div
                        style={{
                          width: `${((macros.fat * 9) / macros.kcal) * 100}%`,
                          background: "rgba(168,85,247,1)",
                        }}
                        className="h-full"
                      />
                    </div>
                    <div className="flex gap-3">
                      {[
                        {
                          label: t(lang, "diet_protein"),
                          pct: (macros.protein * 4) / macros.kcal,
                          color: "rgba(236,72,153,1)",
                        },
                        {
                          label: t(lang, "diet_carbs"),
                          pct: (macros.carbs * 4) / macros.kcal,
                          color: "rgba(245,158,11,1)",
                        },
                        {
                          label: t(lang, "diet_fat"),
                          pct: (macros.fat * 9) / macros.kcal,
                          color: "rgba(168,85,247,1)",
                        },
                      ].map(({ label, pct, color }) => (
                        <span
                          key={label}
                          className="text-[10px] font-mono uppercase tracking-widest"
                          style={{ color }}
                        >
                          {Math.round(pct * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <SectionLabel>{t(lang, "diet_meal_ingredients")}</SectionLabel>
                <div
                  className="mt-2 rounded-[10px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.15) 100%)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {meal.ingredients.map((ing, i) => {
                    const food = FOOD_MAP[ing.foodId];
                    if (!food) return null;
                    const kcal = (food.kcalPer100g * ing.grams) / 100;
                    const protein = (food.proteinPer100g * ing.grams) / 100;
                    const catColor = CAT_COLORS[food.category as FoodCategory];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 transition-all"
                        style={{
                          borderBottom:
                            i < meal.ingredients.length - 1
                              ? "1px solid rgba(255,255,255,0.03)"
                              : "none",
                          background:
                            i % 2 === 0
                              ? "rgba(255,255,255,0.01)"
                              : "transparent",
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: catColor }}
                        />
                        <span
                          className="text-[13px] flex-1 truncate"
                          style={{ color: "rgba(255,255,255,0.70)" }}
                        >
                          {food.name}
                        </span>
                        <span
                          className="text-[8px] px-2 py-0.5 rounded-[5px] font-mono uppercase tracking-wider shrink-0"
                          style={{
                            fontFamily: "var(--font-accent)",
                            fontWeight: 700,
                            color: catColor,
                            background: catColor + "12",
                            border: `0.5px solid ${catColor}44`,
                          }}
                        >
                          {food.category}
                        </span>
                        <span
                          className="text-[10px] font-mono w-10 text-right shrink-0"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {ing.grams}g
                        </span>
                        <div className="text-right shrink-0 w-20">
                          <span
                            className="text-[10px] font-mono block"
                            style={{ color: "rgba(255,255,255,0.45)" }}
                          >
                            {Math.round(kcal)} kcal
                          </span>
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: "rgba(236,72,153,0.80)" }}
                          >
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
        <div
          className="px-5 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            className="text-[10px] font-mono truncate"
            style={{ color: "rgba(255,255,255,0.18)" }}
            title={meal.id}
          >
            {meal.id}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Internal helpers ──────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-mono uppercase tracking-[0.14em] font-semibold leading-none"
      style={{ color: "rgba(255,255,255,0.30)" }}
    >
      {children}
    </p>
  );
}
