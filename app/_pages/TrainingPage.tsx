"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

export default function TrainingPage() {
  const { lang } = useLang();

  return (
    <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--color-border-default)] bg-[color:var(--color-bg-surface)] px-6 py-16">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-16 h-56 w-56 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-warning) 32%, transparent) 0%, transparent 68%)",
          filter: "blur(10px)",
        }}
        animate={{ scale: [0.96, 1.08, 0.96], opacity: [0.5, 0.85, 0.5] }}
        transition={{
          duration: 4.8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--color-data) 28%, transparent) 0%, transparent 70%)",
          filter: "blur(14px)",
        }}
        animate={{ scale: [1.08, 0.96, 1.08], opacity: [0.45, 0.75, 0.45] }}
        transition={{
          duration: 5.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="relative flex w-full max-w-2xl flex-col items-center gap-5 rounded-[var(--card-radius)] border border-[color:var(--card-border)] bg-[image:var(--card-bg)] px-8 py-12 text-center shadow-[var(--shadow-sm)]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[12%] top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--color-fg-primary) 26%, transparent), transparent)",
          }}
        />

        <p className="text-[var(--text-2xs)] uppercase tracking-[0.18em] text-[color:var(--color-warning)] text-glow-yellow">
          {t(lang, "training_title")}
        </p>

        <motion.h2
          className="text-[clamp(1.3rem,2.8vw,2rem)] font-bold uppercase tracking-[0.1em] text-[color:var(--color-fg-primary)]"
          animate={{
            textShadow: [
              "0 0 0px rgba(243,230,0,0)",
              "0 0 18px rgba(243,230,0,0.38)",
              "0 0 0px rgba(243,230,0,0)",
            ],
          }}
          transition={{
            duration: 2.6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {t(lang, "module_in_progress")}
        </motion.h2>

        <div className="flex items-center gap-2" aria-hidden>
          {(
            [
              "var(--color-success)",
              "var(--color-warning)",
              "var(--color-data)",
            ] as const
          ).map((dotColor, index) => (
            <motion.span
              key={dotColor}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: dotColor }}
              animate={{
                y: [0, -4, 0],
                opacity: [0.35, 1, 0.35],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 0.9,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.14,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
