import { useNavigate } from "react-router-dom";
import { BookOpen, Rocket } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import VocabBoostLogoPNG from "../components/LogoComponentPNG"

// ✅ traductions locales à ce composant
const homeTranslations = {
  fr: {
    title: "VocabBoost",
    subtitle: "Apprends 3000 mots essentiels",
    description:
      "Avec VocabBoost, progresse chaque jour grâce à des sessions rapides et motivantes. Débloque des badges, garde ta série 🔥 et booste ton vocabulaire efficacement.",
    login: "Se connecter",
    signup: "Créer un compte",
    footer: "Boost ton anglais chaque jour 🚀"
  },
  en: {
    title: "VocabBoost",
    subtitle: "Learn 3000 essential words",
    description:
      "With VocabBoost, improve every day with quick and motivating sessions. Unlock badges, keep your streak 🔥 and boost your vocabulary effectively.",
    login: "Log in",
    signup: "Sign up",
    footer: "Boost your English every day 🚀"
  },
  ar: {
    title: "VocabBoost",
    subtitle: "تعلم 3000 كلمة أساسية",
    description:
      "مع VocabBoost، تطور كل يوم من خلال جلسات سريعة ومحفزة. افتح الشارات، حافظ على سلسلتك 🔥 وعزز مفرداتك بفعالية.",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    footer: "عزز لغتك الإنجليزية كل يوم 🚀"
  },
  es: {
    title: "VocabBoost",
    subtitle: "Aprende 3000 palabras esenciales",
    description:
      "Con VocabBoost, progresa cada día con sesiones rápidas y motivadoras. Desbloquea insignias, mantén tu racha 🔥 y mejora tu vocabulario eficazmente.",
    login: "Iniciar sesión",
    signup: "Crear una cuenta",
    footer: "Mejora tu inglés cada día 🚀"
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { language } = useTranslate();

  // petite fonction utilitaire de traduction
  const t = (key: keyof typeof homeTranslations["fr"]) =>
    homeTranslations[language][key] || homeTranslations.en[key];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-center">
        <VocabBoostLogoPNG size="medium" />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-lg w-full animate-fadeIn">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22C55E] flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#111827] dark:text-white">
            {t("subtitle")}
          </h2>
          <p className="text-base md:text-lg text-[#111827]/80 dark:text-gray-300 mb-8 leading-relaxed">
            {t("description")}
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="w-full bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition flex items-center justify-center gap-2 font-semibold"
            >
              <Rocket className="w-5 h-5" />
              {t("signup")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white dark:bg-gray-800 text-[#3B82F6] text-lg py-3 px-6 rounded-2xl border-2 border-[#3B82F6] hover:bg-blue-50 active:scale-95 transition font-medium"
            >
              {t("login")}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-4 text-center">
        <p className="text-white/80 text-sm sm:text-base">
          {t("footer")}
        </p>
      </footer>
    </div>
  );
}
