"use client";

import {
  useMemo,
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  MusicNote,
  Gamepad,
  Microphone,
  CompactDisc,
  PenTablet,
  ArrowUp,
} from "iconoir-react";
import { MOCK_SKILLS, MOCK_WORKOUT_TODAY, MOCK_MEALS_TODAY } from "@/lib/mock";
import { roundSvg, radarNPolygon } from "@/app/components/radar";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL } from "@/app/constants";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — aligned to design-system.md
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bgBase:         "#000000",
  bgSurface:      "#0A0A0A",
  bgElevated:     "#141414",
  bgOverlay:      "#1C1C1C",
  borderSubtle:   "rgba(255,255,255,0.06)",
  borderDefault:  "rgba(255,255,255,0.09)",
  borderStrong:   "rgba(255,255,255,0.16)",
  textPrimary:    "#FFFFFF",
  textSecondary:  "rgba(255,255,255,0.70)",
  textTertiary:   "rgba(255,255,255,0.55)",
  textSupporting: "rgba(255,255,255,0.30)",
  textDisabled:   "rgba(255,255,255,0.18)",
  accentGreen:    "#00FF9F",
  accentYellow:   "#F3E600",
  accentCyan:     "#55EAD4",
  accentRed:      "#FF2060",
  accentViolet:   "#C840FF",
  // semantic shortcut used across this page
  accent:         "#F3E600",
  accentGlow:     "rgba(243,230,0,0.08)",
} as const;

