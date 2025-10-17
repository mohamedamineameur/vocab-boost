import React, { useState, useEffect } from "react";
import { CheckCircle2, Globe2, Moon, SunMedium, Loader2 } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext"; // ✅ assure-toi que ce context expose { language, setLanguage }
// ⛏️ Ajuste ce chemin selon ton arborescence
import { createProfile, getProfiles } from "../services/profile.services";
import { getUserCategories } from "../services/user-category.services";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

// --- Types minimalistes côté front ---
export type LocalType = "fr" | "es" | "ar";
export type ThemeType = "light" | "dark";

interface Props {
  userId?: string; // si non fourni, on essaiera de le lire dans localStorage("userId")
  onCreated?: (profile: { id: string; userId: string; local: LocalType; theme: ThemeType }) => void;
}

// 🌍 Traductions locales (fr/en/ar/es)
const tr = {
  fr: {
    title: "Créer mon profil",
    subtitle: "Choisis ta langue secondaire pour apprendre l'anglais.",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    save: "Enregistrer",
    saving: "Enregistrement...",
    success: "Profil créé avec succès !",
    needUser: "Utilisateur introuvable. Connecte-toi d’abord.",
    preview: "Aperçu",
    helperLang: "Tu pourras modifier ces préférences plus tard.",
  },
  en: {
    title: "Create my profile",
    subtitle: "Choose your secondary language to learn English.",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    save: "Save",
    saving: "Saving...",
    success: "Profile created successfully!",
    needUser: "User not found. Please sign in first.",
    preview: "Preview",
    helperLang: "You can change these later.",
  },
  ar: {
    title: "إنشاء ملفي الشخصي",
    subtitle: "اختر لغتك الثانوية لتعلم الإنجليزية.",
    language: "اللغة",
    theme: "السمة",
    light: "فاتح",
    dark: "داكن",
    save: "حفظ",
    saving: "جارٍ الحفظ...",
    success: "تم إنشاء الملف الشخصي بنجاح!",
    needUser: "المستخدم غير موجود. يرجى تسجيل الدخول أولاً.",
    preview: "معاينة",
    helperLang: "يمكنك تغيير هذه الإعدادات لاحقًا.",
  },
  es: {
    title: "Crear mi perfil",
    subtitle: "Elige tu idioma secundario para aprender inglés.",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    save: "Guardar",
    saving: "Guardando...",
    success: "¡Perfil creado con éxito!",
    needUser: "Usuario no encontrado. Inicia sesión primero.",
    preview: "Vista previa",
    helperLang: "Podrás cambiar esto más tarde.",
  },
} as const;

