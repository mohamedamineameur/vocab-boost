import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslate } from "../contexts/TranslateContext";
import { getCategories } from "../services/category.services";
import { createUserCategory } from "../services/user-category.services";

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
    title: "Choisis tes catégories",
    subtitle: "Personnalise ton apprentissage",
    description: "Sélectionne au moins 3 catégories pour commencer ton parcours",
    continue: "Continuer",
    loading: "Chargement...",
    error: "Erreur lors du chargement",
    selectMore: "Sélectionne au moins 3 catégories",
    selected: "sélectionnées"
  },
  en: {
    title: "Choose your categories",
    subtitle: "Personalize your learning",
    description: "Select at least 3 categories to start your journey",
    continue: "Continue",
    loading: "Loading...",
    error: "Error loading data",
    selectMore: "Select at least 3 categories",
    selected: "selected"
  },
  es: {
    title: "Elige tus categorías",
    subtitle: "Personaliza tu aprendizaje",
    description: "Selecciona al menos 3 categorías para comenzar",
    continue: "Continuar",
    loading: "Cargando...",
    error: "Error al cargar",
    selectMore: "Selecciona al menos 3 categorías",
    selected: "seleccionadas"
  },
  ar: {
    title: "اختر فئاتك",
    subtitle: "خصّص تعلمك",
    description: "اختر 3 فئات على الأقل للبدء",
    continue: "متابعة",
    loading: "جارٍ التحميل...",
    error: "خطأ في التحميل",
    selectMore: "اختر 3 فئات على الأقل",
    selected: "محدد"
  }
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useTranslate();
  const t = (key: keyof typeof translations.fr) => {
    const lang = language as keyof typeof translations;
    return translations[lang]?.[key] || translations.en[key];
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCategories();
      const catsArray = Array.isArray(response) ? response : [];
      setCategories(catsArray);
    } catch (err) {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleContinue = async () => {
    if (selectedIds.size < 3 || !user?.id) return;

    try {
      setSaving(true);
      const payloads = Array.from(selectedIds).map(categoryId => ({
        categoryId,
        userId: user.id
      }));

      await Promise.all(payloads.map(p => createUserCategory(p)));
      navigate("/learn");
    } catch (err) {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
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
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("title")}</h1>
            <p className="text-gray-600 dark:text-gray-300">{t("subtitle")}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t("description")}</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
            <span className="font-semibold">{selectedIds.size}</span>
            <span>{t("selected")}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
            {error}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map((cat) => {
            const isSelected = selectedIds.has(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 active:scale-95
                  ${isSelected 
                    ? "bg-gradient-to-br from-blue-500 to-green-500 text-white border-transparent shadow-xl" 
                    : "bg-white dark:bg-gray-800 text-white dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-lg"
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">{getLabel(cat)}</h3>
                  {cat.description && (
                    <p className={`text-sm ${isSelected ? "text-white/90" : "text-gray-600 dark:text-gray-300"}`}>
                      {cat.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 -mx-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleContinue}
              disabled={selectedIds.size < 3 || saving}
              className={`
                w-full py-4 px-6 rounded-full font-semibold text-lg transition-all duration-300
                flex items-center justify-center gap-2
                ${selectedIds.size >= 3 && !saving
                  ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }
              `}
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <span>{t("continue")}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {selectedIds.size < 3 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                {t("selectMore")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

