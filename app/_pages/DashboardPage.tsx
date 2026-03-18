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
  Apple,
  Gym,
} from "iconoir-react";
import {
  MOCK_SKILLS,
  MOCK_WORKOUT_TODAY,
  MOCK_MEALS_TODAY,
  MOCK_DAILY_PLAN,
  MOCK_CATEGORY_PROGRESS,
  type PlanCategory,
} from "@/lib/mock";
import { roundSvg, radarNPolygon } from "@/app/components/radar";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL, TAB_TRAINING, TAB_DIET } from "@/app/constants";

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — aligned to design-system.md
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bgBase: "#000000",
  bgSurface: "#0A0A0A",
  bgElevated: "#141414",
  bgOverlay: "#1C1C1C",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(255,255,255,0.16)",
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.70)",
  textTertiary: "rgba(255,255,255,0.55)",
  textSupporting: "rgba(255,255,255,0.30)",
  textDisabled: "rgba(255,255,255,0.18)",
  accentGreen: "#00FF9F",
  accentYellow: "#F3E600",
  accentCyan: "#55EAD4",
  accentRed: "#FF2060",
  accentViolet: "#C840FF",
  // semantic shortcut used across this page
  accent: "#F3E600",
  accentGlow: "rgba(243,230,0,0.08)",
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
  const [hoveredNodeId, setHoveredNodeId] = useState<string | undefined>();

  // Neural map: one axis per unique node in today's plan — skill OR bare category, deduped
  type PlanNode = { id: string; name: string; color: string; value: number };
  const planNodes = useMemo((): PlanNode[] => {
    const seen = new Set<string>();
    const result: PlanNode[] = [];
    for (const entry of MOCK_DAILY_PLAN) {
      const nodeId = entry.skillId ?? entry.category;
      if (seen.has(nodeId)) continue;
      seen.add(nodeId);
      if (entry.skillId) {
        const skill = MOCK_SKILLS.find((s) => s.id === entry.skillId);
        if (skill)
          result.push({
            id: skill.id,
            name: skill.name.toUpperCase(),
            color: skill.color,
            value: skill.completionPercentage,
          });
      } else {
        const meta = PLAN_CATEGORY_META[entry.category];
        result.push({
          id: entry.category,
          name: t(lang, meta.tagKey),
          color: meta.color,
          value: MOCK_CATEGORY_PROGRESS[entry.category],
        });
      }
    }
    return result;
  }, [lang]);

  const mapRadar = useMemo(
    () => radarNPolygon(planNodes.map((n) => n.value)),
    [planNodes],
  );

  const navigateToSkill = (skillId: string) => {
    setSelectedSkillId?.(skillId);
    setActiveTab?.(TAB_SKILL_DETAIL);
  };

  const navigateToPlanNode = (nodeId: string) => {
    if (MOCK_SKILLS.some((s) => s.id === nodeId)) {
      navigateToSkill(nodeId);
    } else if (nodeId === "training") {
      setActiveTab?.(TAB_TRAINING);
    } else if (nodeId === "diet") {
      setActiveTab?.(TAB_DIET);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ───── TOP GRID ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* DAILY PLAN */}
        <Card className="lg:col-span-2">
          <SectionLabel>{t(lang, "dashboard_plan").toUpperCase()}</SectionLabel>
          <div className="flex flex-col gap-1 mt-5">
            {MOCK_DAILY_PLAN.map((entry) => (
              <PlanItem
                key={entry.id}
                time={entry.time}
                title={entry.title}
                category={entry.category}
                skillId={entry.skillId}
                active={entry.active}
                hoveredNodeId={hoveredNodeId}
                onSkillClick={navigateToSkill}
                onHoverNode={setHoveredNodeId}
              />
            ))}
          </div>
        </Card>

        {/* NEURAL MAP */}
        <Card>
          <SectionLabel>
            {t(lang, "dashboard_neural_map").toUpperCase()}
          </SectionLabel>
          <div className="flex-1 flex items-center justify-center relative py-4">
            <svg
              viewBox="0 0 100 100"
              className="w-full max-w-[210px] overflow-visible"
            >
              <defs>
                {/* Per-  node neon glow filter */}
                {planNodes.map((node) => (
                  <filter
                    key={node.id}
                    id={`neon-node-${node.id.replace(/\//g, "-")}`}
                    x="-120%"
                    y="-120%"
                    width="340%"
                    height="340%"
                  >
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
                {/* Broad soft glow for edge segments */}
                <filter
                  id="edge-glow"
                  x="-80%"
                  y="-80%"
                  width="260%"
                  height="260%"
                >
                  <feGaussianBlur stdDeviation="2.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid rings — neutral white, barely visible */}
              {[40, 26.7, 13.3].map((r, ri) => {
                const n = planNodes.length;
                const pts = Array.from({ length: n }, (_, i) => {
                  const angle = (i * 360) / n;
                  const rad = (angle * Math.PI) / 180;
                  return `${roundSvg(50 + r * Math.sin(rad))},${roundSvg(50 - r * Math.cos(rad))}`;
                });
                return (
                  <polygon
                    key={ri}
                    points={pts.join(" ")}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="0.4"
                  />
                );
              })}

              {/* Grid spokes — lightly tinted in node's color */}
              {planNodes.map((node, i) => {
                const n = planNodes.length;
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
                    stroke={node.color}
                    strokeWidth="0.4"
                    opacity={0.2}
                  />
                );
              })}

              {/* Node sectors — moderate color, not too heavy */}
              {planNodes.map((node, i) => {
                const n = planNodes.length;
                const next = (i + 1) % n;
                const thisPoint = mapRadar.pts[i];
                const nextPoint = mapRadar.pts[next];
                const isActive = hoveredNodeId === node.id;
                return (
                  <g
                    key={`sector-${node.id}`}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(undefined)}
                    onClick={() => navigateToPlanNode(node.id)}
                  >
                    <polygon
                      points={`50,50 ${thisPoint.x},${thisPoint.y} ${nextPoint.x},${nextPoint.y}`}
                      fill={isActive ? `${node.color}38` : `${node.color}18`}
                      stroke={node.color}
                      strokeWidth={isActive ? "0.8" : "0.5"}
                      strokeLinejoin="round"
                      opacity={isActive ? 1 : 0.8}
                      style={{ transition: "all 0.2s ease" }}
                    />
                  </g>
                );
              })}

              {/* Radar shape — colored edge segments */}
              {/* Soft glow behind each edge */}
              {planNodes.map((node, i) => {
                const next = (i + 1) % planNodes.length;
                const p1 = mapRadar.pts[i];
                const p2 = mapRadar.pts[next];
                return (
                  <line
                    key={`glow-${i}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={node.color}
                    strokeWidth="4"
                    opacity={0.14}
                    style={{ filter: "blur(3px)" }}
                    aria-hidden="true"
                  />
                );
              })}
              {/* Translucent fill */}
              <polygon
                points={mapRadar.points}
                fill="rgba(255,255,255,0.03)"
                stroke="none"
              />
              {/* Sharp colored edge + subtle white overlay for crispness */}
              {planNodes.map((node, i) => {
                const next = (i + 1) % planNodes.length;
                const p1 = mapRadar.pts[i];
                const p2 = mapRadar.pts[next];
                return (
                  <line
                    key={`edge-${i}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={node.color}
                    strokeWidth="1.0"
                    opacity={0.85}
                    filter={`url(#edge-glow)`}
                  />
                );
              })}

              {/* Vertex dots + node labels */}
              {planNodes.map((node, i) => {
                const n = planNodes.length;
                const deg = (i * 360) / n;
                const rad = (deg * Math.PI) / 180;
                const labelX = roundSvg(50 + 50 * Math.sin(rad));
                const labelY = roundSvg(50 - 50 * Math.cos(rad));
                const dot = mapRadar.pts[i];
                const isActive = hoveredNodeId === node.id;
                return (
                  <g
                    key={`dot-${node.id}`}
                    style={{ cursor: "pointer", outline: "none" }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(undefined)}
                    onClick={() => navigateToPlanNode(node.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigateToPlanNode(node.id);
                    }}
                  >
                    {/* Invisible wide hitbox */}
                    <circle cx={dot.x} cy={dot.y} r="7" fill="transparent" />
                    {/* Outer corona — only on hover */}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isActive ? "5.5" : "3.5"}
                      fill={node.color}
                      opacity={isActive ? 0.16 : 0.08}
                      style={{ transition: "all 0.2s ease" }}
                    />
                    {/* Inner glow ring */}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isActive ? "3.5" : "2.2"}
                      fill={node.color}
                      opacity={isActive ? 0.28 : 0.14}
                      style={{ transition: "all 0.2s ease" }}
                    />
                    {/* Sharp dot */}
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r={isActive ? "2.2" : "1.6"}
                      fill={node.color}
                      style={{ transition: "all 0.2s ease" }}
                      filter={`url(#neon-node-${node.id.replace(/\//g, "-")})`}
                    />
                    {/* Node label — word-wrapped: one word per line */}
                    <text
                      x={labelX}
                      y={labelY}
                      fill={isActive ? node.color : T.textSupporting}
                      style={{
                        fontSize: "5.5",
                        transition: "fill 0.2s ease",
                        userSelect: "none",
                      }}
                      fontFamily="var(--font-mono)"
                      textAnchor="middle"
                      letterSpacing="0.08em"
                    >
                      {node.name.split(" ").map((word, wi, arr) => (
                        <tspan
                          key={wi}
                          x={labelX}
                          dy={wi === 0 ? (arr.length > 1 ? "-2.3" : "0") : "5"}
                        >
                          {word}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </svg>
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
        <SectionLabel>{t(lang, "dashboard_diet").toUpperCase()}</SectionLabel>
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
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
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
      onMouseEnter={() => {
        if (isInteractive) setHovered(true);
      }}
      onMouseLeave={() => {
        setMousePos(null);
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => {
        if (isInteractive) setPressed(true);
      }}
      onMouseUp={() => {
        if (isInteractive) setPressed(false);
      }}
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

/* Category → accent color + i18n tag key + Iconoir icon */
const PLAN_CATEGORY_META: Record<
  PlanCategory,
  {
    color: string;
    tagKey:
      | "plan_cat_diet"
      | "plan_cat_music"
      | "plan_cat_training"
      | "plan_cat_gaming";
    Icon: React.ComponentType<{
      width?: number;
      height?: number;
      strokeWidth?: number;
      style?: React.CSSProperties;
    }>;
  }
> = {
  diet: { color: T.accentViolet, tagKey: "plan_cat_diet", Icon: Apple },
  music: { color: T.accentCyan, tagKey: "plan_cat_music", Icon: MusicNote },
  training: { color: T.accentGreen, tagKey: "plan_cat_training", Icon: Gym },
  gaming: { color: T.accentYellow, tagKey: "plan_cat_gaming", Icon: Gamepad },
};

/** Plan timeline item — sidebar-style hover: only icon + title light up, no bg change */
function PlanItem({
  time,
  title,
  category,
  skillId,
  active = false,
  hoveredNodeId,
  onSkillClick,
  onHoverNode,
}: {
  time: string;
  title: string;
  category: PlanCategory;
  skillId?: string;
  active?: boolean;
  hoveredNodeId?: string;
  onSkillClick?: (skillId: string) => void;
  onHoverNode?: (nodeId: string | undefined) => void;
}) {
  const { lang } = useLang();
  const meta = PLAN_CATEGORY_META[category];

  // Unique node id for this entry — matches the neural map axis
  const nodeId = skillId ?? category;
  const skill = skillId ? MOCK_SKILLS.find((s) => s.id === skillId) : undefined;
  const nodeColor = skill ? skill.color : meta.color;
  const tagLabel = skill ? skill.name.toUpperCase() : t(lang, meta.tagKey);

  // Sidebar style: lit when this entry’s node is hovered on the map, or the item is active
  const isLit = active || hoveredNodeId === nodeId;

  const handleTagClick = (e: React.MouseEvent) => {
    if (skillId && onSkillClick) {
      e.stopPropagation();
      onSkillClick(skillId);
    }
  };

  return (
    <div
      className="flex items-center justify-between py-2 px-3 transition-all duration-150"
      style={{
        borderRadius: "7px",
        // Active item keeps accent bar + subtle glow; hover has no bg (sidebar style)
        borderLeft: active ? `2px solid ${T.accent}` : "2px solid transparent",
        background: active ? T.accentGlow : "transparent",
      }}
      onMouseEnter={() => onHoverNode?.(nodeId)}
      onMouseLeave={() => onHoverNode?.(undefined)}
    >
      <div className="flex items-center gap-3">
        {/* Category icon — turns accent on lit (sidebar style) */}
        <meta.Icon
          width={13}
          height={13}
          strokeWidth={1.8}
          style={{
            color: isLit ? nodeColor : T.textSupporting,
            flexShrink: 0,
            transition: "color 0.15s ease",
          }}
        />
        <span
          className="text-[11px] font-mono tabular-nums w-10 shrink-0"
          style={{ color: active ? T.accent : T.textSupporting }}
        >
          {time}
        </span>
        {active && (
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: T.accent,
              boxShadow: `0 0 6px ${T.accent}80`,
            }}
          />
        )}
        <span
          className="text-[13px] font-sans transition-colors duration-150"
          style={{ color: isLit ? T.textPrimary : T.textSecondary }}
        >
          {title}
        </span>
      </div>
        {/* Tag — accent label style, no border, top-edge gloss, neon-flicker on hover
          Clickable when linked to a skill → navigates to skill detail */}
      <span
        className="tag-neon relative overflow-hidden inline-block shrink-0"
        style={{
          fontFamily: "var(--font-accent)",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "7px",
          color: nodeColor,
          background: `${nodeColor}1F`,
          cursor: skill ? "pointer" : "default",
        }}
        onClick={handleTagClick}
        role={skill ? "button" : undefined}
        tabIndex={skill ? 0 : undefined}
        onKeyDown={
          skill && onSkillClick
            ? (e) => {
                if (e.key === "Enter") onSkillClick(skillId!);
              }
            : undefined
        }
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
        {tagLabel}
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
        {today} <ArrowUp width={12} height={12} strokeWidth={2.2} />
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
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null,
  );
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
        transform: pressed
          ? "scale(0.994)"
          : hovered
            ? "translateY(-2px)"
            : "none",
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
