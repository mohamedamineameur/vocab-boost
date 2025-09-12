import { useState } from "react";
import { createUser } from "../../services/user.services";
import { Mail, Lock, User, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 👁️ toggle affichage password
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Validation helpers
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const passwordRules = {
    length: form.password.length >= 12,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
    match: form.password && form.password === form.passwordConfirmation,
  };

  const isFormValid =
    emailValid && Object.values(passwordRules).every(Boolean);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isFormValid) {
      setError("⚠️ Veuillez corriger les erreurs avant de continuer.");
      setLoading(false);
      return;
    }

    try {
      await createUser(form);
      setSuccess(true);
    } catch (err: any) {
      let message = "Une erreur est survenue";

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = data.error;
        } else if (Array.isArray(data.errors)) {
          message = data.errors.join(", ");
        }
      } else if (err.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // fonction helper pour appliquer rouge si erreur
  const getInputClasses = (valid: boolean) =>
    `peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all outline-none ${
      valid ? "border-gray-300 focus:ring-2 focus:ring-[#3B82F6]" : "border-red-500 focus:ring-2 focus:ring-red-500"
    }`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          🚀 Apprends l’anglais en t’amusant
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          Rejoins une communauté motivante et atteins tes objectifs 🎯
        </p>
      </div>

      {/* Signup Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          Créer un compte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Prénom */}
          <div className="relative group">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              name="firstname"
              placeholder=" "
              value={form.firstname}
              onChange={handleChange}
              required
              className={getInputClasses(!!form.firstname)}
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Prénom
            </label>
          </div>

          {/* Nom */}
          <div className="relative group">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              name="lastname"
              placeholder=" "
              value={form.lastname}
              onChange={handleChange}
              required
              className={getInputClasses(!!form.lastname)}
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Nom
            </label>
          </div>

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              placeholder=" "
              value={form.email}
              onChange={handleChange}
              required
              className={getInputClasses(emailValid)}
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              required
              className={getInputClasses(passwordRules.length && passwordRules.uppercase && passwordRules.number && passwordRules.special)}
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Mot de passe
            </label>
            {/* 👁️ toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Password confirmation */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type={showPasswordConfirm ? "text" : "password"}
              name="passwordConfirmation"
              placeholder=" "
              value={form.passwordConfirmation}
              onChange={handleChange}
              required
              className={getInputClasses(passwordRules.match)}
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Confirmer le mot de passe
            </label>
            {/* 👁️ toggle button */}
            <button
              type="button"
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              className="absolute right-3 top-3 text-gray-400 hover:text-[#111827] transition"
            >
              {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Email Helper */}
          <div className="space-y-1 text-sm">
            <p className="font-medium text-[#111827]">📧 Vérification de l’email :</p>
            <div className="flex items-center gap-2">
              {emailValid ? (
                <CheckCircle size={16} className="text-[#22C55E]" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <span className={emailValid ? "text-[#22C55E]" : "text-red-500"}>
                Doit être un email valide (ex: nom@domaine.com)
              </span>
            </div>
          </div>

          {/* Password Helpers */}
          <div className="space-y-1 text-sm">
            <p className="font-medium text-[#111827]">🔒 Votre mot de passe doit contenir :</p>
            {[
              { key: "length", label: "Au moins 12 caractères" },
              { key: "uppercase", label: "Une majuscule" },
              { key: "number", label: "Un chiffre" },
              { key: "special", label: "Un caractère spécial" },
              { key: "match", label: "Les deux mots de passe doivent correspondre" },
            ].map(({ key, label }) => {
              const valid = passwordRules[key as keyof typeof passwordRules];
              const Icon = valid ? CheckCircle : XCircle;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon size={16} className={valid ? "text-[#22C55E]" : "text-red-500"} />
                  <span className={valid ? "text-[#22C55E]" : "text-red-500"}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Error & Success */}
          {error && (
            <div className="bg-red-100 text-red-600 text-sm font-medium px-4 py-2 rounded-xl text-center shadow">
              ❌ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-600 text-sm font-medium px-4 py-2 rounded-xl text-center shadow">
              ✅ Compte créé avec succès !
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full py-3 px-6 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-[#3B82F6] to-[#22C55E] hover:opacity-90 active:scale-95 transition transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Création...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Déjà un compte ?{" "}
          <a href="/login" className="text-[#3B82F6] font-semibold hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </div>
  );
}
