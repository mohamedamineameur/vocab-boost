import React from "react";
import { useTranslate } from "../contexts/TranslateContext";

interface ProgressChartProps {
  totalWords: number;
  learnedWords: number;
  inProgressWords: number;
}

const tr = {
  fr: {
    title: "Progression d'apprentissage",
    learned: "Appris",
    inProgress: "En cours",
    notStarted: "Non commencé",
  },
  en: {
    title: "Learning progress",
    learned: "Learned",
    inProgress: "In progress",
    notStarted: "Not started",
  },
  ar: {
    title: "تقدم التعلم",
    learned: "مكتمل",
    inProgress: "قيد التقدم",
    notStarted: "لم يبدأ",
  },
  es: {
    title: "Progreso de aprendizaje",
    learned: "Aprendido",
    inProgress: "En progreso",
    notStarted: "No iniciado",
  },
} as const;

export default function ProgressChart({
  totalWords,
  learnedWords,
  inProgressWords,
}: ProgressChartProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const notStarted = Math.max(0, totalWords - learnedWords - inProgressWords);
  
  const learnedPercent = totalWords > 0 ? (learnedWords / totalWords) * 100 : 0;
  const inProgressPercent = totalWords > 0 ? (inProgressWords / totalWords) * 100 : 0;
  const notStartedPercent = totalWords > 0 ? (notStarted / totalWords) * 100 : 0;

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-lg font-bold text-[#111827]">📈 {t("title")}</h2>

      {/* Barre de progression */}
      <div className="relative h-8 rounded-full bg-[#F3F4F6] overflow-hidden shadow-inner">
        <div
          className="absolute top-0 left-0 h-full bg-[#22C55E] transition-all duration-500"
          style={{ width: `${learnedPercent}%` }}
        />
        <div
          className="absolute top-0 h-full bg-[#3B82F6] transition-all duration-500"
          style={{ left: `${learnedPercent}%`, width: `${inProgressPercent}%` }}
        />
        <div
          className="absolute top-0 h-full bg-[#F3F4F6] transition-all duration-500"
          style={{ left: `${learnedPercent + inProgressPercent}%`, width: `${notStartedPercent}%` }}
        />

        {/* Pourcentage au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-[#111827] drop-shadow-sm">
            {Math.round(learnedPercent)}%
          </span>
        </div>
      </div>

      {/* Légende */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <div className="flex-1">
            <div className="font-semibold text-[#111827]">{learnedWords}</div>
            <div className="text-[#111827]/60">{t("learned")}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <div className="flex-1">
            <div className="font-semibold text-[#111827]">{inProgressWords}</div>
            <div className="text-[#111827]/60">{t("inProgress")}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F3F4F6] border border-[#111827]/20" />
          <div className="flex-1">
            <div className="font-semibold text-[#111827]">{notStarted}</div>
            <div className="text-[#111827]/60">{t("notStarted")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


