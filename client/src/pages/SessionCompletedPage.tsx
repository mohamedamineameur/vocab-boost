import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Trophy, Star, ArrowRight, Home } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { createSession } from "../services/session.services";

const translations = {
  fr: {
    congratulations: "Félicitations !",
    sessionCompleted: "Session terminée avec succès !",
    score: "Score",
    correct: "Correctes",
    incorrect: "Incorrectes",
    percentage: "Taux de réussite",
    excellent: "Excellent travail !",
    great: "Bien joué !",
    good: "Continue comme ça !",
    newSession: "Nouvelle session",
    backToHome: "Retour à l'accueil"
  },
  en: {
    congratulations: "Congratulations!",
    sessionCompleted: "Session completed successfully!",
    score: "Score",
    correct: "Correct",
    incorrect: "Incorrect",
    percentage: "Success rate",
    excellent: "Excellent work!",
    great: "Great job!",
    good: "Keep it up!",
    newSession: "New session",
    backToHome: "Back to home"
  },
  es: {
    congratulations: "¡Felicitaciones!",
    sessionCompleted: "¡Sesión completada con éxito!",
    score: "Puntuación",
    correct: "Correctas",
    incorrect: "Incorrectas",
    percentage: "Tasa de éxito",
    excellent: "¡Excelente trabajo!",
    great: "¡Bien hecho!",
    good: "¡Sigue así!",
    newSession: "Nueva sesión",
    backToHome: "Volver al inicio"
  },
  ar: {
    congratulations: "تهانينا!",
    sessionCompleted: "تمت الجلسة بنجاح!",
    score: "النتيجة",
    correct: "صحيحة",
    incorrect: "خاطئة",
    percentage: "معدل النجاح",
    excellent: "عمل ممتاز!",
    great: "أحسنت!",
    good: "استمر!",
    newSession: "جلسة جديدة",
    backToHome: "العودة إلى الصفحة الرئيسية"
  }
};

export default function SessionCompletedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);

  useEffect(() => {
    if (location.state?.score !== undefined && location.state?.total) {
      setScore(location.state.score);
      setTotal(location.state.total);
      saveSession();
    } else {
      navigate("/learn");
    }
  }, [location, navigate]);

  const saveSession = async () => {
    try {
      await createSession({
        userId: "", // Sera rempli par le backend
        score,
        totalQuestions: total,
        completedAt: new Date()
      });
      setSessionSaved(true);
    } catch (error) {
    }
  };

  const correct = score;
  const incorrect = total - score;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getMessage = () => {
    if (percentage >= 90) return t("excellent");
    if (percentage >= 70) return t("great");
    return t("good");
  };

  const getIcon = () => {
    if (percentage >= 90) return Trophy;
    if (percentage >= 70) return Star;
    return CheckCircle2;
  };

  const Icon = getIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center animate-bounce">
            <Icon className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t("congratulations")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{t("sessionCompleted")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Score */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-6 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">{score}/{total}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("score")}</p>
          </div>

          {/* Correct */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-2xl p-6 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-1">{correct}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("correct")}</p>
          </div>

          {/* Incorrect */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 text-center border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600 mb-1">{incorrect}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("incorrect")}</p>
          </div>
        </div>

        {/* Percentage */}
        <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-6 text-center mb-8">
          <p className="text-sm text-white/80 mb-2">{t("percentage")}</p>
          <div className="text-5xl font-bold text-white">{percentage}%</div>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">{getMessage()}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/learn")}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-6 h-6" />
            {t("newSession")}
          </button>
          <button
            onClick={() => navigate("/learn")}
            className="w-full py-3 px-6 rounded-2xl font-medium text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            {t("backToHome")}
          </button>
        </div>

        {/* Session Saved Indicator */}
        {sessionSaved && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-600">✓ Session enregistrée</p>
          </div>
        )}
      </div>
    </div>
  );
}

