import { useState } from "react";
import { loginUser } from "../../services/user.services"; // 👉 ton API de login
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ état pour afficher/masquer

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await loginUser(form.email, form.password);
      setSuccess(true);
    } catch (err: any) {
      let message = "Une erreur est survenue";

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          message = data;
        } else if (data.message) {
          message = data.message; // ✅ ex: { message: "Invalid email or password" }
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] px-4">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
          🔑 Bienvenue de retour !
        </h1>
        <p className="text-white/90 mt-2 text-lg">
          Connecte-toi pour continuer ton apprentissage 📚
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
        <h2 className="text-2xl font-bold text-[#111827] text-center mb-6">
          Connexion
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
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-[#3B82F6]" size={20} />
            <input
              type={showPassword ? "text" : "password"} // 👁️ toggle affichage
              name="password"
              placeholder=" "
              value={form.password}
              onChange={handleChange}
              required
              className="peer w-full pl-10 pr-12 pt-5 pb-2 border rounded-2xl text-[#111827] bg-white/60 focus:bg-white transition-all focus:ring-2 focus:ring-[#3B82F6] outline-none"
            />
            <label className="absolute left-10 top-2 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-[#3B82F6]">
              Mot de passe
            </label>

            {/* Bouton toggle password */}
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
              ✅ Connexion réussie !
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-2xl font-semibold text-white shadow-lg bg-gradient-to-r from-[#3B82F6] to-[#22C55E] hover:opacity-90 active:scale-95 transition transform disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connexion...
              </>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Pas encore de compte ?{" "}
          <a href="/signup" className="text-[#3B82F6] font-semibold hover:underline">
            S'inscrire
          </a>
        </p>
      </div>
    </div>
  );
}
