import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BookOpen, Play, Target } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { getCategories } from "../services/category.services";
import { getUserCategories } from "../services/user-category.services";
import StreakDisplay from "../components/StreakDisplay";

interface Category {
  id: string;
  name: string;
  description?: string;
  frTranslation?: string;
  esTranslation?: string;
  arTranslation?: string;
}

const translations = {
  fr: {
    title: "Prêt à apprendre ?",
    subtitle: "Choisis une catégorie et commence",
    startLearning: "Commencer",
    myCategories: "Mes catégories",
    selectCategory: "Sélectionner une catégorie",
    noCategories: "Aucune catégorie disponible",
    selectFirst: "Sélectionne ta première catégorie"
  },
  en: {
    title: "Ready to learn?",
    subtitle: "Choose a category and start",
    startLearning: "Start",
    myCategories: "My categories",
    selectCategory: "Select a category",
    noCategories: "No categories available",
    selectFirst: "Select your first category"
  },
  es: {
    title: "¿Listo para aprender?",
    subtitle: "Elige una categoría y comienza",
    startLearning: "Comenzar",
    myCategories: "Mis categorías",
    selectCategory: "Seleccionar una categoría",
    noCategories: "No hay categorías disponibles",
    selectFirst: "Selecciona tu primera categoría"
  },
  ar: {
    title: "هل أنت مستعد للتعلم؟",
    subtitle: "اختر فئة وابدأ",
    startLearning: "ابدأ",
    myCategories: "فئاتي",
    selectCategory: "اختر فئة",
    noCategories: "لا توجد فئات متاحة",
    selectFirst: "اختر فئتك الأولى"
  }
};

export default function LearningHomePage() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const [catsData, userCatsData] = await Promise.all([
        getCategories(),
        getUserCategories()
      ]);
      
      const catsArray = Array.isArray(catsData) ? catsData : [];
      const userCatsArray = Array.isArray(userCatsData) ? userCatsData : [];

      // Filtrer les catégories de l'utilisateur
      const userCategoryIds = new Set(userCatsArray.map(uc => uc.categoryId || uc.category_id));
      const userCategories = catsArray.filter(c => userCategoryIds.has(c.id));
      
      setCategories(userCategories);
      
      // Sélectionner automatiquement la première catégorie
      if (userCategories.length > 0) {
        setSelectedCategory(userCategories[0].id);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    if (selectedCategory) {
      navigate(`/learn/${selectedCategory}`);
    }
  };

  const getLabel = (cat: Category) => {
    switch (language) {
      case "fr": return cat.frTranslation || cat.name;
      case "es": return cat.esTranslation || cat.name;
      case "ar": return cat.arTranslation || cat.name;
      default: return cat.name;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("title")}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
            </div>
            <StreakDisplay streak={7} size="md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {t("myCategories")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {categories.length > 0 
              ? t("selectCategory") 
              : t("noCategories")}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900 rounded-3xl p-12 text-center shadow-lg border-2 border-blue-200">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Bienvenue ! 👋</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">Commencez par sélectionner vos catégories de mots préférées</p>
            <button
              onClick={() => navigate("/categories")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Sparkles className="w-6 h-6" />
              {t("selectFirst")}
            </button>
            <p className="text-sm text-gray-500 mt-4">Minimum 3 catégories</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    w-full p-6 rounded-3xl border-2 transition-all duration-300 transform hover:scale-[1.02]
                    ${isSelected 
                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent shadow-xl" 
                      : "bg-white dark:bg-gray-800 text-white dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-lg"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl font-bold mb-1">{getLabel(cat)}</h3>
                      {cat.description && (
                        <p className={`text-sm ${isSelected ? "text-white/90" : "text-gray-600 dark:text-gray-300"}`}>
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${isSelected ? "bg-white dark:bg-gray-800/20" : "bg-blue-100"}
                    `}>
                      <BookOpen className={`w-6 h-6 ${isSelected ? "text-white" : "text-blue-600"}`} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Start Button */}
        {selectedCategory && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleStartLearning}
                className="w-full py-4 px-6 rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6" />
                {t("startLearning")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