/* ── glass card background ── */
const GLASS_BG =
  "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)";

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
            {/* TODO: [DATA] Plan items should come from mock.ts */}
            <PlanItem
              time="07:00"
              title="Śniadanie"
              tag="DIETA"
              tagColor={T.accentViolet}
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="09:00"
              title="CS2 — Aim training (30 min)"
              tag="CS2"
              tagColor={T.accentYellow}
              skillId="skill/cs2"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="10:00"
              title="Gitara — Hammer-on practice (15 min)"
              tag="MUZYKA"
              tagColor={T.accentViolet}
              skillId="skill/guitar"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="12:30"
              title="Lunch"
              tag="DIETA"
              tagColor={T.accentViolet}
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="16:00"
              title="Siłownia — Push A"
              tag="TRENING"
              tagColor={T.accentGreen}
              skillId={undefined}
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="19:00"
              title="Produkcja — EQ session"
              tag="MUZYKA"
              tagColor={T.accentViolet}
              active
              skillId="skill/production"
              hoveredSkillId={hoveredSkillId}
            />
            <PlanItem
              time="21:00"
              title="Kolacja"
              tag="DIETA"
              tagColor={T.accentViolet}
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
                      fill={isActive ? T.textPrimary : T.textSupporting}
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
            {/* TODO: [DATA] Training skill should come from mock.ts */}
            <LegendItem color={T.accentGreen} label="Trening" value="84%" />
          </div>
        </Card>
      </div>

      {/* ───── TODAY'S TRAINING ───── */}
      <Card className="mb-8">
        <div className="flex justify-between items-baseline mb-6">
          <SectionLabel>
            {t(lang, "dashboard_training").toUpperCase()}
          </SectionLabel>
          <span
            className="text-sm font-sans font-semibold"
            style={{ color: T.accentGreen }}
          >
            {MOCK_WORKOUT_TODAY.name}
          </span>
        </div>

        {/* Column headers */}
        <div
          className="grid grid-cols-12 text-[10px] uppercase tracking-widest pb-3 mb-4"
          style={{
            color: T.textSupporting,
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
          <span style={{ color: T.textSupporting }} className="mr-5">
            TOTAL
          </span>
          <span style={{ color: T.accentViolet }} className="mr-5">
            {MOCK_MEALS_TODAY.reduce((s, m) => s + m.protein, 0)}g P
          </span>
          <span style={{ color: T.accentYellow }} className="mr-5">
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
          {MOCK_SKILLS.map((s, idx) => {
            const aspects = s.aspects;
            const radarCurrent =
              aspects.length > 0
                ? radarNPolygon(aspects.map((a) => a.completionPercentage))
                : null;
            const radarGoal =
              aspects.length > 0 ? radarNPolygon(aspects.map(() => 100)) : null;
            // Iconoir icons — one per skill type
            const Icon =
              s.id === "skill/guitar"
                ? MusicNote
                : s.id === "skill/vocals"
                  ? Microphone
                  : s.id === "skill/production"
                    ? CompactDisc
                    : s.id === "skill/songwriting"
                      ? PenTablet
                      : Gamepad; // default: gaming / cs2
            const goToSkillDetail = () => {
              setSelectedSkillId?.(s.id);
              setActiveTab?.(TAB_SKILL_DETAIL);
            };
            return (
              <Reveal key={s.id} delay={idx * 80}>
                <SkillCard
                  skill={s}
                  aspects={aspects}
                  radarCurrent={radarCurrent}
                  radarGoal={radarGoal}
                  Icon={Icon}
                  onClick={goToSkillDetail}
                />
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Glass card — design-system pattern:
 * gradient bg, bright top border, shine line overlay, mouse-follow light.
 * Pass role/tabIndex/onClick to make it interactive (enables hover lift + click scale).
 */
function Card({
  children,
  className = "",
  role,
  tabIndex,
  onClick,
  onKeyDown,
}: {
  children: React.ReactNode;
  className?: string;
  role?: string;
  tabIndex?: number;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const isInteractive = !!onClick;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`flex flex-col relative overflow-hidden ${isInteractive ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: GLASS_BG,
        border: `1px solid ${T.borderDefault}`,
        borderTop: `1px solid ${T.borderStrong}`,
        borderRadius: "14px",
        backdropFilter: "blur(24px)",
        padding: "1.25rem",
        transform: isInteractive
          ? pressed
            ? "scale(0.994)"
            : hovered
              ? "translateY(-2px)"
              : "none"
          : undefined,
        transition: "transform 0.2s ease",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { if (isInteractive) setHovered(true); }}
      onMouseLeave={() => {
        setMousePos(null);
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => { if (isInteractive) setPressed(true); }}
      onMouseUp={() => { if (isInteractive) setPressed(false); }}
    >
      {/* Top-edge shine line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Mouse-follow light */}
      {mousePos && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.025), transparent 70%)`,
            pointerEvents: "none",
            borderRadius: "14px",
          }}
        />
      )}
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
      style={{ color: color ?? T.textSupporting }}
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
          style={{ color: active ? T.accent : T.textSupporting }}
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
      {/* Tag — Orbitron font, no border, top-edge gloss, neon-flicker on hover */}
      <span
        className="tag-neon relative overflow-hidden inline-block"
        style={{
          fontFamily: "var(--font-accent)",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "7px",
          color: tagColor,
          background: `${tagColor}1F`,
        }}
      >
        {/* Top-edge gloss */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
            pointerEvents: "none",
            borderRadius: "7px 7px 0 0",
          }}
        />
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
    <div
      className="grid grid-cols-12 items-center text-[13px] rounded-md px-2 py-1 transition-colors duration-150"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <div className="col-span-4 font-sans" style={{ color: T.textPrimary }}>
        {name}
      </div>
      <div
        className="col-span-2 text-center font-mono tabular-nums"
        style={{ color: T.textTertiary }}
      >
        {sets}
      </div>
      <div
        className="col-span-2 text-center font-mono tabular-nums"
        style={{ color: T.textTertiary }}
      >
        {reps}
      </div>
      <div
        className="col-span-2 text-right font-mono tabular-nums"
        style={{ color: T.textSupporting }}
      >
        {last}
      </div>
      <div
        className="col-span-2 text-right font-mono tabular-nums font-medium flex items-center justify-end gap-1"
        style={{ color: T.accentGreen }}
      >
        {today}{" "}
        <ArrowUp width={12} height={12} strokeWidth={2.2} />
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
        background: T.bgElevated,
        borderRadius: "7px",
        borderLeft: `2px solid ${T.borderSubtle}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = `${T.accentViolet}50`;
        e.currentTarget.style.background = T.bgOverlay;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = T.borderSubtle;
        e.currentTarget.style.background = T.bgElevated;
      }}
    >
      <span
        className="text-[13px] font-sans"
        style={{ color: T.textSecondary }}
      >
        {name}
      </span>
      <div className="flex items-center gap-5 text-[11px] font-mono tabular-nums">
        <span style={{ color: T.accentViolet }}>{p}</span>
        <span style={{ color: T.accentYellow }}>{w}</span>
        <span style={{ color: T.textTertiary }}>{kcal} kcal</span>
      </div>
    </div>
  );
}

/** Aspect completion bar — design-system progress-wrap pattern */
function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="progress-wrap flex items-center gap-3 text-[10px] uppercase tracking-wider"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="font-mono w-1/3 truncate"
        style={{ color: T.textSupporting }}
      >
        {label}
      </span>
      <div
        className="flex-1 relative"
        style={{
          height: hovered ? "5px" : "3px",
          background: T.bgOverlay,
          borderRadius: "2px",
          transition: "height 0.18s ease",
        }}
      >
        <div
          className="progress-fill h-full"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}28, ${color})`,
            borderRadius: "2px",
          }}
        />
        {/* Endpoint dot */}
        <div
          className="progress-dot"
          style={{
            position: "absolute",
            left: `${value}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: hovered ? "9px" : "6px",
            height: hovered ? "9px" : "6px",
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}90`,
            transition: "width 0.18s ease, height 0.18s ease",
          }}
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

/** Skill card — glass card, hover lift, click scale, colored glow blob, mouse-follow light */
function SkillCard({
  skill: s,
  aspects,
  radarCurrent,
  radarGoal,
  Icon,
  onClick,
}: {
  skill: (typeof MOCK_SKILLS)[number];
  aspects: (typeof MOCK_SKILLS)[number]["aspects"];
  radarCurrent: ReturnType<typeof radarNPolygon> | null;
  radarGoal: ReturnType<typeof radarNPolygon> | null;
  Icon: React.ComponentType<{
    width?: number;
    height?: number;
    strokeWidth?: number;
    style?: React.CSSProperties;
  }>;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex flex-col cursor-pointer relative overflow-hidden"
      style={{
        background: GLASS_BG,
        border: `1px solid ${T.borderDefault}`,
        borderTop: `1px solid ${T.borderStrong}`,
        borderRadius: "14px",
        backdropFilter: "blur(24px)",
        padding: "1.25rem",
        transform: pressed ? "scale(0.994)" : hovered ? "translateY(-2px)" : "none",
        transition: "transform 0.2s ease",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
        setMousePos(null);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {/* Top-edge shine line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 50%, transparent)",
          pointerEvents: "none",
        }}
      />
      {/* Colored glow blob behind content */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: s.color,
          filter: "blur(70px)",
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      {/* Mouse-follow light */}
      {mousePos && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.025), transparent 70%)`,
            pointerEvents: "none",
            borderRadius: "14px",
          }}
        />
      )}

      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Icon
            width={18}
            height={18}
            strokeWidth={1.8}
            style={{ color: s.color }}
          />
          <h3
            className="text-[15px] font-sans font-bold leading-none"
            style={{ color: T.textPrimary }}
          >
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

      {/* Progress — design-system gradient fill */}
      <div
        className="w-full h-[3px] mb-5 rounded-sm overflow-hidden"
        style={{ background: T.bgOverlay }}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${s.completionPercentage}%`,
            background: `linear-gradient(90deg, ${s.color}28, ${s.color})`,
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
              <circle key={i} cx={p.x} cy={p.y} r="1.3" fill={s.color} />
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
                  fill={T.textSupporting}
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
}

/** Scroll-reveal wrapper — IntersectionObserver, opacity + translateY, stagger via delay prop */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
