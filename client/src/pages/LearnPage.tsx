import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import WordCard from "../components/WordCard";
import QuizCard from "../components/QuizCard";
import ProgressBar from "../components/ProgressBar";

interface Word {
  id: string;
  word: string;
  translation: string;
  example?: string;
  exampleTranslation?: string;
}

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: string;
}

const translations = {
  fr: {
    learning: "Apprentissage",
    words: "Mots",
    quiz: "Quiz",
    next: "Suivant",
    continue: "Continuer",
    congratulations: "Félicitations !",
    unitCompleted: "Vous avez terminé cette unité !",
    backToCourse: "Retour aux cours"
  },
  en: {
    learning: "Learning",
    words: "Words",
    quiz: "Quiz",
    next: "Next",
    continue: "Continue",
    congratulations: "Congratulations!",
    unitCompleted: "You completed this unit!",
    backToCourse: "Back to courses"
  },
  es: {
    learning: "Aprendizaje",
    words: "Palabras",
    quiz: "Cuestionario",
    next: "Siguiente",
    continue: "Continuar",
    congratulations: "¡Felicitaciones!",
    unitCompleted: "¡Completaste esta unidad!",
    backToCourse: "Volver a los cursos"
  },
  ar: {
    learning: "التعلم",
    words: "كلمات",
    quiz: "اختبار",
    next: "التالي",
    continue: "متابعة",
    congratulations: "تهانينا!",
    unitCompleted: "لقد أكملت هذه الوحدة!",
    backToCourse: "العودة إلى الدورات"
  }
};

export default function LearnPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [currentStep, setCurrentStep] = useState<"words" | "quiz">("words");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, [categoryId]);

  const loadWords = async () => {
    try {
      setLoading(true);
      // Simuler des mots pour la démo
      const mockWords: Word[] = [
        { id: "1", word: "Hello", translation: "Bonjour", example: "Hello, how are you?", exampleTranslation: "Bonjour, comment allez-vous ?" },
        { id: "2", word: "Goodbye", translation: "Au revoir", example: "Goodbye, see you later!", exampleTranslation: "Au revoir, à bientôt !" },
        { id: "3", word: "Thank you", translation: "Merci", example: "Thank you very much!", exampleTranslation: "Merci beaucoup !" },
        { id: "4", word: "Please", translation: "S'il vous plaît", example: "Can you help me, please?", exampleTranslation: "Pouvez-vous m'aider, s'il vous plaît ?" },
        { id: "5", word: "Sorry", translation: "Désolé", example: "I'm sorry for being late.", exampleTranslation: "Je suis désolé d'être en retard." }
      ];

      const mockQuizzes: Quiz[] = [
        {
          id: "q1",
          question: "Comment dit-on 'Bonjour' en anglais ?",
          options: ["Hello", "Goodbye", "Thank you", "Please"],
          correctAnswer: "Hello",
          type: "multiple"
        },
        {
          id: "q2",
          question: "Quelle est la traduction de 'Goodbye' ?",
          options: ["Bonjour", "Au revoir", "Merci", "S'il vous plaît"],
          correctAnswer: "Au revoir",
          type: "multiple"
        },
        {
          id: "q3",
          question: "Comment dit-on 'Merci' en anglais ?",
          options: ["Hello", "Goodbye", "Thank you", "Please"],
          correctAnswer: "Thank you",
          type: "multiple"
        }
      ];

      setWords(mockWords);
      setQuizzes(mockQuizzes);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleNextWords = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setCurrentStep("quiz");
    }
  };

  const handleQuizAnswer = () => {
    setTimeout(() => {
      if (currentQuizIndex < quizzes.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
      } else {
        // Tous les quiz sont terminés
        showCompletion();
      }
    }, 1500);
  };

  const showCompletion = () => {
    // Afficher un écran de félicitations
    // Ici on pourrait naviguer vers une page de completion ou afficher un modal
  };

  const currentWord = words[currentWordIndex];
  const currentQuiz = quizzes[currentQuizIndex];
  const totalWords = words.length;
  const totalQuizzes = quizzes.length;
  const progress = currentStep === "words" 
    ? ((currentWordIndex + 1) / totalWords) * 50 
    : 50 + ((currentQuizIndex + 1) / totalQuizzes) * 50;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/learn")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex-1 mx-4">
              <ProgressBar
                current={progress}
                total={100}
                color="#3B82F6"
                height={8}
                animated={true}
              />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentStep === "words" && currentWord && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("learning")} - {t("words")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Mot {currentWordIndex + 1} sur {totalWords}
              </p>
            </div>

            <WordCard
              word={currentWord.word}
              translation={currentWord.translation}
              example={currentWord.example}
              exampleTranslation={currentWord.exampleTranslation}
              size="lg"
              showExample={true}
            />

            <div className="flex justify-center">
              <button
                onClick={handleNextWords}
                className="px-8 py-4 bg-blue-500 text-white rounded-full font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {currentWordIndex < totalWords - 1 ? t("next") : t("continue")}
              </button>
            </div>
          </div>
        )}

        {currentStep === "quiz" && currentQuiz && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t("quiz")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Question {currentQuizIndex + 1} sur {totalQuizzes}
              </p>
            </div>

            <QuizCard
              question={currentQuiz.question}
              options={currentQuiz.options}
              correctAnswer={currentQuiz.correctAnswer}
              onAnswer={handleQuizAnswer}
            />
          </div>
        )}

        {/* Completion Screen */}
        {currentStep === "quiz" && currentQuizIndex >= totalQuizzes && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("congratulations")}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t("unitCompleted")}</p>
            <button
              onClick={() => navigate("/learn")}
              className="px-8 py-4 bg-blue-500 text-white rounded-full font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              {t("backToCourse")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

