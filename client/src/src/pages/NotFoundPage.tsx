import { Link } from "react-router-dom";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

const tr = {
  fr: {
    title: "Page non trouvée",
    subtitle: "Oops ! La page que vous recherchez n'existe pas.",
    description: "Il semble que vous ayez suivi un lien cassé ou tapé une URL incorrecte.",
    suggestions: "Que souhaitez-vous faire ?",
    goHome: "Retour à l'accueil",
    goBack: "Retour en arrière",
    search: "Rechercher",
    errorCode: "Erreur 404",
  },
  en: {
    title: "Page not found",
    subtitle: "Oops! The page you're looking for doesn't exist.",
    description: "It looks like you followed a broken link or typed an incorrect URL.",
    suggestions: "What would you like to do?",
    goHome: "Go to home",
    goBack: "Go back",
    search: "Search",
    errorCode: "Error 404",
  },
  ar: {
    title: "الصفحة غير موجودة",
    subtitle: "عذراً! الصفحة التي تبحث عنها غير موجودة.",
    description: "يبدو أنك اتبعت رابطاً معطلاً أو كتبت عنواناً غير صحيح.",
    suggestions: "ماذا تريد أن تفعل؟",
    goHome: "العودة للرئيسية",
    goBack: "العودة للخلف",
    search: "البحث",
    errorCode: "خطأ 404",
  },
  es: {
    title: "Página no encontrada",
    subtitle: "¡Ups! La página que buscas no existe.",
    description: "Parece que seguiste un enlace roto o escribiste una URL incorrecta.",
    suggestions: "¿Qué te gustaría hacer?",
    goHome: "Ir al inicio",
    goBack: "Volver atrás",
    search: "Buscar",
    errorCode: "Error 404",
  },
} as const;

export default function NotFoundPage() {
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] flex items-center justify-center px-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-2xl w-full text-center">
        {/* Container principal */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/40">
          {/* Icône d'erreur */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <div className="text-6xl font-bold text-gray-300 mb-4">
              {t("errorCode")}
            </div>
          </div>

          {/* Titre et description */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4">
            {t("title")}
          </h1>
          
          <p className="text-lg text-[#111827]/70 mb-8 leading-relaxed">
            {t("subtitle")}
          </p>
          
          <p className="text-[#111827]/60 mb-10">
            {t("description")}
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <p className="text-[#111827]/70 font-medium mb-6">
              {t("suggestions")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-semibold hover:bg-[#2563EB] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                {t("goHome")}
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#3B82F6] border-2 border-[#3B82F6] rounded-xl font-semibold hover:bg-[#3B82F6] hover:text-white transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("goBack")}
              </button>
            </div>
          </div>

          {/* Décoration */}
          <div className="mt-12 flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#3B82F6]/30 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Message d'aide */}
        <div className="mt-8 text-white/80 text-sm">
          <p>
            Si vous pensez qu'il s'agit d'une erreur, contactez notre support technique.
          </p>
        </div>
      </div>
    </div>
  );
}
