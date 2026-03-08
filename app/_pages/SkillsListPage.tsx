"use client";

import {
  useRef,
  useState,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  MusicNote,
  Microphone,
  CompactDisc,
  PenTablet,
  Gamepad,
  NavArrowRight,
  Plus,
} from "iconoir-react";
import { MOCK_SKILLS } from "@/lib/mock";
import type { Skill } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL } from "@/app/constants";

/* ── design tokens ── */
const T = {
  bgOverlay:      "#1C1C1C",
  borderDefault:  "rgba(255,255,255,0.09)",
  borderStrong:   "rgba(255,255,255,0.16)",
  textPrimary:    "#FFFFFF",
  textSecondary:  "rgba(255,255,255,0.70)",
  textTertiary:   "rgba(255,255,255,0.55)",
  textSupporting: "rgba(255,255,255,0.30)",
};

const GLASS_BG =
  "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)";

/* ── icon map (Iconoir only) ── */
type IconComponent = React.ComponentType<{
  width?: number;
  height?: number;
  strokeWidth?: number;
  style?: React.CSSProperties;
}>;

const SKILL_ICONS: Record<string, IconComponent> = {
  "skill/guitar":      MusicNote,
  "skill/vocals":      Microphone,
  "skill/production":  CompactDisc,
  "skill/songwriting": PenTablet,
  "skill/cs2":         Gamepad,
};

type Props = {
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
  setActiveTab?: Dispatch<SetStateAction<string>>;
};

export default function SkillsListPage({ setSelectedSkillId, setActiveTab }: Props) {
  const { lang } = useLang();

  return (
    <div className="max-w-6xl mx-auto">
      {MOCK_SKILLS.length === 0 ? (
        <p className="text-[13px]" style={{ color: T.textTertiary }}>
          {t(lang, "no_skills")}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_SKILLS.map((skill, i) => {
            const Icon = SKILL_ICONS[skill.id] ?? Gamepad;
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                Icon={Icon}
                lang={lang}
                index={i}
                onSelect={() => {
                  setSelectedSkillId?.(skill.id);
                  setActiveTab?.(TAB_SKILL_DETAIL);
                }}
              />
            );
          })}
          <AddSkillCard lang={lang} index={MOCK_SKILLS.length} />
        </div>
      )}
    </div>
  );
}

function SkillCard({
  skill,
  Icon,
  lang,
  index,
  onSelect,
}: {
  skill: Skill;
  Icon: IconComponent;
  lang: "pl" | "en";
  index: number;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  /* scroll reveal via IntersectionObserver */
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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const {
    name,
    description,
    completionPercentage,
    targetPercentage,
    nextQuest,
    color,
  } = skill;

  /* staggered reveal; fast transition after reveal */
  const revealTransition = `opacity 0.5s ease ${index * 70}ms, transform 0.5s ease ${index * 70}ms`;
  const interactiveTransition = "transform 0.2s ease";

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className="flex flex-col cursor-pointer relative overflow-hidden"
      style={{
        background: GLASS_BG,
        border: `1px solid ${T.borderDefault}`,
        borderTop: `1px solid ${T.borderStrong}`,
        borderRadius: "14px",
        backdropFilter: "blur(24px)",
        padding: "1.25rem",
        opacity: visible ? 1 : 0,
        transform: pressed
          ? "scale(0.994)"
          : hovered
            ? "translateY(-2px)"
            : visible
              ? "translateY(0)"
              : "translateY(18px)",
        transition: visible ? interactiveTransition : revealTransition,
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

      {/* Colored glow blob */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-40px",
          right: "-40px",
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          background: color,
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

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <Icon width={18} height={18} strokeWidth={1.8} style={{ color }} />
          <h3
            className="text-[15px] font-bold leading-none"
            style={{ color: T.textPrimary }}
          >
            {name}
          </h3>
        </div>
        <span
          className="text-sm font-mono font-bold tabular-nums"
          style={{ color }}
        >
          {completionPercentage}%
        </span>
      </div>

      {/* ── Description ── */}
      <p className="text-[12px] mb-4 relative z-10" style={{ color: T.textTertiary }}>
        {description}
      </p>

      {/* ── Progress bar (design-system .progress-wrap) ── */}
      <div className="progress-wrap relative z-10 mb-1">
        <div
          className="progress-track w-full rounded-sm overflow-visible relative"
          style={{ background: T.bgOverlay }}
        >
          <div
            className="progress-fill h-full transition-all"
            style={{
              width: `${completionPercentage}%`,
              background: `linear-gradient(90deg, ${color}28, ${color})`,
            }}
          />
        </div>

        {/* Endpoint dot */}
        <div className="relative" style={{ height: 0 }}>
          <div
            className="progress-dot absolute rounded-full"
            style={{
              left: `${completionPercentage}%`,
              top: "-3px",
              transform: "translate(-50%, -50%)",
              background: color,
              boxShadow: `0 0 6px ${color}90`,
            }}
          />
        </div>

        {/* Target marker */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: `${targetPercentage}%`,
            top: "-4px",
            width: "1px",
            height: "10px",
            background: "rgba(255,255,255,0.25)",
          }}
        />
      </div>

      {/* Target label */}
      <div className="flex justify-end mb-5 relative z-10">
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: T.textSupporting }}
        >
          {t(lang, "skill_progress")} → {targetPercentage}%
        </span>
      </div>

      {/* ── Next quest ── */}
      <div
        className="relative z-10 pt-3 flex items-start justify-between gap-2"
        style={{ borderTop: `1px solid ${T.borderDefault}` }}
      >
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.14em] mb-1"
            style={{ color: T.textSupporting }}
          >
            {t(lang, "skill_next_quest")}
          </p>
          <p className="text-[13px]" style={{ color: T.textSecondary }}>
            {nextQuest}
          </p>
        </div>
        <NavArrowRight
          width={16}
          height={16}
          strokeWidth={1.8}
          style={{ color: T.textSupporting, flexShrink: 0, marginTop: "2px" }}
        />
      </div>
    </div>
  );
}

function AddSkillCard({
  lang,
  index,
}: {
  lang: "pl" | "en";
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

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
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const revealTransition = `opacity 0.5s ease ${index * 70}ms, transform 0.5s ease ${index * 70}ms`;
  const interactiveTransition = "transform 0.2s ease";

  const handleClick = () => {
    // TODO: [UI] open "create new skill" form / modal
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="flex flex-col items-center justify-center cursor-pointer relative overflow-hidden min-h-[200px]"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.2) 100%)",
        border: "1px dashed rgba(255,255,255,0.12)",
        borderRadius: "14px",
        backdropFilter: "blur(24px)",
        padding: "1.25rem",
        opacity: visible ? 1 : 0,
        transform: pressed
          ? "scale(0.994)"
          : hovered
            ? "translateY(-2px)"
            : visible
              ? "translateY(0)"
              : "translateY(18px)",
        transition: visible ? interactiveTransition : revealTransition,
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
      {/* Mouse-follow light */}
      {mousePos && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.02), transparent 70%)`,
            pointerEvents: "none",
            borderRadius: "14px",
          }}
        />
      )}

      <div className="flex flex-col items-center gap-3 relative z-10">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px dashed rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus width={20} height={20} strokeWidth={1.8} style={{ color: "rgba(255,255,255,0.3)" }} />
        </div>
        <span
          className="text-[13px] text-center"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {t(lang, "skill_add_new")}
        </span>
      </div>
    </div>
  );
}
