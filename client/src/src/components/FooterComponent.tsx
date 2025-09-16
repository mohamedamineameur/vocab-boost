import { useTranslate } from "../contexts/TranslateContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// ✅ traductions locales du footer
const footerTranslations = {
  fr: {
    text: "Boost ton anglais chaque jour 🚀"
  },
  en: {
    text: "Boost your English every day 🚀"
  },
  ar: {
    text: "عزز لغتك الإنجليزية كل يوم 🚀"
  },
  es: {
    text: "Mejora tu inglés cada día 🚀"
  }
};

export default function Footer() {
  const { language, setLanguage } = useTranslate();
  const t = (key: keyof typeof footerTranslations["fr"]) =>
    footerTranslations[language][key] || footerTranslations.en[key];
  const navigate= useNavigate()

  return (
    <footer className="w-full text-white shadow-inner">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Texte du footer */}
        <span className="text-sm md:text-base font-medium tracking-wide text-center md:text-left">
          © {new Date().getFullYear()}    <span className="text-sm md:text-base font-medium tracking-wide text-center md:text-left">
          © {new Date().getFullYear()}{" "}
          <Link
            to="/"
            className="font-bold hover:underline hover:text-white/90 transition"
          >
            VocabBoost
          </Link>{" "}
          
        </span> – {t("text")}
        </span>

        {/* Sélecteur de langue */}
        <div className="flex items-center gap-2">
          <label htmlFor="lang-select" className="text-xs md:text-sm opacity-90">
            🌍
          </label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white/90 text-[#111827] text-sm font-medium border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] hover:cursor-pointer transition"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇸🇦 العربية</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>
      </div>
    </footer>
  );
}
