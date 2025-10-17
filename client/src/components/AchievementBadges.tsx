import React from "react";
import { Trophy, Award, Star, Zap, Target, Book, Flame, CheckCircle } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: number;      // 0-100
  requirement?: number;   // Valeur requise
  category: "words" | "quizzes" | "streak" | "mastery";
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

const tr = {
  fr: {
    title: "Trophées & Récompenses",
    unlocked: "Débloqué",
    locked: "Verrouillé",
    progress: "Progression",
    empty: "Continuez à apprendre pour débloquer des récompenses !",
    categories: {
      words: "Vocabulaire",
      quizzes: "Quiz",
      streak: "Régularité",
      mastery: "Maîtrise",
    },
  },
  en: {
    title: "Trophies & Achievements",
    unlocked: "Unlocked",
    locked: "Locked",
    progress: "Progress",
    empty: "Keep learning to unlock achievements!",
    categories: {
      words: "Vocabulary",
      quizzes: "Quizzes",
      streak: "Consistency",
      mastery: "Mastery",
    },
  },
  ar: {
    title: "الجوائز والإنجازات",
    unlocked: "مفتوح",
    locked: "مقفل",
    progress: "التقدم",
    empty: "استمر في التعلم لفتح الإنجازات!",
    categories: {
      words: "المفردات",
      quizzes: "الاختبارات",
      streak: "الانتظام",
      mastery: "الإتقان",
    },
  },
  es: {
    title: "Trofeos y logros",
    unlocked: "Desbloqueado",
    locked: "Bloqueado",
    progress: "Progreso",
    empty: "¡Sigue aprendiendo para desbloquear logros!",
    categories: {
      words: "Vocabulario",
      quizzes: "Cuestionarios",
      streak: "Regularidad",
      mastery: "Dominio",
    },
  },
} as const;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  award: Award,
  star: Star,
  zap: Zap,
  target: Target,
  book: Book,
  flame: Flame,
  check: CheckCircle,
};

export default function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as unknown as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  if (achievements.length === 0) {
    return (
      <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <h2 className="text-lg font-bold text-[#111827]">🏆 {t("title")}</h2>
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] text-center">
          <Trophy className="w-12 h-12 mx-auto text-[#111827]/20 mb-2" />
          <p className="text-sm text-[#111827]/60">{t("empty")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827]">🏆 {t("title")}</h2>
        <div className="text-sm font-semibold text-[#111827]/60">
          {unlockedCount}/{totalCount}
        </div>
      </div>

      {/* Progress bar globale */}
      <div className="relative h-3 rounded-full bg-[#F3F4F6] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#22C55E] transition-all duration-500"
          style={{ width: `${Math.round((unlockedCount / totalCount) * 100)}%` }}
        />
      </div>

      {/* Grid de badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon] || Trophy;
          
          return (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-2xl border transition ${
                achievement.unlocked
                  ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md"
                  : "bg-white dark:bg-gray-800 border-[#F3F4F6] opacity-60"
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  achievement.unlocked
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                    : "bg-[#F3F4F6]"
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 ${
                    achievement.unlocked ? "text-white" : "text-[#111827]/40"
                  }`}
                />
              </div>

              {/* Title & Description */}
              <div className="text-center mb-2">
                <h3 className="text-sm font-bold text-[#111827] mb-1 leading-tight">
                  {achievement.title}
                </h3>
                <p className="text-xs text-[#111827]/60 leading-tight">
                  {achievement.description}
                </p>
              </div>

              {/* Progress bar (si non débloqué) */}
              {!achievement.unlocked && achievement.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
                    <div
                      className="h-full bg-[#3B82F6] transition-all"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-center text-[#111827]/60 mt-1">
                    {Math.round(achievement.progress || 0)}%
                  </div>
                </div>
              )}

              {/* Status badge */}
              <div
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  achievement.unlocked
                    ? "bg-[#22C55E] text-white"
                    : "bg-[#F3F4F6] text-[#111827]/40"
                }`}
              >
                {achievement.unlocked ? "✓" : "🔒"}
              </div>

              {/* Sparkles effect pour les badges débloqués */}
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1">
                  <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Légende des catégories */}
      <div className="flex flex-wrap gap-2 text-xs">
        {Object.entries(tr[language as keyof typeof tr]?.categories || tr.en.categories).map(
          ([key, label]) => (
            <div
              key={key}
              className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#111827]/70"
            >
              {label}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/**
 * Fonction utilitaire pour générer des achievements basés sur les stats
 */
// eslint-disable-next-line react-refresh/only-export-components
export function generateAchievements(stats: {
  totalWords: number;
  learnedWords: number;
  totalQuizzes: number;
  successRate: number;
  streak: number;
}): Achievement[] {
  return [
    {
      id: "first-word",
      icon: "book",
      title: "Premier pas",
      description: "Ajouter votre premier mot",
      unlocked: stats.totalWords >= 1,
      progress: Math.min(100, (stats.totalWords / 1) * 100),
      category: "words" as const,
    },
    {
      id: "10-words",
      icon: "target",
      title: "Collectionneur",
      description: "Ajouter 10 mots",
      unlocked: stats.totalWords >= 10,
      progress: Math.min(100, (stats.totalWords / 10) * 100),
      category: "words" as const,
    },
    {
      id: "50-words",
      icon: "star",
      title: "Vocabulaire riche",
      description: "Ajouter 50 mots",
      unlocked: stats.totalWords >= 50,
      progress: Math.min(100, (stats.totalWords / 50) * 100),
      category: "words" as const,
    },
    {
      id: "first-quiz",
      icon: "zap",
      title: "Première tentative",
      description: "Compléter votre premier quiz",
      unlocked: stats.totalQuizzes >= 1,
      progress: Math.min(100, (stats.totalQuizzes / 1) * 100),
      category: "quizzes" as const,
    },
    {
      id: "10-quizzes",
      icon: "check",
      title: "Pratique assidue",
      description: "Compléter 10 quiz",
      unlocked: stats.totalQuizzes >= 10,
      progress: Math.min(100, (stats.totalQuizzes / 10) * 100),
      category: "quizzes" as const,
    },
    {
      id: "perfectionist",
      icon: "trophy",
      title: "Perfectionniste",
      description: "Atteindre 100% de réussite",
      unlocked: stats.successRate === 100 && stats.totalQuizzes >= 5,
      progress: stats.successRate,
      category: "mastery" as const,
    },
    {
      id: "3-day-streak",
      icon: "flame",
      title: "Régulier",
      description: "3 jours consécutifs",
      unlocked: stats.streak >= 3,
      progress: Math.min(100, (stats.streak / 3) * 100),
      category: "streak" as const,
    },
    {
      id: "7-day-streak",
      icon: "flame",
      title: "Déterminé",
      description: "7 jours consécutifs",
      unlocked: stats.streak >= 7,
      progress: Math.min(100, (stats.streak / 7) * 100),
      category: "streak" as const,
    },
    {
      id: "30-day-streak",
      icon: "award",
      title: "Champion",
      description: "30 jours consécutifs !",
      unlocked: stats.streak >= 30,
      progress: Math.min(100, (stats.streak / 30) * 100),
      category: "streak" as const,
    },
    {
      id: "master-10",
      icon: "star",
      title: "Maître des mots",
      description: "Maîtriser 10 mots",
      unlocked: stats.learnedWords >= 10,
      progress: Math.min(100, (stats.learnedWords / 10) * 100),
      category: "mastery" as const,
    },
  ];
}


