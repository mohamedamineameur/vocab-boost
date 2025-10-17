import React, { useState, useEffect } from "react";
import { User, Save, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslate } from "../contexts/TranslateContext";
import { updateUser } from "../services/user.services";
import { useNavigate } from "react-router-dom";

const tr = {
  fr: {
    settings: "Paramètres",
    profile: "Profil",
    personalInfo: "Informations personnelles",
    password: "Mot de passe",
    sessions: "Sessions",
    manageSessions: "Gérer mes sessions actives",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Email",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    save: "Enregistrer",
    saving: "Enregistrement...",
    show: "Afficher",
    hide: "Masquer",
    success: "Succès",
    error: "Erreur",
    profileUpdated: "Profil mis à jour avec succès",
    passwordUpdated: "Mot de passe mis à jour avec succès",
    errorUpdating: "Erreur lors de la mise à jour",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    fillAllFields: "Veuillez remplir tous les champs",
    invalidEmail: "Adresse email invalide",
    passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
  },
  en: {
    settings: "Settings",
    profile: "Profile",
    personalInfo: "Personal Information",
    password: "Password",
    sessions: "Sessions",
    manageSessions: "Manage my active sessions",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    save: "Save",
    saving: "Saving...",
    show: "Show",
    hide: "Hide",
    success: "Success",
    error: "Error",
    profileUpdated: "Profile updated successfully",
    passwordUpdated: "Password updated successfully",
    errorUpdating: "Error updating",
    passwordsDoNotMatch: "Passwords do not match",
    fillAllFields: "Please fill all fields",
    invalidEmail: "Invalid email address",
    passwordTooShort: "Password must be at least 8 characters",
  },
  ar: {
    settings: "الإعدادات",
    profile: "الملف الشخصي",
    personalInfo: "المعلومات الشخصية",
    password: "كلمة المرور",
    sessions: "الجلسات",
    manageSessions: "إدارة جلساتي النشطة",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    email: "البريد الإلكتروني",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة مرور جديدة",
    confirmPassword: "تأكيد كلمة المرور",
    save: "حفظ",
    saving: "جاري الحفظ...",
    show: "إظهار",
    hide: "إخفاء",
    success: "نجح",
    error: "خطأ",
    profileUpdated: "تم تحديث الملف الشخصي بنجاح",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح",
    errorUpdating: "خطأ في التحديث",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    fillAllFields: "يرجى ملء جميع الحقول",
    invalidEmail: "عنوان بريد إلكتروني غير صالح",
    passwordTooShort: "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل",
  },
  es: {
    settings: "Configuración",
    profile: "Perfil",
    personalInfo: "Información Personal",
    password: "Contraseña",
    sessions: "Sesiones",
    manageSessions: "Administrar mis sesiones activas",
    firstName: "Nombre",
    lastName: "Apellido",
    email: "Correo",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Contraseña",
    save: "Guardar",
    saving: "Guardando...",
    show: "Mostrar",
    hide: "Ocultar",
    success: "Éxito",
    error: "Error",
    profileUpdated: "Perfil actualizado exitosamente",
    passwordUpdated: "Contraseña actualizada exitosamente",
    errorUpdating: "Error al actualizar",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    fillAllFields: "Por favor complete todos los campos",
    invalidEmail: "Dirección de correo inválida",
    passwordTooShort: "La contraseña debe tener al menos 8 caracteres",
  },
} as const;

