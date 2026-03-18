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
      />{" "}
    </div>
  );
}
