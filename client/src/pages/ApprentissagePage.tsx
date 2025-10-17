import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, ArrowRight, FolderOpen, List, Plus, Check } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";
import { getUserCategories, createUserCategory } from "../services/user-category.services";
import { getUserWords, createUserWord } from "../services/user-word.services";
import { getWords } from "../services/word.services";
import { getCategories } from "../services/category.services";

interface Word {
  id: string;
  text: string;
  meaning: string;
  example: string;
  frTranslation: string;
  esTranslation: string;
  arTranslation: string;
  categoryId: string;
}

interface UserWord {
  id: string;
  wordId: string;
  userId: string;
  word?: Word;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

const translations = {
  fr: {
    title: "Session d'Apprentissage",
    subtitle: "Répétition et nouveaux mots",
    revision: "Répétition",
    newWords: "Nouveaux mots",
    loading: "Chargement...",
    startRevision: "Commencer la répétition",
    startNewWords: "Apprendre de nouveaux mots",
    noCategories: "Aucune catégorie sélectionnée",
    selectCategories: "Sélectionner des catégories",
    wordsCount: "mots aux hasards de vos mots sélectionnés",
    preparing: "Préparation de votre session...",
    revisionDescription: "Répétez vos mots existants",
    newWordsDescription: "Apprenez 10 nouveaux mots",
    wordsCountNew: "nouveaux mots à apprendre",
    // Nouvelles sections
    categories: "Catégories",
    myWords: "Mes Mots",
    allWords: "Tous les Mots",
    addCategory: "Ajouter une catégorie",
    myCategories: "Mes Catégories",
    availableCategories: "Catégories Disponibles",
    add: "Ajouter",
    added: "Ajouté",
    learn: "Apprendre",
    alreadyLearned: "Déjà appris",
  },
  en: {
    title: "Learning Session",
    subtitle: "Review and new words",
    revision: "Review",
    newWords: "New words",
    loading: "Loading...",
    startRevision: "Start review",
    startNewWords: "Learn new words",
    noCategories: "No categories selected",
    selectCategories: "Select categories",
    wordsCount: "words at random of your selected words",
    preparing: "Preparing your session...",
    revisionDescription: "Review your existing words",
    newWordsDescription: "Learn 10 new words",
    wordsCountNew: "new words to learn",
    // New sections
    categories: "Categories",
    myWords: "My Words",
    allWords: "All Words",
    addCategory: "Add a category",
    myCategories: "My Categories",
    availableCategories: "Available Categories",
    add: "Add",
    added: "Added",
    learn: "Learn",
    alreadyLearned: "Already learned",
  },
  es: {
    title: "Sesión de Aprendizaje",
    subtitle: "Repaso y palabras nuevas",
    revision: "Repaso",
    newWords: "Palabras nuevas",
    loading: "Cargando...",
    startRevision: "Comenzar repaso",
    startNewWords: "Aprender palabras nuevas",
    noCategories: "No hay categorías seleccionadas",
    selectCategories: "Seleccionar categorías",
    wordsCount: "palabras al azar de tus palabras seleccionadas",
    preparing: "Preparando tu sesión...",
    revisionDescription: "Repasa tus palabras existentes",
    newWordsDescription: "Aprende 10 palabras nuevas",
    wordsCountNew: "palabras nuevas para aprender",
    // Nuevas secciones
    categories: "Categorías",
    myWords: "Mis Palabras",
    allWords: "Todas las Palabras",
    addCategory: "Agregar una categoría",
    myCategories: "Mis Categorías",
    availableCategories: "Categorías Disponibles",
    add: "Agregar",
    added: "Agregado",
    learn: "Aprender",
    alreadyLearned: "Ya aprendido",
  },
  ar: {
    title: "جلسة التعلم",
    subtitle: "المراجعة والكلمات الجديدة",
    revision: "المراجعة",
    newWords: "كلمات جديدة",
    loading: "جارٍ التحميل...",
    startRevision: "بدء المراجعة",
    startNewWords: "تعلم كلمات جديدة",
    noCategories: "لا توجد فئات محددة",
    selectCategories: "اختر الفئات",
    wordsCount: "كلمات عشوائية من كلماتك المحددة",
    preparing: "جارٍ إعداد جلستك...",
    revisionDescription: "راجع كلماتك الموجودة",
    newWordsDescription: "تعلم 10 كلمات جديدة",
    wordsCountNew: "كلمات جديدة لتعلم",
    // أقسام جديدة
    categories: "الفئات",
    myWords: "كلماتي",
    allWords: "جميع الكلمات",
    addCategory: "إضافة فئة",
    myCategories: "فئاتي",
    availableCategories: "الفئات المتاحة",
    add: "إضافة",
    added: "تمت الإضافة",
    learn: "تعلم",
    alreadyLearned: "تم التعلم بالفعل",
  }
};

export default function ApprentissagePage() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const { user } = useAuth();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [loading, setLoading] = useState(true);
  const [hasCategories, setHasCategories] = useState(false);
  const [revisionWords, setRevisionWords] = useState<Word[]>([]);
  const [activeTab, setActiveTab] = useState<'learning' | 'categories' | 'myWords' | 'allWords'>('learning');
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [myWords, setMyWords] = useState<Word[]>([]);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [learnedWordIds, setLearnedWordIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setLoading(true);

      // 1. Vérifier les catégories
      const userCatsData = await getUserCategories();
      const userCats = Array.isArray(userCatsData) 
        ? userCatsData 
        : Array.isArray(userCatsData?.userCategories)
          ? userCatsData.userCategories
          : [];
      
      if (userCats.length === 0) {
        setHasCategories(false);
        setLoading(false);
        return;
      }

      setHasCategories(true);

      // 2. Récupérer les mots existants de l'utilisateur
      const userWordsData = await getUserWords();
      const userWords: UserWord[] = Array.isArray(userWordsData) ? userWordsData : [];

      // 3. Sélectionner 10 mots aléatoires pour la répétition
      const wordsForRevision = userWords
        .filter(uw => uw.word) // S'assurer que le mot est chargé
        .map(uw => uw.word!)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      setRevisionWords(wordsForRevision);

      // 4. Charger toutes les catégories
      const allCatsData = await getCategories();
      const allCats = Array.isArray(allCatsData) ? allCatsData : [];
      setAllCategories(allCats);
      
      // 5. Stocker les catégories de l'utilisateur
      const userCatsObjects = allCats.filter(cat => 
        userCats.some((uc: { categoryId?: string }) => uc.categoryId === cat.id)
      );
      setUserCategories(userCatsObjects);

      // 6. Stocker tous les mots de l'utilisateur
      const userWordsList = userWords
        .filter(uw => uw.word)
        .map(uw => uw.word!);
      setMyWords(userWordsList);

      // 7. Stocker les IDs des mots appris
      const learnedIds = new Set(userWords.map(uw => uw.wordId || uw.word?.id).filter((id): id is string => Boolean(id)));
      setLearnedWordIds(learnedIds);

      // 8. Charger tous les mots
      const allWordsData = await getWords();
      const allWordsList = Array.isArray(allWordsData) ? allWordsData : [];
      setAllWords(allWordsList);

    } catch (error) {
        console.error("Erreur lors de l'initialisation de la session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRevision = () => {
    // Naviguer vers la page d'apprentissage avec les mots de révision
    navigate("/learn-words", { state: { words: revisionWords, type: 'revision' } });
  };

  const handleStartNewWords = async () => {
    if (!user?.id) {
      return;
    }
    
    try {
      // 1. Récupérer les catégories
      const userCatsData = await getUserCategories();
      const userCats = Array.isArray(userCatsData) 
        ? userCatsData 
        : Array.isArray(userCatsData?.userCategories)
          ? userCatsData.userCategories
          : [];
      
      if (userCats.length === 0) {
        return;
      }
      
      const categoryIds = userCats.map((uc: { categoryId?: string }) => uc.categoryId).filter(Boolean);
      
      // 2. Récupérer TOUS les mots et mettre leurs IDs dans un tableau
      const allWordsData = await getWords();
      const allWords: Word[] = Array.isArray(allWordsData) ? allWordsData : [];
      const categoryWords = allWords.filter(w => categoryIds.includes(w.categoryId));
      
      const allWordIds = categoryWords.map(w => w.id);
      
      // 3. Récupérer TOUS les userWords et extraire les wordIds dans un tableau
      const userWordsData = await getUserWords();
      const userWords: UserWord[] = Array.isArray(userWordsData) ? userWordsData : [];
      
      const learnedWordIds = userWords.map(uw => uw.wordId || uw.word?.id).filter(Boolean);
      
      // 4. Créer un tableau de la soustraction (tous les mots - userWords)
      const availableWordIds = allWordIds.filter(id => !learnedWordIds.includes(id));
      
      if (availableWordIds.length === 0) {
        alert("🎉 Félicitations ! Vous avez appris tous les mots de vos catégories !");
        return;
      }
      
      // 5. Choisir 10 mots au hasard de ce tableau d'IDs
      const shuffledIds = availableWordIds.sort(() => Math.random() - 0.5);
      const selectedIds = shuffledIds.slice(0, Math.min(10, availableWordIds.length));
      
      // Récupérer les mots complets correspondant à ces IDs
      const wordsToLearn = categoryWords.filter(w => selectedIds.includes(w.id));
      
      // Naviguer vers la page d'apprentissage avec les mots sélectionnés
      navigate("/learn-words", { 
        state: { 
          words: wordsToLearn, 
          type: 'new',
          userId: user.id
        } 
      });
    } catch {
      alert("Erreur lors de la sélection des nouveaux mots. Veuillez réessayer.");
    }
  };

  const handleAddCategory = async (categoryId: string) => {
    if (!user?.id) return;
    
    try {
      await createUserCategory({ userId: user.id, categoryId });
      await initializeSession();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      alert("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleLearnWord = async (wordId: string) => {
    if (!user?.id) return;
    
    try {
      await createUserWord({ userId: user.id, wordId });
      await initializeSession();
      alert("Mot ajouté à votre liste d'apprentissage !");
    } catch (error) {

      alert("Erreur lors de l'ajout du mot:" + error);
    }
  };

  const handleWordClick = (word: Word) => {
    navigate("/learn-words", { 
      state: { 
        words: [word], 
        type: 'revision'
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!hasCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t("noCategories")}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Vous devez d'abord sélectionner vos catégories de mots.</p>
          <button
            onClick={() => navigate("/categories")}
            className="w-full py-4 px-6 rounded-full font-semibold text-lg bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6" />
            {t("selectCategories")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={() => setActiveTab('learning')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-base whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'learning'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 inline sm:mr-2" />
              <span className="hidden sm:inline">Apprentissage</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-base whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'categories'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 inline sm:mr-2" />
              <span className="hidden sm:inline">{t("categories")}</span>
            </button>
            <button
              onClick={() => setActiveTab('myWords')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-base whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'myWords'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-3 h-3 sm:w-4 sm:h-4 inline sm:mr-2" />
              <span className="hidden sm:inline">{t("myWords")}</span>
            </button>
            <button
              onClick={() => setActiveTab('allWords')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-base whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === 'allWords'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline sm:mr-2" />
              <span className="hidden sm:inline">{t("allWords")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Onglet Apprentissage */}
        {activeTab === 'learning' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carte Répétition */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 dark:from-blue-900 dark:to-blue-800 rounded-3xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("revision")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t("revisionDescription")}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-300 mb-4">
                {revisionWords.length} {t("wordsCount")}
              </div>
              <button
                onClick={handleStartRevision}
                disabled={revisionWords.length === 0}
                className={`
                  w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300
                  flex items-center justify-center gap-2
                  ${revisionWords.length > 0
                    ? "bg-blue-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                <BookOpen className="w-5 h-5" />
                {t("startRevision")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Carte Nouveaux mots */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 dark:from-green-900 dark:to-green-800 rounded-3xl p-6 shadow-lg border-2 border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("newWords")}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t("newWordsDescription")}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-4">
                10 {t("wordsCountNew")}
              </div>
              <button
                onClick={handleStartNewWords}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 bg-green-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-5 h-5" />
                {t("startNewWords")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Onglet Catégories */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("myCategories")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {userCategories.map((cat) => (
                <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{cat.description}</p>
                    </div>
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("availableCategories")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCategories
                .filter(cat => !userCategories.some(uc => uc.id === cat.id))
                .map((cat) => (
                  <div key={cat.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">{cat.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{cat.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddCategory(cat.id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t("add")}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Onglet Mes Mots */}
        {activeTab === 'myWords' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("myWords")} ({myWords.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myWords.map((word) => (
                <div
                  key={word.id}
                  onClick={() => handleWordClick(word)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-xl cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{word.text}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{word.meaning}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Onglet Tous les Mots */}
        {activeTab === 'allWords' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("allWords")} ({allWords.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allWords.map((word) => {
                const isLearned = learnedWordIds.has(word.id);
                return (
                  <div
                    key={word.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{word.text}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{word.meaning}</p>
                      </div>
                      {isLearned && (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    {isLearned ? (
                      <div className="text-sm text-green-600 font-semibold">{t("alreadyLearned")}</div>
                    ) : (
                      <button
                        onClick={() => handleLearnWord(word.id)}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t("add")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
