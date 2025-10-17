import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyMFACode } from "../services/session.services";
import { Shield, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

const tr = {
  fr: {
    heroTitle: "🔐 Vérification en 2 étapes",
    heroSubtitle: "Saisissez le code envoyé à votre email",
    title: "Code de vérification",
    codeLabel: "Code à 6 chiffres",
    button: "Vérifier",
    loading: "Vérification...",
    error: "Une erreur est survenue",
    success: "✅ Code vérifié ! Connexion en cours...",
    invalidCode: "Code invalide. Veuillez réessayer.",
    codeExpired: "Le code a expiré. Reconnectez-vous.",
    enterCode: "Entrez le code à 6 chiffres",
  },
  en: {
    heroTitle: "🔐 Two-step verification",
    heroSubtitle: "Enter the code sent to your email",
    title: "Verification code",
    codeLabel: "6-digit code",
    button: "Verify",
    loading: "Verifying...",
    error: "An error occurred",
    success: "✅ Code verified! Logging in...",
    invalidCode: "Invalid code. Please try again.",
    codeExpired: "Code has expired. Please log in again.",
    enterCode: "Enter the 6-digit code",
  },
  ar: {
    heroTitle: "🔐 التحقق بخطوتين",
    heroSubtitle: "أدخل الرمز المرسل إلى بريدك الإلكتروني",
    title: "رمز التحقق",
    codeLabel: "رمز مكون من 6 أرقام",
    button: "تحقق",
    loading: "جاري التحقق...",
    error: "حدث خطأ ما",
    success: "✅ تم التحقق من الرمز! جاري تسجيل الدخول...",
    invalidCode: "رمز غير صالح. حاول مرة أخرى.",
    codeExpired: "انتهت صلاحية الرمز. يرجى تسجيل الدخول مرة أخرى.",
    enterCode: "أدخل الرمز المكون من 6 أرقام",
  },
  es: {
    heroTitle: "🔐 Verificación en 2 pasos",
    heroSubtitle: "Ingresa el código enviado a tu correo",
    title: "Código de verificación",
    codeLabel: "Código de 6 dígitos",
    button: "Verificar",
    loading: "Verificando...",
    error: "Ocurrió un error",
    success: "✅ ¡Código verificado! Iniciando sesión...",
    invalidCode: "Código inválido. Inténtalo de nuevo.",
    codeExpired: "El código ha expirado. Por favor, inicia sesión de nuevo.",
    enterCode: "Ingresa el código de 6 dígitos",
  },
} as const;

export default function MFAVerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslate();
  const { refreshUser } = useAuth();
  const t = (key: keyof typeof tr["fr"]) =>
    tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Récupérer userId depuis l'état de navigation
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyMFACode(userId, code);
      setSuccess(true);
      
      // Rafraîchir les données utilisateur
      await refreshUser();
      
      // Redirection vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: unknown) {
      let message: string = t("error");
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

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          {t("heroTitle")}
        </h1>
        <p className="text-white/90 mt-2 text-lg">{t("heroSubtitle")}</p>
      </div>

      {/* MFA Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#22C55E] flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          {t("title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Code Input */}
          <div className="relative group">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder=" "
              value={code}
              onChange={handleChange}
              required
              maxLength={6}
              className="peer w-full px-4 pt-6 pb-2 border-2 rounded-2xl text-[#111827] bg-white dark:bg-gray-800/60 focus:bg-white dark:bg-gray-800 transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none text-center text-3xl font-bold tracking-widest"
              style={{ letterSpacing: "0.5em" }}
            />
            <label className="absolute left-4 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("codeLabel")}
            </label>
          </div>

          <p className="text-sm text-center text-gray-600 dark:text-gray-300">
            {t("enterCode")}
          </p>

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
            disabled={loading || code.length !== 6}
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
          <button
            onClick={() => navigate("/login")}
            className="text-[#3B82F6] font-semibold hover:underline text-sm"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}

