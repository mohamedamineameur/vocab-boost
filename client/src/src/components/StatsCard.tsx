import { TrendingUp, Target, Award, CheckCircle2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

interface StatsData {
  totalWords: number;
  learnedWords: number;
  totalQuizzes: number;
  correctAnswers: number;
  successRate: number;
  streak: number;
}

interface StatsCardProps {
  stats: StatsData;
}

const tr = {
  fr: {
    totalWords: "Mots au total",
    learned: "Mots appris",
    successRate: "Taux de réussite",
    streak: "Série actuelle",
    quizzes: "Quiz complétés",
    correct: "Réponses correctes",
    days: "jours",
  },
  en: {
    totalWords: "Total words",
    learned: "Words learned",
    successRate: "Success rate",
    streak: "Current streak",
    quizzes: "Quizzes completed",
    correct: "Correct answers",
    days: "days",
  },
  ar: {
    totalWords: "إجمالي الكلمات",
    learned: "الكلمات المتعلمة",
    successRate: "معدل النجاح",
    streak: "السلسلة الحالية",
    quizzes: "الاختبارات المكتملة",
    correct: "إجابات صحيحة",
    days: "أيام",
  },
  es: {
    totalWords: "Palabras totales",
    learned: "Palabras aprendidas",
    successRate: "Tasa de éxito",
    streak: "Racha actual",
    quizzes: "Cuestionarios completados",
    correct: "Respuestas correctas",
    days: "días",
  },
} as const;

export default function StatsCard({ stats }: StatsCardProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const statItems = [
    {
      icon: Target,
      label: t("totalWords"),
      value: stats.totalWords,
      color: "text-[#3B82F6]",
      bgColor: "bg-blue-100",
    },
    {
      icon: CheckCircle2,
      label: t("learned"),
      value: stats.learnedWords,
      color: "text-[#22C55E]",
      bgColor: "bg-green-100",
    },
    {
      icon: TrendingUp,
      label: t("successRate"),
      value: `${stats.successRate}%`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Award,
      label: t("streak"),
      value: `${stats.streak} ${t("days")}`,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-lg font-bold text-[#111827] mb-4">📊 Statistiques</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-[#F3F4F6] shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-bold text-[#111827] leading-none mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-[#111827]/60 leading-tight">
                  {item.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Détails supplémentaires */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3B82F6]/5 to-[#22C55E]/5 border border-[#3B82F6]/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#111827]/70">{t("quizzes")}</span>
          <span className="font-bold text-[#111827]">{stats.totalQuizzes}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-[#111827]/70">{t("correct")}</span>
          <span className="font-bold text-[#22C55E]">{stats.correctAnswers}</span>
        </div>
      </div>
    </div>
  );
}


