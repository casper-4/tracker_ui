"use client";

import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  Music,
  Crosshair,
  Mic,
  Disc,
  PenTool,
  ArrowUp,
} from "lucide-react";
import { MOCK_SKILLS, MOCK_WORKOUT_TODAY, MOCK_MEALS_TODAY } from "@/lib/mock";
import { roundSvg, radarNPolygon } from "@/app/components/radar";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";
import { TAB_SKILL_DETAIL } from "@/app/constants";

type DashboardPageProps = {
  setSelectedSkillId?: Dispatch<SetStateAction<string | undefined>>;
  setActiveTab?: Dispatch<SetStateAction<string>>;
};

export default function DashboardPage({ setSelectedSkillId, setActiveTab }: DashboardPageProps) {
  const { lang } = useLang();
  const mainPlanRadar = useMemo(
    () => radarNPolygon(MOCK_SKILLS.map((s) => s.completionPercentage)),
    []
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* DAILY PLAN */}
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex flex-col">
          <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-6">
            {t(lang, "dashboard_plan").toUpperCase()}
          </h3>
          <div className="flex flex-col gap-4 flex-1">
            <PlanItem time="07:00" title="Sniadanie" tag="DIETA" tagColor="#d946ef" />
            <PlanItem time="09:00" title="CS2 -- Aim training (30 min)" tag="CS2" tagColor="#f97316" />
            <PlanItem time="10:00" title="Gitara -- Hammer-on practice (15 min)" tag="MUZYKA" tagColor="#a855f7" />
            <PlanItem time="12:30" title="Lunch" tag="DIETA" tagColor="#d946ef" />
            <PlanItem time="16:00" title="Silownia -- Push A" tag="TRENING" tagColor="#22c55e" />
            <PlanItem time="19:00" title="Produkcja -- EQ session" tag="MUZYKA" tagColor="#a855f7" active />
            <PlanItem time="21:00" title="Kolacja" tag="DIETA" tagColor="#d946ef" />
          </div>
        </div>

        {/* NEURAL MAP */}
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex flex-col relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-[#facc15]"></div>
            <h3 className="text-[10px] text-[#666] uppercase tracking-widest">
              {t(lang, "dashboard_neural_map").toUpperCase()}
            </h3>
          </div>
          <p className="text-[10px] text-[#facc15] uppercase tracking-widest mb-8">
            {t(lang, "dashboard_today").toUpperCase()}
          </p>

          <div className="flex-1 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-full max-w-[220px] overflow-visible">
              {[40, 26.7, 13.3].map((r, ri) => {
                const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
                  const rad = (deg * Math.PI) / 180;
                  return `${roundSvg(50 + r * Math.sin(rad))},${roundSvg(50 - r * Math.cos(rad))}`;
                });
                return (
                  <polygon key={ri} points={pts.join(" ")} fill="none" stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="2,2" />
                );
              })}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const x = roundSvg(50 + 40 * Math.sin(rad));
                const y = roundSvg(50 - 40 * Math.cos(rad));
                return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="2,2" />;
              })}
              <polygon points={mainPlanRadar.points} fill="rgba(250, 204, 21, 0.1)" stroke="#facc15" strokeWidth="1.5" />
              {mainPlanRadar.pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#facc15" />
              ))}
              {MOCK_SKILLS.map((s, i) => {
                const deg = (i * 360) / MOCK_SKILLS.length;
                const rad = (deg * Math.PI) / 180;
                const dist = 46;
                const x = roundSvg(50 + dist * Math.sin(rad));
                const y = roundSvg(50 - dist * Math.cos(rad));
                return (
                  <g
                    key={i}
                    style={{ cursor: "pointer" }}
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
                    role="button"
                    tabIndex={0}
                  >
                    <text x={x} y={y} fill={s.color} fontSize="3.2" textAnchor="middle" className="uppercase tracking-widest">
                      {s.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-6 flex flex-col gap-1.5">
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
        </div>

        {/* TODAY'S TRAINING */}
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex flex-col">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-[10px] text-[#666] uppercase tracking-widest">
              {t(lang, "dashboard_training").toUpperCase()}
            </h3>
            <span className="text-sm text-[#22c55e] font-bold">{MOCK_WORKOUT_TODAY.name}</span>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-12 text-[10px] text-[#666] uppercase tracking-widest border-b border-[#1f1f1f] pb-3 mb-4">
              <div className="col-span-4">EXERCISE</div>
              <div className="col-span-2 text-center">SETS</div>
              <div className="col-span-2 text-center">REPS</div>
              <div className="col-span-2 text-right">LAST</div>
              <div className="col-span-2 text-right">TODAY</div>
            </div>

            <div className="flex flex-col gap-4">
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
          </div>
        </div>
      </div>

      {/* MEAL PLAN */}
      <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 mb-10">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-6">
          {t(lang, "dashboard_diet").toUpperCase()}
        </h3>
        <div className="flex flex-col gap-3">
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
        <div className="mt-4 text-right text-xs">
          <span className="text-[#666] mr-4">Total:</span>
          <span className="text-[#a855f7] mr-4">{MOCK_MEALS_TODAY.reduce((s, m) => s + m.protein, 0)}g P</span>
          <span className="text-[#f97316] mr-4">{MOCK_MEALS_TODAY.reduce((s, m) => s + m.carbs, 0)}g W</span>
          <span className="text-[#00f0ff]">{MOCK_MEALS_TODAY.reduce((s, m) => s + m.kcal, 0)} kcal</span>
        </div>
      </div>

      {/* SKILLS cards */}
      <div className="mb-10">
        <h3 className="text-[10px] text-[#facc15] uppercase tracking-widest mb-4">
          {t(lang, "dashboard_skills")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_SKILLS.map((s) => {
            const aspects = s.aspects;
            const radarCurrent = aspects.length > 0 ? radarNPolygon(aspects.map((a) => a.completionPercentage)) : null;
            const radarGoal = aspects.length > 0 ? radarNPolygon(aspects.map(() => 100)) : null;
            const Icon =
              s.id === "skill/guitar" ? Music
              : s.id === "skill/vocals" ? Mic
              : s.id === "skill/production" ? Disc
              : s.id === "skill/songwriting" ? PenTool
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
                className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex flex-col cursor-pointer hover:border-[#333] hover:bg-[#0d0d0d] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: s.color }} />
                    <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  </div>
                  <span className="font-mono font-bold" style={{ color: s.color }}>{s.completionPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-[#1f1f1f] rounded-full mb-5">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.completionPercentage}%`, backgroundColor: s.color }} />
                </div>
                {radarCurrent && radarGoal && (
                  <div className="flex justify-center mb-6">
                    <svg viewBox="0 0 100 100" className="w-full max-w-[200px] overflow-visible">
                      {[40, 26.7, 13.3].map((maxR, ri) => {
                        const n = aspects.length;
                        const pts = Array.from({ length: n }, (_, i) => {
                          const angle = (i * 360) / n;
                          const rad = (angle * Math.PI) / 180;
                          return `${roundSvg(50 + maxR * Math.sin(rad))},${roundSvg(50 - maxR * Math.cos(rad))}`;
                        });
                        return <polygon key={ri} points={pts.join(" ")} fill="none" stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="2,2" />;
                      })}
                      {aspects.map((_, i) => {
                        const n = aspects.length;
                        const angle = (i * 360) / n;
                        const rad = (angle * Math.PI) / 180;
                        const x = roundSvg(50 + 40 * Math.sin(rad));
                        const y = roundSvg(50 - 40 * Math.cos(rad));
                        return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#1f1f1f" strokeWidth="0.5" strokeDasharray="2,2" />;
                      })}
                      <polygon points={radarGoal.points} fill="none" stroke={s.color} strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
                      <polygon points={radarCurrent.points} fill={`${s.color}1a`} stroke={s.color} strokeWidth="1.5" />
                      {radarCurrent.pts.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={s.color} />
                      ))}
                      {aspects.map((a, i) => {
                        const n = aspects.length;
                        const angle = (i * 360) / n;
                        const rad = (angle * Math.PI) / 180;
                        const dist = 46;
                        const x = roundSvg(50 + dist * Math.sin(rad));
                        const y = roundSvg(50 - dist * Math.cos(rad));
                        return <text key={i} x={x} y={y} fill="#888" fontSize="3" textAnchor="middle" className="uppercase tracking-widest">{a.name}</text>;
                      })}
                    </svg>
                  </div>
                )}
                <div className="flex flex-col gap-3 mt-auto">
                  {aspects.map((a) => (
                    <div key={a.name} className="space-y-1">
                      <ProgressBar label={a.name} value={a.completionPercentage} color={s.color} />
                    </div>
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

function PlanItem({
  time,
  title,
  tag,
  tagColor,
  active = false,
}: {
  time: string;
  title: string;
  tag: string;
  tagColor: string;
  active?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-2 border transition-all ${active ? "border-[#facc15] bg-[#facc15]/5" : "border-transparent hover:border-[#1f1f1f]"}`}>
      <div className="flex items-center gap-4">
        <span className={`text-xs ${active ? "text-[#facc15]" : "text-[#666]"}`}>{time}</span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></div>}
        <span className={`text-sm ${active ? "text-white" : "text-[#888]"}`}>{title}</span>
      </div>
      <span className="text-[10px] px-2 py-0.5 border uppercase tracking-widest" style={{ color: tagColor, borderColor: `${tagColor}40` }}>{tag}</span>
    </div>
  );
}

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
      className={`flex items-center justify-between text-xs ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></div>
        <span className="text-[#888]">{label}</span>
      </div>
      <span style={{ color }}>{value}</span>
    </div>
  );
}

function WorkoutRow({ name, sets, reps, last, today }: { name: string; sets: string; reps: string; last: string; today: string }) {
  return (
    <div className="grid grid-cols-12 items-center text-sm">
      <div className="col-span-4 text-[#ccc] pr-2">{name}</div>
      <div className="col-span-2 text-center text-[#666]">{sets}</div>
      <div className="col-span-2 text-center text-[#666]">{reps}</div>
      <div className="col-span-2 text-right text-[#666]">{last}</div>
      <div className="col-span-2 text-right text-[#22c55e] flex items-center justify-end gap-1 font-medium">
        {today} <ArrowUp className="w-3 h-3" />
      </div>
    </div>
  );
}

function FoodRow({ name, p, w, kcal }: { name: string; p: string; w: string; kcal: string }) {
  return (
    <div className="flex items-center justify-between p-4 border border-[#1f1f1f] bg-[#050505]">
      <span className="text-sm text-[#888]">{name}</span>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-[#a855f7]">{p}</span>
        <span className="text-[#f97316]">{w}</span>
        <span className="text-[#666]">{kcal} kcal</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
      <span className="text-[#888] w-1/3 truncate pr-2">{label}</span>
      <div className="flex-1 h-1 bg-[#1f1f1f] rounded-full mx-4">
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span style={{ color }} className="w-8 text-right">{value}%</span>
    </div>
  );
}
