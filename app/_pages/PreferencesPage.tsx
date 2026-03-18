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
                    <p className="mb-1 text-[var(--text-2xs)] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
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
              <p className="mb-1 text-[var(--text-2xs)] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                {t(lang, "prefs_language")}
              </p>
              <p className="text-[var(--text-sm)] text-[color:var(--color-fg-primary)]">
                {t(lang, "prefs_language_desc")}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 sm:mt-3 sm:justify-end">
            {([
              { id: "pl", labelKey: "prefs_language_pl" },
              { id: "en", labelKey: "prefs_language_en" },
            ] as const).map((option) => (
              <button
                key={option.id}
                onClick={() => setLang(option.id)}
                className={`rounded-[var(--btn-radius)] border px-3 py-1.5 text-[var(--text-2xs)] font-semibold uppercase tracking-[0.18em] transition-[transform,background-color,color,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[var(--state-btn-press-scale)] ${
                  lang === option.id
                    ? "border-[color:var(--color-warning)] bg-[color:var(--color-warning-subtle)] text-[color:var(--color-warning)]"
                    : "border-[color:var(--color-border-default)] text-[color:var(--color-fg-tertiary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--state-hover-bg)] hover:text-[color:var(--color-fg-primary)]"
                }`}
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
