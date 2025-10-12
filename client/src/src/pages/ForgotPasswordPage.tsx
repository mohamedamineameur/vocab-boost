import { useState } from "react";
import { requestPasswordReset } from "../../services/user.services";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useNavigate } from "react-router-dom";

const tr = {
  fr: {
    heroTitle: "🔐 Mot de passe oublié ?",
    heroSubtitle: "Pas de problème, on va t'aider à le récupérer !",
    title: "Réinitialiser le mot de passe",
    email: "Email",
    button: "Envoyer le lien",
    loading: "Envoi en cours...",
    error: "Une erreur est survenue",
    success: "✅ Lien envoyé ! Vérifiez votre boîte de réception.",
    backToLogin: "Retour à la connexion",
    rememberPassword: "Vous vous souvenez de votre mot de passe ?",
  },
  en: {
    heroTitle: "🔐 Forgot your password?",
    heroSubtitle: "No problem, we'll help you recover it!",
    title: "Reset password",
    email: "Email",
    button: "Send reset link",
    loading: "Sending...",
    error: "An error occurred",
    success: "✅ Link sent! Check your inbox.",
    backToLogin: "Back to login",
    rememberPassword: "Remember your password?",
  },
  ar: {
    heroTitle: "🔐 نسيت كلمة المرور؟",
    heroSubtitle: "لا مشكلة، سنساعدك في استردادها!",
    title: "إعادة تعيين كلمة المرور",
    email: "البريد الإلكتروني",
    button: "إرسال الرابط",
    loading: "جاري الإرسال...",
    error: "حدث خطأ ما",
    success: "✅ تم إرسال الرابط! تحقق من صندوق الوارد.",
    backToLogin: "العودة لتسجيل الدخول",
    rememberPassword: "تذكرت كلمة المرور؟",
  },
  es: {
    heroTitle: "🔐 ¿Olvidaste tu contraseña?",
    heroSubtitle: "¡No hay problema, te ayudaremos a recuperarla!",
    title: "Restablecer contraseña",
    email: "Correo electrónico",
    button: "Enviar enlace",
    loading: "Enviando...",
    error: "Ocurrió un error",
    success: "✅ ¡Enlace enviado! Revisa tu bandeja de entrada.",
    backToLogin: "Volver al inicio de sesión",
    rememberPassword: "¿Recuerdas tu contraseña?",
  },
} as const;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (key: keyof typeof tr["fr"]) =>
    tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: unknown) {
      let message = t("error");
      const error = err as { response?: { data?: unknown }; message?: string };

      if (error.response?.data) {
        const data = error.response.data as Record<string, unknown>;
        if (typeof data === "string") {
          message = data;
        } else if (data.message) {
          const msg = data.message as Record<string, string> | string;
          message = typeof msg === "object" ? (msg[language] || msg.en || JSON.stringify(msg)) : msg;
        } else if (data.error) {
          const err = data.error as Record<string, string> | string;
          message = typeof err === "object" ? (err[language] || err.en || JSON.stringify(err)) : err;
        } else if (Array.isArray(data.errors)) {
          message = data.errors.join(", ");
        }
      } else if (error.message) {
        message = error.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          {t("heroTitle")}
        </h1>
        <p className="text-white/90 mt-2 text-lg">{t("heroSubtitle")}</p>
      </div>

      {/* Forgot Password Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          {t("title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#3B82F6]" size={20} />
            <input
              type="email"
              name="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full pl-10 pr-4 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("email")}
            </label>
          </div>

          {/* Error & Success */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-xl text-center shadow">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-600 text-sm font-medium px-4 py-2 rounded-xl text-center shadow">
              {t("success")}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-[#3B82F6] to-[#22C55E] hover:opacity-90 active:scale-95 transition transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t("loading")}
              </>
            ) : (
              t("button")
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            {t("rememberPassword")}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-[#3B82F6] font-semibold hover:underline"
          >
            <ArrowLeft size={16} />
            {t("backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
