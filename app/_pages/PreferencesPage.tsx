"use client";

import { Globe } from "iconoir-react";
import { MOCK_USER } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

const GLASS_BG =
  "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%)";

export default function PreferencesPage() {
  const { lang, setLang } = useLang();
  const user = MOCK_USER;

  const languageOptions = [
    {
      id: "pl",
      labelKey: "prefs_language_pl",
      activeStyle: {
        backgroundImage:
          "linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.95) 50%, rgba(220,20,60,0.92) 50%, rgba(220,20,60,0.92) 100%)",
        borderColor: "rgba(220,20,60,0.9)",
      },
    },
    {
      id: "en",
      labelKey: "prefs_language_en",
      activeStyle: {
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 36'%3E%3Crect width='60' height='36' fill='%23012169'/%3E%3Cpolygon points='0,0 24,14 18,14 0,3' fill='white'/%3E%3Cpolygon points='60,0 36,14 42,14 60,3' fill='white'/%3E%3Cpolygon points='0,36 24,22 18,22 0,33' fill='white'/%3E%3Cpolygon points='60,36 36,22 42,22 60,33' fill='white'/%3E%3Cpolygon points='0,0 22,13 19,13 0,2' fill='%23C8102E'/%3E%3Cpolygon points='60,0 38,13 41,13 60,2' fill='%23C8102E'/%3E%3Cpolygon points='0,36 22,23 19,23 0,34' fill='%23C8102E'/%3E%3Cpolygon points='60,36 38,23 41,23 60,34' fill='%23C8102E'/%3E%3Crect y='14' width='60' height='8' fill='white'/%3E%3Crect x='26' width='8' height='36' fill='white'/%3E%3Crect y='15.5' width='60' height='5' fill='%23C8102E'/%3E%3Crect x='27.5' width='5' height='36' fill='%23C8102E'/%3E%3C/svg%3E\")",
        borderColor: "rgba(198,39,56,0.9)",
      },
    },
  ] as const;

  const joinedDate = new Date(user.joinedAt).toLocaleDateString(
    lang === "pl" ? "pl-PL" : "en-US",
    { year: "numeric", month: "short" },
  );

  const profileFields = [
    { key: "prefs_name", value: user.name },
    { key: "prefs_username", value: user.handle },
    { key: "prefs_streak", value: String(user.streakDays) },
    { key: "prefs_joined", value: joinedDate },
  ] as const;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <section>
        <div
          className="relative overflow-hidden rounded-[var(--card-radius)] border border-[color:var(--card-border)] p-6"
          style={{
            background: GLASS_BG,
            backdropFilter: "var(--card-backdrop)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-48px] top-[-54px] h-36 w-36 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-warning) 38%, transparent) 0%, transparent 72%)",
              filter: "blur(14px)",
              opacity: 0.38,
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-border-strong) 20%, var(--color-border-strong) 80%, transparent 100%)",
            }}
          />

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-warning)]/45 bg-[color:var(--color-warning-subtle)]">
              <span className="text-[var(--text-xl)] font-bold text-[color:var(--color-warning)]">
                {user.avatarInitials}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {profileFields.map((field) => (
                  <div key={field.key}>
                    <p
                      className="mb-1 text-[10px] font-mono uppercase leading-none tracking-[0.14em]"
                      style={{ color: "rgba(255, 255, 255, 0.3)" }}
                    >
                      {t(lang, field.key)}
                    </p>
                    <p className="truncate text-[var(--text-md)] font-semibold text-[color:var(--color-fg-primary)]">
                      {field.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div
          className="relative overflow-hidden rounded-[var(--card-radius)] border border-[color:var(--card-border)] px-5 py-4"
          style={{
            background: GLASS_BG,
            backdropFilter: "var(--card-backdrop)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, var(--color-border-strong) 22%, var(--color-border-strong) 78%, transparent 100%)",
            }}
          />

          <div className="flex items-center gap-3">
            <Globe
              width={16}
              height={16}
              strokeWidth={1.9}
              className="text-[color:var(--color-fg-subtle)]"
            />
            <div>
              <p
                className="mb-1 text-[10px] font-mono uppercase leading-none tracking-[0.14em]"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                {t(lang, "prefs_language")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 sm:mt-3 sm:justify-end">
            {languageOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setLang(option.id)}
                className={`rounded-[var(--btn-radius)] border px-3 py-1.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[0.18em] transition-[transform,background-color,color,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[var(--state-btn-press-scale)] ${
                  lang === option.id
                    ? "bg-cover bg-center text-[color:var(--color-fg-primary)]"
                    : "border-[color:var(--color-border-default)] text-[color:var(--color-fg-tertiary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--state-hover-bg)] hover:text-[color:var(--color-fg-primary)]"
                }`}
                style={lang === option.id ? option.activeStyle : undefined}
                aria-pressed={lang === option.id}
              >
                {t(lang, option.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
