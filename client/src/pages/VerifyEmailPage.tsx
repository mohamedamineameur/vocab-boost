import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import api from "../services/main";

const tr = {
  fr: {
    verifying: "Vérification en cours...",
    success: "Email vérifié avec succès !",
    alreadyVerified: "Votre email est déjà vérifié.",
    error: "Erreur lors de la vérification",
    invalidToken: "Le lien de vérification est invalide ou a expiré.",
    goToLogin: "Se connecter",
    goToHome: "Retour à l'accueil",
  },
  en: {
    verifying: "Verifying...",
    success: "Email verified successfully!",
    alreadyVerified: "Your email is already verified.",
    error: "Verification error",
    invalidToken: "The verification link is invalid or has expired.",
    goToLogin: "Log in",
    goToHome: "Back to home",
  },
  ar: {
    verifying: "جاري التحقق...",
    success: "تم التحقق من البريد الإلكتروني بنجاح!",
    alreadyVerified: "تم التحقق من بريدك الإلكتروني بالفعل.",
    error: "خطأ في التحقق",
    invalidToken: "رابط التحقق غير صالح أو منتهي الصلاحية.",
    goToLogin: "تسجيل الدخول",
    goToHome: "العودة إلى الصفحة الرئيسية",
  },
  es: {
    verifying: "Verificando...",
    success: "¡Correo electrónico verificado con éxito!",
    alreadyVerified: "Tu correo electrónico ya está verificado.",
    error: "Error de verificación",
    invalidToken: "El enlace de verificación no es válido o ha expirado.",
    goToLogin: "Iniciar sesión",
    goToHome: "Volver al inicio",
  },
} as const;

export default function VerifyEmailPage() {
  const { userId, verificationToken } = useParams<{ userId: string; verificationToken: string }>();
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (tr as Record<string, Record<string, string>>)[language] ?? tr.en;
  const isRTL = language === "ar";

  const [status, setStatus] = useState<"loading" | "success" | "already_verified" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !verificationToken) {
        setStatus("error");
        setMessage(t.invalidToken);
        return;
      }

      try {
        const response = await api.post(`/users/verify/${userId}/${verificationToken}`);
        const data = response.data;

        if (data.alreadyVerified) {
          setStatus("already_verified");
          setMessage(data.message?.[language] || data.message?.en || t.alreadyVerified);
        } else if (data.verified) {
          setStatus("success");
          setMessage(data.message?.[language] || data.message?.en || t.success);
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { error?: Record<string, string> | string } } };
        setStatus("error");
        
        if (error.response?.data?.error) {
          const errorData = error.response.data.error;
          if (typeof errorData === "object") {
            setMessage(errorData[language] || errorData.en || t.error);
          } else {
            setMessage(errorData);
          }
        } else {
          setMessage(t.error);
        }
      }
    };

    verifyEmail();
  }, [userId, verificationToken, language]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E]"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto text-[#3B82F6] animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-[#111827] mb-2">{t.verifying}</h2>
            <p className="text-[#111827]/70">Veuillez patienter...</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#22C55E]" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">{t.success}</h2>
            <p className="text-[#111827]/70 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              {t.goToLogin}
            </button>
          </div>
        )}

        {/* Already Verified State */}
        {status === "already_verified" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#3B82F6]" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">{t.alreadyVerified}</h2>
            <p className="text-[#111827]/70 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22C55E] text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              {t.goToLogin}
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#111827] mb-2">{t.error}</h2>
            <p className="text-[#111827]/70 mb-6">{message}</p>
            <button
              onClick={() => navigate("/home")}
              className="w-full py-3 px-6 rounded-2xl bg-[#111827] text-white font-semibold shadow-lg hover:opacity-90 transition"
            >
              {t.goToHome}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