export default function SettingsComponent() {
  const { user, refreshUser } = useAuth();
  const { language } = useTranslate();
  const navigate = useNavigate();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // États pour l'interface
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "sessions">("profile");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialiser les données du profil
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Fonction pour afficher un message
  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Validation email
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Gestionnaire de mise à jour du profil
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!profileForm.firstname || !profileForm.lastname || !profileForm.email) {
        showMessage("error", t("fillAllFields"));
        return;
      }

      if (!isValidEmail(profileForm.email)) {
        showMessage("error", t("invalidEmail"));
        return;
      }

      // Utiliser updateUser pour la mise à jour du profil
      await updateUser(user!.id, {
        firstname: profileForm.firstname,
        lastname: profileForm.lastname,
        email: profileForm.email,
      });

      // Rafraîchir les données utilisateur
      await refreshUser();
      showMessage("success", t("profileUpdated"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { en?: string; fr?: string; es?: string; ar?: string }; message?: { en?: string; fr?: string; es?: string; ar?: string } | string } }; message?: string };
      const errorMessage = err.response?.data?.error?.[language as keyof typeof err.response.data.error] 
        || (typeof err.response?.data?.message === 'object' ? err.response?.data?.message?.[language as keyof typeof err.response.data.message] : err.response?.data?.message)
        || err.message
        || t("errorUpdating");
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Gestionnaire de mise à jour du mot de passe
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        showMessage("error", t("fillAllFields"));
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        showMessage("error", t("passwordTooShort"));
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showMessage("error", t("passwordsDoNotMatch"));
        return;
      }

      // Utiliser updateUser avec les paramètres attendus par le backend
      // Les champs newPassword et passwordConfirmation sont acceptés par le backend mais ne sont pas dans UserCreationAttributes
      await updateUser(user!.id, {
        password: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        passwordConfirmation: passwordForm.confirmPassword,
      } as Record<string, string>);

      // Réinitialiser le formulaire
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      showMessage("success", t("passwordUpdated"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { en?: string; fr?: string; es?: string; ar?: string }; message?: { en?: string; fr?: string; es?: string; ar?: string } | string } }; message?: string };
      const errorMessage = err.response?.data?.error?.[language as keyof typeof err.response.data.error] 
        || (typeof err.response?.data?.message === 'object' ? err.response?.data?.message?.[language as keyof typeof err.response.data.message] : err.response?.data?.message)
        || err.message
        || t("errorUpdating");
      showMessage("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour basculer la visibilité du mot de passe
  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3B82F6] via-[#60A5FA] to-[#22C55E] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-8 h-8 text-[#3B82F6]" />
            <h1 className="text-2xl font-bold text-[#111827] dark:text-gray-100">{t("settings")}</h1>
          </div>

          {/* Message de notification */}
          {message && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              message.type === "success" 
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700" 
                : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
            }`}>
              {message.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "bg-[#F3F4F6] dark:bg-gray-700 text-[#111827] dark:text-gray-100 hover:bg-[#E5E7EB] dark:hover:bg-gray-600"
              }`}
            >
              {t("profile")}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "password"
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "bg-[#F3F4F6] dark:bg-gray-700 text-[#111827] dark:text-gray-100 hover:bg-[#E5E7EB] dark:hover:bg-gray-600"
              }`}
            >
              {t("password")}
            </button>
            <button
              onClick={() => setActiveTab("sessions")}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === "sessions"
                  ? "bg-[#3B82F6] text-white shadow-md"
                  : "bg-[#F3F4F6] dark:bg-gray-700 text-[#111827] dark:text-gray-100 hover:bg-[#E5E7EB] dark:hover:bg-gray-600"
              }`}
            >
              {t("sessions")}
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-semibold text-[#111827] dark:text-gray-100 mb-6">{t("personalInfo")}</h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prénom */}
                  <div>
                    <label htmlFor="firstname" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                      {t("firstName")}
                    </label>
                    <input
                      type="text"
                      id="firstname"
                      value={profileForm.firstname}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstname: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      required
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label htmlFor="lastname" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                      {t("lastName")}
                    </label>
                    <input
                      type="text"
                      id="lastname"
                      value={profileForm.lastname}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastname: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    required
                  />
                </div>

                {/* Bouton de sauvegarde */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#16A34A] hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? t("saving") : t("save")}
                </button>
              </form>
            </div>
          )}

          {activeTab === "password" && (
            <div>
              <h2 className="text-xl font-semibold text-[#111827] dark:text-gray-100 mb-6">{t("password")}</h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                {/* Mot de passe actuel */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                    {t("currentPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-gray-100 transition-colors"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                    {t("newPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-gray-100 transition-colors"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirmer le mot de passe */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#111827] dark:text-gray-100 mb-2">
                    {t("confirmPassword")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-[#F3F4F6] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#111827] dark:text-gray-100 focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-gray-100 transition-colors"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bouton de sauvegarde */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#22C55E] text-white rounded-xl font-medium hover:bg-[#16A34A] hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {loading ? t("saving") : t("save")}
                </button>
              </form>
            </div>
          )}

          {activeTab === "sessions" && (
            <div>
              <h2 className="text-xl font-semibold text-[#111827] dark:text-gray-100 mb-6">{t("sessions")}</h2>
              
              <div className="text-center py-8">
                <Shield className="w-16 h-16 mx-auto text-[#3B82F6] mb-4" />
                <p className="text-[#111827]/70 dark:text-gray-300 mb-6">{t("manageSessions")}</p>
                <button
                  onClick={() => navigate("/sessions")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white rounded-xl font-medium hover:bg-[#2563EB] hover:scale-105 active:scale-95 transition-all shadow-md"
                >
                  <Shield className="w-5 h-5" />
                  {t("manageSessions")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
