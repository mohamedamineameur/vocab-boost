import { useState, useEffect } from 'react';
import { getUserWords } from '../services/user-word.services';
import { getUserCategories } from '../services/user-category.services';
import { useTranslate } from '../contexts/TranslateContext';
import { useNavigate } from 'react-router';
import { BookOpen, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const translations = {
  fr: {
    dashboard: "Tableau de bord",
    welcome: "Bienvenue",
    words: "Le nombre de mots séléctionnés à apprendre",
    categories: "Le nombre de catégories séléctionnées",
    click: "cliquez pour continuer"
  },
  en: {
    dashboard: "Dashboard",
    welcome: "Welcome",
    words: "Number of words selected to learn",
    categories: "Number of categories selected",
    click: "click to continue"
  },
  es: {
    dashboard: "Panel de control",
    welcome: "Bienvenido",
    words: "Número de palabras seleccionadas para aprender",
    categories: "Número de categorías seleccionadas",
    click: "haz clic para continuar"
  },
  ar: {
    dashboard: "لوحة التحكم",
    welcome: "مرحباً",
    words: "عدد الكلمات المحددة للتعلم",
    categories: "عدد الفئات المحددة",
    click: "انقر للمتابعة"
  }
};

const asArray = (v: unknown) => {
  if (Array.isArray(v)) return v;
  const keys = ['data','rows','items','results','userCategories','categories','words'];
  const vObj = v as Record<string, unknown>;
  for (const k of keys) if (Array.isArray(vObj?.[k])) return vObj[k];
  return [];
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const { user } = useAuth();
  const t = translations[language as keyof typeof translations] ?? translations.fr;

  const [words, setWords] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [wRes, cRes] = await Promise.all([getUserWords(), getUserCategories()]);
        if (!mounted) return;
        setWords(asArray(wRes));
        setCategories(asArray(cRes));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const wordsCount = words.length;
  const categoriesCount = categories.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
        <div className="max-w-xl mx-auto px-5 py-8">
          <header className="mb-6">
            <div className="h-6 w-40 rounded bg-black/10 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-black/10 animate-pulse" />
          </header>
          <div className="grid grid-cols-1 gap-3">
            <div className="h-24 rounded-2xl border border-black/10 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            </div>
            <div className="h-24 rounded-2xl border border-black/10 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // styles utilitaires
  const cardBase =
    "group relative w-full rounded-2xl border border-black/10 bg-white dark:bg-gray-800 shadow-sm active:scale-[0.98] transition";
  const rowBase = "flex items-center justify-between gap-3 p-4";
  const leftBase = "flex items-center gap-3";
  const iconWrap = "h-12 w-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center";
  const countStyle = "text-2xl font-bold text-[#111827] leading-none";
  const labelStyle = "text-xs text-black/60";
  const arrow =
    "shrink-0 h-5 w-5 text-black/40 group-hover:translate-x-0.5 transition-transform";

  const wordsDisabled = wordsCount === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F3F4F6]">
      <div className="max-w-xl mx-auto px-5 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-[#111827]">{t.dashboard}</h1>
          <p className="text-sm text-black/60">
            {t.welcome} {user?.firstname} {user?.lastname} 👋
          </p>
        </header>

        {/* Cartes métriques */}
        <div className="grid grid-cols-1 gap-3">
          {/* Catégories → /categories */}
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className={`${cardBase} hover:shadow-md hover:border-[#3B82F6]/30`}
            aria-label="Aller aux catégories"
          >
            <div className={rowBase}>
              <div className={leftBase}>
                <div className={iconWrap}>
                  <Tag className="text-[#3B82F6]" />
                </div>
                <div>
                  <div className={countStyle}>{categoriesCount}</div>
                  <div className={labelStyle}>{t.categories}</div>
                </div>
              </div>
              <ChevronRight className={arrow} />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#3B82F6]/10" />
          </button>

          {/* Mots → /words (grisé si 0) */}
          <button
            type="button"
            onClick={() => !wordsDisabled && navigate('/words')}
            disabled={wordsDisabled}
            aria-disabled={wordsDisabled}
            className={[
              cardBase,
              wordsDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:shadow-md hover:border-[#22C55E]/30"
            ].join(' ')}
            aria-label={wordsDisabled ? "Aucun mot sélectionné" : "Aller aux mots"}
            title={wordsDisabled ? "Ajoutez des mots depuis les catégories" : ""}
          >
            <div className={rowBase}>
              <div className={leftBase}>
                <div className={iconWrap}>
                  <BookOpen className={wordsDisabled ? "text-black/30" : "text-[#22C55E]"} />
                </div>
                <div>
                  <div className={countStyle}>{wordsCount}</div>
                  <div className={labelStyle}>{t.words}</div>
                </div>
              </div>
              <ChevronRight className={arrow} />
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-[#22C55E]/10" />
          </button>
        </div>

        {/* Hint / CTA */}
        <div className="mt-6 text-center text-xs text-black/50">
          {t.click}
        </div>
      </div>
    </div>
  );
}
