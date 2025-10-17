import { Flame, Calendar } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
}

const tr = {
  fr: {
    title: "Série d'apprentissage",
    current: "Série actuelle",
    longest: "Record personnel",
    days: "jours",
    keepItUp: "Continue comme ça !",
    comeBack: "Revenez demain pour continuer votre série !",
    warning: "Attention ! Revenez aujourd'hui pour ne pas perdre votre série.",
  },
  en: {
    title: "Learning streak",
    current: "Current streak",
    longest: "Personal best",
    days: "days",
    keepItUp: "Keep it up!",
    comeBack: "Come back tomorrow to continue your streak!",
    warning: "Warning! Come back today to keep your streak alive.",
  },
  ar: {
    title: "سلسلة التعلم",
    current: "السلسلة الحالية",
    longest: "أفضل إنجاز",
    days: "أيام",
    keepItUp: "استمر!",
    comeBack: "عد غدًا لمواصلة سلسلتك!",
    warning: "تحذير! عد اليوم للحفاظ على سلسلتك.",
  },
  es: {
    title: "Racha de aprendizaje",
    current: "Racha actual",
    longest: "Récord personal",
    days: "días",
    keepItUp: "¡Sigue así!",
    comeBack: "¡Vuelve mañana para continuar tu racha!",
    warning: "¡Atención! Vuelve hoy para no perder tu racha.",
  },
} as const;

export default function StreakCounter({
  currentStreak,
  longestStreak,
  lastActivityDate,
}: StreakCounterProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  // Vérifier si c'est aujourd'hui
  const isToday = lastActivityDate
    ? new Date(lastActivityDate).toDateString() === new Date().toDateString()
    : false;

  // Vérifier si c'était hier
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = lastActivityDate
    ? new Date(lastActivityDate).toDateString() === yesterday.toDateString()
    : false;

  const getMotivationMessage = () => {
    if (currentStreak === 0) return t("comeBack");
    if (isToday) return t("keepItUp");
    if (wasYesterday) return t("warning");
    return t("comeBack");
  };

  const getFlameColor = () => {
    if (currentStreak >= 30) return "text-red-600";
    if (currentStreak >= 14) return "text-orange-600";
    if (currentStreak >= 7) return "text-orange-500";
    return "text-orange-400";
  };

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-lg font-bold text-[#111827]">🔥 {t("title")}</h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 shadow-md">
        {/* Streak principal */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Flame className={`w-20 h-20 ${getFlameColor()} drop-shadow-lg`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white drop-shadow-md mt-2">
                {currentStreak}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl bg-white dark:bg-gray-800/80 backdrop-blur">
            <div className="text-2xl font-bold text-[#111827]">{currentStreak}</div>
            <div className="text-xs text-[#111827]/60">{t("current")}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-white dark:bg-gray-800/80 backdrop-blur">
            <div className="text-2xl font-bold text-[#111827]">{longestStreak}</div>
            <div className="text-xs text-[#111827]/60">{t("longest")}</div>
          </div>
        </div>

        {/* Message de motivation */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-gray-800/60 backdrop-blur">
          <Calendar className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <p className="text-sm text-[#111827] leading-tight">
            {getMotivationMessage()}
          </p>
        </div>
      </div>

      {/* Calendrier visuel de la semaine (optionnel) */}
      <div className="grid grid-cols-7 gap-1">
        {[...Array(7)].map((_, i) => {
          const dayDate = new Date();
          dayDate.setDate(dayDate.getDate() - (6 - i));
          const isActive = currentStreak > (6 - i);
          
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg transition ${
                isActive
                  ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-md"
                  : "bg-[#F3F4F6] border border-[#111827]/10"
              }`}
              title={dayDate.toLocaleDateString()}
            />
          );
        })}
      </div>
    </div>
  );
}


