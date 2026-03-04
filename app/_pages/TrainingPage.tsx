"use client";

import { MOCK_WORKOUT_TODAY } from "@/lib/mock";
import { useLang } from "@/lib/language-context";
import { t } from "@/lib/i18n";

export default function TrainingPage() {
  const { lang } = useLang();
  // TODO: [UI] design this view from scratch
  return (
    <div className="max-w-6xl mx-auto">
      <p className="text-[#facc15] text-[10px] uppercase tracking-widest">{t(lang, "training_title")}</p>
      <pre className="text-[#444] text-xs mt-4">{JSON.stringify(MOCK_WORKOUT_TODAY, null, 2)}</pre>
    </div>
  );
}
