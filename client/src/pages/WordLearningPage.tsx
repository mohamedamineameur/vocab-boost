import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Volume2, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { createUserWord, getUserWords } from "../services/user-word.services";
import { getQuizzes } from "../services/quiz.services";
import ProgressBar from "../components/ProgressBar";

interface Word {
  id: string;
  text: string;
  meaning: string;
  example: string;
  pronunciation: string;
  frTranslation: string;
  esTranslation: string;
  arTranslation: string;
}

interface UserWord {
  id: string;
  wordId?: string;
  word?: { id: string };
}

interface Quiz {
  id: string;
  userWordId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: string;
}

const translations = {
  fr: {
    title: "Apprends les mots",
    subtitle: "Écoute et répète",
    word: "Mot",
    meaning: "Signification",
    example: "Exemple",
    pronunciation: "Prononciation",
    next: "Suivant",
    startQuizzes: "Commencer les quiz",
    loadingQuizzes: "Préparation des quiz...",
    wordOf: "sur"
  },
  en: {
    title: "Learn the words",
    subtitle: "Listen and repeat",
    word: "Word",
    meaning: "Meaning",
    example: "Example",
    pronunciation: "Pronunciation",
    next: "Next",
    startQuizzes: "Start quizzes",
    loadingQuizzes: "Preparing quizzes...",
    wordOf: "of"
  },
  es: {
    title: "Aprende las palabras",
    subtitle: "Escucha y repite",
    word: "Palabra",
    meaning: "Significado",
    example: "Ejemplo",
    pronunciation: "Pronunciación",
    next: "Siguiente",
    startQuizzes: "Comenzar cuestionarios",
    loadingQuizzes: "Preparando cuestionarios...",
    wordOf: "de"
  },
  ar: {
    title: "تعلم الكلمات",
    subtitle: "استمع وكرر",
    word: "كلمة",
    meaning: "معنى",
    example: "مثال",
    pronunciation: "نطق",
    next: "التالي",
    startQuizzes: "بدء الاختبارات",
    loadingQuizzes: "جارٍ إعداد الاختبارات...",
    wordOf: "من"
  }
};

