import { useCallback } from "react";
import { createUserActivity } from "../services/user-activity.services";
import { updateUserStreak } from "../services/user-streak.services";
import { checkAndUnlockAchievements, calculateStatsForAchievements } from "../utils/achievementChecker";
import { getUserWords } from "../services/user-word.services";
import { getQuizzes } from "../services/quiz.services";
import { getUserStreak } from "../services/user-streak.services";

/**
 * Hook personnalisé pour tracker automatiquement les activités utilisateur
 * et mettre à jour les streaks/badges
 */
export function useActivityTracker() {
  /**
   * Enregistre une activité de quiz complété
   */
  const trackQuiz = useCallback(
    async (quizId: string, userWordId: string, isCorrect: boolean, wordText?: string) => {
      try {
        // 1. Enregistrer l'activité
        await createUserActivity({
          activityType: isCorrect ? "quiz_correct" : "quiz_incorrect",
          quizId,
          userWordId,
          metadata: {
            word: wordText,
            score: isCorrect ? 100 : 0,
            timestamp: new Date().toISOString(),
          },
        });

        // 2. Mettre à jour le streak
        await updateUserStreak();

        // 3. Vérifier et débloquer les badges
        await checkBadges();

        // Activity tracked
      } catch (error) {
      }
    },
    []
  );

  /**
   * Enregistre un mot comme appris
   */
  const trackWordLearned = useCallback(async (userWordId: string, wordText?: string) => {
    try {
      await createUserActivity({
        activityType: "word_learned",
        userWordId,
        metadata: {
          word: wordText,
          timestamp: new Date().toISOString(),
        },
      });

      await updateUserStreak();
      await checkBadges();

      // Word learned tracked
    } catch (error) {
    }
  }, []);

  /**
   * Enregistre un nouveau mot ajouté
   */
  const trackWordAdded = useCallback(async (userWordId: string, wordText?: string) => {
    try {
      await createUserActivity({
        activityType: "word_added",
        userWordId,
        metadata: {
          word: wordText,
          timestamp: new Date().toISOString(),
        },
      });

      // Word added tracked
    } catch (error) {
    }
  }, []);

  /**
   * Vérifie et débloque automatiquement les badges
   */
  const checkBadges = useCallback(async () => {
    try {
      const [userWords, quizzes, streakData] = await Promise.all([
        getUserWords(),
        getQuizzes(),
        getUserStreak(),
      ]);

      const wordsArray = Array.isArray(userWords) ? userWords : [];
      const quizzesArray = Array.isArray(quizzes) ? quizzes : [];

      const stats = calculateStatsForAchievements(
        wordsArray,
        quizzesArray,
        streakData?.currentStreak ?? 0
      );

      const newBadges = await checkAndUnlockAchievements(stats);

      if (newBadges.length > 0) {
        // New badges unlocked
        // TODO: Afficher une notification à l'utilisateur
      }
    } catch (error) {
    }
  }, []);

  return {
    trackQuiz,
    trackWordLearned,
    trackWordAdded,
    checkBadges,
  };
}