export default function ProfileCreatePage({ onCreated }: Props) {
  const { language, setLanguage } = useTranslate();
  type Keys = keyof typeof tr.fr;
  const t = (key: Keys) => (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";
    const { user } = useAuth();
    const navigate = useNavigate()

  const [local, setLocal] = useState<LocalType>((language as LocalType) ?? "en");
  const [theme, setTheme] = useState<ThemeType>("light");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // 🔍 Vérifier si un profil existe déjà au chargement
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const [profiles, userCategories] = await Promise.all([
          getProfiles(),
          getUserCategories()
        ]);
        
        const profilesArray = Array.isArray(profiles) ? profiles : [];
        const categoriesArray = Array.isArray(userCategories) 
          ? userCategories 
          : (userCategories?.userCategories || []);

        // Si un profil existe déjà
        if (profilesArray.length > 0) {
          // Si pas de catégories, rediriger vers /categories
          if (categoriesArray.length === 0) {
            navigate("/categories", { replace: true });
          } else {
            // Sinon, rediriger vers le dashboard
            navigate("/", { replace: true });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil:", error);
      } finally {
        setCheckingProfile(false);
      }
    };

    if (user?.id) {
      checkExistingProfile();
    } else {
      setCheckingProfile(false);
    }
  }, [user?.id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(null);
    setErr(null);


    setLoading(true);
    try {
      if (!user?.id) {
        setErr("Utilisateur non connecté");
        setLoading(false);
        return;
      }
      // ⚠️ le backend attend { userId, local, theme }
      const payload = { userId: user.id, local, theme };
      const created = await createProfile(payload);

      setOk(created.message?.[language] );
      // mettre à jour l'UI (langue du context)
      try { 
        setLanguage?.(local); 
      } catch {
        // Ignore errors when updating language
      }
      // appliquer le thème côté document
      try {
        document.documentElement.classList.toggle("dark", theme === "dark");
      } catch {
        // Ignore errors when applying theme
      }

      onCreated?.(created);
     setTimeout(() => {
       navigate("/");
     }, 800);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { en?: string; fr?: string; es?: string; ar?: string }; message?: { en?: string; fr?: string; es?: string; ar?: string } | string } }; message?: string };
      const errorMessage = err.response?.data?.error?.[language as keyof typeof err.response.data.error] 
        || (typeof err.response?.data?.message === 'object' ? err.response?.data?.message?.[language as keyof typeof err.response.data.message] : err.response?.data?.message)
        || err.message
        || "Error";
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Afficher un loader pendant la vérification du profil
  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#3B82F6] mx-auto mb-4" />
          <p className="text-[#111827] text-lg">⏳ Vérification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-[#F3F4F6] p-6 md:p-8"
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">{t("title")}</h1>
          <p className="text-[#111827]/70 mt-1">{t("subtitle")}</p>
        </div>

        {/* Langue */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#111827] mb-2" htmlFor="local">
            {t("language")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" id="local">
            {([
              { code: "fr", label: "Français" },
              { code: "es", label: "Español" },
              { code: "ar", label: "العربية" },
            ] as { code: LocalType; label: string }[]).map(({ code, label }) => (
              <button
                type="button"
                key={code}
                onClick={() => setLocal(code)}
                className={[
                  "py-3 px-4 rounded-2xl border shadow-md text-sm font-medium",
                  "transition hover:scale-105 active:scale-95",
                  local === code
                    ? "bg-[#3B82F6] text-white border-[#3B82F6]"
                    : "bg-white dark:bg-gray-800 text-[#111827] border-[#F3F4F6]",
                ].join(" ")}
                aria-pressed={local === code}
              >
                <span className="inline-flex items-center gap-2"><Globe2 className="w-4 h-4" />{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-[#111827]/60 mt-2">{t("helperLang")}</p>
        </div>

        {/* Thème */}
        <div className="mb-6">
          <span className="block text-sm font-semibold text-[#111827] mb-2">{t("theme")}</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={[
                "py-3 px-4 rounded-2xl border shadow-md flex items-center justify-center gap-2",
                "transition hover:scale-105 active:scale-95",
                theme === "light"
                  ? "bg-[#22C55E] text-white border-[#22C55E]"
                  : "bg-white dark:bg-gray-800 text-[#111827] border-[#F3F4F6]",
              ].join(" ")}
              aria-pressed={theme === "light"}
            >
              <SunMedium className="w-4 h-4" /> {t("light")}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={[
                "py-3 px-4 rounded-2xl border shadow-md flex items-center justify-center gap-2",
                "transition hover:scale-105 active:scale-95",
                theme === "dark"
                  ? "bg-[#111827] text-white border-[#111827]"
                  : "bg-white dark:bg-gray-800 text-[#111827] border-[#F3F4F6]",
              ].join(" ")}
              aria-pressed={theme === "dark"}
            >
              <Moon className="w-4 h-4" /> {t("dark")}
            </button>
          </div>
        </div>

        {/* Aperçu */}
        <div className="mb-6">
          <span className="block text-sm font-semibold text-[#111827] mb-2">{t("preview")}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-[#F3F4F6] shadow-sm bg-white dark:bg-gray-800">
              <div className="text-xs text-[#111827]/70 mb-1">UI</div>
              <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full bg-[#22C55E] rounded-full" style={{ width: "60%" }} />
              </div>
              <div className="mt-3 h-10 rounded-xl bg-[#3B82F6] text-white grid place-items-center text-sm">
                CTA
              </div>
            </div>
            <div className={["p-4 rounded-2xl border shadow-sm", theme === "dark" ? "bg-[#111827] border-[#111827] text-white" : "bg-white dark:bg-gray-800 border-[#F3F4F6] text-[#111827]"].join(" ") }>
              <div className="text-xs opacity-70 mb-1">{theme === "dark" ? "Dark" : "Light"}</div>
              <div className={"h-2 w-full rounded-full overflow-hidden " + (theme === "dark" ? "bg-white dark:bg-gray-800/20" : "bg-[#F3F4F6]") }>
                <div className={"h-full rounded-full " + (theme === "dark" ? "bg-[#22C55E]" : "bg-[#22C55E]") } style={{ width: "40%" }} />
              </div>
              <div className={"mt-3 h-10 rounded-xl grid place-items-center text-sm " + (theme === "dark" ? "bg-white dark:bg-gray-800/10 text-white" : "bg-[#3B82F6] text-white") }>
                Button
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {err && (
          <div className="mb-3 p-3 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {err}
          </div>
        )}
        {ok && (
          <div className="mb-3 p-3 rounded-2xl border border-green-200 bg-green-50 text-[#111827] text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> {ok}
          </div>
        )}

        {/* Bouton principal (mobile-first) */}
        <button
          type="submit"
          disabled={ loading}
          className={[
            "w-full py-3 px-6 rounded-2xl shadow-md text-white text-lg",
            "transition hover:scale-105 active:scale-95",
            loading ? "bg-[#3B82F6]/60 cursor-not-allowed" : "bg-[#3B82F6]",
          ].join(" ")}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> {t("saving")}</span>
          ) : (
            t("save")
          )}
        </button>
      </form>
    </div>
  );
}
