import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

export interface ActivityItem {
  id: string;
  type: "quiz" | "word";
  word: string;
  quizType?: string;
  isCorrect?: boolean;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const tr = {
  fr: {
    title: "Activité récente",
    empty: "Aucune activité récente",
    quiz: "Quiz",
    learned: "Mot appris",
    correct: "Correct",
    incorrect: "Incorrect",
    ago: "il y a",
    minutes: "min",
    hours: "h",
    days: "j",
    now: "à l'instant",
  },
  en: {
    title: "Recent activity",
    empty: "No recent activity",
    quiz: "Quiz",
    learned: "Word learned",
    correct: "Correct",
    incorrect: "Incorrect",
    ago: "",
    minutes: "min",
    hours: "h",
    days: "d",
    now: "just now",
  },
  ar: {
    title: "النشاط الأخير",
    empty: "لا يوجد نشاط حديث",
    quiz: "اختبار",
    learned: "كلمة مكتسبة",
    correct: "صحيح",
    incorrect: "خطأ",
    ago: "منذ",
    minutes: "د",
    hours: "س",
    days: "ي",
    now: "الآن",
  },
  es: {
    title: "Actividad reciente",
    empty: "Sin actividad reciente",
    quiz: "Cuestionario",
    learned: "Palabra aprendida",
    correct: "Correcto",
    incorrect: "Incorrecto",
    ago: "hace",
    minutes: "min",
    hours: "h",
    days: "d",
    now: "ahora",
  },
} as const;

export default function RecentActivity({ activities }: RecentActivityProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("now");
    if (minutes < 60) return `${t("ago")} ${minutes}${t("minutes")}`;
    if (hours < 24) return `${t("ago")} ${hours}${t("hours")}`;
    return `${t("ago")} ${days}${t("days")}`;
  };

  if (activities.length === 0) {
    return (
      <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <h2 className="text-lg font-bold text-[#111827]">🕒 {t("title")}</h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] text-center">
          <Clock className="w-12 h-12 mx-auto text-[#111827]/20 mb-2" />
          <p className="text-sm text-[#111827]/60">{t("empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-lg font-bold text-[#111827]">🕒 {t("title")}</h2>

      <div className="space-y-2">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm hover:shadow-md transition flex items-center gap-3"
          >
            {/* Icône */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                activity.type === "quiz"
                  ? activity.isCorrect
                    ? "bg-green-100"
                    : "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {activity.type === "quiz" ? (
                activity.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[#111827] text-sm truncate">
                {activity.word}
              </div>
              <div className="text-xs text-[#111827]/60">
                {activity.type === "quiz"
                  ? `${t("quiz")} • ${activity.isCorrect ? t("correct") : t("incorrect")}`
                  : t("learned")}
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-[#111827]/40 shrink-0">
              {getTimeAgo(activity.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


