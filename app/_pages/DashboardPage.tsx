"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Music, Crosshair, Mic, Disc, PenTool, ArrowUp } from "lucide-react";
import { MOCK_SKILLS, MOCK_WORKOUT_TODAY, MOCK_MEALS_TODAY } from "@/lib/mock";
import { roundSvg, radarNPolygon } from "@/app/components/radar";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL } from "@/app/constants";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS V2 — "Command Center" style
   (inline until we centralize into a shared file)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bgRoot: "#050505",
  bgCard: "#0a0a0a",
  bgElevated: "#0f0f0f",
  bgInset: "#080808",
  borderSubtle: "#141414",
  borderDefault: "#1f1f1f",
  borderHover: "#222222",
  textPrimary: "#d4d4d4",
  textSecondary: "#888888",
  textMuted: "#555555",
  textDisabled: "#333333",
  accent: "#facc15",
  accentGlow: "rgba(250,204,21,0.08)",
  accentCyan: "#00f0ff",
} as const;

type DashboardPageProps = {
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
  setActiveTab?: Dispatch<SetStateAction<string>>;
};

export default function DashboardPage({
  setSelectedSkillId,
  setActiveTab,
}: DashboardPageProps) {
  const { lang } = useLang();
  const [hoveredSkillId, setHoveredSkillId] = useState<string | undefined>();
  const mainPlanRadar = useMemo(
    () => radarNPolygon(MOCK_SKILLS.map((s) => s.completionPercentage)),
    [],
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* ───── TOP GRID ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* DAILY PLAN */}
        <Card className="lg:col-span-2">
          <SectionLabel color={T.accent}>
            {t(lang, "dashboard_plan").toUpperCase()}
          </SectionLabel>
          <div className="flex flex-col gap-2 mt-5">
            <PlanItem
              time="07:00"
              title="Śniadanie"
              tag="DIETA"
              tagColor="#d946ef"
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="09:00"
              title="CS2 — Aim training (30 min)"
              tag="CS2"
              tagColor="#f97316"
              skillId="skill/cs2"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="10:00"
              title="Gitara — Hammer-on practice (15 min)"
              tag="MUZYKA"
              tagColor="#a855f7"
              skillId="skill/guitar"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="12:30"
              title="Lunch"
              tag="DIETA"
              tagColor="#d946ef"
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="16:00"
              title="Siłownia — Push A"
              tag="TRENING"
              tagColor="#22c55e"
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="19:00"
              title="Produkcja — EQ session"
              tag="MUZYKA"
              tagColor="#a855f7"
              active
              skillId="skill/production"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="21:00"
              title="Kolacja"
              tag="DIETA"
              tagColor="#d946ef"
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
          </div>
        </Card>

        {/* NEURAL MAP */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: T.accent,
                boxShadow: `0 0 6px ${T.accent}60`,
              }}
            />
            <SectionLabel>
              {t(lang, "dashboard_neural_map").toUpperCase()}
            </SectionLabel>
          </div>

          <div className="flex-1 flex items-center justify-center relative py-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full max-w-[260px] overflow-visible"
            >
              {/* Grid rings */}
              {[40, 26.7, 13.3].map((r, ri) => {
                const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  return `${roundSvg(50 + r * Math.sin(rad))},${roundSvg(50 - r * Math.cos(rad))}`;
                });
                return (
                  <polygon
                    key={ri}
                    points={pts.join(" ")}
                    fill="none"
                    stroke={T.borderSubtle}
                    strokeWidth="0.4"
                  />
                );
              })}
              {/* Grid spokes */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = roundSvg(50 + 40 * Math.sin(rad));
                const y = roundSvg(50 - 40 * Math.cos(rad));
                return (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke={T.borderSubtle}
                    strokeWidth="0.4"
                  />
                );
              })}
              {/* Skill sectors — softer fill, cleaner stroke */}
              {MOCK_SKILLS.map((s, i) => {
                const next = (i + 1) % MOCK_SKILLS.length;
                const thisPoint = mainPlanRadar.pts[i];
                const nextPoint = mainPlanRadar.pts[next];
                const isActive = hoveredSkillId === s.id;
                return (
                  <polygon
                    key={`sector-${i}`}
                    points={`50,50 ${thisPoint.x},${thisPoint.y} ${nextPoint.x},${nextPoint.y}`}
                    fill={isActive ? `${s.color}30` : `${s.color}12`}
                    stroke={s.color}
                    strokeWidth={isActive ? "1" : "0.5"}
                    strokeLinejoin="round"
                    style={{ transition: "all 0.2s ease" }}
                  />
                );
              })}
              {/* Labels + dots */}
              {MOCK_SKILLS.map((s, i) => {
                const deg = (i * 360) / MOCK_SKILLS.length;
                const rad = (deg * Math.PI) / 180;
                const dist = 46;
                const labelX = roundSvg(50 + dist * Math.sin(rad));
                const labelY = roundSvg(50 - dist * Math.cos(rad));
                const dot = mainPlanRadar.pts[i];
                const isActive = hoveredSkillId === s.id;
                return (
                  <g
                    key={i}
                    style={{ cursor: "pointer", outline: "none" }}
                    onClick={() => {
                      setSelectedSkillId?.(s.id);
                      setActiveTab?.(TAB_SKILL_DETAIL);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSelectedSkillId?.(s.id);
                        setActiveTab?.(TAB_SKILL_DETAIL);
                      }
                    }}
                    onMouseEnter={() => setHoveredSkillId(s.id)}
                    onMouseLeave={() => setHoveredSkillId(undefined)}
                    role="button"
                    tabIndex={0}
                  >
                    <circle cx={dot.x} cy={dot.y} r="5" fill="transparent" />
                    {isActive && (
                      <circle
                        cx={dot.x}
                        cy={dot.y}
                        r="4"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    )}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isActive ? "2.2" : "1.4"}
                      fill={s.color}
                      style={{ transition: "all 0.2s ease" }}
                    />
                    <text
                      x={labelX}
                      y={labelY}
                      fill={isActive ? T.textPrimary : T.textMuted}
                      fontSize="3.2"
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      letterSpacing="0.08em"
                      style={{
                        transition: "fill 0.2s ease",
                        textTransform: "uppercase",
                      }}
                    >
                      {s.name.length > 8 ? (
                        <>
                          <tspan x={labelX} dy={-2}>
                            {s.name.split(" ")[0]}
                          </tspan>
                          {s.name.split(" ").length > 1 && (
                            <tspan x={labelX} dy="4">
                              {s.name.split(" ").slice(1).join(" ")}
                            </tspan>
                          )}
                        </>
                      ) : (
                        s.name
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-col gap-1.5">
            {MOCK_SKILLS.map((s) => (
              <LegendItem
                key={s.id}
                color={s.color}
                label={s.name}
                value={`${s.completionPercentage}%`}
                onClick={() => {
                  setSelectedSkillId?.(s.id);
                  setActiveTab?.(TAB_SKILL_DETAIL);
                }}
              />
            ))}
            <LegendItem color="#22c55e" label="Trening" value="84%" />
          </div>
        </Card>
      </div>

      {/* ───── TODAY'S TRAINING ───── */}
      <Card className="mb-8">
        <div className="flex justify-between items-baseline mb-6">
          <SectionLabel>
            {t(lang, "dashboard_training").toUpperCase()}
          </SectionLabel>
          <span className="text-sm font-sans font-semibold text-[#22c55e]">
            {MOCK_WORKOUT_TODAY.name}
          </span>
        </div>

        {/* Column headers */}
        <div
          className="grid grid-cols-12 text-[10px] uppercase tracking-widest pb-3 mb-4"
          style={{
            color: T.textMuted,
            borderBottom: `1px solid ${T.borderSubtle}`,
          }}
        >
          <div className="col-span-4">Exercise</div>
          <div className="col-span-2 text-center">Sets</div>
          <div className="col-span-2 text-center">Reps</div>
          <div className="col-span-2 text-right">Last</div>
          <div className="col-span-2 text-right">Today</div>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_WORKOUT_TODAY.exercises.map((ex) => (
            <WorkoutRow
              key={ex.name}
              name={ex.name}
              sets={String(ex.sets)}
              reps={String(ex.reps)}
              last={ex.lastWeight}
              today={ex.todayWeight}
            />
          ))}
        </div>
      </Card>

      {/* ───── MEAL PLAN ───── */}
      <Card className="mb-10">
        <SectionLabel color={T.accent}>
          {t(lang, "dashboard_diet").toUpperCase()}
        </SectionLabel>
        <div className="flex flex-col gap-2 mt-5">
          {MOCK_MEALS_TODAY.map((meal) => (
            <FoodRow
              key={meal.name}
              name={meal.name}
              p={`${meal.protein}g`}
              w={`${meal.carbs}g`}
              kcal={String(meal.kcal)}
            />
          ))}
        </div>
        <div
          className="mt-5 pt-4 text-right text-xs font-mono"
          style={{ borderTop: `1px solid ${T.borderSubtle}` }}
        >
          <span style={{ color: T.textMuted }} className="mr-5">
            TOTAL
          </span>
          <span className="text-[#a855f7] mr-5">
            {MOCK_MEALS_TODAY.reduce((s, m) => s + m.protein, 0)}g P
          </span>
          <span className="text-[#f97316] mr-5">
            {MOCK_MEALS_TODAY.reduce((s, m) => s + m.carbs, 0)}g W
          </span>
          <span style={{ color: T.accentCyan }}>
            {MOCK_MEALS_TODAY.reduce((s, m) => s + m.kcal, 0)} kcal
          </span>
        </div>
      </Card>

      {/* ───── SKILLS CARDS ───── */}
      <div className="mb-10">
        <SectionLabel color={T.accent} className="mb-5">
          {t(lang, "dashboard_skills")}
        </SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MOCK_SKILLS.map((s) => {
            const aspects = s.aspects;
            const radarCurrent =
              aspects.length > 0
                ? radarNPolygon(aspects.map((a) => a.completionPercentage))
                : null;
            const radarGoal =
              aspects.length > 0 ? radarNPolygon(aspects.map(() => 100)) : null;
            const Icon =
              s.id === "skill/guitar"
                ? Music
                : s.id === "skill/vocals"
                  ? Mic
                  : s.id === "skill/production"
                    ? Disc
                    : s.id === "skill/songwriting"
                      ? PenTool
                      : Crosshair;
            const goToSkillDetail = () => {
              setSelectedSkillId?.(s.id);
              setActiveTab?.(TAB_SKILL_DETAIL);
            };
            return (
              <div
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={goToSkillDetail}
                onKeyDown={(e) => e.key === "Enter" && goToSkillDetail()}
                className="group flex flex-col cursor-pointer transition-all duration-200"
                style={{
                  background: T.bgCard,
                  border: `1px solid ${T.borderSubtle}`,
                  padding: "1.25rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.borderHover;
                  e.currentTarget.style.background = T.bgElevated;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.borderSubtle;
                  e.currentTarget.style.background = T.bgCard;
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className="w-[18px] h-[18px]"
                      style={{ color: s.color }}
                    />
                    <h3 className="text-[15px] font-sans font-bold text-white leading-none">
                      {s.name}
                    </h3>
                  </div>
                  <span
                    className="text-sm font-mono font-bold tabular-nums"
                    style={{ color: s.color }}
                  >
                    {s.completionPercentage}%
                  </span>
                </div>

                {/* Progress bar — sharp, no rounding */}
                <div
                  className="w-full h-[5px] mb-5"
                  style={{ background: T.bgInset }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${s.completionPercentage}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>

                {/* Mini radar */}
                {radarCurrent && radarGoal && (
                  <div className="flex justify-center mb-5">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full max-w-[180px] overflow-visible"
                    >
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
                            stroke={T.borderSubtle}
                            strokeWidth="0.4"
                          />
                        );
                      })}
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
                            stroke={T.borderSubtle}
                            strokeWidth="0.4"
                          />
                        );
                      })}
                      <polygon
                        points={radarGoal.points}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="0.6"
                        strokeDasharray="3,2"
                        opacity={0.35}
                      />
                      <polygon
                        points={radarCurrent.points}
                        fill={`${s.color}14`}
                        stroke={s.color}
                        strokeWidth="1"
                      />
                      {radarCurrent.pts.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r="1.3"
                          fill={s.color}
                        />
                      ))}
                      {aspects.map((a, i) => {
                        const n = aspects.length;
                        const angle = (i * 360) / n;
                        const rad = (angle * Math.PI) / 180;
                        const dist = 46;
                        const x = roundSvg(50 + dist * Math.sin(rad));
                        const y = roundSvg(50 - dist * Math.cos(rad));
                        return (
                          <text
                            key={i}
                            x={x}
                            y={y}
                            fill={T.textMuted}
                            fontSize="2.8"
                            fontFamily="var(--font-mono)"
                            textAnchor="middle"
                            letterSpacing="0.06em"
                            style={{ textTransform: "uppercase" }}
                          >
                            {a.name}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* Aspect progress bars */}
                <div className="flex flex-col gap-2.5 mt-auto">
                  {aspects.map((a) => (
                    <ProgressBar
                      key={a.name}
                      label={a.name}
                      value={a.completionPercentage}
                      color={s.color}
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

/* ═══════════════════════════════════════════════════════════════
   SHARED PRIMITIVES — consistent building blocks
   ═══════════════════════════════════════════════════════════════ */

/** Standard card wrapper */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        background: T.bgCard,
        border: `1px solid ${T.borderSubtle}`,
        padding: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}

/** Section / category label — mono, uppercase, tiny */
function SectionLabel({
  children,
  color,
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <h3
      className={`text-[10px] font-mono uppercase tracking-[0.14em] leading-none ${className}`}
      style={{ color: color ?? T.textMuted }}
    >
      {children}
    </h3>
  );
}

/** Plan timeline item */
function PlanItem({
  time,
  title,
  tag,
  tagColor,
  active = false,
  skillId,
  hoveredSkillId,
}: {
  time: string;
  title: string;
  tag: string;
  tagColor: string;
  active?: boolean;
  skillId?: string;
  hoveredSkillId?: string;
}) {
  const isHovered = skillId && hoveredSkillId === skillId;
  const isHighlighted = isHovered || active;
  return (
    <div
      className="flex items-center justify-between py-2 px-3 transition-all duration-150"
      style={{
        borderLeft: isHighlighted
          ? `2px solid ${active ? T.accent : tagColor}`
          : "2px solid transparent",
        background: isHighlighted ? T.accentGlow : "transparent",
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="text-[11px] font-mono tabular-nums"
          style={{ color: active ? T.accent : T.textMuted }}
        >
          {time}
        </span>
        {active && (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: T.accent,
              boxShadow: `0 0 6px ${T.accent}80`,
            }}
          />
        )}
        <span
          className="text-[13px] font-sans"
          style={{ color: active ? T.textPrimary : T.textSecondary }}
        >
          {title}
        </span>
      </div>
      <span
        className="text-[9px] font-mono px-2 py-0.5 uppercase tracking-wider"
        style={{
          color: tagColor,
          border: `1px solid ${tagColor}30`,
          background: `${tagColor}08`,
        }}
      >
        {tag}
      </span>
    </div>
  );
}

/** Radar / skill legend row */
function LegendItem({
  color,
  label,
  value,
  onClick,
}: {
  color: string;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={`flex items-center justify-between text-[11px] py-0.5 ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="font-sans" style={{ color: T.textSecondary }}>
          {label}
        </span>
      </div>
      <span className="font-mono font-medium tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

/** Workout table row */
function WorkoutRow({
  name,
  sets,
  reps,
  last,
  today,
}: {
  name: string;
  sets: string;
  reps: string;
  last: string;
  today: string;
}) {
  return (
    <div className="grid grid-cols-12 items-center text-[13px]">
      <div className="col-span-4 font-sans" style={{ color: T.textPrimary }}>
        {name}
      </div>
      <div
        className="col-span-2 text-center font-mono tabular-nums"
        style={{ color: T.textMuted }}
      >
        {sets}
      </div>
      <div
        className="col-span-2 text-center font-mono tabular-nums"
        style={{ color: T.textMuted }}
      >
        {reps}
      </div>
      <div
        className="col-span-2 text-right font-mono tabular-nums"
        style={{ color: T.textMuted }}
      >
        {last}
      </div>
      <div className="col-span-2 text-right font-mono tabular-nums font-medium text-[#22c55e] flex items-center justify-end gap-1">
        {today} <ArrowUp className="w-3 h-3" />
      </div>
    </div>
  );
}

/** Meal row */
function FoodRow({
  name,
  p,
  w,
  kcal,
}: {
  name: string;
  p: string;
  w: string;
  kcal: string;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 px-4 transition-colors duration-150"
      style={{
        background: T.bgInset,
        borderLeft: `2px solid ${T.borderSubtle}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = "#d946ef40";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = T.borderSubtle;
      }}
    >
      <span
        className="text-[13px] font-sans"
        style={{ color: T.textSecondary }}
      >
        {name}
      </span>
      <div className="flex items-center gap-5 text-[11px] font-mono tabular-nums">
        <span className="text-[#a855f7]">{p}</span>
        <span className="text-[#f97316]">{w}</span>
        <span style={{ color: T.textMuted }}>{kcal} kcal</span>
      </div>
    </div>
  );
}

/** Aspect completion bar */
function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider">
      <span className="font-mono w-1/3 truncate" style={{ color: T.textMuted }}>
        {label}
      </span>
      <div className="flex-1 h-[3px]" style={{ background: T.bgInset }}>
        <div
          className="h-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="font-mono font-medium w-8 text-right tabular-nums"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}
