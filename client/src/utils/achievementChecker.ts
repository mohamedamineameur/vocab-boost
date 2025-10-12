import {
  unlockAchievement,
  getUserAchievements,
  updateAchievementProgress,
  type UserAchievement,
} from "../services/user-achievement.services";

interface Stats {
  totalWords: number;
  learnedWords: number;
  totalQuizzes: number;
  successRate: number;
  currentStreak: number;
}

/**
 * Définition de tous les badges disponibles
 */
const ACHIEVEMENTS = [
  { id: "first-word", category: "words" as const, requirement: 1 },
  { id: "10-words", category: "words" as const, requirement: 10 },
  { id: "50-words", category: "words" as const, requirement: 50 },
  { id: "first-quiz", category: "quizzes" as const, requirement: 1 },
  { id: "10-quizzes", category: "quizzes" as const, requirement: 10 },
  { id: "perfectionist", category: "mastery" as const, requirement: 100, minQuizzes: 5 },
  { id: "3-day-streak", category: "streak" as const, requirement: 3 },
  { id: "7-day-streak", category: "streak" as const, requirement: 7 },
  { id: "30-day-streak", category: "streak" as const, requirement: 30 },
  { id: "master-10", category: "mastery" as const, requirement: 10 },
];

/**
 * Vérifie et débloque automatiquement les badges en fonction des stats
 */
export async function checkAndUnlockAchievements(stats: Stats): Promise<UserAchievement[]> {
  try {
    // Récupérer les badges déjà débloqués
    const userAchievements = await getUserAchievements();
    const unlockedIds = new Set(
      Array.isArray(userAchievements)
        ? userAchievements.map((a: UserAchievement) => a.achievementId)
        : []
    );

    const newlyUnlocked: UserAchievement[] = [];

    // Vérifier chaque badge
    for (const achievement of ACHIEVEMENTS) {
      // Si déjà débloqué, passer
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      let shouldUnlock = false;
      let progress = 0;

      // Déterminer si le badge doit être débloqué
      switch (achievement.category) {
        case "words":
          progress = Math.round(Math.min(100, (stats.totalWords / achievement.requirement) * 100));
          shouldUnlock = stats.totalWords >= achievement.requirement;
          break;

        case "quizzes":
          progress = Math.round(Math.min(100, (stats.totalQuizzes / achievement.requirement) * 100));
          shouldUnlock = stats.totalQuizzes >= achievement.requirement;
          break;

        case "streak":
          progress = Math.round(Math.min(100, (stats.currentStreak / achievement.requirement) * 100));
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;

        case "mastery":
          if (achievement.id === "perfectionist") {
            progress = Math.round(stats.successRate);
            shouldUnlock =
              stats.successRate === 100 &&
              stats.totalQuizzes >= (achievement.minQuizzes || 0);
          } else if (achievement.id === "master-10") {
            progress = Math.round(Math.min(100, (stats.learnedWords / achievement.requirement) * 100));
            shouldUnlock = stats.learnedWords >= achievement.requirement;
          }
          break;
      }

      if (shouldUnlock) {
        // Débloquer le badge
        try {
          const unlocked = await unlockAchievement(achievement.id, achievement.category);
          newlyUnlocked.push(unlocked);
          console.log(`🏆 Badge débloqué: ${achievement.id}`);
        } catch (error) {
          console.error(`Erreur débloquant ${achievement.id}:`, error);
        }
      } else if (progress > 0) {
        // Mettre à jour la progression
        try {
          await updateAchievementProgress(
            achievement.id,
            achievement.category,
            Math.round(progress)
          );
        } catch (error) {
          // Ignorer les erreurs de progression (badge peut ne pas exister encore)
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error("Erreur lors de la vérification des badges:", error);
    return [];
  }
}

/**
 * Calcule les stats à partir des données brutes
 */
export function calculateStatsForAchievements(
  userWords: { isLearned?: boolean; [key: string]: unknown }[],
  quizzes: { isCorrect?: boolean; [key: string]: unknown }[],
  currentStreak: number
): Stats {
  const totalWords = userWords.length;
  const learnedWords = userWords.filter((w) => w.isLearned).length;

  // Compter les quiz avec réponses
  let totalQuizAttempts = 0;
  let correctAnswers = 0;

  quizzes.forEach((quiz) => {
    if (quiz.areUserAnswersCorrect && Array.isArray(quiz.areUserAnswersCorrect)) {
      totalQuizAttempts += quiz.areUserAnswersCorrect.length;
      correctAnswers += quiz.areUserAnswersCorrect.filter(Boolean).length;
    }
  });

  const successRate =
    totalQuizAttempts > 0 ? Math.round((correctAnswers / totalQuizAttempts) * 100) : 0;

  return {
    totalWords,
    learnedWords,
    totalQuizzes: quizzes.length,
    successRate,
    currentStreak,
  };
}


