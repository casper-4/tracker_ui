"use client";

import { useState } from "react";
import { Bell, Calendar, CheckSquare, Clock, Globe, Zap } from "lucide-react";
import { MOCK_USER, MOCK_USER_SETTINGS } from "@/lib/mock";
import type { UserSettings } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

// ─── Setting row (toggle) ────────────────────────────────────────────────────

type SettingRowProps = {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onToggle: VoidFunction;
};

function SettingToggleRow({ icon, label, value, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        {icon}
        <p className="text-sm text-[#e0e0e0]">{label}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-5 border transition-colors relative shrink-0 ${
          value
            ? "border-[#facc15] bg-[#facc15]/10"
            : "border-[#1f1f1f] bg-transparent"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3.5 h-3.5 transition-all ${
            value
              ? "left-[calc(100%-1.125rem)] bg-[#facc15]"
              : "left-0.5 bg-[#444]"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
  const { lang, setLang } = useLang();
  const user = MOCK_USER;
  // TODO: [DATA] persist settings changes to storage
  const [settings, setSettings] = useState<UserSettings>(MOCK_USER_SETTINGS);

  const toggle = (key: keyof UserSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const joinedDate = new Date(user.joinedAt).toLocaleDateString(
    lang === "pl" ? "pl-PL" : "en-US",
    { year: "numeric", month: "short" },
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* ── User profile ────────────────────────────────────────────────── */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-[#666] mb-4">
          // {t(lang, "prefs_profile")}
        </p>
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-6 flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full border border-[#facc15]/40 bg-[#facc15]/10 flex items-center justify-center shrink-0">
            <span className="text-[#facc15] font-mono font-bold text-xl">
              {user.avatarInitials}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {user.name}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-[#555]">
                {user.handle}
              </span>
            </div>
            <p className="text-sm text-[#888] mt-1">{user.bio}</p>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-4 gap-4 max-w-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">
                  LVL
                </p>
                <p className="text-lg font-mono font-bold text-[#facc15]">
                  {user.level}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">
                  XP
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {user.totalXP.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">
                  {t(lang, "prefs_streak")}
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {user.streakDays}d
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#555] mb-1">
                  {t(lang, "prefs_joined")}
                </p>
                <p className="text-sm font-mono text-[#666]">{joinedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Language ────────────────────────────────────────────────────── */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-[#666] mb-4">
          // {t(lang, "prefs_language")}
        </p>
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-[#666]" />
            <div>
              <p className="text-sm text-[#e0e0e0]">
                {t(lang, "prefs_language")}
              </p>
              <p className="text-[10px] text-[#555] mt-0.5">
                {t(lang, "prefs_language_desc")}
              </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {(["pl", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                  lang === l
                    ? "border-[#facc15] text-[#facc15] bg-[#facc15]/5"
                    : "border-[#1f1f1f] text-[#555] hover:text-[#888] hover:border-[#333]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── App settings ────────────────────────────────────────────────── */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-[#666] mb-4">
          // {t(lang, "prefs_settings")}
        </p>
        <div className="border border-[#1f1f1f] bg-[#0a0a0a] divide-y divide-[#1f1f1f]">
          <SettingToggleRow
            icon={<Bell className="w-4 h-4 text-[#666]" />}
            label={t(lang, "prefs_notifications")}
            value={settings.notificationsEnabled}
            onToggle={() => toggle("notificationsEnabled")}
          />

          <SettingToggleRow
            icon={<Zap className="w-4 h-4 text-[#666]" />}
            label={t(lang, "prefs_auto_advance")}
            value={settings.autoAdvanceQuests}
            onToggle={() => toggle("autoAdvanceQuests")}
          />

          <SettingToggleRow
            icon={<CheckSquare className="w-4 h-4 text-[#666]" />}
            label={t(lang, "prefs_show_completed")}
            value={settings.showCompletedQuests}
            onToggle={() => toggle("showCompletedQuests")}
          />

          {/* Week starts on */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#666]" />
              <p className="text-sm text-[#e0e0e0]">
                {t(lang, "prefs_week_start")}
              </p>
            </div>
            <div className="flex gap-1">
              {(["monday", "sunday"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() =>
                    setSettings((p) => ({ ...p, weekStartsOn: d }))
                  }
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-widest border transition-colors ${
                    settings.weekStartsOn === d
                      ? "border-[#facc15] text-[#facc15] bg-[#facc15]/5"
                      : "border-[#1f1f1f] text-[#555] hover:text-[#888] hover:border-[#333]"
                  }`}
                >
                  {t(
                    lang,
                    d === "monday"
                      ? "prefs_week_start_monday"
                      : "prefs_week_start_sunday",
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Daily goal hours */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#666]" />
              <p className="text-sm text-[#e0e0e0]">
                {t(lang, "prefs_daily_goal")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSettings((p) => ({
                    ...p,
                    dailyGoalHours: Math.max(1, p.dailyGoalHours - 1),
                  }))
                }
                className="w-6 h-6 border border-[#1f1f1f] text-[#666] hover:text-white hover:border-[#333] flex items-center justify-center text-sm font-mono transition-colors"
              >
                −
              </button>
              <span className="text-sm font-mono text-[#facc15] w-5 text-center">
                {settings.dailyGoalHours}
              </span>
              <button
                onClick={() =>
                  setSettings((p) => ({
                    ...p,
                    dailyGoalHours: Math.min(12, p.dailyGoalHours + 1),
                  }))
                }
                className="w-6 h-6 border border-[#1f1f1f] text-[#666] hover:text-white hover:border-[#333] flex items-center justify-center text-sm font-mono transition-colors"
              >
                +
              </button>
              <span className="text-[10px] text-[#555] uppercase tracking-widest ml-1">
                h
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
