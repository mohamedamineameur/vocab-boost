import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Play,
  Trophy,
} from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

export interface WordStats {
  wordId: string;
  english: string;
  translation?: string;
  isLearned: boolean;
  totalAttempts: number;
  correctAttempts: number;
  successRate: number;
  lastAttempt?: Date;
  quizTypes: string[];
}

interface WordDetailCardProps {
  word: WordStats;
  onStartQuiz?: () => void;
}

const tr = {
  fr: {
    learned: "Maîtrisé",
    inProgress: "En cours",
    notStarted: "Non commencé",
    attempts: "Tentatives",
    success: "Réussite",
    lastAttempt: "Dernière tentative",
    startQuiz: "Commencer",
    continueQuiz: "Continuer",
    never: "Jamais",
    quizTypes: "Types de quiz",
  },
  en: {
    learned: "Mastered",
    inProgress: "In progress",
    notStarted: "Not started",
    attempts: "Attempts",
    success: "Success",
    lastAttempt: "Last attempt",
    startQuiz: "Start",
    continueQuiz: "Continue",
    never: "Never",
    quizTypes: "Quiz types",
  },
  ar: {
    learned: "متقن",
    inProgress: "قيد التقدم",
    notStarted: "لم يبدأ",
    attempts: "المحاولات",
    success: "النجاح",
    lastAttempt: "آخر محاولة",
    startQuiz: "ابدأ",
    continueQuiz: "تابع",
    never: "أبدًا",
    quizTypes: "أنواع الاختبارات",
  },
  es: {
    learned: "Dominado",
    inProgress: "En progreso",
    notStarted: "No iniciado",
    attempts: "Intentos",
    success: "Éxito",
    lastAttempt: "Último intento",
    startQuiz: "Comenzar",
    continueQuiz: "Continuar",
    never: "Nunca",
    quizTypes: "Tipos de cuestionarios",
  },
} as const;

const quizTypeIcons: Record<string, string> = {
  translationEnglishToOther: "🇬🇧→",
  translationOtherToEnglish: "→🇬🇧",
  meaning: "💭",
  audio: "🔊",
  wordSorting: "🔤",
  spelling: "✍️",
  speaking: "🎤",
};

export default function WordDetailCard({ word, onStartQuiz }: WordDetailCardProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const getStatus = () => {
    if (word.isLearned) return { label: t("learned"), color: "text-[#22C55E]", bg: "bg-green-100" };
    if (word.totalAttempts > 0) return { label: t("inProgress"), color: "text-[#3B82F6]", bg: "bg-blue-100" };
    return { label: t("notStarted"), color: "text-[#111827]/40", bg: "bg-[#F3F4F6]" };
  };

  const status = getStatus();

  const formatDate = (date?: Date) => {
    if (!date) return t("never");
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  };

  return (
    <div
      className="p-4 rounded-2xl bg-white border border-[#F3F4F6] shadow-sm hover:shadow-md transition"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#111827] mb-1">{word.english}</h3>
          {word.translation && (
            <p className="text-sm text-[#111827]/60">{word.translation}</p>
          )}
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full ${status.bg}`}
        >
          {word.isLearned && <Trophy className={`w-3 h-3 ${status.color}`} />}
          <span className={`text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 rounded-xl bg-[#F3F4F6]">
          <div className="text-lg font-bold text-[#111827]">{word.totalAttempts}</div>
          <div className="text-xs text-[#111827]/60">{t("attempts")}</div>
        </div>

        <div className="text-center p-2 rounded-xl bg-green-50">
          <div className="text-lg font-bold text-[#22C55E]">{word.successRate}%</div>
          <div className="text-xs text-[#111827]/60">{t("success")}</div>
        </div>

        <div className="text-center p-2 rounded-xl bg-blue-50">
          <div className="text-lg font-bold text-[#3B82F6]">
            {formatDate(word.lastAttempt)}
          </div>
          <div className="text-xs text-[#111827]/60">{t("lastAttempt")}</div>
        </div>
      </div>

      {/* Quiz types */}
      {word.quizTypes.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-[#111827]/60 mb-2">{t("quizTypes")}</div>
          <div className="flex flex-wrap gap-1">
            {word.quizTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 rounded-lg bg-[#F3F4F6] text-xs"
                title={type}
              >
                {quizTypeIcons[type] || "📝"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {word.totalAttempts > 0 && (
        <div className="mb-3">
          <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
            <div
              className={`h-full transition-all ${
                word.successRate >= 80
                  ? "bg-[#22C55E]"
                  : word.successRate >= 50
                  ? "bg-[#3B82F6]"
                  : "bg-red-500"
              }`}
              style={{ width: `${word.successRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={onStartQuiz}
        className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white font-semibold text-sm hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2"
      >
        {word.totalAttempts > 0 ? (
          <>
            <TrendingUp className="w-4 h-4" />
            {t("continueQuiz")}
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            {t("startQuiz")}
          </>
        )}
      </button>

      {/* Detailed stats (optional expand) */}
      {word.totalAttempts > 0 && (
        <div className="mt-3 pt-3 border-t border-[#F3F4F6] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#22C55E]">
            <CheckCircle2 className="w-3 h-3" />
            <span>{word.correctAttempts} correct</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="w-3 h-3" />
            <span>{word.totalAttempts - word.correctAttempts} incorrect</span>
          </div>
        </div>
      )}
    </div>
  );
}


