import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { updateQuiz } from "../services/quiz.services";
import ProgressBar from "../components/ProgressBar";
import SpeakingComponent from "../components/SpeakingComponent";
import SpellingComponent from "../components/SpellingComponent";
import SentenceArrangeComponent from "../components/SentenceArrangeComponent";

interface Quiz {
  id: string;
  userWordId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  type: string;
  areUserAnswersCorrect?: boolean[];
  userWord?: {
    word?: {
      text: string;
      example: string;
      frTranslation: string;
      esTranslation: string;
      arTranslation: string;
    };
  };
}

const translations = {
  fr: {
    question: "Question",
    of: "sur",
    correct: "Correct !",
    incorrect: "Incorrect",
    next: "Suivant",
    finish: "Terminer",
    congratulations: "Félicitations !",
    sessionCompleted: "Session terminée avec succès !",
    backToHome: "Retour à l'accueil",
    progress: "Progression",
    speaking: "Prononcez le mot à voix haute",
    spelling: "Orthographe : tapez l'orthographe correcte",
    wordSorting: "Remettez les mots dans le bon ordre",
    manualInput: "Ce type de quiz nécessite une saisie manuelle"
  },
  en: {
    question: "Question",
    of: "of",
    correct: "Correct!",
    incorrect: "Incorrect",
    next: "Next",
    finish: "Finish",
    congratulations: "Congratulations!",
    sessionCompleted: "Session completed successfully!",
    backToHome: "Back to home",
    progress: "Progress",
    speaking: "Say the word aloud",
    spelling: "Spelling: type the correct spelling",
    wordSorting: "Put the words in the correct order",
    manualInput: "This quiz type requires manual input"
  },
  es: {
    question: "Pregunta",
    of: "de",
    correct: "¡Correcto!",
    incorrect: "Incorrecto",
    next: "Siguiente",
    finish: "Terminar",
    congratulations: "¡Felicitaciones!",
    sessionCompleted: "¡Sesión completada con éxito!",
    backToHome: "Volver al inicio",
    progress: "Progreso",
    speaking: "Di la palabra en voz alta",
    spelling: "Ortografía: escribe la ortografía correcta",
    wordSorting: "Pon las palabras en el orden correcto",
    manualInput: "Este tipo de quiz requiere entrada manual"
  },
  ar: {
    question: "سؤال",
    of: "من",
    correct: "صحيح!",
    incorrect: "خطأ",
    next: "التالي",
    finish: "إنهاء",
    congratulations: "تهانينا!",
    sessionCompleted: "تمت الجلسة بنجاح!",
    backToHome: "العودة إلى الصفحة الرئيسية",
    progress: "التقدم",
    speaking: "قل الكلمة بصوت عالٍ",
    spelling: "الإملاء: اكتب الإملاء الصحيح",
    wordSorting: "ضع الكلمات بالترتيب الصحيح",
    manualInput: "هذا النوع من الاختبار يتطلب إدخالًا يدويًا"
  }
};

