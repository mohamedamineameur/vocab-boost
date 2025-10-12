import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Home, Settings, LogOut, Shield } from "lucide-react";
import { useTranslate } from "../contexts/TranslateContext";
import { useAuth } from "../contexts/AuthContext";

const tr = {
  fr: {
    back: "Retour",
    home: "Accueil",
    settings: "Paramètres",
    logout: "Déconnexion",
    admin: "Admin",
  },
  en: {
    back: "Back",
    home: "Home",
    settings: "Settings",
    logout: "Logout",
    admin: "Admin",
  },
  ar: {
    back: "رجوع",
    home: "الرئيسية",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    admin: "المسؤول",
  },
  es: {
    back: "Volver",
    home: "Inicio",
    settings: "Configuración",
    logout: "Cerrar sesión",
    admin: "Admin",
  },
} as const;

interface HeaderProps {
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSettingsButton?: boolean;
  onBackClick?: () => void;
  title?: string;
}

export default function Header({ 
  showBackButton = true, 
  showHomeButton = true,
  showSettingsButton = true,
  onBackClick,
  title 
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslate();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const t = (key: keyof typeof tr["fr"]) =>
    (tr as Record<string, Record<string, string>>)[language]?.[key] ?? tr.en[key];
  const isRTL = language === "ar";

  // Ne pas afficher le header si l'utilisateur n'est pas connecté
  if (!isLoggedIn) {
    return null;
  }

  // Ne pas afficher le bouton home si on est déjà sur la page d'accueil
  const isOnHomePage = location.pathname === "/" || location.pathname === "/dashboard";
  const isOnSettingsPage = location.pathname === "/settings";
  const isOnAdminPage = location.pathname.startsWith("/admin");

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/home");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b border-[#F3F4F6] shadow-sm"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Bouton retour */}
          <div className="flex items-center gap-2">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#F3F4F6] text-[#111827] hover:bg-[#F3F4F6] hover:scale-105 active:scale-95 transition-all shadow-sm"
                aria-label={t("back")}
              >
                {isRTL ? (
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
                <span className="font-medium hidden sm:inline">{t("back")}</span>
              </button>
            )}
          </div>

          {/* Titre (optionnel) */}
          {title && (
            <h1 className="text-lg font-bold text-[#111827] truncate px-4">
              {title}
            </h1>
          )}

          {/* Boutons de navigation */}
          <div className="flex items-center gap-2">
            {/* Bouton Admin (si admin et pas sur page admin) */}
            {isAdmin && !isOnAdminPage && (
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-[#3B82F6] text-white hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md"
                aria-label={t("admin")}
              >
                <Shield className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{t("admin")}</span>
              </button>
            )}
            
            {showHomeButton && !isOnHomePage && (
              <button
                onClick={handleHomeClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6] text-white hover:bg-[#2563EB] hover:scale-105 active:scale-95 transition-all shadow-md"
                aria-label={t("home")}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{t("home")}</span>
              </button>
            )}
            {showSettingsButton && !isOnSettingsPage && (
              <button
                onClick={handleSettingsClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B7280] text-white hover:bg-[#4B5563] hover:scale-105 active:scale-95 transition-all shadow-md"
                aria-label={t("settings")}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">{t("settings")}</span>
              </button>
            )}
            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-md"
              aria-label={t("logout")}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

