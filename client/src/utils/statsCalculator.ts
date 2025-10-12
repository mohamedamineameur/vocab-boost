import type { ActivityItem } from "../src/components/RecentActivity";

export interface UserWord {
  id: string;
  wordId: string;
  isLearned?: boolean;
  word?: {
    english: string;
  };
}

export interface Quiz {
  id: string;
  userWordId: string;
  correctAnswer: string;
  type: string;
  areUserAnswersCorrect?: boolean[];
  updatedAt?: string | Date;
}

export interface StatsData {
  totalWords: number;
  learnedWords: number;
  inProgressWords: number;
  totalQuizzes: number;
  correctAnswers: number;
  successRate: number;
  streak: number;
  longestStreak: number;
}

/**
 * Calcule les statistiques d'apprentissage à partir des mots et activités
 */
export function calculateStats(
  userWords: UserWord[],
  quizzes: Quiz[],
  activities?: Array<{ activityType?: string; [key: string]: unknown }>
): StatsData {
  const totalWords = userWords.length;
  const learnedWords = userWords.filter((w) => w.isLearned).length;

  // Mots en cours = mots qui ont au moins un quiz mais pas encore appris
  const wordsWithQuizzes = new Set(quizzes.map((q) => q.userWordId));
  const inProgressWords = userWords.filter(
    (w) => !w.isLearned && wordsWithQuizzes.has(w.id)
  ).length;

  // Calculer le total de quiz et réponses correctes
  let totalQuizAttempts = 0;
  let correctAnswersCount = 0;

  console.log("🔍 Debug statsCalculator - Total quizzes:", quizzes.length);
  console.log("🔍 Debug statsCalculator - Total activities:", activities?.length || 0);

  // Utiliser les activités si disponibles (plus fiable)
  if (activities && activities.length > 0) {
    console.log("✅ Using activities for statistics");
    
    activities.forEach((activity, index) => {
      if (activity.activityType?.includes('quiz')) {
        totalQuizAttempts++;
        if (activity.activityType === 'quiz_correct') {
          correctAnswersCount++;
        }
        console.log(`Activity ${index}: ${activity.activityType} - ${activity.activityType === 'quiz_correct' ? 'CORRECT' : 'INCORRECT'}`);
      }
    });
  } else {
    // Fallback sur les quiz (moins fiable)
    console.log("⚠️ Using quizzes for statistics (fallback)");
    
    quizzes.forEach((quiz, index) => {
      console.log(`Quiz ${index}:`, {
        id: quiz.id,
        areUserAnswersCorrect: quiz.areUserAnswersCorrect,
        type: typeof quiz.areUserAnswersCorrect,
        isArray: Array.isArray(quiz.areUserAnswersCorrect)
      });
      
      if (quiz.areUserAnswersCorrect && Array.isArray(quiz.areUserAnswersCorrect)) {
        totalQuizAttempts += quiz.areUserAnswersCorrect.length;
        correctAnswersCount += quiz.areUserAnswersCorrect.filter(Boolean).length;
        
        console.log(`Quiz ${index} stats:`, {
          attempts: quiz.areUserAnswersCorrect.length,
          correct: quiz.areUserAnswersCorrect.filter(Boolean).length,
          answers: quiz.areUserAnswersCorrect
        });
      }
    });
  }

  console.log("📊 Final stats:", {
    totalQuizAttempts,
    correctAnswersCount,
    successRate: totalQuizAttempts > 0 ? Math.round((correctAnswersCount / totalQuizAttempts) * 100) : 0
  });

  const successRate =
    totalQuizAttempts > 0
      ? Math.round((correctAnswersCount / totalQuizAttempts) * 100)
      : 0;

  // Calculer la série (streak) - simplifié pour l'exemple
  // Dans une vraie application, vous voudriez stocker les dates d'activité
  const { currentStreak, longestStreak } = calculateStreak(quizzes);

  return {
    totalWords,
    learnedWords,
    inProgressWords,
    totalQuizzes: quizzes.length,
    correctAnswers: correctAnswersCount,
    successRate,
    streak: currentStreak,
    longestStreak,
  };
}

/**
 * Calcule la série d'activité à partir des quiz
 */
function calculateStreak(quizzes: Quiz[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (quizzes.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Grouper les quiz par date
  const dateMap = new Map<string, boolean>();
  
  quizzes.forEach((quiz) => {
    if (quiz.updatedAt) {
      const date = new Date(quiz.updatedAt);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      dateMap.set(dateKey, true);
    }
  });

  const sortedDates = Array.from(dateMap.keys()).sort().reverse();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculer la série actuelle
  for (let i = 0; i < sortedDates.length; i++) {
    const date = new Date(sortedDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (date.toDateString() === expectedDate.toDateString()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculer la série la plus longue
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);
      const diffDays = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Génère l'historique d'activité récente
 */
export function generateRecentActivity(
  userWords: UserWord[],
  quizzes: Quiz[]
): ActivityItem[] {
  const activities: ActivityItem[] = [];

  // Créer une map pour accéder rapidement aux mots
  const wordMap = new Map<string, UserWord>();
  userWords.forEach((uw) => {
    wordMap.set(uw.id, uw);
  });

  // Ajouter les quiz récents
  quizzes
    .filter((q) => q.areUserAnswersCorrect && q.areUserAnswersCorrect.length > 0)
    .forEach((quiz) => {
      const userWord = wordMap.get(quiz.userWordId);
      const lastAnswer =
        quiz.areUserAnswersCorrect![quiz.areUserAnswersCorrect!.length - 1];

      activities.push({
        id: quiz.id,
        type: "quiz",
        word: quiz.correctAnswer || userWord?.word?.english || "Unknown",
        quizType: quiz.type,
        isCorrect: lastAnswer,
        timestamp: quiz.updatedAt ? new Date(quiz.updatedAt) : new Date(),
      });
    });

  // Ajouter les mots appris récemment
  userWords
    .filter((w) => w.isLearned)
    .forEach((word) => {
      activities.push({
        id: `learned-${word.id}`,
        type: "word",
        word: word.word?.english || "Unknown",
        timestamp: new Date(), // Idéalement, vous auriez une date d'apprentissage
      });
    });

  // Trier par date décroissante
  return activities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}