export default function WordLearningPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatingQuizzes, setGeneratingQuizzes] = useState(false);
  const [quizzesReady, setQuizzesReady] = useState(false);
  const [userWordIds, setUserWordIds] = useState<string[]>([]);
  const initializationStarted = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    // S'assurer qu'on ne s'exécute qu'une seule fois
    if (isInitialized.current) {
      return;
    }
    
    if (location.state?.words) {
      isInitialized.current = true;
      initializationStarted.current = true;
      setWords(location.state.words);
      const sessionType = location.state.type || 'new';
      
      if (sessionType === 'revision') {
        // Pour la révision, récupérer les quiz existants
        fetchExistingQuizzes(location.state.words);
      } else {
        // Pour les nouveaux mots, créer les UserWords en arrière-plan
        const userId = location.state.userId;
        if (userId) {
          createUserWordsAndCheckQuizzes(location.state.words, userId);
        } else {
          // Fallback: créer les UserWords si pas d'userId
          generateQuizzesInBackground(location.state.words);
        }
      }
    } else if (!location.state?.words) {
      navigate("/learn");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUserWordsAndCheckQuizzes = async (wordsToLearn: Word[], userId: string) => {
    try {
      
      // Vérifier d'abord les UserWords existants
      const existingUserWordsData = await getUserWords();
      const existingUserWords = Array.isArray(existingUserWordsData) ? existingUserWordsData : [];
      const existingWordIds = new Set(
        existingUserWords.map((uw: UserWord) => uw.wordId || uw.word?.id).filter(Boolean)
      );
      
      
      // Créer les UserWords pour tous les nouveaux mots
      const createdUserWordIds: string[] = [];
      
      for (let i = 0; i < wordsToLearn.length; i++) {
        const word = wordsToLearn[i];
        
        // Vérifier si le mot existe déjà
        if (existingWordIds.has(word.id)) {
          // Récupérer l'ID du UserWord existant
          const existingUserWord = existingUserWords.find((uw: UserWord) => 
            (uw.wordId || uw.word?.id) === word.id
          );
          if (existingUserWord) {
            createdUserWordIds.push(existingUserWord.id);
          }
          continue;
        }
        
        try {
          const result = await createUserWord({
            userId: userId,
            wordId: word.id
          });
          createdUserWordIds.push(result.userWord.id);
        } catch (error: unknown) {
          // Si l'erreur indique que le mot existe déjà, récupérer l'ID existant (pas d'erreur)
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { error?: { en?: string } } } };
            if (axiosError.response?.data?.error?.en?.includes("already associated")) {
              const existingUserWord = existingUserWords.find((uw: UserWord) => 
                (uw.wordId || uw.word?.id) === word.id
              );
              if (existingUserWord) {
                createdUserWordIds.push(existingUserWord.id);
              } else {
                console.error("UserWord non trouvé pour le mot:", word.text);
              }
            }
          } else {
            // Autres erreurs
            console.error("Erreur création UserWord:", error);
          }
        }
      }
      
      
      // Récupérer TOUS les UserWords pour TOUS les mots (pas seulement ceux créés)
      const allUserWordsData = await getUserWords();
      const allUserWords: UserWord[] = Array.isArray(allUserWordsData) ? allUserWordsData : [];
      
      // Extraire les IDs des UserWords pour TOUS les 10 mots
      const allUserWordIds: string[] = [];
      for (const word of wordsToLearn) {
        const userWord = allUserWords.find(uw => uw.wordId === word.id || uw.word?.id === word.id);
        if (userWord) {
          allUserWordIds.push(userWord.id);
        } else {
            console.error("UserWord non trouvé pour le mot:", word.text);
        }
      }
      
      
      // Stocker les IDs des UserWords pour TOUS les mots
      setUserWordIds(allUserWordIds);
      
     

      setQuizzesReady(true);
    } catch (error) {
        console.error("Erreur création UserWords et vérification quiz:", error);
      setQuizzesReady(true); // Continuer quand même
    }
  };

  const fetchExistingQuizzes = async (wordsToReview: Word[]) => {
    try {
      // Récupérer tous les UserWords
      const userWordsData = await getUserWords();
      const allUserWords = Array.isArray(userWordsData) ? userWordsData : [];
      
      // Récupérer les UserWords pour ces mots
      const wordIds = wordsToReview.map(w => w.id);
      const existingUserWordIds = allUserWords
        .filter((uw: UserWord) => wordIds.includes(uw.wordId || ''))
        .map((uw: UserWord) => uw.id);
      
      // Stocker les IDs des UserWords existants
      setUserWordIds(existingUserWordIds);
      
      
      setQuizzesReady(true);
    } catch (error) {
        console.error("Erreur récupération quiz:", error);
    }
  };

  const generateQuizzesInBackground = async (wordsToLearn: Word[]) => {
    try {
      // Créer les UserWords pour tous les nouveaux mots
      const createdUserWordIds: string[] = [];
      
      for (const word of wordsToLearn) {
        try {
          const result = await createUserWord({
            userId: "", // Sera rempli par le backend
            wordId: word.id
          });
          createdUserWordIds.push(result.userWord.id);
        } catch (error) {
            console.error("Erreur génération quiz:", error);
        }
      }

      // Stocker les IDs des UserWords créés
      setUserWordIds(createdUserWordIds);

      setQuizzesReady(true);
    } catch (error) {
      console.error("Erreur génération quiz:", error);
      setQuizzesReady(true); // Continuer quand même
    }
  };

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex === words.length - 1;

  const handlePlayAudio = () => {
    if (!currentWord) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(currentWord.text);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleStartQuizzes = async () => {
    setGeneratingQuizzes(true);
    
    
    // Attendre que les quiz soient prêts
    while (!quizzesReady) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Recharger tous les quiz depuis le backend
    const quizzesData = await getQuizzes();
    const allQuizzes = Array.isArray(quizzesData?.quizzes) ? quizzesData.quizzes : [];
    
    
    // Filtrer uniquement les quiz des mots sélectionnés (10 mots)
    const filteredQuizzes = allQuizzes.filter((quiz: Quiz) => 
      userWordIds.includes(quiz.userWordId)
    );
    
    
    // Mélanger les quiz
    const shuffledQuizzes = filteredQuizzes.sort(() => Math.random() - 0.5);
    

    navigate("/quiz-session", { state: { quizzes: shuffledQuizzes } });
  };

  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  const getTranslation = () => {
    switch (language) {
      case "fr": return currentWord.frTranslation;
      case "es": return currentWord.esTranslation;
      case "ar": return currentWord.arTranslation;
      default: return currentWord.meaning;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/learn")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t("word")} {currentIndex + 1} {t("wordOf")} {words.length}
              </h2>
            </div>
            <div className="w-6" />
          </div>
          <ProgressBar
            current={currentIndex + 1}
            total={words.length}
            color="#3B82F6"
            height={8}
            animated={true}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8">
          {/* Word Card */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-4xl font-bold text-white">
                {currentWord.text[0].toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {currentWord.text}
            </h1>

            <button
              onClick={handlePlayAudio}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                isPlaying 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-600"
              }`}
            >
              <Volume2 className="w-5 h-5" />
              {isPlaying ? "Lecture..." : "Écouter"}
            </button>
          </div>

          {/* Translation */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900 dark:from-blue-900 dark:to-green-900 rounded-2xl p-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("meaning")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTranslation()}</p>
            </div>
          </div>

          {/* Example */}
          {currentWord.example && (
            <div className="bg-white dark:bg-gray-800 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-700 dark:border-gray-600 rounded-2xl p-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("example")}</p>
              <p className="text-lg text-gray-800 dark:text-gray-200 italic">"{currentWord.example}"</p>
            </div>
          )}

          {/* Pronunciation */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{t("pronunciation")}</p>
            <p className="text-lg text-gray-700 dark:text-gray-300 font-mono">{currentWord.pronunciation}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {!isLastWord ? (
            <button
              onClick={handleNext}
              className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {t("next")}
              <ArrowRight className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleStartQuizzes}
              disabled={generatingQuizzes}
              className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingQuizzes ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t("loadingQuizzes")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  {t("startQuizzes")}
                </>
              )}
            </button>
          )}
        </div>

        {/* Status */}
        {!quizzesReady && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
              🎯 Les quiz se génèrent en arrière-plan pendant que vous apprenez...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

