import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/user.services";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";

const tr = {
  fr: {
    heroTitle: "🔐 Nouveau mot de passe",
    heroSubtitle: "Créez un mot de passe sécurisé pour votre compte",
    title: "Réinitialiser le mot de passe",
    password: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    button: "Réinitialiser",
    loading: "Réinitialisation...",
    error: "Une erreur est survenue",
    success: "✅ Mot de passe réinitialisé ! Redirection...",
    backToLogin: "Retour à la connexion",
    passwordRules: {
      title: "Règles du mot de passe :",
      length: "Au moins 12 caractères",
      uppercase: "Une majuscule",
      number: "Un chiffre",
      special: "Un caractère spécial",
      match: "Les mots de passe correspondent",
    },
  },
  en: {
    heroTitle: "🔐 New password",
    heroSubtitle: "Create a secure password for your account",
    title: "Reset password",
    password: "New password",
    confirmPassword: "Confirm password",
    button: "Reset",
    loading: "Resetting...",
    error: "An error occurred",
    success: "✅ Password reset! Redirecting...",
    backToLogin: "Back to login",
    passwordRules: {
      title: "Password rules:",
      length: "At least 12 characters",
      uppercase: "One uppercase letter",
      number: "One number",
      special: "One special character",
      match: "Passwords match",
    },
  },
  ar: {
    heroTitle: "🔐 كلمة مرور جديدة",
    heroSubtitle: "أنشئ كلمة مرور آمنة لحسابك",
    title: "إعادة تعيين كلمة المرور",
    password: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    button: "إعادة تعيين",
    loading: "جاري إعادة التعيين...",
    error: "حدث خطأ ما",
    success: "✅ تم إعادة تعيين كلمة المرور! جاري التوجيه...",
    backToLogin: "العودة لتسجيل الدخول",
    passwordRules: {
      title: "قواعد كلمة المرور:",
      length: "12 حرف على الأقل",
      uppercase: "حرف كبير واحد",
      number: "رقم واحد",
      special: "رمز خاص واحد",
      match: "كلمات المرور متطابقة",
    },
  },
  es: {
    heroTitle: "🔐 Nueva contraseña",
    heroSubtitle: "Crea una contraseña segura para tu cuenta",
    title: "Restablecer contraseña",
    password: "Nueva contraseña",
    confirmPassword: "Confirmar contraseña",
    button: "Restablecer",
    loading: "Restableciendo...",
    error: "Ocurrió un error",
    success: "✅ ¡Contraseña restablecida! Redirigiendo...",
    backToLogin: "Volver al inicio de sesión",
    passwordRules: {
      title: "Reglas de la contraseña:",
      length: "Al menos 12 caracteres",
      uppercase: "Una letra mayúscula",
      number: "Un número",
      special: "Un carácter especial",
      match: "Las contraseñas coinciden",
    },
  },
} as const;

export default function ResetPasswordPage() {
  const { userId, resetToken } = useParams<{ userId: string; resetToken: string }>();
  const navigate = useNavigate();
  const { language } = useTranslate();
  const t = (key: Exclude<keyof typeof tr["fr"], "passwordRules">): string => {
    const value = tr[language as keyof typeof tr]?.[key] ?? tr.en[key];
    return typeof value === "string" ? value : String(value);
  };
  const tPasswordRules = (key: keyof typeof tr["fr"]["passwordRules"]) =>
    tr[language as keyof typeof tr]?.passwordRules?.[key] ?? tr.en.passwordRules[key];
  const isRTL = language === "ar";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation
  const passwordRules = {
    length: form.password.length >= 12,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
    match: !!(form.password && form.password === form.confirmPassword),
  };

  const isFormValid = Object.values(passwordRules).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !resetToken) {
      setError("ID utilisateur ou token de réinitialisation manquant");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(userId, resetToken, form.password, form.confirmPassword);
      setSuccess(true);
      
      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          {t("heroTitle")}
        </h1>
        <p className="text-white/90 mt-2 text-lg">{t("heroSubtitle")}</p>
      </div>

      {/* Reset Password Card */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          {t("title")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#3B82F6]" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              required
              className="peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white dark:bg-gray-800/60 focus:bg-white dark:bg-gray-800 transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("password")}
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#3B82F6]" size={20} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder=" "
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white dark:bg-gray-800/60 focus:bg-white dark:bg-gray-800 transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("confirmPassword")}
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password Rules */}
          <div className="space-y-2 text-sm">
            <p className="font-medium text-[#111827]">{tPasswordRules("title")}</p>
            <div className="space-y-1">
              {Object.entries(passwordRules).map(([key, valid]) => {
                const Icon = valid ? CheckCircle2 : XCircle;
                const labelKey = key as keyof typeof passwordRules;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon size={16} className={valid ? "text-[#22C55E]" : "text-red-500"} />
                    <span className={valid ? "text-[#22C55E]" : "text-red-500"}>
                      {tPasswordRules(labelKey)}
                    </span>
                  </div>
                );
              })}
            </div>
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
            disabled={loading || !isFormValid}
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
            className="text-[#3B82F6] font-semibold hover:underline"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