export default function QuizSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [speakingAnswered, setSpeakingAnswered] = useState(false);
  const [spellingAnswered, setSpellingAnswered] = useState(false);
  const [wordSortingAnswered, setWordSortingAnswered] = useState(false);

  useEffect(() => {
    if (location.state?.quizzes) {
      setQuizzes(location.state.quizzes);
    } else {
      navigate("/learn");
    }
  }, [location, navigate]);

  const currentQuiz = quizzes[currentIndex];
  const isLastQuestion = currentIndex === quizzes.length - 1;

  const handleAnswer = async (answer: string) => {
    if (showResult) return;

    setSelectedAnswer(answer);
    const correct = answer === currentQuiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // Sauvegarder la réponse
    try {
      await updateQuiz(currentQuiz.id, correct);
    } catch (error) {
    }

    // Passer à la question suivante après 1.5 secondes
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleFinish = () => {
    navigate("/session-completed", { state: { score, total: quizzes.length } });
  };

  const handleSpeakingAnswer = async (isCorrectAnswer: boolean) => {
    setSpeakingAnswered(true);
    setIsCorrect(isCorrectAnswer);
    setShowResult(true);

    if (isCorrectAnswer) {
      setScore(prev => prev + 1);
    }

    // Sauvegarder la réponse
    try {
      await updateQuiz(currentQuiz.id, isCorrectAnswer);
    } catch (error) {
    }

    // Passer à la question suivante après 1.5 secondes
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentIndex(prev => prev + 1);
        setSpeakingAnswered(false);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleSpellingAnswer = async (isCorrectAnswer: boolean) => {
    setSpellingAnswered(true);
    setIsCorrect(isCorrectAnswer);
    setShowResult(true);

    if (isCorrectAnswer) {
      setScore(prev => prev + 1);
    }

    // Sauvegarder la réponse
    try {
      await updateQuiz(currentQuiz.id, isCorrectAnswer);
    } catch (error) {
    }

    // Passer à la question suivante après 1.5 secondes
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentIndex(prev => prev + 1);
        setSpellingAnswered(false);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleWordSortingAnswer = async (isCorrectAnswer: boolean) => {
    setWordSortingAnswered(true);
    setIsCorrect(isCorrectAnswer);
    setShowResult(true);

    if (isCorrectAnswer) {
      setScore(prev => prev + 1);
    }

    // Sauvegarder la réponse
    try {
      await updateQuiz(currentQuiz.id, isCorrectAnswer);
    } catch (error) {
    }

    // Passer à la question suivante après 1.5 secondes
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentIndex(prev => prev + 1);
        setWordSortingAnswered(false);
        setShowResult(false);
      }
    }, 1500);
  };

  if (!currentQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  // Obtenir les options (peuvent être dans options ou construites)
  const options = currentQuiz.options || [];
  const word = currentQuiz.userWord?.word;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/learn")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t("question")} {currentIndex + 1} {t("of")} {quizzes.length}
              </h2>
            </div>
            <div className="w-6" />
          </div>
          <ProgressBar
            current={currentIndex + 1}
            total={quizzes.length}
            color="#3B82F6"
            height={8}
            animated={true}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            {word && currentQuiz.type !== 'spelling' && currentQuiz.type !== 'wordSorting' && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{word.text}</span>
              </div>
            )}
            {currentQuiz.type !== 'spelling' && currentQuiz.type !== 'wordSorting' && (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {currentQuiz.question}
              </h2>
            )}
          </div>

          {currentQuiz.type === 'speaking' ? (
            <div className="py-4">
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t("speaking")}</p>
              </div>
              <SpeakingComponent
                questionId={currentQuiz.id}
                textToSpeak={word?.text || ""}
                correctAnswer={currentQuiz.correctAnswer}
                fetchAnswer={async (_id, isCorrect) => {
                  await handleSpeakingAnswer(isCorrect);
                }}
              />
            </div>
          ) : currentQuiz.type === 'spelling' ? (
            <div className="py-4">
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t("spelling")}</p>
              </div>
              <SpellingComponent
                questionId={currentQuiz.id}
                audioText={word?.text || ""}
                correctAnswer={currentQuiz.correctAnswer}
                fetchAnswer={async (_id, isCorrect) => {
                  await handleSpellingAnswer(isCorrect);
                }}
              />
            </div>
          ) : currentQuiz.type === 'wordSorting' ? (
            <div className="py-4">
              <div className="mb-4 text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t("wordSorting")}</p>
              </div>
              <SentenceArrangeComponent
                questionId={currentQuiz.id}
                sentence={currentQuiz.question}
                correctAnswer={currentQuiz.correctAnswer}
                fetchAnswer={async (_id, isCorrect) => {
                  await handleWordSortingAnswer(isCorrect);
                  return "";
                }}
              />
            </div>
          ) : options.length > 0 ? (
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = option === currentQuiz.correctAnswer;
                
                let buttonClass = "w-full p-4 rounded-2xl text-left font-medium transition-all duration-300 transform";

                if (showResult) {
                  if (isCorrectAnswer) {
                    buttonClass += " bg-green-100 border-2 border-green-500 text-green-900";
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonClass += " bg-red-100 border-2 border-red-500 text-red-900";
                  } else {
                    buttonClass += " bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed";
                  }
                } else {
                  buttonClass += " hover:scale-[1.02] active:scale-[0.98] bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 text-white dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isSelected && (
                        <div>
                          {isCorrectAnswer ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t("manualInput")}</p>
              <p className="text-sm text-gray-400">Type: {currentQuiz.type}</p>
            </div>
          )}

          {showResult && currentQuiz.type !== 'speaking' && currentQuiz.type !== 'spelling' && currentQuiz.type !== 'wordSorting' && (
            <div className={`mt-6 p-4 rounded-2xl ${isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <p className="font-semibold text-center">
                {isCorrect ? "✓ " + t("correct") : "✗ " + t("incorrect")}
              </p>
            </div>
          )}
        </div>

        {(showResult || speakingAnswered || spellingAnswered || wordSortingAnswered) && isLastQuestion && (
          <div className="flex justify-center">
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              {t("finish")}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
