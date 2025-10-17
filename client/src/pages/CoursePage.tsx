import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Star, Flame } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { getCategories } from "../services/category.services";
import { getUserCategories } from "../services/user-category.services";
import UnitCard from "../components/UnitCard";
import StreakDisplay from "../components/StreakDisplay";
import ProgressBar from "../components/ProgressBar";
interface WordAttributes {
  id: string;
  text: string;
  meaning: string;
  categoryId: string;
}

interface Unit {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  words: WordAttributes[];
  progress: number;
  isLocked: boolean;
}

const translations = {
  fr: {
    title: "Mes Cours",
    subtitle: "Continue ton apprentissage",
    startLearning: "Commencer",
    units: "Unités",
    wordsLearned: "Mots appris",
    streak: "Série",
    noUnits: "Aucune unité disponible",
    selectCategory: "Sélectionne une catégorie pour commencer"
  },
  en: {
    title: "My Courses",
    subtitle: "Continue your learning",
    startLearning: "Start",
    units: "Units",
    wordsLearned: "Words learned",
    streak: "Streak",
    noUnits: "No units available",
    selectCategory: "Select a category to get started"
  },
  es: {
    title: "Mis Cursos",
    subtitle: "Continúa tu aprendizaje",
    startLearning: "Comenzar",
    units: "Unidades",
    wordsLearned: "Palabras aprendidas",
    streak: "Racha",
    noUnits: "No hay unidades disponibles",
    selectCategory: "Selecciona una categoría para comenzar"
  },
  ar: {
    title: "دوراتي",
    subtitle: "تابع تعلمك",
    startLearning: "ابدأ",
    units: "وحدات",
    wordsLearned: "الكلمات المستفادة",
    streak: "السلسلة",
    noUnits: "لا توجد وحدات متاحة",
    selectCategory: "اختر فئة للبدء"
  }
};

export default function CoursePage() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catsData, userCatsData] = await Promise.all([
        getCategories(),
        getUserCategories()
      ]);
      
      const catsArray = Array.isArray(catsData) ? catsData : [];
      const userCatsArray = Array.isArray(userCatsData) ? userCatsData : [];

      // Créer des unités à partir des catégories
      const userCategoryIds = new Set(userCatsArray.map(uc => uc.categoryId || uc.category_id));
      const availableCategories = catsArray.filter(c => userCategoryIds.has(c.id));
      
      const generatedUnits: Unit[] = availableCategories.map((cat, index) => ({
        id: cat.id,
        title: cat.name,
        description: cat.description || `Apprends les mots de ${cat.name}`,
        categoryId: cat.id,
        words: [], // À remplir avec les mots réels
        progress: Math.floor(Math.random() * 100), // Temporaire
        isLocked: index > 0 && availableCategories[index - 1].progress < 80
      }));

      setUnits(generatedUnits);
    } catch (error) {
        alert("Erreur lors de la récupération des données:" + error);
    } finally {
      setLoading(false);
    }
  };

  const totalWords = useMemo(() => units.reduce((sum, unit) => sum + unit.words.length, 0), [units]);
  const completedWords = useMemo(() => units.reduce((sum, unit) => sum + Math.floor((unit.progress / 100) * unit.words.length), 0), [units]);

  const handleUnitClick = (unit: Unit) => {
    if (unit.isLocked) return;
    navigate(`/course/${unit.id}/learn`);
  };

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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
              </div>
            </div>
            <StreakDisplay streak={7} size="md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("units")}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{units.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("wordsLearned")}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedWords}/{totalWords}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t("streak")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
          <ProgressBar
            current={completedWords}
            total={totalWords}
            color="#3B82F6"
            height={12}
            showPercentage={true}
            animated={true}
          />
        </div>

        {/* Units */}
        {units.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-lg">
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t("noUnits")}</p>
            <button
              onClick={() => navigate("/categories")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
            >
              {t("selectCategory")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("units")}</h2>
            {units.map((unit, index) => (
              <UnitCard
                key={unit.id}
                title={unit.title}
                description={unit.description}
                progress={unit.progress}
                totalWords={unit.words.length || 10}
                completedWords={Math.floor((unit.progress / 100) * (unit.words.length || 10))}
                isLocked={unit.isLocked}
                isActive={index === 0}
                onClick={() => handleUnitClick(unit)}
                color={index % 2 === 0 ? "#3B82F6" : "#22C55E"}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

