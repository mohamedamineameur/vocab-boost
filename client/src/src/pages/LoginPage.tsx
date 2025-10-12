import { useState } from "react";
import { loginUser, resendVerificationEmail } from "../../services/user.services";
import { Mail, Lock, Loader2, Eye, EyeOff, Send } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ✅ Clés de traduction locales à ce composant
const loginTranslations = {
  fr: {
    heroTitle: "🔑 Bienvenue de retour !",
    heroSubtitle: "Connecte-toi pour continuer ton apprentissage 📚",
    title: "Connexion",
    email: "Email",
    password: "Mot de passe",
    button: "Se connecter",
    loading: "Connexion...",
    error: "Une erreur est survenue",
    success: "✅ Connexion réussie !",
    noAccount: "Pas encore de compte ?",
    signup: "S'inscrire",
    resendEmail: "Renvoyer l'email de vérification",
    resendLoading: "Envoi en cours...",
    resendSuccess: "✅ Email renvoyé ! Vérifiez votre boîte de réception."
  },
  en: {
    heroTitle: "🔑 Welcome back!",
    heroSubtitle: "Log in to continue your learning 📚",
    title: "Login",
    email: "Email",
    password: "Password",
    button: "Log in",
    loading: "Logging in...",
    error: "An error occurred",
    success: "✅ Successfully logged in!",
    noAccount: "Don't have an account?",
    signup: "Sign up",
    resendEmail: "Resend verification email",
    resendLoading: "Sending...",
    resendSuccess: "✅ Email resent! Check your inbox."
  },
  ar: {
    heroTitle: "🔑 مرحباً بعودتك!",
    heroSubtitle: "سجّل الدخول لمواصلة تعلمك 📚",
    title: "تسجيل الدخول",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    button: "تسجيل الدخول",
    loading: "جاري تسجيل الدخول...",
    error: "حدث خطأ ما",
    success: "✅ تم تسجيل الدخول بنجاح!",
    noAccount: "ليس لديك حساب؟",
    signup: "إنشاء حساب",
    resendEmail: "إعادة إرسال بريد التحقق",
    resendLoading: "جاري الإرسال...",
    resendSuccess: "✅ تم إعادة إرسال البريد! تحقق من صندوق الوارد."
  },
  es: {
    heroTitle: "🔑 ¡Bienvenido de nuevo!",
    heroSubtitle: "Inicia sesión para continuar tu aprendizaje 📚",
    title: "Iniciar sesión",
    email: "Correo electrónico",
    password: "Contraseña",
    button: "Iniciar sesión",
    loading: "Conectando...",
    error: "Ocurrió un error",
    success: "✅ ¡Inicio de sesión exitoso!",
    noAccount: "¿No tienes una cuenta?",
    signup: "Regístrate",
    resendEmail: "Reenviar correo de verificación",
    resendLoading: "Enviando...",
    resendSuccess: "✅ ¡Correo reenviado! Revisa tu bandeja de entrada."
  }
};

export default function LoginPage() {
  const navigate = useNavigate()
  const { language } = useTranslate(); // 🔑 on récupère la langue actuelle
  const t = (key: keyof typeof loginTranslations["fr"]) =>
    loginTranslations[language][key] || loginTranslations.en[key];

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const {refreshUser}=useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(form.email, form.password);
      
      // Si MFA requis, rediriger vers la page de vérification
      if (response.mfaRequired && response.userId) {
        navigate("/mfa-verify", { state: { userId: response.userId } });
        return;
      }
      
      // Sinon connexion normale (au cas où)
      setSuccess(true);
      refreshUser();
      setTimeout(() => {
        navigate("/");
      }, 1000);
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

  const handleResendEmail = async () => {
    if (!form.email) {
      setError("Veuillez saisir votre email d'abord");
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    setError(null);

    try {
      await resendVerificationEmail(form.email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
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
      setResendLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          {t("heroTitle")}
        </h1>
        <p className="text-white/90 mt-2 text-lg">{t("heroSubtitle")}</p>
      </div>

      {/* Login Card */}
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
              value={form.email}
              onChange={handleChange}
              required
              className="peer w-full pl-10 pr-4 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("email")}
            </label>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#3B82F6]" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              required
              className="peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              {t("password")}
            </label>

            {/* Toggle password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
          {resendSuccess && (
            <div className="bg-green-100 text-green-600 text-sm font-medium px-4 py-2 rounded-xl text-center shadow">
              {t("resendSuccess")}
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            {/* Login Button */}
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

            {/* Resend Verification Email Button */}
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendLoading || !form.email}
              className="w-full py-2 px-6 rounded-2xl font-medium text-[#3B82F6] shadow-md bg-white border border-[#3B82F6] hover:bg-[#3B82F6] hover:text-white active:scale-95 transition transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("resendLoading")}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {t("resendEmail")}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-sm text-gray-600">
            {t("noAccount")}{" "}
            <a href="/signup" className="text-[#3B82F6] font-semibold hover:underline">
              {t("signup")}
            </a>
          </p>
          <p className="text-sm text-gray-600">
            <a href="/forgot-password" className="text-[#3B82F6] font-semibold hover:underline">
              Mot de passe oublié ?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
