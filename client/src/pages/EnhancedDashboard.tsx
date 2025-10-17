import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Tag, ChevronRight, TrendingUp } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

import { getUserWords } from "../services/user-word.services";
import { getUserCategories } from "../services/user-category.services";
import { getQuizzes } from "../services/quiz.services";
import { getUserActivities } from "../services/user-activity.services";
import { getUserAchievements } from "../services/user-achievement.services";
import { getUserStreak } from "../services/user-streak.services";

import ProgressChart from "../components/ProgressChart";
import RecentActivity from "../components/RecentActivity";
import StreakCounter from "../components/StreakCounter";
import AchievementBadges, { generateAchievements } from "../components/AchievementBadges";

import {
  calculateStats,
  generateRecentActivity,
  type UserWord,
  type Quiz,
} from "../utils/statsCalculator";
import type { ActivityItem } from "../components/RecentActivity";

const tr = {
  fr: {
    dashboard: "Tableau de bord",
    welcome: "Bienvenue !",
    words: "Mots sélectionnés",
    categories: "Catégories",
    overview: "Vue d'ensemble",
    goToWords: "Voir mes mots",
    goToCategories: "Gérer les catégories",
    loading: "Chargement...",
  },
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome!",
    words: "Selected words",
    categories: "Categories",
    overview: "Overview",
    goToWords: "View my words",
    goToCategories: "Manage categories",
    loading: "Loading...",
  },
  ar: {
    dashboard: "لوحة التحكم",
    welcome: "مرحباً!",
    words: "الكلمات المحددة",
    categories: "الفئات",
    overview: "نظرة عامة",
    goToWords: "عرض كلماتي",
    goToCategories: "إدارة الفئات",
    loading: "جارٍ التحميل...",
  },
  es: {
    dashboard: "Panel de control",
    welcome: "¡Bienvenido!",
    words: "Palabras seleccionadas",
    categories: "Categorías",
    overview: "Resumen",
    goToWords: "Ver mis palabras",
    goToCategories: "Administrar categorías",
    loading: "Cargando...",
  },
} as const;

const asArray = (v: unknown) => {
  if (Array.isArray(v)) return v;
  const keys = ["data", "rows", "items", "results", "userCategories", "categories", "words", "quizzes"];
  const vObj = v as Record<string, unknown>;
  for (const k of keys) if (Array.isArray(vObj?.[k])) return vObj[k];
  return [];
};

export default function EnhancedDashboard() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const { user } = useAuth();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [loading, setLoading] = useState(true);
  const [userWords, setUserWords] = useState<UserWord[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [backendAchievements, setBackendAchievements] = useState<Array<{ achievementId: string; unlockedAt?: Date; progress?: number; [key: string]: unknown }>>([]);
  const [streakData, setStreakData] = useState<{ currentStreak?: number; longestStreak?: number; lastActivityDate?: string; [key: string]: unknown } | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        
        // 🔥 Charger TOUTES les données (frontend + backend)
        const [
          wordsRes,
          categoriesRes,
          quizzesRes,
          activitiesRes,
          achievementsRes,
          streakRes,
        ] = await Promise.all([
          getUserWords(),
          getUserCategories(),
          getQuizzes(),
          getUserActivities(20).catch(() => []), // 20 dernières activités
          getUserAchievements().catch(() => []),
          getUserStreak().catch(() => null),
        ]);

        if (!mounted) return;

        setUserWords(asArray(wordsRes));
        setCategories(asArray(categoriesRes));
        setQuizzes(asArray(quizzesRes));
        
        // 🎯 Utiliser les données du backend si disponibles
        setActivities(asArray(activitiesRes));
        setBackendAchievements(asArray(achievementsRes));
        setStreakData(streakRes);
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-[#F3F4F6] border-t-[#3B82F6] animate-spin mb-4" />
            <p className="text-[#111827]/60">{t("loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  // 🎯 Utiliser le streak du backend si disponible, sinon calculer
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  
  const stats = {
    ...calculateStats(userWords, quizzes, activities as unknown as Array<{ activityType?: string; [key: string]: unknown }>),
    streak: currentStreak,
    longestStreak,
  };

  // 🔥 Convertir les activités backend au format attendu par le composant
  const formattedActivities: ActivityItem[] = activities.length > 0
    ? activities.map((act) => {
        const activityData = act as ActivityItem & { activityType?: string; metadata?: { word?: string }; createdAt: string };
        return {
        id: activityData.id,
        type: activityData.activityType?.includes("quiz") ? "quiz" : "word",
        word: activityData.metadata?.word || "Unknown",
        quizType: activityData.activityType,
        isCorrect: activityData.activityType === "quiz_correct",
        timestamp: new Date(activityData.createdAt),
      };
      })
    : generateRecentActivity(userWords, quizzes); // Fallback sur le calcul client

  // 🏆 Fusionner les badges backend avec les calculs frontend
  const achievements = generateAchievements(stats);
  const mergedAchievements = achievements.map((achievement) => {
    const backendAch = backendAchievements.find(
      (ba) => ba.achievementId === achievement.id
    );
    
    if (backendAch) {
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: backendAch.unlockedAt,
        progress: backendAch.progress ?? 100,
      };
    }
    
    return achievement;
  });

  const cardBase =
    "group relative w-full rounded-2xl border border-black/10 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md active:scale-[0.98] transition";
  const rowBase = "flex items-center justify-between gap-3 p-4";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">
            {t("dashboard")}
          </h1>
          <p className="text-[#111827]/60">
            {t("welcome")} {user?.firstname} {user?.lastname} 👋
          </p>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            className={`${cardBase} hover:border-[#3B82F6]/30`}
          >
            <div className={rowBase}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Tag className="text-[#3B82F6] w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-[#111827]">
                    {categories.length}
                  </div>
                  <div className="text-sm text-[#111827]/60">{t("categories")}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#111827]/40" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/words")}
            disabled={userWords.length === 0}
            className={`${cardBase} ${
              userWords.length === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-[#22C55E]/30"
            }`}
          >
            <div className={rowBase}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <BookOpen className="text-[#22C55E] w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-[#111827]">
                    {userWords.length}
                  </div>
                  <div className="text-sm text-[#111827]/60">{t("words")}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#111827]/40" />
            </div>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Stats & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.streak}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Série</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.learnedWords}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Mots appris</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.inProgressWords}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">En cours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.successRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Taux de réussite</div>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm">
              <ProgressChart
                totalWords={stats.totalWords}
                learnedWords={stats.learnedWords}
                inProgressWords={stats.inProgressWords}
              />
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm">
              <RecentActivity activities={formattedActivities} />
            </div>

            {/* Achievements */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm">
              <AchievementBadges achievements={mergedAchievements} />
            </div>
          </div>

          {/* Colonne de droite - Streak */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#F3F4F6] shadow-sm">
              <StreakCounter
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                lastActivityDate={
                  streakData?.lastActivityDate
                    ? new Date(streakData.lastActivityDate)
                    : undefined
                }
              />
            </div>

            {/* Mini CTA */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#22C55E] text-white shadow-lg">
              <TrendingUp className="w-12 h-12 mb-3 opacity-80" />
              <h3 className="text-lg font-bold mb-2">{t("overview")}</h3>
              <p className="text-sm opacity-90 mb-4">
                {stats.successRate}% {t("overview")}
              </p>
              <button
                onClick={() => navigate("/words")}
                className="w-full py-2 px-4 rounded-xl bg-white dark:bg-gray-800/20 hover:bg-white dark:bg-gray-800/30 backdrop-blur transition text-sm font-semibold"
              >
                {t("goToWords")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

